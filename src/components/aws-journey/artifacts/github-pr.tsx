'use client';

import {
  Bell,
  Bookmark,
  Eye,
  GitBranch,
  GitFork,
  GitMerge,
  GitPullRequest,
  Plus,
  Search,
  Star,
} from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { MacBookFrame } from './macbook-frame';

/**
 * Pixel-leaning recreation of GitHub's PR view. Wraps the existing PR
 * content in MacBook + Chrome chrome and re-skins the page chrome (top nav,
 * repo header, PR header, tabs, side metadata) to match GitHub's actual
 * design language.
 */
export function GitHubPrArtifact() {
  return (
    <MacBookFrame
      url="github.com/acme/orders-modernization/pull/247"
      tabTitle="PR #247 · acme/orders-modernization"
      browser="chrome"
    >
      <div className="bg-[#FFFFFF] text-[#1F2328]">
        {/* Top dark navbar */}
        <div className="flex items-center gap-3 bg-[#0D1117] px-4 py-2 text-[12.5px] text-[#E6EDF3]">
          <OctocatLogo />
          <span className="ml-2 hidden md:inline opacity-70">|</span>
          <span className="hidden font-semibold md:inline">acme</span>
          <span className="opacity-50">/</span>
          <span className="font-semibold">orders-modernization</span>
          <div className="ml-3 flex flex-1 items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/60 md:flex">
              <Search className="h-3 w-3" />
              <span>Type / to search</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <Plus className="h-3.5 w-3.5" />
            <Bell className="h-3.5 w-3.5" />
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF9900] text-[10px] font-bold text-[#0D1117]">
              CA
            </span>
          </div>
        </div>

        {/* Repo header */}
        <div className="border-b border-[#D1D9E0] bg-[#F6F8FA] px-4 pt-3">
          <div className="flex items-center gap-2 text-[14px]">
            <GitBranch className="h-4 w-4 text-[#57606A]" />
            <span className="text-[#0969DA] hover:underline">acme</span>
            <span className="text-[#57606A]">/</span>
            <span className="font-semibold text-[#0969DA] hover:underline">orders-modernization</span>
            <span className="ml-2 rounded-full border border-[#D1D9E0] px-1.5 py-0 text-[10.5px] font-medium text-[#57606A]">
              Public
            </span>
            <div className="ml-auto flex items-center gap-1.5 text-[11.5px]">
              <RepoBtn icon={<Eye className="h-3 w-3" />} label="Watch" count="42" />
              <RepoBtn icon={<GitFork className="h-3 w-3" />} label="Fork" count="8" />
              <RepoBtn icon={<Star className="h-3 w-3" />} label="Star" count="316" />
            </div>
          </div>
          {/* Tabs */}
          <div className="mt-2 flex items-center gap-1 text-[12px]">
            <RepoTab label="Code" />
            <RepoTab label="Issues" count="14" />
            <RepoTab label="Pull requests" count="3" active />
            <RepoTab label="Actions" />
            <RepoTab label="Projects" />
            <RepoTab label="Wiki" />
            <RepoTab label="Security" />
          </div>
        </div>

        {/* PR header */}
        <div className="px-5 py-4">
          <div className="mb-1 flex items-baseline gap-2">
            <h1 className="text-[20px] font-bold leading-tight text-[#1F2328]">
              OrdersService cutover: canary workflow + parity-diff Lambda
            </h1>
            <span className="text-[20px] font-light text-[#57606A]">#247</span>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[12.5px] text-[#57606A]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8250DF] px-2 py-0.5 text-[12px] font-semibold text-white">
              <GitMerge className="h-3 w-3" />
              Merged
            </span>
            <span>
              <span className="font-semibold text-[#1F2328]">cursor-agent</span> merged 18 commits into{' '}
              <code className="rounded bg-[#EAEEF2] px-1 py-0.5 font-mono text-[11.5px]">main</code> from{' '}
              <code className="rounded bg-[#EAEEF2] px-1 py-0.5 font-mono text-[11.5px]">release/orders-cutover-v1</code>
            </span>
            <span>· 14:02 UTC, Day 21 · 22 days from open</span>
          </div>

          {/* PR tabs */}
          <div className="-mb-px flex items-center gap-3 border-b border-[#D1D9E0] text-[12.5px]">
            <PrTab icon={<GitPullRequest className="h-3.5 w-3.5" />} label="Conversation" count="34" active />
            <PrTab label="Commits" count="18" />
            <PrTab label="Checks" count="12" tone="ok" />
            <PrTab label="Files changed" count="34" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
            {/* Left column — conversation */}
            <div className="space-y-3">
              {/* Description card */}
              <PrCard authorAccent="#FF9900" who="cursor-agent" when="opened 22 days ago">
                <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#57606A]">Summary</h3>
                <ul className="space-y-1 text-[13px]">
                  <li>· Adds <code className="rounded bg-[#EAEEF2] px-1 py-0.5 font-mono text-[12px]">orders-stack.ts</code> (CDK) — 6 Lambda handlers + Aurora Serverless v2</li>
                  <li>· Adds parity-diff Lambda (per J. Park review on Day 3) — 15-min cadence, fail-closed @ 0.01% drift</li>
                  <li>· Codex auto-patches: IAM scope reduction + VPC endpoints for SecretsManager &amp; RDS</li>
                  <li>· Canary orchestration workflow (1% → 10% → 50% → 100%) with automatic rollback on SLO breach</li>
                  <li>· Decommissions <code className="rounded bg-[#EAEEF2] px-1 py-0.5 font-mono text-[12px]">OrdersServiceBean</code> EJB (WebSphere)</li>
                </ul>
              </PrCard>

              {/* Reviews */}
              <ReviewRow who="park" verdict="approved" day="Day 3" body="Approved with changes requested — dual-write window extended to 14 days." />
              <ReviewRow who="chen" verdict="approved" day="Day 11" body="Security approved. CIS §3.1, §4.2 baseline met. Access Analyzer 0 findings." />
              <ReviewRow who="davis" verdict="approved" day="Day 17" body="FinOps approved provisioned-concurrency trade-off. +$180/mo." />
              <ReviewRow who="kim" verdict="approved" day="Day 21" body="SRE go. Cutover complete at 14:02 UTC. Hyper-care closed Day 23." />

              {/* Checks */}
              <div className="rounded-md border border-[#D1D9E0]">
                <div className="flex items-center gap-2 border-b border-[#D1D9E0] bg-[#F6F8FA] px-3 py-2 text-[12px]">
                  <span className="inline-flex items-center gap-1 rounded bg-[#DAFBE1] px-1.5 py-0.5 font-semibold text-[#1A7F37]">
                    ✓ All checks have passed
                  </span>
                  <span className="text-[#57606A]">12 successful checks</span>
                </div>
                <ul className="divide-y divide-[#EAEEF2] text-[12px]">
                  <CheckRow name="ci · integration tests" detail="47/47 passed · coverage 94.7% · 11.4s" />
                  <CheckRow name="ci · k6 load test" detail="12k rps · p99 340 ms · 0.00% error" />
                  <CheckRow name="codex · security scan" detail="2 issues auto-patched · IAM, VPC" />
                  <CheckRow name="cdk · synth" detail="orders-prod stack synth ok" />
                  <CheckRow name="parity-diff · 14-day window" detail="0.0008% drift · within 0.01% gate" />
                </ul>
              </div>

              {/* Final merge banner */}
              <div className="flex items-center gap-2 rounded-md border border-[#8250DF] bg-[#FBF7FF] px-3 py-2 text-[12.5px]">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8250DF] text-white">
                  <GitMerge className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold text-[#1F2328]">Pull request successfully merged and closed</div>
                  <div className="text-[11.5px] text-[#57606A]">
                    You&rsquo;re all set — the <code className="font-mono">release/orders-cutover-v1</code> branch can be safely deleted.
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — sidebar metadata */}
            <aside className="space-y-3 text-[12px]">
              <SideMeta label="Reviewers">
                <ul className="mt-1 space-y-1">
                  <ReviewerLi who="park" verdict="approved" />
                  <ReviewerLi who="chen" verdict="approved" />
                  <ReviewerLi who="davis" verdict="approved" />
                  <ReviewerLi who="kim" verdict="approved" />
                </ul>
              </SideMeta>
              <SideMeta label="Assignees">
                <span className="text-[12px] text-[#1F2328]">cursor-agent</span>
              </SideMeta>
              <SideMeta label="Labels">
                <div className="flex flex-wrap gap-1">
                  {['modernization', 'lambda', 'aurora', 'canary', 'codex'].map((l) => (
                    <span key={l} className="rounded-full bg-[#DDF4FF] px-2 py-0.5 text-[10.5px] font-semibold text-[#0969DA]">
                      {l}
                    </span>
                  ))}
                </div>
              </SideMeta>
              <SideMeta label="Projects">
                <span className="text-[#0969DA]">Modernization W1</span>
              </SideMeta>
              <SideMeta label="Milestone">
                <span className="text-[#0969DA]">Oracle EoL · Dec 31, 2027</span>
              </SideMeta>
              <SideMeta label="Linked issues">
                <span className="text-[#0969DA]">#246 · #245 · #244</span>
              </SideMeta>
              <SideMeta label="Notifications">
                <span className="inline-flex items-center gap-1 text-[#1F2328]">
                  <Bookmark className="h-3 w-3" /> Subscribed (4)
                </span>
              </SideMeta>
            </aside>
          </div>
        </div>
      </div>
    </MacBookFrame>
  );
}

