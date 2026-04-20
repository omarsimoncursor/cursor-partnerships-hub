'use client';

import { Bell, ChevronDown, Plus, Search, Settings } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { MacBookFrame } from './macbook-frame';

/**
 * Pixel-leaning recreation of an Atlassian Jira issue view, scoped to the
 * OrdersService modernization epic. Wrapped in MacBook + Chrome chrome.
 */
export function JiraTicketArtifact() {
  return (
    <MacBookFrame
      url="acme.atlassian.net/jira/software/projects/ORDERS/boards/12?selectedIssue=ORDERS-4201"
      tabTitle="ORDERS-4201 · Jira"
      browser="chrome"
    >
      <div className="bg-[#FFFFFF] text-[#172B4D]">
        {/* Atlassian top nav */}
        <div className="flex items-center gap-3 border-b border-[#DFE1E6] bg-white px-4 py-2 text-[12px]">
          <span className="flex items-center gap-1.5 font-semibold text-[#172B4D]">
            <JiraLogo />
            <span>Jira Software</span>
          </span>
          <nav className="ml-3 hidden items-center gap-3 text-[#42526E] md:flex">
            <span>Your work</span>
            <span>Projects</span>
            <span>Filters</span>
            <span>Dashboards</span>
            <span>Apps</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded border border-[#DFE1E6] bg-[#F4F5F7] px-2 py-1 text-[11.5px] text-[#42526E] md:flex">
              <Search className="h-3 w-3" />
              <span>Search</span>
            </div>
            <span className="rounded bg-[#0052CC] px-2 py-1 text-[11.5px] font-semibold text-white">Create</span>
            <Bell className="h-3.5 w-3.5 text-[#42526E]" />
            <Settings className="h-3.5 w-3.5 text-[#42526E]" />
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF8B00] text-[10.5px] font-bold text-white">
              JP
            </span>
          </div>
        </div>

        {/* Project header */}
        <div className="border-b border-[#DFE1E6] bg-white px-5 pt-3">
          <div className="flex items-center gap-2 text-[11.5px] text-[#5E6C84]">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[#0052CC] text-[10px] font-bold text-white">
              O
            </span>
            <span>Projects</span>
            <span>/</span>
            <span className="text-[#0052CC]">Orders Modernization</span>
            <span>/</span>
            <span className="text-[#0052CC]">ORDERS-4201</span>
          </div>
          <h1 className="mt-1 text-[16px] font-bold text-[#172B4D]">Orders Modernization · Backlog</h1>
        </div>

        {/* Two-column issue body */}
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_280px]">
          {/* Left — main issue */}
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center gap-2 text-[11.5px] text-[#5E6C84]">
              <span className="inline-flex items-center gap-1 rounded-sm bg-[#42526E] px-1.5 py-0.5 font-mono font-semibold text-white">
                ⚡ ORDERS-4201
              </span>
              <span>Epic</span>
            </div>
            <h2 className="mb-3 text-[22px] font-bold leading-tight">
              Decompose OrdersService → AWS Lambda + Aurora Serverless v2
            </h2>

            {/* Quick action row */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11.5px]">
              <Pill bg="#36B37E" fg="#FFFFFF">
                <span className="mr-1">●</span> Done
              </Pill>
              <span className="rounded border border-[#DFE1E6] bg-white px-2 py-1 text-[#42526E]">+ Add</span>
              <span className="rounded border border-[#DFE1E6] bg-white px-2 py-1 text-[#42526E]">Apps</span>
              <span className="ml-auto text-[#5E6C84]">22 days · created 22d ago</span>
            </div>

            <Section label="Description">
              <p className="mb-2">
                Strangler-fig migration of the OrdersService bounded context from{' '}
                <strong>WebSphere 8.5 + Oracle 12c</strong> to <strong>AWS Lambda + Aurora Serverless v2</strong>.
                Completed in 22 calendar days with 4 named review gates. Cutover at Day 21; hyper-care closed Day 23.
              </p>
              <p className="text-[12px] text-[#5E6C84]">
                Driven by a Cursor Cloud Agent fleet — 6 agents in parallel during discovery, supervised by named human reviewers at each gate.
              </p>
            </Section>

            <Section label="Acceptance criteria">
              <ul className="space-y-1">
                {[
                  'All 47 integration tests green',
                  'p99 latency < 400 ms under 12k rps',
                  'IAM least-privilege verified by Access Analyzer (0 findings)',
                  'Dual-write drift < 0.01% over 14 days',
                  'FinOps sign-off: $527/mo vs $70k/mo monolith allocation',
                  'SRE sign-off: 0 P1/P2 incidents during 48h hyper-care',
                ].map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[13px]">
                    <span
                      className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm bg-[#36B37E] text-[10px] text-white"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </Section>

            <Section label="Activity" defaultTab="History">
              <ol className="relative space-y-3 border-l-2 border-[#DFE1E6] pl-4 text-[12.5px]">
                <Timeline day="Day 1–3" who="Cursor agent fleet" body="Discovery — 38 contexts mapped, 8 boundary violations, OrdersService recommended as starting point." />
                <Timeline day="Day 3" who={CHARACTERS.park.name} verdict="approved" body="Architecture approved (gate 1/4). Override: extend dual-write to 14 days, add parity-diff Lambda." />
                <Timeline day="Day 3–11" who="Cursor + Codex" body="Build — 2.8k LOC ported, 47 tests written, IAM + VPC issues auto-patched by Codex before review." />
                <Timeline day="Day 11" who={CHARACTERS.chen.name} verdict="approved" body="Security approved (gate 2/4). CIS §3.1, §4.2 baseline · Access Analyzer 0 findings." />
                <Timeline day="Day 11–17" who="Cursor agent" body="Staging — k6 load test at 12k rps. Cold-start spike caught + fix proposed with cost impact." />
                <Timeline day="Day 17" who={CHARACTERS.davis.name} verdict="approved" body="FinOps approved (gate 3/4). +$180/mo provisioned concurrency vs $47k/hr downtime risk." />
                <Timeline day="Day 17–21" who="Cursor agent" body="Canary cutover — 1% → 10% → 50% → 100% with auto-rollback on SLO breach. Runbook authored overnight." />
                <Timeline day="Day 21" who={CHARACTERS.kim.name} verdict="approved" body="Cutover approved (gate 4/4). Monolith cold at 14:02 UTC." />
                <Timeline day="Day 23" who="Cursor agent" body="Hyper-care closed — 0 P1, 0 P2." />
              </ol>
            </Section>
          </div>

          {/* Right — details sidebar */}
          <aside className="border-t border-[#DFE1E6] bg-[#FAFBFC] px-4 py-4 text-[12px] lg:border-l lg:border-t-0">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[#5E6C84]">Details</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#5E6C84]" />
            </div>
            <Meta label="Assignee" value="Cursor Agent (acme-ai)" pill />
            <Meta label="Reporter" value="Priya N. (CEO)" />
            <Meta label="Epic owner" value={CHARACTERS.park.name} />
            <Meta label="Sprint" value="Modernization W1" />
            <Meta label="Story points" value="34" />
            <Meta label="Priority" value="Highest" tone="#DE350B" />
            <Meta label="Labels" mono value="modernization, lambda, aurora, map" />
            <Meta label="Components" value="OrdersService" />
            <Meta label="Due" value="Dec 31, 2027 (Oracle EoL)" />

            <div className="mt-4 border-t border-[#DFE1E6] pt-3">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[#5E6C84]">Reviewers</span>
              <ul className="mt-1.5 space-y-1.5">
                {[
                  CHARACTERS.park,
                  CHARACTERS.chen,
                  CHARACTERS.davis,
                  CHARACTERS.kim,
                ].map((r) => (
                  <li key={r.key} className="flex items-center gap-2 text-[12px]">
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: r.accent }}
                    >
                      {r.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-[#172B4D]">{r.name}</span>
                    <span className="ml-auto rounded bg-[#E3FCEF] px-1.5 py-0.5 text-[10px] font-semibold text-[#006644]">
                      ✓
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </MacBookFrame>
  );
}

function JiraLogo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <defs>
        <linearGradient id="jl" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="#0052CC" />
          <stop offset="100%" stopColor="#2684FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#jl)"
        d="M11.53 2c0 2.4 1.95 4.34 4.36 4.34h1.78v1.72c0 2.4 1.95 4.34 4.34 4.34V2.84a.84.84 0 0 0-.84-.84H11.53Zm-5.18 5.17c0 2.4 1.95 4.34 4.36 4.34h1.78v1.72c0 2.4 1.95 4.34 4.34 4.34V8.01a.84.84 0 0 0-.84-.84H6.35Zm-5.18 5.17c0 2.4 1.95 4.34 4.36 4.34H7.31v1.72c0 2.4 1.95 4.34 4.34 4.34V13.18a.84.84 0 0 0-.84-.84H1.17Z"
      />
    </svg>
  );
}

function Pill({
  children,
  bg,
  fg,
}: {
  children: React.ReactNode;
  bg: string;
  fg: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11.5px] font-semibold uppercase tracking-wider"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

function Section({
  label,
  children,
  defaultTab,
}: {
  label: string;
  children: React.ReactNode;
  defaultTab?: string;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline gap-3">
        <span className="text-[12.5px] font-semibold text-[#172B4D]">{label}</span>
        {defaultTab && (
          <span className="rounded-sm border border-[#DFE1E6] bg-white px-1.5 py-0 text-[10.5px] text-[#42526E]">
            {defaultTab}
          </span>
        )}
      </div>
      <div className="text-[13px] leading-relaxed text-[#172B4D]">{children}</div>
    </div>
  );
}

function Timeline({
  day,
  who,
  body,
  verdict,
}: {
  day: string;
  who: string;
  body: string;
  verdict?: 'approved';
}) {
  return (
    <li className="relative">
      <span className="absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#0052CC]" />
      <div className="mb-0.5 flex items-baseline gap-2 text-[11.5px] text-[#5E6C84]">
        <span className="font-semibold text-[#172B4D]">{day}</span>
        <span>·</span>
        <span>{who}</span>
        {verdict === 'approved' && (
          <span className="ml-1 rounded bg-[#E3FCEF] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#006644]">
            ✓ approved
          </span>
        )}
      </div>
      <p>{body}</p>
    </li>
  );
}

function Meta({
  label,
  value,
  mono,
  pill,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  pill?: boolean;
  tone?: string;
}) {
  return (
    <div className="mb-2">
      <div className="text-[10.5px] uppercase tracking-wider text-[#5E6C84]">{label}</div>
      {pill ? (
        <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-[12px] font-semibold text-[#172B4D] ring-1 ring-[#DFE1E6]">
          <span className="inline-block h-3.5 w-3.5 rounded-full bg-[#FF9900]" /> {value}
        </span>
      ) : (
        <div
          className={`${mono ? 'font-mono text-[11.5px]' : 'text-[12px]'} font-semibold`}
          style={{ color: tone ?? '#172B4D' }}
        >
          {value}
        </div>
      )}
    </div>
  );
}
