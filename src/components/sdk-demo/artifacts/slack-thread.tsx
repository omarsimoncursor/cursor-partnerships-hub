'use client';

import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';

interface SlackThreadProps {
  script: ResolvedScript;
}

export function SlackThread({ script }: SlackThreadProps) {
  const meta = script.meta;
  return (
    <div className="w-full h-full bg-[#1A1D21] text-[#D1D2D3] overflow-y-auto font-sans">
      <div className="border-b border-[#383B40] px-5 py-3 flex items-center gap-3">
        <span className="text-[#9D9FA1] text-[14px]">#</span>
        <span className="text-[14px] font-semibold text-white">security-incidents</span>
        <span className="text-[12px] text-[#9D9FA1]">
          Live security alerts and response · 18 members
        </span>
      </div>

      <div className="px-5 py-4 max-w-[760px]">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-md bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-[11px] font-bold flex items-center justify-center shrink-0">
            CA
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[14px] font-bold text-white">Cursor Agent</span>
              <span className="text-[10px] px-1.5 py-px rounded bg-[#1264A3] text-white font-semibold">
                APP
              </span>
              <span className="text-[12px] text-[#9D9FA1]">just now</span>
            </div>
            <div className="rounded-md border-l-4 border-accent-amber bg-[#222529] px-4 py-3">
              <p className="text-[14px] text-white font-semibold mb-2">
                🔒 {script.title} · {meta.jiraId}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                <Field label="Service" value={meta.prRepo.split('/')[1]} />
                <Field label="Severity" value="P0" />
                <Field label="Status" value="Resolved · Awaiting human review" />
                <Field label="Run id" value={meta.agentId} mono />
              </div>

              <div className="mt-3 pt-3 border-t border-[#383B40]">
                <p className="text-[11px] text-[#9D9FA1] uppercase tracking-wider font-semibold mb-1.5">
                  Containment
                </p>
                <p className="text-[13px] text-white leading-snug">{meta.remediation}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#383B40]">
                <p className="text-[11px] text-[#9D9FA1] uppercase tracking-wider font-semibold mb-1.5">
                  Artifacts
                </p>
                <ul className="text-[13px] space-y-0.5">
                  {meta.evidenceLinks.map((link, i) => (
                    <li key={i}>
                      <span className="text-[#1d9bd1]">{link.label}</span>{' '}
                      <span className="text-[#9D9FA1] font-mono text-[12px]">{link.ref}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 pt-2 flex items-center gap-2 text-[12px] text-[#9D9FA1]">
                <span>👀 1</span>
                <span>✅ 1</span>
                <span>·</span>
                <span>1 reply · last reply 12s ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-12 flex items-start gap-3 mb-2">
          <div className="w-7 h-7 rounded-md bg-[#3F2F77] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            SP
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-bold text-white">Sarah Park</span>
              <span className="text-[12px] text-[#9D9FA1]">12 seconds ago</span>
            </div>
            <p className="text-[13px] text-white leading-snug">
              Thanks Cursor — reviewing the PR now. Holding any history-purge until we coordinate the
              force-push window with the service owners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-[#9D9FA1] uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-[13px] text-white ${mono ? 'font-mono text-[12px]' : ''}`}>{value}</p>
    </div>
  );
}
