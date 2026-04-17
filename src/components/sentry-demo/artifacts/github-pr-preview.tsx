'use client';

import { GitMerge, GitPullRequest, Check, MessageSquare, ChevronDown, Eye, MoreHorizontal, Book } from 'lucide-react';

export function GitHubPRPreview() {
  return (
    <div className="w-full h-full bg-[#0d1117] text-[#e6edf3] overflow-y-auto font-sans">
      {/* Top header */}
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-4">
          {/* Octocat */}
          <svg viewBox="0 0 16 16" className="w-8 h-8 fill-white">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#4493f8] hover:underline cursor-pointer">cursor-demos</span>
            <span className="text-[#7d8590]">/</span>
            <span className="text-[#4493f8] hover:underline cursor-pointer font-semibold">cursor-for-enterprise</span>
          </div>

          <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[11px] text-[#7d8590]">Public</span>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Watch
              <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">12</span>
            </button>
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]">
              ★ Star
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">328</span>
            </button>
          </div>
        </div>

        {/* Repo nav */}
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-1 text-[13.5px]">
          <NavTab label="Code" icon="code" />
          <NavTab label="Issues" count="3" />
          <NavTab label="Pull requests" count="2" active />
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
            fix: handle undefined payment details in order processor
            <span className="text-[#7d8590] ml-2 font-light">#142</span>
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
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">cursor-agent</span> wants to merge{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">1 commit</span> into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">main</span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">fix/bank-transfer-null-ref</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px]">
          <PrTab label="Conversation" count="3" active icon={<MessageSquare className="w-3.5 h-3.5" />} />
          <PrTab label="Commits" count="1" />
          <PrTab label="Checks" count="4" icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />} />
          <PrTab label="Files changed" count="2" />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-5 py-6 grid grid-cols-[1fr_296px] gap-6">
        {/* Main column */}
        <div className="min-w-0 space-y-4">
          {/* Author comment */}
          <PrComment>
            <PrCommentHeader author="cursor-agent" bot label="authored" time="2 minutes ago" />
            <div className="text-[14px] text-[#e6edf3] leading-relaxed space-y-4">
              <section>
                <h3 className="font-semibold text-[15px] mb-1">Summary</h3>
                <p className="text-[#e6edf3]">
                  Restore checkout for bank-transfer orders by marking{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono text-[#e6edf3]">PaymentMethod.details</code>{' '}
                  as optional and guarding the receipt formatter.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Root cause</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">formatPaymentReceipt</code>{' '}
                    dereferences <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">payment.details.brand</code> unconditionally (<code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">src/lib/demo/format-payment.ts:4</code>)
                  </li>
                  <li>
                    Regression introduced in commit{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">a4f2e1b</span>{' '}
                    — <em>&quot;feat: add bank_transfer payment type&quot;</em>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Fix</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Widened <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">PaymentMethod.details</code> to optional</li>
                  <li>Added guard in <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">formatPaymentReceipt</code> with ACH fallback label</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Evidence</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Sentry: <span className="text-[#4493f8] hover:underline cursor-pointer">a2f1…4c0e</span> · 1,847 events · 312 users</li>
                  <li>Jira: <span className="text-[#4493f8] hover:underline cursor-pointer">CUR-4291</span></li>
                  <li>Typecheck: <span className="text-[#3fb950]">✓</span></li>
                  <li>Live reproduction: <span className="text-[#3fb950]">✓ order processed without error</span></li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Blast radius: 2 files · +7 −3</li>
                  <li>Rollback: revert this PR — no migrations</li>
                </ul>
              </section>
            </div>
          </PrComment>

          {/* Review timeline event */}
          <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
            <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#10a37f]/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3fb950]" />
            </div>
            <p className="text-[13px] text-[#7d8590]">
              <span className="text-[#e6edf3] font-semibold">codex-bot</span> approved these changes
              <span className="ml-1">· just now</span>
            </p>
          </div>

          {/* Checks summary */}
          <PrComment>
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#3fb950] bg-[#238636]/20 rounded-full p-0.5" />
                <span className="text-[14px] font-semibold text-[#e6edf3]">All checks have passed</span>
              </div>
              <button className="text-[12.5px] text-[#4493f8] hover:underline">Show all checks</button>
            </div>
            <div className="divide-y divide-[#30363d] text-[13px]">
              <CheckRow name="typecheck" detail="npx tsc --noEmit" duration="4s" />
              <CheckRow name="lint" detail="eslint + prettier" duration="3s" />
              <CheckRow name="unit-tests" detail="vitest · 142 passed" duration="11s" />
              <CheckRow name="live-reproduction" detail="dev server + headless browser" duration="8s" />
            </div>
          </PrComment>

          {/* Merge box */}
          <PrComment>
            <div className="px-4 py-4 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-[#3fb950]" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#e6edf3]">
                  This branch has no conflicts with the base branch
                </p>
                <p className="text-[12.5px] text-[#7d8590]">Merging can be performed automatically.</p>
              </div>
              <button className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13.5px] font-medium">
                Merge pull request
              </button>
            </div>
          </PrComment>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5 text-[12.5px]">
          <SidebarSection title="Reviewers">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
              <span className="text-[#e6edf3]">codex-bot</span>
              <span className="ml-auto text-[#3fb950]">✓ approved</span>
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
              <Label color="#F85149" label="bug" />
              <Label color="#A371F7" label="auto-fix" />
              <Label color="#2188ff" label="checkout" />
              <Label color="#7D8590" label="sentry-triage" />
            </div>
          </SidebarSection>
          <SidebarSection title="Development">
            <div className="space-y-1 text-[#7d8590]">
              <p>Successfully links to an issue</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">CUR-4291 (Jira)</p>
            </div>
          </SidebarSection>
          <SidebarSection title="Milestone">
            <p className="text-[#7d8590]">No milestone</p>
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

function NavTab({ label, count, active }: { label: string; count?: string; active?: boolean; icon?: string }) {
  return (
    <button
      className={`px-3 py-3 text-[13.5px] flex items-center gap-1.5 border-b-2 ${
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:border-[#30363d]'
      }`}
    >
      {label === 'Wiki' && <Book className="w-3.5 h-3.5" />}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
    </button>
  );
}

function PrTab({ label, count, active, icon }: { label: string; count?: string; active?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      className={`px-4 py-3 flex items-center gap-1.5 border-b-2 ${
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:text-[#e6edf3]'
      }`}
    >
      {icon}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
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

function PrCommentHeader({ author, bot, label, time }: { author: string; bot?: boolean; label: string; time: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#151b23]">
      <div className="flex items-center gap-2 text-[13px]">
        <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
          <span className="text-accent-blue text-[10px] font-bold">{author[0].toUpperCase()}</span>
        </div>
        <span className="font-semibold text-[#e6edf3]">{author}</span>
        {bot && <span className="px-1.5 py-0.5 rounded-full border border-[#30363d] text-[10px] text-[#7d8590]">bot</span>}
        <span className="text-[#7d8590]">{label} · {time}</span>
      </div>
      <button className="text-[#7d8590] hover:text-[#e6edf3]">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckRow({ name, detail, duration }: { name: string; detail: string; duration: string }) {
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
