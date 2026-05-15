'use client';

import { Activity, Bell, CheckCircle2, Clock, Rss, Server } from 'lucide-react';

// ----------------------------------------------------------------
// Statuspage public component — pixel-perfect mock of an Atlassian
// Statuspage incident page. Light theme, brand green, inverted from PD.
// ----------------------------------------------------------------

interface UpdateRow {
  status: 'Investigating' | 'Identified' | 'Resolved';
  time: string;
  body: string;
}

const UPDATES: UpdateRow[] = [
  {
    status: 'Resolved',
    time: 'Apr 23, 03:18:34 PT',
    body:
      'A regression introduced in v1.43.0 was reverted. All payments traffic restored. Postmortem to follow.',
  },
  {
    status: 'Identified',
    time: 'Apr 23, 03:15:48 PT',
    body:
      'Root cause traced to a regression in the v1.43.0 deploy of payments-api. Reverting now via revert PR #318. Canary will be evaluated against the SLO before promotion.',
  },
  {
    status: 'Investigating',
    time: 'Apr 23, 03:15:00 PT',
    body:
      'We are investigating elevated 5xx errors on the payments API. Some customers may see failed transactions. Engineering is engaged.',
  },
];

const STATUS_TONE: Record<UpdateRow['status'], { bg: string; text: string; border: string }> = {
  Resolved:     { bg: '#E8F8EE', text: '#057A28', border: '#B7E5C7' },
  Identified:   { bg: '#FFF4E5', text: '#B86E00', border: '#FFD2A8' },
  Investigating:{ bg: '#FBE9EB', text: '#B82332', border: '#F2C7CC' },
};

