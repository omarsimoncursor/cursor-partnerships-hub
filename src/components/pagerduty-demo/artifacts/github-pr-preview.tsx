'use client';

import {
  Book,
  Check,
  ChevronDown,
  Eye,
  GitMerge,
  GitPullRequest,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react';

export function GitHubPRPreview() {
  return (
    <div className="w-full h-full bg-[#0d1117] text-[#e6edf3] overflow-y-auto font-sans">
      {/* Top header */}
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-4">
          <svg viewBox="0 0 16 16" className="w-8 h-8 fill-white">
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>

          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#4493f8] hover:underline cursor-pointer">acme-eng</span>
            <span className="text-[#7d8590]">/</span>
            <span className="text-[#4493f8] hover:underline cursor-pointer font-semibold">
              payments-api
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[11px] text-[#7d8590]">
            Private
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Watch
              <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">28</span>
            </button>
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]">
              ★ Star
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">94</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-1 text-[13.5px]">
          <NavTab label="Code" />
          <NavTab label="Issues" count="7" />
          <NavTab label="Pull requests" count="3" active />
          <NavTab label="Actions" />
          <NavTab label="Projects" />
          <NavTab label="Wiki" />
          <NavTab label="Security" />
          <NavTab label="Insights" />
          <NavTab label="Settings" />
        </div>
      </div>

      {/* PR header */}
      <div className="max-w-[1280px] mx-auto px-5 pt-6 pb-4 border-b border-[#30363d]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-[26px] font-normal text-[#e6edf3] leading-tight">
            revert: roll back v1.43.0 (resolves INC-21487)
            <span className="text-[#7d8590] ml-2 font-light">#318</span>
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13px] font-medium">
              Code ▾
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f6feb] text-white text-[13px] font-medium">
            <GitPullRequest className="w-4 h-4" />
            Open
          </span>
          <p className="text-[14px] text-[#7d8590]">
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">
              cursor-agent
            </span>{' '}
            wants to merge{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">1 commit</span> into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">
              main
            </span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">
              revert/v1.43.0-bank-transfer
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px]">
          <PrTab
            label="Conversation"
            count="4"
            active
            icon={<MessageSquare className="w-3.5 h-3.5" />}
          />
          <PrTab label="Commits" count="1" />
          <PrTab
            label="Checks"
            count="5"
            icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />}
          />
          <PrTab label="Files changed" count="1" />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-5 py-6 grid grid-cols-[1fr_296px] gap-6">
        <div className="min-w-0 space-y-4">
          <PrComment>
            <PrCommentHeader author="cursor-agent" bot label="authored" time="3 minutes ago" />
            <div className="text-[14px] text-[#e6edf3] leading-relaxed space-y-4">
              <section>
                <h3 className="font-semibold text-[15px] mb-1">Summary</h3>
                <p>
                  Revert{' '}
                  <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">
                    a4f2e1b
                  </span>{' '}
                  (&quot;feat: bank-transfer support&quot;) to resolve a P1 SLO breach on
                  payments-api. Pure subtractive change. Settlement worker contention identified
                  as the root cause; fix-forward is blocked on a schema migration and will land in
                  a separate PR after design review.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Triage decision (from agent)</h3>
                <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#30363d] bg-[#151b23] text-[12px] text-[#7d8590] font-mono">
                    opus · triage · confidence 0.93
                  </div>
                  <div className="px-3 py-3 text-[12.5px] text-[#e6edf3] font-mono leading-relaxed">
                    Decision: <span className="text-[#3fb950]">revert</span>
                    <br />
                    Rationale: forward-fix would require a schema migration on{' '}
                    <span className="text-[#4493f8]">payments_transfers</span>; revert is mechanical
                    and reversible. Settlement-worker contention pattern not safe to retry without
                    isolation.
                    <br />
                    Confidence floor: 0.7 · observed: 0.93 · auto-promote allowed.
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Recovery telemetry</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Metric</th>
                        <th className="px-3 py-2 text-right font-semibold">Before</th>
                        <th className="px-3 py-2 text-right font-semibold">After (revert)</th>
                        <th className="px-3 py-2 text-right font-semibold">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">5xx error rate</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">7.4%</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">0.0%</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−100%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">P99 latency</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">2,840ms</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">118ms</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−95.8%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Burn rate</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">36×</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">0×</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">resolved</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Humans paged</td>
                        <td className="px-3 py-2 text-right font-mono">would be 2</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">0</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Diff preview</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre text-[#e6edf3]">
