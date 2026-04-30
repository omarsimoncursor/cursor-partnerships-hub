'use client';

import { useState } from 'react';
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
import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';
import { cn } from '@/lib/utils';

interface GithubPrPreviewProps {
  script: ResolvedScript;
}

type Tab = 'conversation' | 'commits' | 'checks' | 'files';

export function GithubPrPreview({ script }: GithubPrPreviewProps) {
  const meta = script.meta;
  const [tab, setTab] = useState<Tab>('conversation');
  const [orgSlug, repoSlug] = meta.prRepo.split('/');
  const prNumber = meta.prNumber > 0 ? meta.prNumber : '—';
  const filesChanged = filesForWorkflow(script.id);

  return (
    <div className="w-full h-full bg-[#0d1117] text-[#e6edf3] overflow-y-auto font-sans">
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-4">
          <svg viewBox="0 0 16 16" className="w-8 h-8 fill-white">
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>

          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#4493f8] hover:underline cursor-pointer">{orgSlug}</span>
            <span className="text-[#7d8590]">/</span>
            <span className="text-[#4493f8] hover:underline cursor-pointer font-semibold">
              {repoSlug}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[11px] text-[#7d8590]">
            Private
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Watch
              <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">12</span>
            </button>
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]">
              ★ Star
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">128</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-1 text-[13.5px]">
          <NavTab label="Code" />
          <NavTab label="Issues" count="14" />
          <NavTab label="Pull requests" count="7" active />
          <NavTab label="Actions" />
          <NavTab label="Projects" />
          <NavTab label="Wiki" />
          <NavTab label="Security" />
          <NavTab label="Insights" />
          <NavTab label="Settings" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 pt-6 pb-4 border-b border-[#30363d]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-[26px] font-normal text-[#e6edf3] leading-tight">
            {meta.prTitle}
            <span className="text-[#7d8590] ml-2 font-light">#{prNumber}</span>
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
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">
              cursor-agent
            </span>{' '}
            wants to merge{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">
              {filesChanged.length} commits
            </span>{' '}
            into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">
              main
            </span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">
              {meta.prBranch}
            </span>
          </p>
        </div>
      </div>

      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px] overflow-x-auto">
          <PrTab
            label="Conversation"
            count="3"
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            active={tab === 'conversation'}
            onClick={() => setTab('conversation')}
          />
          <PrTab label="Commits" count={String(filesChanged.length)} active={tab === 'commits'} onClick={() => setTab('commits')} />
          <PrTab
            label="Checks"
            count="5"
            icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />}
            active={tab === 'checks'}
            onClick={() => setTab('checks')}
          />
          <PrTab
            label="Files changed"
            count={String(filesChanged.length)}
            active={tab === 'files'}
            onClick={() => setTab('files')}
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-6">
        <div className="min-w-0 space-y-4">
          {tab === 'conversation' && (
            <ConversationTab script={script} />
          )}
          {tab === 'commits' && <CommitsTab script={script} files={filesChanged} />}
          {tab === 'checks' && <ChecksTab />}
          {tab === 'files' && <FilesTab files={filesChanged} />}
        </div>

        <aside className="space-y-5 text-[12.5px]">
          <SidebarSection title="Reviewers">
            <SidebarRow>
              <Avatar letter="X" tone="green" />
              <span className="text-[#e6edf3]">codex-bot</span>
              <span className="ml-auto text-[#3fb950]">✓ approved</span>
            </SidebarRow>
            <SidebarRow>
              <Avatar letter="S" tone="amber" />
              <span className="text-[#e6edf3]">@security-team</span>
              <span className="ml-auto text-[#7d8590]">requested</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Assignees">
            <SidebarRow>
              <Avatar letter="C" tone="blue" />
              <span className="text-[#e6edf3]">cursor-agent</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Labels">
            <div className="flex flex-wrap gap-1.5">
              <Label color="#F85149" label="security" />
              <Label color="#A371F7" label="auto-fix" />
              <Label color="#1f6feb" label="cursor-sdk" />
              <Label color="#3fb950" label={meta.jiraId.toLowerCase()} />
            </div>
          </SidebarSection>
          <SidebarSection title="Development">
            <div className="space-y-1 text-[#7d8590]">
              <p>Successfully links to an issue</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">
                {meta.jiraId} (Jira)
              </p>
            </div>
          </SidebarSection>
          <SidebarSection title="Notifications">
            <button className="w-full px-3 py-1.5 rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] text-[12.5px] hover:bg-[#30363d] flex items-center justify-center gap-1.5">
              <Eye className="w-3 h-3" /> Customize
            </button>
          </SidebarSection>
          <SidebarSection title="3 participants">
            <div className="flex gap-1">
              <Avatar letter="C" tone="blue" />
              <Avatar letter="X" tone="green" />
              <Avatar letter="S" tone="amber" />
            </div>
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Conversation tab
// ----------------------------------------------------------------------------

function ConversationTab({ script }: { script: ResolvedScript }) {
  const meta = script.meta;
  return (
    <>
      <PrComment>
        <PrCommentHeader author="cursor-agent" bot label="opened this PR" time="32 seconds ago" />
        <div className="px-4 py-4 text-[14px] text-[#e6edf3] leading-relaxed space-y-4">
          <section>
            <h3 className="font-semibold text-[15px] mb-1">Summary</h3>
            <p className="text-[#e6edf3]">{meta.incidentSummary}</p>
          </section>

          <section>
            <h3 className="font-semibold text-[15px] mb-1">Root cause</h3>
            <p>{meta.rootCause}</p>
          </section>

          <section>
            <h3 className="font-semibold text-[15px] mb-1">Fix</h3>
            <p>{meta.remediation}</p>
          </section>

          <section>
            <h3 className="font-semibold text-[15px] mb-1">Containment evidence</h3>
            <ul className="list-disc list-outside ml-5 space-y-1">
              {meta.evidenceLinks.map((link, i) => (
                <li key={i}>
                  <span className="font-medium">{link.label}:</span>{' '}
                  <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">
                    {link.ref}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-[15px] mb-1">Verification</h3>
            <ul className="list-disc list-outside ml-5 space-y-1">
              <li>
                Typecheck: <span className="text-[#3fb950]">✓ passed</span>
              </li>
              <li>
                Lint: <span className="text-[#3fb950]">✓ 0 errors · 0 warnings</span>
              </li>
              <li>
                Tests: <span className="text-[#3fb950]">✓ 287 passed · 0 failed · coverage 84.2%</span>
              </li>
              <li>
                Security re-scan: <span className="text-[#3fb950]">✓ no findings</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
            <ul className="list-disc list-outside ml-5 space-y-1">
              <li>Blast radius: small (≤ 3 files)</li>
              <li>
                Rollback: <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">git revert HEAD</code> · no migrations
              </li>
              <li>Type surface unchanged · all callers preserved</li>
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
          <span className="ml-1">· 14 seconds ago</span>
        </p>
      </div>

      <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
        <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#1f6feb]/20 flex items-center justify-center shrink-0">
          <span className="text-[#4493f8] text-[10px] font-bold">S</span>
        </div>
        <p className="text-[13px] text-[#7d8590]">
          Review requested from <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">@security-team</span>
          <span className="ml-1">· just now</span>
        </p>
      </div>

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
          <CheckRow name="unit-tests" detail="vitest · 287 passed" duration="11s" />
          <CheckRow name="dependency-review" detail="snyk + osv-scanner" duration="8s" />
          <CheckRow name="gitleaks" detail="0 leaks · allowlist applied" duration="2s" />
        </div>
      </PrComment>

      <PrComment>
        <div className="px-4 py-4 flex items-start gap-3">
          <GitMerge className="w-6 h-6 text-[#3fb950] mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#e6edf3]">
              This branch has no conflicts with the base branch
            </p>
            <p className="text-[12.5px] text-[#7d8590] mt-0.5">
              Cursor agents do not auto-merge to main. A reviewer must approve before merge.
            </p>
          </div>
          <button className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13.5px] font-medium shrink-0 self-start">
            Merge pull request
          </button>
        </div>
      </PrComment>
    </>
  );
}

// ----------------------------------------------------------------------------
// Files changed tab
// ----------------------------------------------------------------------------

interface FileChange {
  path: string;
  additions: number;
  deletions: number;
  hunks: Array<{ header: string; lines: Array<{ kind: ' ' | '+' | '-'; text: string }> }>;
}

function FilesTab({ files }: { files: FileChange[] }) {
  const totalAdd = files.reduce((s, f) => s + f.additions, 0);
  const totalDel = files.reduce((s, f) => s + f.deletions, 0);
  return (
    <>
      <div className="rounded-md border border-[#30363d] bg-[#0d1117]">
        <div className="px-4 py-2 border-b border-[#30363d] bg-[#151b23] text-[13px] flex items-center justify-between">
          <span className="text-[#e6edf3] font-semibold">
            {files.length} changed files
          </span>
          <span className="text-[#7d8590] font-mono text-[12px]">
            <span className="text-[#3fb950]">+{totalAdd}</span> <span className="text-[#f85149]">−{totalDel}</span>
          </span>
        </div>
      </div>
      {files.map((file) => (
        <FileDiff key={file.path} file={file} />
      ))}
    </>
  );
}

function FileDiff({ file }: { file: FileChange }) {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">
      <div className="px-4 py-2 border-b border-[#30363d] bg-[#151b23] flex items-center gap-3">
        <ChevronDown className="w-3.5 h-3.5 text-[#7d8590]" />
        <span className="font-mono text-[12.5px] text-[#e6edf3]">{file.path}</span>
        <span className="font-mono text-[11.5px]">
          <span className="text-[#3fb950]">+{file.additions}</span>{' '}
          <span className="text-[#f85149]">−{file.deletions}</span>
        </span>
        <div className="flex-1" />
        <button className="text-[#7d8590] hover:text-[#e6edf3]">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="font-mono text-[12px] leading-[1.55]">
        {file.hunks.map((hunk, hi) => (
          <div key={hi}>
            <div className="bg-[#151b23] px-4 py-1 text-[#7d8590] text-[11.5px] border-y border-[#30363d]">
              {hunk.header}
            </div>
            {hunk.lines.map((line, li) => (
              <DiffLine key={li} kind={line.kind} text={line.text} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DiffLine({ kind, text }: { kind: ' ' | '+' | '-'; text: string }) {
  const bg =
    kind === '+'
      ? 'bg-[#1a3a1f]'
      : kind === '-'
        ? 'bg-[#3a1a1f]'
        : 'bg-transparent';
  const sym =
    kind === '+'
      ? <span className="text-[#3fb950]">+</span>
      : kind === '-'
        ? <span className="text-[#f85149]">−</span>
        : <span className="text-[#30363d]">·</span>;
  return (
    <div className={cn('grid grid-cols-[36px_1fr]', bg)}>
      <span className="px-2 text-[#7d8590] text-right border-r border-[#30363d]/40">{sym}</span>
      <span className="px-3 text-[#e6edf3] whitespace-pre-wrap break-words">{text || ' '}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Commits tab
// ----------------------------------------------------------------------------

function CommitsTab({ script, files }: { script: ResolvedScript; files: FileChange[] }) {
  const meta = script.meta;
  const subject = meta.prTitle.split(':').slice(1).join(':').trim() || meta.prTitle;
  const sha = (meta.agentId || 'abc1234').slice(-7);
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">
      <div className="px-4 py-2 border-b border-[#30363d] bg-[#151b23] text-[13px] text-[#e6edf3]">
        <span className="font-semibold">Commits on today</span>
      </div>
      {files.length === 0 ? (
        <div className="px-4 py-3 text-[13px] text-[#7d8590]">No commits</div>
      ) : (
        <div className="divide-y divide-[#30363d]">
          <div className="flex items-start gap-3 px-4 py-3">
            <Avatar letter="C" tone="blue" />
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] text-[#e6edf3] font-medium leading-snug">
                {subject}
              </p>
              <p className="text-[12px] text-[#7d8590] mt-0.5">
                <span className="font-medium">cursor-agent</span> committed 32 seconds ago
              </p>
            </div>
            <span className="font-mono text-[11.5px] text-[#7d8590] border border-[#30363d] rounded px-1.5 py-0.5">
              {sha}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Checks tab
// ----------------------------------------------------------------------------

function ChecksTab() {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#30363d] bg-[#151b23] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-[#3fb950] bg-[#238636]/20 rounded-full p-0.5" />
          <span className="text-[14px] font-semibold text-[#e6edf3]">5 / 5 checks passed</span>
        </div>
      </div>
      <div className="divide-y divide-[#30363d] text-[13px]">
        <CheckRow name="typecheck" detail="npx tsc --noEmit" duration="4s" />
        <CheckRow name="lint" detail="eslint + prettier" duration="3s" />
        <CheckRow name="unit-tests" detail="vitest · 287 passed" duration="11s" />
        <CheckRow name="dependency-review" detail="snyk + osv-scanner" duration="8s" />
        <CheckRow name="gitleaks" detail="0 leaks · allowlist applied" duration="2s" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

function NavTab({ label, count, active }: { label: string; count?: string; active?: boolean }) {
  return (
    <button
      className={cn(
        'px-3 py-3 text-[13.5px] flex items-center gap-1.5 border-b-2',
        active
          ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
          : 'border-transparent text-[#e6edf3] hover:border-[#30363d]',
      )}
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
  onClick,
}: {
  label: string;
  count?: string;
  active?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-3 flex items-center gap-1.5 border-b-2 cursor-pointer',
        active
          ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
          : 'border-transparent text-[#e6edf3] hover:text-[#e6edf3]',
      )}
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
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">{children}</div>
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
        <Avatar letter={author[0]?.toUpperCase() ?? 'C'} tone="blue" />
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
  return <div className="flex items-center gap-2 text-[13px] mb-1.5 last:mb-0">{children}</div>;
}

function Avatar({ letter, tone }: { letter: string; tone: 'blue' | 'green' | 'amber' }) {
  const cls =
    tone === 'green'
      ? 'bg-[#10a37f]/20 text-[#10a37f]'
      : tone === 'amber'
        ? 'bg-[#fbbf24]/20 text-[#fbbf24]'
        : 'bg-accent-blue/20 text-accent-blue';
  return (
    <div className={cn('w-5 h-5 rounded-full flex items-center justify-center', cls)}>
      <span className="text-[10px] font-bold">{letter}</span>
    </div>
  );
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

// ----------------------------------------------------------------------------
// Per-workflow file diffs
// ----------------------------------------------------------------------------

function filesForWorkflow(scriptId: string): FileChange[] {
  switch (scriptId) {
    case 'gitguardian-secret':
      return [
        {
          path: 'src/config/payments.ts',
          additions: 4,
          deletions: 4,
          hunks: [
            {
              header: '@@ -1,10 +1,10 @@ src/config/payments.ts',
              lines: [
                { kind: ' ', text: "import { PaymentConfig } from './types';" },
                { kind: ' ', text: '' },
                { kind: ' ', text: 'export const PAYMENT_CONFIG: PaymentConfig = {' },
                { kind: ' ', text: "  region: 'us-east-1'," },
                { kind: '-', text: "  AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE'," },
                { kind: '-', text: "  AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'," },
                { kind: '+', text: "  AWS_ACCESS_KEY_ID: getSecret('payments-service/aws-access-key-id')," },
                { kind: '+', text: "  AWS_SECRET_ACCESS_KEY: getSecret('payments-service/aws-secret-access-key')," },
                { kind: ' ', text: '  enableProductionCharges: true,' },
                { kind: ' ', text: '};' },
              ],
            },
          ],
        },
        {
          path: 'src/lib/stripe-client.ts',
          additions: 3,
          deletions: 2,
          hunks: [
            {
              header: '@@ -1,8 +1,9 @@ src/lib/stripe-client.ts',
              lines: [
                { kind: ' ', text: "import Stripe from 'stripe';" },
                { kind: '+', text: "import { getSecret } from '@acme/secrets';" },
                { kind: ' ', text: '' },
                { kind: '-', text: "const STRIPE_RESTRICTED_KEY = '<rk_live placeholder>';" },
                { kind: '+', text: "const STRIPE_RESTRICTED_KEY = getSecret('payments-service/stripe-restricted-key');" },
                { kind: ' ', text: '' },
                { kind: ' ', text: 'export const stripe = new Stripe(STRIPE_RESTRICTED_KEY, {' },
                { kind: ' ', text: "  apiVersion: '2024-11-20.acacia'," },
                { kind: ' ', text: '});' },
              ],
            },
          ],
        },
        {
          path: '.gitleaks.toml',
          additions: 6,
          deletions: 0,
          hunks: [
            {
              header: '@@ -0,0 +1,6 @@ .gitleaks.toml',
              lines: [
                { kind: '+', text: '[allowlist]' },
                { kind: '+', text: 'description = "AWS-published example credentials are never valid"' },
                { kind: '+', text: 'regexes = [' },
                { kind: '+', text: "  '''AKIAIOSFODNN7EXAMPLE''',\n" },
                { kind: '+', text: ']' },
                { kind: '+', text: '' },
              ],
            },
          ],
        },
      ];
    case 'wiz-public-bucket':
      return [
        {
          path: 'terraform/modules/customer-exports.tf',
          additions: 21,
          deletions: 8,
          hunks: [
            {
              header: '@@ -12,16 +12,29 @@ terraform/modules/customer-exports.tf',
              lines: [
                { kind: ' ', text: 'resource "aws_s3_bucket" "customer_exports" {' },
                { kind: ' ', text: '  bucket = "acme-customer-exports"' },
                { kind: '-', text: '  acl    = "public-read"' },
                { kind: ' ', text: '  tags = local.tags' },
                { kind: ' ', text: '}' },
                { kind: ' ', text: '' },
                { kind: '+', text: 'resource "aws_s3_bucket_public_access_block" "customer_exports" {' },
                { kind: '+', text: '  bucket                  = aws_s3_bucket.customer_exports.id' },
                { kind: '+', text: '  block_public_acls       = true' },
                { kind: '+', text: '  block_public_policy     = true' },
                { kind: '+', text: '  ignore_public_acls      = true' },
                { kind: '+', text: '  restrict_public_buckets = true' },
                { kind: '+', text: '}' },
                { kind: '+', text: '' },
                { kind: '-', text: 'resource "aws_s3_bucket_policy" "customer_exports" {' },
                { kind: '-', text: '  bucket = aws_s3_bucket.customer_exports.id' },
                { kind: '-', text: '  policy = data.aws_iam_policy_document.public_read.json' },
                { kind: '-', text: '}' },
                { kind: '+', text: 'data "aws_iam_policy_document" "least_privilege" {' },
                { kind: '+', text: '  statement {' },
                { kind: '+', text: '    actions   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket", "s3:GetBucketLocation"]' },
                { kind: '+', text: '    resources = [' },
                { kind: '+', text: '      aws_s3_bucket.customer_exports.arn,' },
                { kind: '+', text: '      "${aws_s3_bucket.customer_exports.arn}/*",' },
                { kind: '+', text: '    ]' },
                { kind: '+', text: '    principals { type = "AWS" identifiers = [aws_iam_role.exporter.arn] }' },
                { kind: '+', text: '  }' },
                { kind: '+', text: '}' },
              ],
            },
          ],
        },
      ];
    case 'snyk-vuln':
      return [
        {
          path: 'package.json',
          additions: 1,
          deletions: 1,
          hunks: [
            {
              header: '@@ -23,7 +23,7 @@ package.json',
              lines: [
                { kind: ' ', text: '  "dependencies": {' },
                { kind: ' ', text: '    "express": "^4.21.0",' },
                { kind: '-', text: '    "lodash": "4.17.20",' },
                { kind: '+', text: '    "lodash": "4.17.21",' },
                { kind: ' ', text: '    "stripe": "^17.4.0"' },
                { kind: ' ', text: '  },' },
              ],
            },
          ],
        },
        {
          path: 'package-lock.json',
          additions: 2,
          deletions: 2,
          hunks: [
            {
              header: '@@ -1424,8 +1424,8 @@ package-lock.json',
              lines: [
                { kind: ' ', text: '    "node_modules/lodash": {' },
                { kind: '-', text: '      "version": "4.17.20",' },
                { kind: '-', text: '      "integrity": "sha512-PlhdFcillOINfeV7Ni6oF1TAEayyZBoZ8bcshTHqOYJYlrqzRK5hagpagky5o4HfCzzd1TRkXPMFq6cKk9rGmA==",' },
                { kind: '+', text: '      "version": "4.17.21",' },
                { kind: '+', text: '      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==",' },
                { kind: ' ', text: '      "license": "MIT"' },
                { kind: ' ', text: '    },' },
              ],
            },
          ],
        },
      ];
    case 'crowdstrike-detection':
      return [
        {
          path: 'package.json',
          additions: 0,
          deletions: 1,
          hunks: [
            {
              header: '@@ -23,7 +23,6 @@ package.json',
              lines: [
                { kind: ' ', text: '  "dependencies": {' },
                { kind: ' ', text: '    "@colors/colors": "1.6.0",' },
                { kind: '-', text: '    "@colors/colorz": "1.0.0",' },
                { kind: ' ', text: '    "express": "^4.21.0"' },
                { kind: ' ', text: '  },' },
              ],
            },
          ],
        },
        {
          path: 'package-lock.json',
          additions: 0,
          deletions: 6,
          hunks: [
            {
              header: '@@ -1488,12 +1488,6 @@ package-lock.json',
              lines: [
                { kind: ' ', text: '    "node_modules/@colors/colors": {' },
                { kind: ' ', text: '      "version": "1.6.0"' },
                { kind: ' ', text: '    },' },
                { kind: '-', text: '    "node_modules/@colors/colorz": {' },
                { kind: '-', text: '      "version": "1.0.0",' },
                { kind: '-', text: '      "resolved": "https://registry.npmjs.org/@colors/colorz/-/colorz-1.0.0.tgz",' },
                { kind: '-', text: '      "integrity": "sha512-suspicious==",' },
                { kind: '-', text: '      "license": "MIT"' },
                { kind: '-', text: '    },' },
              ],
            },
          ],
        },
      ];
    case 'okta-anomaly':
      return [
        {
          path: 'README.md',
          additions: 1,
          deletions: 0,
          hunks: [
            {
              header: '@@ -1,3 +1,4 @@ README.md',
              lines: [
                { kind: ' ', text: '# payments-service' },
                { kind: '+', text: '> Branch protection on main: signed commits required (added by cursor-agent during CUR-SEC-2241)' },
                { kind: ' ', text: '' },
                { kind: ' ', text: 'Production payments processing service.' },
              ],
            },
          ],
        },
      ];
    default:
      return [];
  }
}
