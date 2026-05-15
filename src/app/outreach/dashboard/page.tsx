import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { ensureSchema, isDatabaseConfigured } from '@/lib/prospect-store';
import { query } from '@/lib/prospect-store/db';
import { computeNextEmailSendDate } from '@/lib/prospect-store/sequence-cadence';
import {
  toContactResponse,
  type OutreachContactResponse,
  type OutreachContactRow,
} from '@/lib/outreach-store';
import { DashboardClient } from './dashboard-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Wide cap so the dashboard always renders the territory in one
// fetch. The intent agent batches ~20 contacts/day so a 90-day
// window is well under 2k rows. Pagination can land later.
const MAX_ROWS = 2000;

export default async function DashboardPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-text-secondary text-sm">
          Database not configured. Configure DATABASE_URL on this deployment.
        </div>
      </div>
    );
  }

  await ensureSchema();
  const contactsRaw = await loadContacts(MAX_ROWS);
  const contactsWithLink = await attachLinkedProspects(contactsRaw);
  const contacts = contactsWithLink.map((c) =>
    toContactResponse(c.contact, { linkedProspect: c.linkedProspect }),
  );

  // Pull the latest run for the "today's hot" card and the Slack-DM
  // shortcut at the top.
  const { rows: latestRunRows } = await query<{
    id: string;
    run_date: string;
    user_email: string;
    ran_at: string;
    total_contacts: number;
  }>(
    `SELECT id, to_char(run_date, 'YYYY-MM-DD') AS run_date, user_email, ran_at, total_contacts
       FROM outreach_runs
       ORDER BY ran_at DESC LIMIT 1`,
  );
  const latestRun = latestRunRows[0] ?? null;

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="border-b border-dark-border px-6 py-4 sticky top-0 bg-dark-bg/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-secondary mb-1"
            >
              <ArrowLeft className="w-3 h-3" />
              /admin
            </Link>
            <h1 className="text-lg md:text-xl font-bold text-text-primary inline-flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent-blue" />
              Outreach territory dashboard
            </h1>
            <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
              {contacts.length} contacts across {new Set(contacts.map((c) => c.account_display_name)).size} accounts
            </p>
          </div>
          {latestRun && (
            <Link
              href={`/outreach/runs/${latestRun.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-accent-blue/10 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/20 transition-colors"
            >
              Today&apos;s run · {latestRun.run_date} ({latestRun.total_contacts})
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <DashboardClient contacts={contacts} latestRunId={latestRun?.id ?? null} />
      </main>
    </div>
  );
}

async function loadContacts(limit: number): Promise<OutreachContactRow[]> {
  const { rows } = await query<OutreachContactRow>(
    `SELECT * FROM outreach_contacts
       ORDER BY signal_latest_at DESC
       LIMIT $1`,
    [limit],
  );
  return rows;
}

type LinkedProspect = NonNullable<OutreachContactResponse['linked_prospect']>;

async function attachLinkedProspects(
  contacts: OutreachContactRow[],
): Promise<Array<{ contact: OutreachContactRow; linkedProspect: LinkedProspect | null }>> {
  if (contacts.length === 0) return [];
  type ProspectLite = {
    id: string;
    slug: string;
    name: string;
    email: string | null;
    linkedin_url: string | null;
    last_sequence_sent: number | null;
    last_email_send_date: string | null;
    replied: boolean;
  };
  const ids = contacts
    .map((c) => c.promoted_to_prospect_id)
    .filter((v): v is string => !!v);
  const linkedinUrls = Array.from(
    new Set(contacts.map((c) => c.linkedin_url).filter((v): v is string => !!v)),
  );
  const emails = Array.from(
    new Set(contacts.map((c) => c.work_email?.toLowerCase()).filter((v): v is string => !!v)),
  );
  const { rows } = await query<ProspectLite>(
    `SELECT id, slug, name, email, linkedin_url, last_sequence_sent,
            to_char(last_email_send_date, 'YYYY-MM-DD') AS last_email_send_date, replied
       FROM prospects
       WHERE id = ANY($1::uuid[])
          OR (linkedin_url IS NOT NULL AND linkedin_url = ANY($2::text[]))
          OR (email IS NOT NULL AND lower(email) = ANY($3::text[]))`,
    [ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000'], linkedinUrls, emails],
  );
  const byId = new Map(rows.map((r) => [r.id, r]));
  const byLinkedinUrl = new Map(
    rows.filter((r) => r.linkedin_url).map((r) => [r.linkedin_url as string, r]),
  );
  const byEmail = new Map(
    rows
      .filter((r) => r.email)
      .map((r) => [(r.email as string).toLowerCase(), r]),
  );
  return contacts.map((contact) => {
    let prospect: ProspectLite | null = null;
    let via: 'promoted' | 'natural_key' = 'promoted';
    if (contact.promoted_to_prospect_id) {
      prospect = byId.get(contact.promoted_to_prospect_id) ?? null;
      via = 'promoted';
    }
    if (!prospect && contact.linkedin_url) {
      prospect = byLinkedinUrl.get(contact.linkedin_url) ?? null;
      via = 'natural_key';
    }
    if (!prospect && contact.work_email) {
      prospect = byEmail.get(contact.work_email.toLowerCase()) ?? null;
      via = 'natural_key';
    }
    if (!prospect) return { contact, linkedProspect: null };
    return {
      contact,
      linkedProspect: {
        id: prospect.id,
        slug: prospect.slug,
        name: prospect.name,
        last_sequence_sent: prospect.last_sequence_sent ?? null,
        next_email_send_date: computeNextEmailSendDate({
          last_sequence_sent: prospect.last_sequence_sent ?? null,
          last_email_send_date: prospect.last_email_send_date ?? null,
          replied: prospect.replied,
        }),
        replied: prospect.replied,
        via,
      },
    };
  });
}
