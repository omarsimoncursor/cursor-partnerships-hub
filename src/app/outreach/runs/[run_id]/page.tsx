import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Inbox } from 'lucide-react';
import {
  getContactsByRunId,
  getRunById,
  getSignalsForRun,
  toContactResponse,
  type OutreachContactResponse,
  type OutreachContactRow,
} from '@/lib/outreach-store';
import { ensureSchema, isDatabaseConfigured } from '@/lib/prospect-store';
import { query } from '@/lib/prospect-store/db';
import { computeNextEmailSendDate } from '@/lib/prospect-store/sequence-cadence';
import { RunView } from './run-view';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function RunPage({
  params,
}: {
  params: Promise<{ run_id: string }>;
}) {
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
  const { run_id: runId } = await params;
  const run = await getRunById(runId);
  if (!run) notFound();

  const contacts = await getContactsByRunId(runId);
  const signalsByContact = await getSignalsForRun(runId);

  // Cross-link to cold prospects: a contact's promoted_to_prospect_id
  // OR natural-key match (linkedin_url || work_email) lights up the
  // "in cold sequence" badge. We do this in a single SQL query to
  // avoid N round-trips per run.
  const contactsWithLink = await attachLinkedProspects(contacts);

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="border-b border-dark-border px-6 py-4 sticky top-0 bg-dark-bg/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <Link
              href="/outreach/dashboard"
              className="inline-flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-secondary mb-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Territory dashboard
            </Link>
            <h1 className="text-lg md:text-xl font-bold text-text-primary inline-flex items-center gap-2">
              <Inbox className="w-4 h-4 text-accent-blue" />
              Outreach run · {run.run_date}
            </h1>
            <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
              {run.user_email} · ran {new Date(run.ran_at).toLocaleString()} ·{' '}
              window {new Date(run.window_start).toLocaleString()} →{' '}
              {new Date(run.window_end).toLocaleString()}
            </p>
          </div>
          <div className="text-[11px] text-text-tertiary font-mono inline-flex flex-wrap gap-x-3 gap-y-1">
            <span>{run.total_contacts} contacts</span>
            <span>{run.unique_executives}x exec</span>
            <span>{run.unique_leaders}x leader</span>
            <span>{run.unique_managers}x mgr</span>
            <span>{run.count_with_work_email} w/ email</span>
            <span>{run.count_with_linkedin_url} w/ LI</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <RunView
          contacts={contactsWithLink.map((c) =>
            toContactResponse(c.contact, {
              signals: signalsByContact.get(c.contact.id) ?? [],
              linkedProspect: c.linkedProspect,
            }),
          )}
          accountsWithActivity={run.accounts_with_activity}
          accountsWithNoSignals={run.accounts_with_no_signals}
        />
      </main>
    </div>
  );
}

type LinkedProspect = NonNullable<OutreachContactResponse['linked_prospect']>;

/**
 * Single-query join: for each contact, find a matching prospect row
 * via (a) the FK if we already promoted, otherwise (b) a natural-key
 * match on linkedin_url or work_email. Returns the contact + the
 * cross-link summary.
 */
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