<span>{`  diff --git a/src/lib/payments/transfer.ts b/src/lib/payments/transfer.ts
  index a4f2e1b..1c8d4f2 100644
`}</span>
<span className="bg-[#301216] text-[#f85149]">{`- export async function chargeWithTransfer(req: ChargeRequest) {
-   const transferRow = await db.payments_transfers.create({
-     data: { id: req.id, amount: req.amount, status: 'pending' },
-   });
-   return processCharge({ ...req, transferId: transferRow.id });
- }
`}</span>
<span className="bg-[#102a1a] text-[#3fb950]">{`+ export async function chargeWithTransfer(req: ChargeRequest) {
+   return processCharge(req);
+ }
`}</span>
                  </pre>
                </div>
                <p className="text-[12.5px] text-[#7d8590] mt-2">
                  Pure subtraction — 218 lines removed across one file. Type surface unchanged.
                  Public API unchanged. The revert restores the v1.42.1 hot path verbatim.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Evidence</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    PagerDuty:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer">INC-21487</span>{' '}
                    (auto-resolved · 4m 12s · 0 humans paged)
                  </li>
                  <li>
                    Datadog monitor:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer">
                      #42971 (payments-api 5xx)
                    </span>
                  </li>
                  <li>
                    Datadog APM trace:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">
                      9c1e447d2b8f3a55
                    </span>
                  </li>
                  <li>
                    Statuspage:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer">
                      status.acme.com/payments-api
                    </span>{' '}
                    · 3 updates posted
                  </li>
                  <li>
                    Postmortem:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer">
                      docs/postmortems/2026-04-23-INC-21487.md
                    </span>{' '}
                    (draft, awaiting human sign-off)
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Blast radius: 1 file · −218 +4 · pure subtractive</li>
                  <li>
                    Type surface: <span className="text-[#3fb950]">unchanged</span>
                  </li>
                  <li>
                    Schema impact:{' '}
                    <span className="text-[#3fb950]">none</span> — revert never created the
                    transfers table column.
                  </li>
                  <li>
                    Rollback:{' '}
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">
                      git revert HEAD
                    </code>{' '}
                    re-introduces v1.43.0 — only do this with the schema migration in front.
                  </li>
                </ul>
              </section>
            </div>
          </PrComment>

          <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
            <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#10a37f]/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3fb950]" />
            </div>
            <p className="text-[13px] text-[#7d8590]">
              <span className="text-[#e6edf3] font-semibold">codex-bot</span> approved these changes
              <span className="ml-1">· just now</span>
            </p>
          </div>

          <PrComment>
            <PrCommentHeader
              author="codex-bot"
              bot
              label="reviewed"
              time="just now"
            />
            <div className="px-4 py-3 text-[14px] text-[#e6edf3] leading-relaxed">
              <p className="mb-2">
                Verified the revert is purely subtractive. No unrelated files touched. No semver
                bump. Rollback path is safe given the schema column was never created.
              </p>
              <p className="text-[#7d8590] text-[12.5px]">
                Reviewed: 1 file · 222 lines · +4 −218 · code review depth model.
              </p>
            </div>
          </PrComment>

          <PrComment>
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#3fb950] bg-[#238636]/20 rounded-full p-0.5" />
                <span className="text-[14px] font-semibold text-[#e6edf3]">
                  All checks have passed
                </span>
              </div>
              <button className="text-[12.5px] text-[#4493f8] hover:underline">
                Show all checks
              </button>
            </div>
            <div className="divide-y divide-[#30363d] text-[13px]">
              <CheckRow name="typecheck" detail="npx tsc --noEmit" duration="3s" />
              <CheckRow name="lint" detail="eslint + prettier" duration="2s" />
              <CheckRow name="unit-tests" detail="vitest · 84 passed" duration="9s" />
              <CheckRow
                name="canary-deploy"
                detail="5% us-west-2 · 5xx 0.0% · 60s sustained"
                duration="42s"
              />
              <CheckRow
                name="slo-gate"
                detail="payments-api 5xx < 0.5% · gate passed"
                duration="2s"
              />
            </div>
          </PrComment>

          <PrComment>
            <div className="px-4 py-4 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-[#3fb950]" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#e6edf3]">
                  This branch has no conflicts with the base branch
                </p>
                <p className="text-[12.5px] text-[#7d8590]">
                  Merging is restricted until the on-call signs off on the postmortem.
                </p>
              </div>
              <button className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13.5px] font-medium">
                Merge pull request
              </button>
            </div>
          </PrComment>
        </div>

        <aside className="space-y-5 text-[12.5px]">
          <SidebarSection title="Reviewers">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
              <span className="text-[#e6edf3]">codex-bot</span>
              <span className="ml-auto text-[#3fb950]">✓ approved</span>
            </SidebarRow>
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#9AA7B5]/20 flex items-center justify-center">
                <span className="text-[#9AA7B5] text-[10px] font-bold">A</span>
              </div>
              <span className="text-[#e6edf3]">@sre-rotation</span>
              <span className="ml-auto text-[#7d8590]">requested</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Assignees">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <span className="text-[#e6edf3]">cursor-agent</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Labels">
            <div className="flex flex-wrap gap-1.5">
              <Label color="#DC3545" label="incident-response" />
              <Label color="#06AC38" label="auto-resolved" />
              <Label color="#A371F7" label="revert" />
              <Label color="#F5A623" label="P1" />
              <Label color="#7D8590" label="pagerduty-triage" />
            </div>
          </SidebarSection>
          <SidebarSection title="Linked artifacts">
            <div className="space-y-1 text-[#7d8590]">
              <p className="text-[#4493f8] hover:underline cursor-pointer">INC-21487 (PagerDuty)</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">PAY-2204 (Jira)</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">
                postmortem · 2026-04-23
              </p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">
                statuspage · payments-api
              </p>
            </div>
          </SidebarSection>
          <SidebarSection title="Verified by Cursor agent">
            <div className="rounded-md border border-[#06AC38]/40 bg-[#06AC38]/10 px-3 py-2.5 space-y-1">
              <p className="text-[#3fb950] font-medium flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Auto-pilot verified
              </p>
              <p className="text-[11px] text-[#7d8590] font-mono">
                Canary 0.0% 5xx · SLO inside budget for 2m before resolve.
              </p>
            </div>
          </SidebarSection>
          <SidebarSection title="2 participants">
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
            </div>
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}