export function StatuspageUpdate() {
  return (
    <div
      className="w-full h-full overflow-y-auto font-sans"
      style={{ background: '#FFFFFF', color: '#1A2433' }}
    >
      {/* Site header */}
      <header
        className="border-b"
        style={{ borderColor: '#E1E5EA', background: '#FAFBFC' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: '#0F172A' }}
          >
            <span className="text-[14px] font-bold text-white">A</span>
          </div>
          <div>
            <h1 className="text-[16px] font-semibold" style={{ color: '#0F172A' }}>
              Acme Status
            </h1>
            <p className="text-[11px]" style={{ color: '#5A6B7C' }}>
              status.acme.com · payments-api
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 text-[11.5px]" style={{ color: '#5A6B7C' }}>
            <button className="flex items-center gap-1 hover:text-[#0F172A]">
              <Rss className="w-3.5 h-3.5" /> RSS
            </button>
            <button className="flex items-center gap-1 hover:text-[#0F172A]">
              <Bell className="w-3.5 h-3.5" /> Subscribe
              <span
                className="px-1.5 py-0.5 rounded font-mono"
                style={{ background: '#F0F2F5' }}
              >
                4,128
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Current operational banner */}
      <div
        className="px-6 py-4 border-b"
        style={{
          background: 'linear-gradient(180deg, #E8F8EE 0%, #FAFBFC 100%)',
          borderColor: '#B7E5C7',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6" style={{ color: '#06AC38' }} />
          <div>
            <p className="text-[15px] font-semibold" style={{ color: '#057A28' }}>
              All systems operational
            </p>
            <p className="text-[12px]" style={{ color: '#5A6B7C' }}>
              Last updated{' '}
              <span className="font-mono">Apr 23, 03:18:34 PT</span> · auto-refreshing
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[11px]" style={{ color: '#5A6B7C' }}>
            <Clock className="w-3 h-3" />
            <span className="font-mono">Uptime · 99.987% / 90 days</span>
          </div>
        </div>
      </div>

      {/* Components list (compact) */}
      <div className="max-w-4xl mx-auto px-6 py-5 border-b" style={{ borderColor: '#E1E5EA' }}>
        <p
          className="text-[10.5px] uppercase tracking-wider mb-3 font-semibold"
          style={{ color: '#5A6B7C' }}
        >
          Components
        </p>
        <div
          className="rounded-lg border divide-y"
          style={{ borderColor: '#E1E5EA', background: '#FFFFFF' }}
        >
          <ComponentRow name="payments-api" status="Operational" detail="Recovered from incident · 4m 12s ago" />
          <ComponentRow name="payments-webhooks" status="Operational" detail="Healthy" />
          <ComponentRow name="dashboard" status="Operational" detail="Healthy" />
          <ComponentRow name="settlement worker" status="Operational" detail="Healthy" />
        </div>
      </div>

      {/* Incident card */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <p
          className="text-[10.5px] uppercase tracking-wider mb-3 font-semibold"
          style={{ color: '#5A6B7C' }}
        >
          Recent incident
        </p>

        <article
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: '#E1E5EA', background: '#FFFFFF' }}
        >
          <header
            className="px-5 py-4 border-b flex items-start justify-between gap-3"
            style={{ borderColor: '#E1E5EA' }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                  style={{
                    background: STATUS_TONE.Resolved.bg,
                    color: STATUS_TONE.Resolved.text,
                    borderColor: STATUS_TONE.Resolved.border,
                  }}
                >
                  Resolved
                </span>
                <span className="text-[11px] font-mono" style={{ color: '#5A6B7C' }}>
                  Apr 23 · payments-api
                </span>
              </div>
              <h2
                className="text-[18px] font-semibold leading-tight"
                style={{ color: '#0F172A' }}
              >
                Elevated 5xx errors on payments API
              </h2>
              <p className="text-[12.5px] mt-1" style={{ color: '#5A6B7C' }}>
                Duration:{' '}
                <span className="font-mono" style={{ color: '#0F172A' }}>
                  4m 12s
                </span>{' '}
                · Affected components:{' '}
                <span className="font-mono" style={{ color: '#0F172A' }}>
                  payments-api
                </span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#5A6B7C' }}>
              <Server className="w-3.5 h-3.5" />
              <span className="font-mono">Posted by Cursor automation</span>
            </div>
          </header>

          <ol className="divide-y" style={{ borderColor: '#E1E5EA' }}>
            {UPDATES.map((u, i) => {
              const tone = STATUS_TONE[u.status];
              return (
                <li key={i} className="px-5 py-4">
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <span
                      className="text-[10.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0"
                      style={{
                        background: tone.bg,
                        color: tone.text,
                        borderColor: tone.border,
                      }}
                    >
                      {u.status}
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: '#5A6B7C' }}>
                      {u.time}
                    </span>
                  </div>
                  <p
                    className="text-[13.5px] leading-relaxed"
                    style={{ color: '#1A2433' }}
                  >
                    {u.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </article>

        <div
          className="mt-5 rounded-lg border px-4 py-3 flex items-center gap-3 text-[12px]"
          style={{ background: '#F0FDF4', borderColor: '#B7E5C7', color: '#057A28' }}
        >
          <Activity className="w-4 h-4" />
          <span>
            Posted automatically via the Cursor + Statuspage integration. All updates were
            reviewed against the brand-voice template before publishing.
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="border-t px-6 py-4"
        style={{ borderColor: '#E1E5EA', background: '#FAFBFC' }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between text-[11px]" style={{ color: '#5A6B7C' }}>
          <span>Powered by Statuspage</span>
          <span className="font-mono">RSS · API · status.acme.com</span>
        </div>
      </footer>
    </div>
  );
}

function ComponentRow({
  name,
  status,
  detail,
}: {
  name: string;
  status: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#06AC38' }} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium" style={{ color: '#0F172A' }}>
          {name}
        </p>
        <p className="text-[11px]" style={{ color: '#5A6B7C' }}>
          {detail}
        </p>
      </div>
      <span
        className="text-[11px] font-medium px-2 py-0.5 rounded"
        style={{ background: '#E8F8EE', color: '#057A28' }}
      >
        {status}
      </span>
    </div>
  );
}
