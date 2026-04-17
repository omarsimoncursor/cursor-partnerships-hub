'use client';

import { GitMerge, GitPullRequest, Check, MessageSquare, ChevronDown, Eye, MoreHorizontal, Book } from 'lucide-react';
import { ProductCardCanonical, ProductCardDrifted } from '../product-card-drifted';

export function GitHubPRPreview() {
  return (
    <div className="w-full h-full bg-[#0d1117] text-[#e6edf3] overflow-y-auto font-sans">
      {/* Top header */}
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-4">
          <svg viewBox="0 0 16 16" className="w-8 h-8 fill-white">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#4493f8] hover:underline cursor-pointer">cursor-demos</span>
            <span className="text-[#7d8590]">/</span>
            <span className="text-[#4493f8] hover:underline cursor-pointer font-semibold">cursor-for-enterprise</span>
          </div>
          <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[11px] text-[#7d8590]">Public</span>
          <div className="flex-1" />
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
          <NavTab label="Code" />
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
            fix(ui): restore token references on ProductCard v2.3 (100% Figma match)
            <span className="text-[#7d8590] ml-2 font-light">#163</span>
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13px] font-medium">
              Code ▾
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f6feb] text-white text-[13px] font-medium">
            <GitPullRequest className="w-4 h-4" />
            Open
          </span>
          <p className="text-[14px] text-[#7d8590]">
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">cursor-agent</span> wants to merge{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">1 commit</span> into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">main</span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">fix/product-card-token-drift</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px]">
          <PrTab label="Conversation" count="2" active icon={<MessageSquare className="w-3.5 h-3.5" />} />
          <PrTab label="Commits" count="1" />
          <PrTab label="Checks" count="4" icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />} />
          <PrTab label="Files changed" count="1" />
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
                  Restore the <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">tokens.*</code> references that were
                  inadvertently inlined as hardcoded literals during a partial revert. ProductCard v2.3 is now a 100% pixel match
                  against the Figma frame <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">Marketing/Shop/ProductCard@2.3</code>.
                </p>
              </section>

              {/* Before / after */}
              <section>
                <h3 className="font-semibold text-[15px] mb-2">Before / after</h3>
                <div className="grid grid-cols-2 gap-3">
                  <BeforeAfter title="Before · drifted" tagColor="#F5A623">
                    <ProductCardDrifted />
                  </BeforeAfter>
                  <BeforeAfter title="After · 100% match" tagColor="#3fb950">
                    <ProductCardCanonical />
                  </BeforeAfter>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Root cause</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    Commit <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">3ef91a2</span> — <em>&quot;revert: product card restyle&quot;</em>{' '}
                    re-introduced 7 hardcoded CSS literals in <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">product-card-drifted.tsx</code>
                  </li>
                  <li>
                    Token refs (<code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">tokens.radius.card</code>,{' '}
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">tokens.color.brandAccent</code>, …) were lost during the
                    partial revert
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Violations resolved</h3>
                <div className="rounded-md border border-[#30363d] overflow-hidden">
                  <table className="w-full text-[12.5px] font-mono">
                    <thead className="bg-[#151b23] text-[#7d8590]">
                      <tr>
                        <th className="text-left px-3 py-1.5 font-normal">#</th>
                        <th className="text-left px-3 py-1.5 font-normal">Variable</th>
                        <th className="text-left px-3 py-1.5 font-normal">Figma</th>
                        <th className="text-left px-3 py-1.5 font-normal">Was</th>
                        <th className="text-left px-3 py-1.5 font-normal">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#e6edf3]">
                      <DiffRow n="1" v="radius/md"           f="16px"     w="12px"     d="−4px" />
                      <DiffRow n="2" v="space/6"             f="24px"     w="20px"     d="−4px" />
                      <DiffRow n="3" v="font.title"          f="600 / 18" w="700 / 17" d="+100 / −1" />
                      <DiffRow n="4" v="color/brand/accent"  f="#A259FF"  w="#9A4FFF"  d="ΔE 6.2" />
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Fix</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Token-only substitution — 7 hardcoded literals replaced with <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">tokens.*</code> refs</li>
                  <li>No semantic, layout, or behavior changes</li>
                  <li>Visual regression: <span className="text-[#3fb950]">4 → 0 violations · ΔE 5.4 → 0.2</span></li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Evidence</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Figma file: <span className="text-[#4493f8] hover:underline cursor-pointer">Marketing/Shop/ProductCard@2.3</span> · file_key zk2N…M9pq</li>
                  <li>Jira: <span className="text-[#4493f8] hover:underline cursor-pointer">CUR-4409</span></li>
                  <li>Regression commit: <span className="font-mono text-[12.5px]">3ef91a2</span></li>
                  <li>WCAG AA contrast (CTA on surface): <span className="text-[#3fb950]">4.17:1 → 4.63:1 ✓</span></li>
                  <li>Typecheck / lint: <span className="text-[#3fb950]">✓</span></li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Blast radius: 1 file · +7 −7 · token-only</li>
                  <li>Rollback: revert this PR — no schema, no API change</li>
                </ul>
              </section>
            </div>
          </PrComment>

          {/* Review timeline */}
          <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
            <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#10a37f]/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3fb950]" />
            </div>
            <p className="text-[13px] text-[#7d8590]">
              <span className="text-[#e6edf3] font-semibold">codex-bot</span> approved these changes — verified by Cursor agent · 100% Figma match
              <span className="ml-1">· just now</span>
            </p>
          </div>

          {/* Checks */}
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
              <CheckRow name="visual-regression" detail="figma-frame vs storybook · 4 anchor points" duration="9s" />
              <CheckRow name="wcag-contrast" detail="AA · CTA on surface" duration="1s" />
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

        {/* Sidebar */}
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
              <Label color="#A259FF" label="design-drift" />
              <Label color="#A371F7" label="auto-fix" />
              <Label color="#2188ff" label="ui" />
              <Label color="#7D8590" label="figma-triage" />
            </div>
          </SidebarSection>
          <SidebarSection title="Development">
            <div className="space-y-1 text-[#7d8590]">
              <p>Successfully links to an issue</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">CUR-4409 (Jira)</p>
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

function NavTab({ label, count, active }: { label: string; count?: string; active?: boolean }) {
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
  return <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">{children}</div>;
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

function DiffRow({ n, v, f, w, d }: { n: string; v: string; f: string; w: string; d: string }) {
  return (
    <tr className="border-t border-[#30363d]">
      <td className="px-3 py-1.5 text-[#7d8590]">{n}</td>
      <td className="px-3 py-1.5">{v}</td>
      <td className="px-3 py-1.5 text-[#3fb950]">{f}</td>
      <td className="px-3 py-1.5 text-[#7d8590] line-through">{w}</td>
      <td className="px-3 py-1.5 text-[#F5A623]">{d}</td>
    </tr>
  );
}

function BeforeAfter({ title, tagColor, children }: { title: string; tagColor: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#30363d] overflow-hidden bg-[#0a0a0d]">
      <div className="px-3 py-1.5 border-b border-[#30363d] flex items-center justify-between bg-[#151b23]">
        <span className="text-[12px] font-mono text-[#e6edf3]">{title}</span>
        <span
          className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
          style={{ color: tagColor, background: `${tagColor}1a`, border: `1px solid ${tagColor}55` }}
        >
          {title.split('·')[0].trim() === 'Before' ? 'Drifted' : 'Match'}
        </span>
      </div>
      <div className="p-4 flex items-center justify-center" style={{ minHeight: 360 }}>
        <div style={{ transform: 'scale(0.78)', transformOrigin: 'center' }}>{children}</div>
      </div>
    </div>
  );
}
