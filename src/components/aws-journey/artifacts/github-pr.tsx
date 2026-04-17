'use client';

import { CHARACTERS } from '../data/characters';

export function GitHubPrArtifact() {
  return (
    <article className="bg-white p-6 text-[#1F2328]">
      <header className="mb-4 border-b pb-3" style={{ borderColor: '#D1D9E0' }}>
        <div className="mb-1 flex items-center gap-2 text-[12px] text-[#57606A]">
          <span className="font-mono">acme/orders-modernization</span>
          <span>·</span>
          <span>#247</span>
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
            style={{ background: '#8250DF' }}
          >
            Merged
          </span>
        </div>
        <h2 className="text-xl font-bold">
          OrdersService cutover: canary workflow + parity-diff Lambda
        </h2>
        <div className="mt-2 text-[13px] text-[#57606A]">
          <span className="font-mono font-semibold text-[#0969DA]">cursor-agent</span> wants to merge{' '}
          <span className="font-mono">main ← release/orders-cutover-v1</span> · 18 commits · 1,487 additions, 214 deletions
        </div>
      </header>

      <section className="mb-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#57606A]">Summary</h3>
        <ul className="space-y-1 text-[13px]">
          <li>· Adds <code className="rounded bg-[#F6F8FA] px-1 py-0.5 font-mono text-[12px]">orders-stack.ts</code> (CDK) with 6 Lambda handlers + Aurora Serverless v2 cluster</li>
          <li>· Adds parity-diff Lambda (per J. Park review on Day 3) — 15-min cadence, fail-closed @ 0.01% drift</li>
          <li>· Codex auto-patches: IAM scope reduction + VPC endpoints for SecretsManager & RDS</li>
          <li>· Canary orchestration workflow (1% → 10% → 50% → 100%) with automatic rollback on SLO breach</li>
          <li>· Decommissions <code className="rounded bg-[#F6F8FA] px-1 py-0.5 font-mono text-[12px]">OrdersServiceBean</code> EJB (WebSphere)</li>
        </ul>
      </section>

      <section className="mb-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#57606A]">Reviews</h3>
        <ul className="space-y-2 text-[13px]">
          <ReviewRow who="park"  verdict="approved" label="Approved with changes requested — dual-write window extended to 14 days." day="Day 3" />
          <ReviewRow who="chen"  verdict="approved" label="Security approved. CIS §3.1, §4.2 baseline met. Access Analyzer 0 findings." day="Day 11" />
          <ReviewRow who="davis" verdict="approved" label="FinOps approved provisioned concurrency trade-off." day="Day 17" />
          <ReviewRow who="kim"   verdict="approved" label="SRE go. Cutover complete at 14:02 UTC." day="Day 21" />
          <li className="flex items-center gap-2 border-t pt-2 text-[12px] text-[#57606A]" style={{ borderColor: '#D1D9E0' }}>
            <span className="rounded bg-[#DAFBE1] px-1.5 py-0.5 font-semibold text-[#1A7F37]">CI ✓</span>
            <span className="font-mono">47/47 tests passing · coverage 94.7% · build 11.4s</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#57606A]">Files changed (top 6)</h3>
        <ul className="space-y-1 font-mono text-[12px]">
          <FileRow path="lib/cdk/orders-stack.ts" add={412} del={0}  />
          <FileRow path="handlers/create-order.ts" add={128} del={0} />
          <FileRow path="handlers/parity-diff.ts"  add={214} del={0} />
          <FileRow path="db/migrations/orders.createOrderProc.sql" add={187} del={0} />
          <FileRow path="legacy/OrdersServiceBean.java"  add={0} del={208} muted />
          <FileRow path="docs/runbooks/cutover.md" add={147} del={0} />
        </ul>
      </section>
    </article>
  );
}

function ReviewRow({ who, verdict, label, day }: { who: keyof typeof CHARACTERS; verdict: 'approved' | 'requested'; label: string; day: string }) {
  const character = CHARACTERS[who];
  return (
    <li className="flex items-start gap-3 rounded-md border px-3 py-2" style={{ borderColor: '#D1D9E0', background: '#F6F8FA' }}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: character.accent }}>
        {character.name.replace(/\s+/g, '').slice(0, 2).toUpperCase()}
      </span>
      <div className="flex-1">
        <div className="mb-0.5 text-[12px] font-semibold text-[#1F2328]">
          {character.name} · <span className="text-[#57606A] font-normal">{character.role}</span>
          <span className="float-right text-[11px] font-mono text-[#57606A]">{day}</span>
        </div>
        <div className="text-[12px] text-[#1F2328]">
          <span
            className="mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: verdict === 'approved' ? '#DAFBE1' : '#FFF8C5', color: '#1A7F37' }}
          >
            {verdict}
          </span>
          {label}
        </div>
      </div>
    </li>
  );
}

function FileRow({ path, add, del, muted }: { path: string; add: number; del: number; muted?: boolean }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b py-1 last:border-b-0" style={{ borderColor: '#EAEEF2', opacity: muted ? 0.6 : 1 }}>
      <span className="truncate text-[#1F2328]">{path}</span>
      <span className="shrink-0 space-x-2 font-mono text-[11px]">
        <span style={{ color: '#1A7F37' }}>+{add}</span>
        <span style={{ color: '#CF222E' }}>-{del}</span>
      </span>
    </li>
  );
}