function OctocatLogo() {
  // Simple Octocat outline; readable at the nav scale.
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

function RepoBtn({ icon, label, count }: { icon: React.ReactNode; label: string; count: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[#D1D9E0] bg-[#F6F8FA] px-2 py-0.5 text-[#1F2328]">
      {icon}
      <span>{label}</span>
      <span className="rounded-full border border-[#D1D9E0] bg-white px-1.5 py-0 text-[10.5px] text-[#1F2328]">
        {count}
      </span>
    </span>
  );
}

function RepoTab({ label, count, active }: { label: string; count?: string; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 ${
        active ? 'bg-[#FFFFFF] font-semibold text-[#1F2328]' : 'text-[#1F2328] hover:bg-white/60'
      }`}
      style={{ borderBottom: active ? '2px solid #FD8C73' : '2px solid transparent' }}
    >
      <span>{label}</span>
      {count && (
        <span className="rounded-full bg-[#EAEEF2] px-1.5 py-0 text-[10.5px] font-medium text-[#57606A]">
          {count}
        </span>
      )}
    </span>
  );
}

function PrTab({
  icon,
  label,
  count,
  tone,
  active,
}: {
  icon?: React.ReactNode;
  label: string;
  count?: string;
  tone?: 'ok';
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 pb-2 ${
        active ? 'border-b-2 border-[#FD8C73] font-semibold text-[#1F2328]' : 'text-[#57606A]'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count && (
        <span
          className="rounded-full px-1.5 py-0 text-[10.5px] font-medium"
          style={{
            background: tone === 'ok' ? '#DAFBE1' : '#EAEEF2',
            color: tone === 'ok' ? '#1A7F37' : '#57606A',
          }}
        >
          {count}
        </span>
      )}
    </span>
  );
}

function PrCard({
  who,
  when,
  authorAccent,
  children,
}: {
  who: string;
  when: string;
  authorAccent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-[#D1D9E0]">
      <div className="flex items-center gap-2 border-b border-[#D1D9E0] bg-[#F6F8FA] px-3 py-1.5 text-[12px]">
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10.5px] font-bold text-white"
          style={{ background: authorAccent }}
        >
          CA
        </span>
        <span className="font-semibold text-[#1F2328]">{who}</span>
        <span className="text-[#57606A]">{when}</span>
      </div>
      <div className="bg-white p-3 text-[13px]">{children}</div>
    </div>
  );
}

function ReviewRow({
  who,
  verdict,
  body,
  day,
}: {
  who: keyof typeof CHARACTERS;
  verdict: 'approved' | 'requested';
  body: string;
  day: string;
}) {
  const c = CHARACTERS[who];
  const initials = c.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="rounded-md border border-[#D1D9E0]">
      <div className="flex items-center gap-2 border-b border-[#D1D9E0] bg-[#F6F8FA] px-3 py-1.5 text-[12px]">
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10.5px] font-bold text-white"
          style={{ background: c.accent }}
        >
          {initials}
        </span>
        <span className="font-semibold text-[#1F2328]">{c.name}</span>
        <span
          className="rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider"
          style={{ background: verdict === 'approved' ? '#DAFBE1' : '#FFF8C5', color: verdict === 'approved' ? '#1A7F37' : '#9A6700' }}
        >
          {verdict}
        </span>
        <span className="text-[#57606A]">these changes · {day}</span>
      </div>
      <div className="bg-white p-3 text-[12.5px] text-[#1F2328]">{body}</div>
    </div>
  );
}

function CheckRow({ name, detail }: { name: string; detail: string }) {
  return (
    <li className="flex items-baseline justify-between gap-2 px-3 py-2">
      <span className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-[#1A7F37]" />
        <span className="font-mono text-[#1F2328]">{name}</span>
      </span>
      <span className="text-[11.5px] text-[#57606A]">{detail}</span>
    </li>
  );
}

function SideMeta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#D1D9E0] pb-2 last:border-b-0">
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-[#1F2328]">
        <span>{label}</span>
        <span className="text-[#57606A]">⚙</span>
      </div>
      {children}
    </div>
  );
}

function ReviewerLi({ who, verdict }: { who: keyof typeof CHARACTERS; verdict: 'approved' | 'pending' }) {
  const c = CHARACTERS[who];
  return (
    <li className="flex items-center justify-between gap-2 text-[12px]">
      <span className="flex items-center gap-1.5">
        <span
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ background: c.accent }}
        >
          {c.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
        </span>
        <span className="text-[#1F2328]">{c.name}</span>
      </span>
      <span
        className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{ background: verdict === 'approved' ? '#DAFBE1' : '#FFF8C5', color: verdict === 'approved' ? '#1A7F37' : '#9A6700' }}
      >
        {verdict === 'approved' ? '✓' : '…'}
      </span>
    </li>
  );
}
