'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Clock, ExternalLink, Loader2, RefreshCw, X } from 'lucide-react';

type EventRow = {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  occurred_at: string;
  session_id: string | null;
  ip: string | null;
  user_agent: string | null;
};

type Props = {
  prospect: { id: string; slug: string; name: string; company_name: string };
  apiToken: string;
  onClose: () => void;
};

// Human-friendly labels for the whitelisted event types. Keeps the
// timeline readable for reps who don't speak event-type slug.
const EVENT_LABELS: Record<string, string> = {
  'page.view': 'Opened the locked demo URL',
  'page.unlocked': 'Unlocked the demo and saw the page',
  'unlock.attempt': 'Attempted to unlock the demo',
  'unlock.success': 'Entered the correct password',
  'unlock.failure': 'Entered a wrong password',
  'cta.click': 'Clicked a hero CTA',
  'vendor.run': 'Ran a vendor demo',
  'vendor.reset': 'Reset a vendor demo',
  'vendor.complete': 'Watched a vendor demo finish',
  'sdk.starter_loaded': 'Loaded a starter SDK workflow',
  'sdk.run': 'Ran the SDK workflow',
  'sdk.complete': 'Watched the SDK workflow finish',
  'sdk.artifact_opened': 'Opened an SDK artifact',
  'sdk.reset': 'Reset the SDK demo',
  'roi.changed': 'Adjusted the ROI sliders',
  'roi.pricing_assumptions_viewed': 'Hovered the ROI pricing assumptions',
  'nav.section_anchor': 'Jumped to a section via anchor',
  'page.exit': 'Left the page',
};

export function ActivityModal({ prospect, apiToken, onClose }: Props) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chatgtm/prospects/${prospect.id}/events?limit=500`, {
        headers: { Authorization: `Bearer ${apiToken}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.detail || `Load failed (${res.status})`);
        return;
      }
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospect.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Group events by session so reps can read each visit as a coherent
  // narrative ("they unlocked, ran two demos, opened the Jira artifact,
  // adjusted ROI, then exited").
  const sessions = useMemo(() => {
    const byId = new Map<string, EventRow[]>();
    for (const ev of events) {
      const key = ev.session_id || '__no_session__';
      if (!byId.has(key)) byId.set(key, []);
      byId.get(key)!.push(ev);
    }
    return Array.from(byId.entries()).map(([id, evs]) => {
      const sorted = [...evs].sort((a, b) => +new Date(a.occurred_at) - +new Date(b.occurred_at));
      return { id, events: sorted, start: sorted[0]?.occurred_at, end: sorted.at(-1)?.occurred_at };
    });
  }, [events]);

  // Top-line counts the rep wants at a glance.
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const ev of events) c[ev.event_type] = (c[ev.event_type] || 0) + 1;
    return c;
  }, [events]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-dark-border bg-dark-bg shadow-2xl flex flex-col max-h-[90vh]">
        <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary inline-flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              Activity timeline
            </p>
            <h2 className="text-base font-semibold text-text-primary">
              {prospect.name}
              <span className="text-text-tertiary"> — {prospect.company_name}</span>
            </h2>
            <a
              href={`/p/${prospect.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-accent-blue hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
            >
              /p/{prospect.slug}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary border border-dark-border hover:border-dark-border-hover rounded-md px-2 py-1.5"
              title="Reload"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Reload
            </button>
            <button
              onClick={onClose}
              className="p-1 text-text-tertiary hover:text-text-primary"
              aria-label="Close activity modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="px-6 py-4 border-b border-dark-border bg-dark-surface">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Total events" value={events.length} />
            <Stat label="Sessions" value={sessions.filter((s) => s.id !== '__no_session__').length} />
            <Stat label="Page views" value={(counts['page.view'] || 0) + (counts['page.unlocked'] || 0)} />
            <Stat label="Vendor runs" value={counts['vendor.run'] || 0} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {error && (
            <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-xs text-accent-red">
              {error}
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-dark-border p-10 text-center">
              <p className="text-sm text-text-secondary">No activity recorded yet.</p>
              <p className="text-[11px] text-text-tertiary mt-1">
                The prospect hasn&apos;t opened their demo URL.
              </p>
            </div>
          )}

          {sessions.map((session, sessionIndex) => (
            <div key={session.id}>
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary">
                  Session {sessions.length - sessionIndex}
                  {session.id !== '__no_session__' && (
                    <span className="ml-1 text-text-tertiary/70 normal-case">
                      ({session.id.slice(0, 14)})
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-text-tertiary tabular-nums">
                  {session.start && session.end ? `${fmtTime(session.start)} \u2192 ${fmtTime(session.end)}` : ''}
                </p>
              </div>
              <ol className="relative border-l border-dark-border ml-1.5 space-y-2 pl-4">
                {session.events.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span
                      className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-dark-bg"
                      style={{ background: colorFor(ev.event_type) }}
                    />
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: colorFor(ev.event_type) }}>
                        {ev.event_type}
                      </span>
                      <span className="text-[11px] text-text-tertiary tabular-nums inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fmtTime(ev.occurred_at)}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary leading-snug">
                      {EVENT_LABELS[ev.event_type] || ev.event_type}
                    </p>
                    {Object.keys(ev.event_data || {}).length > 0 && (
                      <p className="text-[11px] text-text-tertiary mt-0.5 font-mono break-all">
                        {Object.entries(ev.event_data)
                          .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                          .join(' \u00b7 ')}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-dark-border bg-dark-bg px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider font-mono text-text-tertiary">{label}</p>
      <p className="text-lg font-semibold text-text-primary tabular-nums">{value}</p>
    </div>
  );
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

// Coarse color buckets so the timeline is scannable. Greens are
// positive engagement, blues are content interactions, amber is meta
// (CTAs, exit, navigation), red is failure.
function colorFor(type: string): string {
  if (type.startsWith('unlock.success') || type === 'page.unlocked' || type === 'vendor.complete' || type === 'sdk.complete') return '#4ade80';
  if (type.startsWith('unlock.fail') || type === 'unlock.failure') return '#f87171';
  if (type.startsWith('vendor.') || type.startsWith('sdk.') || type === 'roi.changed') return '#60a5fa';
  if (type === 'cta.click' || type === 'nav.section_anchor') return '#fbbf24';
  if (type === 'page.exit') return '#a3a3a3';
  return '#a3a3a3';
}
