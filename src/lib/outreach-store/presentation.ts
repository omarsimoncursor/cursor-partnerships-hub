// Wire-shape converters for the API responses. Mirrors the
// `toChatgtmResponse` / `toPublic` pattern in prospect-store. Keeps
// the response shape decoupled from the row shape so we can rename
// columns without breaking the dashboard or the agent.

import type {
  OutreachContactRow,
  OutreachContactSignalRow,
  OutreachRunRow,
} from './types';

export type OutreachRunResponse = OutreachRunRow;

export type OutreachContactResponse = OutreachContactRow & {
  // Signals attached when the caller asked for include=signals.
  signals?: OutreachContactSignalRow[];
  // Cross-link: when the contact's linkedin_url or work_email matches
  // a row in `prospects`, surface a tiny summary so the dashboard
  // can render a "★ in cold sequence step N/6" badge without a
  // second fetch. Promotion always flips this on (and points at the
  // same row).
  linked_prospect?: {
    id: string;
    slug: string;
    name: string;
    last_sequence_sent: number | null;
    next_email_send_date: string | null;
    replied: boolean;
    via: 'promoted' | 'natural_key';
  } | null;
};

export function toRunResponse(row: OutreachRunRow): OutreachRunResponse {
  return row;
}

export function toContactResponse(
  row: OutreachContactRow,
  opts: {
    signals?: OutreachContactSignalRow[];
    linkedProspect?: OutreachContactResponse['linked_prospect'];
  } = {},
): OutreachContactResponse {
  const out: OutreachContactResponse = { ...row };
  if (opts.signals !== undefined) out.signals = opts.signals;
  if (opts.linkedProspect !== undefined) out.linked_prospect = opts.linkedProspect;
  return out;
}