function NavTab({
  label,
  count,
  active,
}: {
  label: string;
  count?: string;
  active?: boolean;
}) {
  return (
    <button
      className={`px-3 py-3 text-[13.5px] flex items-center gap-1.5 border-b-2 ${
        active
          ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
          : 'border-transparent text-[#e6edf3] hover:border-[#30363d]'
      }`}
    >
      {label === 'Wiki' && <Book className="w-3.5 h-3.5" />}
      {label}
      {count && (
        <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">
          {count}
        </span>
      )}
    </button>
  );
}

function PrTab({
  label,
  count,
  active,
  icon,
}: {
  label: string;
  count?: string;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      className={`px-4 py-3 flex items-center gap-1.5 border-b-2 ${
        active
          ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
          : 'border-transparent text-[#e6edf3] hover:text-[#e6edf3]'
      }`}
    >
      {icon}
      {label}
      {count && (
        <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">
          {count}
        </span>
      )}
    </button>
  );
}

function PrComment({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">
      {children}
    </div>
  );
}

function PrCommentHeader({
  author,
  bot,
  label,
  time,
}: {
  author: string;
  bot?: boolean;
  label: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#151b23]">
      <div className="flex items-center gap-2 text-[13px]">
        <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
          <span className="text-accent-blue text-[10px] font-bold">{author[0].toUpperCase()}</span>
        </div>
        <span className="font-semibold text-[#e6edf3]">{author}</span>
        {bot && (
          <span className="px-1.5 py-0.5 rounded-full border border-[#30363d] text-[10px] text-[#7d8590]">
            bot
          </span>
        )}
        <span className="text-[#7d8590]">
          {label} · {time}
        </span>
      </div>
      <button className="text-[#7d8590] hover:text-[#e6edf3]">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckRow({
  name,
  detail,
  duration,
}: {
  name: string;
  detail: string;
  duration: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Check className="w-4 h-4 text-[#3fb950] shrink-0" />
      <span className="font-mono text-[12.5px] text-[#e6edf3] font-medium">{name}</span>
      <span className="text-[#7d8590] truncate">{detail}</span>
      <span className="ml-auto text-[#7d8590] font-mono text-[11.5px]">{duration}</span>
      <span className="text-[#4493f8] text-[11.5px] hover:underline cursor-pointer">Details</span>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#30363d] pb-4">
      <div className="flex items-center justify-between mb-2 text-[#7d8590]">
        <span className="font-semibold">{title}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
      {children}
    </div>
  );
}

function SidebarRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-[13px]">{children}</div>;
}

function Label({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{
        backgroundColor: `${color}22`,
        borderColor: `${color}55`,
        color,
      }}
    >
      {label}
    </span>
  );
}
