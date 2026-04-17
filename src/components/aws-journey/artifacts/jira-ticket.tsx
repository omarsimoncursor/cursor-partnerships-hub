'use client';

import { CHARACTERS } from '../data/characters';

export function JiraTicketArtifact() {
  return (
    <article className="bg-white p-6 text-[#172B4D]">
      <header className="mb-4 flex items-start justify-between gap-6 border-b pb-3" style={{ borderColor: '#DFE1E6' }}>
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px]">
            <span className="rounded-sm bg-[#42526E] px-1.5 py-0.5 font-mono font-semibold text-white">ORDERS-4201</span>
            <span className="text-[#6B778C]">Modernization · Epic</span>
          </div>
          <h2 className="text-xl font-bold">Decompose OrdersService → AWS Lambda + Aurora Serverless v2</h2>
        </div>
        <div className="shrink-0 rounded-md border px-2.5 py-1.5 text-center" style={{ borderColor: '#DFE1E6' }}>
          <div className="text-[10px] uppercase tracking-wider text-[#6B778C]">Status</div>
          <div className="mt-0.5 text-[13px] font-semibold text-[#36B37E]">DONE</div>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_240px] gap-6">
        <div>
          <Field label="Description">
            Strangler-fig migration of the OrdersService bounded context from WebSphere 8.5 + Oracle 12c to AWS Lambda + Aurora Serverless v2.
            Completed in 22 calendar days with 4 named review gates. Cutover at Day 21; hyper-care closed Day 23.
          </Field>

          <Field label="Acceptance criteria">
            <ul className="mt-1 space-y-1 text-[13px]">
              <li>✓ All 47 integration tests green</li>
              <li>✓ p99 latency &lt; 400 ms under 12k rps</li>
              <li>✓ IAM least-privilege verified by Access Analyzer (0 findings)</li>
              <li>✓ Dual-write drift &lt; 0.01% over 14 days</li>
              <li>✓ FinOps sign-off: $527/mo vs $70k/mo monolith allocation</li>
              <li>✓ SRE sign-off: 0 P1/P2 incidents during 48h hyper-care</li>
            </ul>
          </Field>

          <Field label="Linked commits">
            <ul className="mt-1 space-y-0.5 font-mono text-[12px] text-[#0052CC]">
              <li>· <span className="underline">acme/orders-modernization</span>#47f9c2d — OrdersStack scaffold</li>
              <li>· <span className="underline">acme/orders-modernization</span>#a31b7a4 — Codex IAM scope patch</li>
              <li>· <span className="underline">acme/orders-modernization</span>#d9e4581 — parity-diff Lambda</li>
              <li>· <span className="underline">acme/orders-modernization</span>#cf0a19f — canary cutover workflow</li>
            </ul>
          </Field>

          <Field label="Timeline">
            <ol className="mt-1 space-y-1 text-[12px]">
              <li><b>Day 1–3</b>  · Discovery (Atlas) · 38 contexts mapped</li>
              <li><b>Day 3</b>   · Plan approved (gate 1/4) — J. Park override, 14d dual-write</li>
              <li><b>Day 3–11</b>· Composer build · 47 tests · Codex auto-patches (IAM, VPC)</li>
              <li><b>Day 11</b>  · Security approved (gate 2/4) — M. Chen · Access Analyzer 0 findings</li>
              <li><b>Day 11–17</b>· Staging + k6 load test · cold-start spike resolved</li>
              <li><b>Day 17</b>  · FinOps approved (gate 3/4) — R. Davis · +$180/mo prov concurrency</li>
              <li><b>Day 17–21</b>· Canary 1% → 10% → 50% → 100%</li>
              <li><b>Day 21</b>  · Cutover approved (gate 4/4) — S. Kim · 14:02 UTC cold</li>
              <li><b>Day 22</b>  · Hyper-care closed · 0 P1, 0 P2</li>
            </ol>
          </Field>
        </div>

        <aside className="text-[12px]">
          <Meta label="Assignee" value="Cursor Agent (acme-ai)" />
          <Meta label="Reporter" value="Priya N." />
          <Meta label="Epic owner" value={CHARACTERS.park.name} />
          <Meta label="Reviewers" value={`${CHARACTERS.chen.name}, ${CHARACTERS.davis.name}, ${CHARACTERS.kim.name}`} />
          <Meta label="Story points" value="34" />
          <Meta label="Sprint" value="Modernization W1" />
          <Meta label="Priority" value="Highest" accent="#DE350B" />
          <Meta label="Labels" value="mod, lambda, aurora, map" mono />
          <Meta label="Due" value="Dec 31, 2027 (Oracle EoL)" />
        </aside>
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B778C]">{label}</div>
      <div className="text-[13px] text-[#172B4D]">{children}</div>
    </div>
  );
}

function Meta({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: string }) {
  return (
    <div className="mb-2">
      <div className="text-[10px] uppercase tracking-wider text-[#6B778C]">{label}</div>
      <div className={`${mono ? 'font-mono' : ''} text-[12px] font-semibold`} style={{ color: accent ?? '#172B4D' }}>
        {value}
      </div>
    </div>
  );
}
