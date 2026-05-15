// Cross-table: promote an outreach contact to the cold-outbound
// `prospects` table so the email sequence orchestrator picks them up.
// Idempotent — calling promote twice on the same contact returns the
// already-promoted prospect row without creating a new one.
//
// The natural-key match (linkedin_url || work_email -> prospect.linkedin_url
// || prospect.email) catches the case where the cold pipeline already
// wrote a row for this person; the FK stamp lets us preserve the link
// even if the natural keys later drift.

import {
  createProspect,
  getProspectById,
  type CreateProspectResult,
} from '../prospect-store/prospects';
import { query } from './db';
import { getContactById, stampPromotedProspect } from './contacts';
import { mapSeniorityToClassifiedLevel } from './seniority';
import { buildDefaultLinkedinDraft } from '../prospect-store/linkedin-draft-template';
import type { OutreachContactRow } from './types';
import type { ProspectRow } from '../prospect-store/types';

export type PromoteResult = {
  contact: OutreachContactRow;
  prospect: ProspectRow;
  prospect_url: string;
  prospect_password: string;
  was_existing: boolean;
};

export async function promoteContact(
  outreachContactId: string,
  origin: string,
): Promise<PromoteResult | { error: 'not_found' }> {
  const contact = await getContactById(outreachContactId);
  if (!contact) return { error: 'not_found' };

  // Already promoted? Return the linked prospect.
  if (contact.promoted_to_prospect_id) {
    const existing = await getProspectById(contact.promoted_to_prospect_id);
    if (existing) {
      return {
        contact,
        prospect: existing,
        prospect_url: `${origin.replace(/\/$/, '')}/p/${existing.slug}`,
        prospect_password: existing.password,
        was_existing: true,
      };
    }
  }

  // Natural-key match against existing prospects (cold pipeline may
  // have written one already).
  const naturalMatch = await findExistingProspect(contact);
  if (naturalMatch) {
    if (naturalMatch.source === 'outreach') {
      await query(
        `UPDATE prospects SET source = 'outreach_promote', updated_at = now() WHERE id = $1`,
        [naturalMatch.id],
      );
      naturalMatch.source = 'outreach_promote';
    }
    const updated = await stampPromotedProspect(outreachContactId, naturalMatch.id);
    return {
      contact: updated ?? contact,
      prospect: naturalMatch,
      prospect_url: `${origin.replace(/\/$/, '')}/p/${naturalMatch.slug}`,
      prospect_password: naturalMatch.password,
      was_existing: true,
    };
  }

  // Net-new: create a prospect row from the outreach contact's
  // mapped fields. Reuse createProspect so the demo build pipeline
  // and password generation are consistent with the cold-outbound
  // flow.
  const created: CreateProspectResult = await createProspect(
    {
      name: contact.full_name,
      company: contact.account_display_name,
      company_domain: contact.account_domain ?? undefined,
      email: contact.work_email ?? undefined,
      linkedin_url: contact.linkedin_url ?? undefined,
      level: contact.title,
      classified_level: mapSeniorityToClassifiedLevel(contact.seniority_tier_value),
      // Inherit the agent's prose linkedin draft when available; otherwise
      // fall back to the shared template so the prospect has a usable
      // linkedin_draft from minute one (matches the bulk-backfill PR's
      // contract).
      linkedin_draft: extractProseFromOutreachMessage(contact.linkedin_message)
        ?? buildDefaultLinkedinDraft(contact.full_name),
      mcp_detail: contact.priority_rationale ?? null,
      source: 'outreach_promote',
      metadata: {
        source: 'outreach_promote',
        outreach_contact_id: contact.id,
        outreach_run_id: contact.run_id,
        outreach_external_key: contact.external_key,
      },
    } as Parameters<typeof createProspect>[0],
    origin,
  );

  await stampPromotedProspect(outreachContactId, created.prospect.id);
  const refreshed = await getContactById(outreachContactId);

  return {
    contact: refreshed ?? contact,
    prospect: created.prospect,
    prospect_url: created.url,
    prospect_password: created.password,
    was_existing: false,
  };
}

async function findExistingProspect(
  contact: OutreachContactRow,
): Promise<ProspectRow | null> {
  if (contact.linkedin_url) {
    const { rows } = await query<ProspectRow>(
      `SELECT * FROM prospects WHERE linkedin_url = $1
         ORDER BY created_at DESC LIMIT 1`,
      [contact.linkedin_url],
    );
    if (rows[0]) return rows[0];
  }
  if (contact.work_email) {
    const { rows } = await query<ProspectRow>(
      `SELECT * FROM prospects WHERE lower(email) = lower($1)
         ORDER BY created_at DESC LIMIT 1`,
      [contact.work_email],
    );
    if (rows[0]) return rows[0];
  }
  return null;
}

// Pull the agent's prose out of the stored full LinkedIn message.
// We persisted full = `<prose>\n\n<url>\nPassword: <pwd>` server-side
// at upsert time, so the prose is everything before the first blank
// line (or the whole string if there's no append).
function extractProseFromOutreachMessage(full: string | null): string | null {
  if (!full) return null;
  const idx = full.indexOf('\n\n');
  if (idx < 0) return full.trim() || null;
  const prose = full.slice(0, idx).trim();
  return prose.length > 0 ? prose : null;
}
