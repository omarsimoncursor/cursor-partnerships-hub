'use client';

import {
  Bell,
  Bookmark,
  ChevronDown,
  Hash,
  Headphones,
  Lock,
  MessageSquare,
  MoreVertical,
  Pencil,
  Phone,
  Pin,
  Plus,
  Search,
  Send,
  Smile,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';
import { cn } from '@/lib/utils';

interface SlackThreadProps {
  script: ResolvedScript;
}

export function SlackThread({ script }: SlackThreadProps) {
  const meta = script.meta;
  return (
    <div className="w-full h-full bg-[#1A1D21] text-[#D1D2D3] font-sans overflow-hidden flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#383B40] bg-[#19171D] shrink-0">
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 rounded hover:bg-[#27242C] flex items-center justify-center text-[#9D9FA1]">
            <ChevronDown className="w-3 h-3" />
          </button>
          <button className="w-6 h-6 rounded hover:bg-[#27242C] flex items-center justify-center text-[#9D9FA1]">
            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 bg-[#27242C] border border-[#383B40] rounded px-3 py-0.5 text-[12px] text-[#9D9FA1] w-[420px] max-w-full">
            <Search className="w-3 h-3" />
            <span>Search Acme Corp</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 rounded hover:bg-[#27242C] flex items-center justify-center text-[#9D9FA1]">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: workspace rail + sidebar + content + thread */}
      <div className="flex-1 grid grid-cols-[52px_220px_1fr_320px] min-h-0">
        {/* Workspace rail */}
        <div className="bg-[#19171D] border-r border-[#383B40] flex flex-col items-center pt-2 gap-1.5">
          <button className="w-9 h-9 rounded-md bg-gradient-to-br from-[#1F845A] to-[#0B6E4F] text-white text-[12px] font-bold flex items-center justify-center ring-2 ring-white/20">
            AC
          </button>
          <button className="w-9 h-9 rounded-md bg-[#27242C] text-[#9D9FA1] text-[10px] font-bold flex items-center justify-center hover:bg-[#383B40]">
            +
          </button>
        </div>

        {/* Channels sidebar */}
        <div className="bg-[#19171D] border-r border-[#383B40] flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-[#383B40] flex items-center justify-between">
            <span className="text-[14px] font-bold text-white">Acme Corp</span>
            <button className="w-6 h-6 rounded hover:bg-[#27242C] flex items-center justify-center text-[#9D9FA1]">
              <Pencil className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 text-[13px]">
            <SidebarRow icon={<MessageSquare className="w-3.5 h-3.5" />} label="Threads" />
            <SidebarRow icon={<Bell className="w-3.5 h-3.5" />} label="Mentions & reactions" />
            <SidebarRow icon={<Bookmark className="w-3.5 h-3.5" />} label="Saved later" />
            <SidebarRow icon={<MoreVertical className="w-3.5 h-3.5" />} label="More" />
            <SidebarSection label="Channels">
              <ChannelRow name="general" />
              <ChannelRow name="incidents" />
              <ChannelRow name="security-incidents" active />
              <ChannelRow name="security-on-call" />
              <ChannelRow name="payments-eng" />
              <ChannelRow name="platform-eng" />
            </SidebarSection>
            <SidebarSection label="Direct messages">
              <DmRow name="Sarah Park" status="online" />
              <DmRow name="Cursor Agent" status="bot" />
              <DmRow name="Marcus Lee" status="away" />
            </SidebarSection>
            <SidebarSection label="Apps">
              <AppRow name="Cursor SDK" badge="3" />
              <AppRow name="GitGuardian" badge="1" />
              <AppRow name="PagerDuty" />
            </SidebarSection>
          </div>
        </div>

        {/* Channel content */}
        <div className="bg-[#1A1D21] flex flex-col min-h-0">
          <div className="border-b border-[#383B40] px-4 py-2 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-[#9D9FA1]" />
                <span className="text-[15px] font-bold text-white">security-incidents</span>
                <Star className="w-3.5 h-3.5 text-[#9D9FA1]" />
                <ChevronDown className="w-3.5 h-3.5 text-[#9D9FA1]" />
              </div>
              <p className="text-[11.5px] text-[#9D9FA1]">
                Live alerts and response · 18 members · Bookmarks: runbooks, on-call rotation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 text-[12px] text-[#9D9FA1] hover:bg-[#27242C] rounded flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                Huddle
              </button>
              <button className="px-2 py-1 text-[12px] text-[#9D9FA1] hover:bg-[#27242C] rounded flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                18
              </button>
              <button className="px-2 py-1 text-[12px] text-[#9D9FA1] hover:bg-[#27242C] rounded flex items-center gap-1">
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button className="px-2 py-1 text-[12px] text-[#9D9FA1] hover:bg-[#27242C] rounded flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            <DayDivider label="Today" />
            <ContextMessage
              author="Cursor Agent"
              authorTone="blue"
              app
              time="2m ago"
              body={
                <>
                  Idle. Watching for webhooks from{' '}
                  <span className="text-[#1d9bd1]">@security-tools</span>. SDK version{' '}
                  <code className="bg-[#27242C] text-[#D1D2D3] px-1 rounded text-[12px]">
                    @cursor/february v1.0.7
                  </code>
                  .
                </>
              }
            />

            <CursorAgentMessage script={script} />

            <SystemReply
              author="Sarah Park"
              authorTone="purple"
              time="12 seconds ago"
              body={
                meta.prNumber > 0
                  ? `Thanks Cursor — reviewing PR #${meta.prNumber} now. Holding any history-purge until we coordinate the force-push window with the service owners.`
                  : 'Reviewing the audit timeline now. Will reactivate the user once we confirm the device is clean.'
              }
            />

            <SystemReply
              author="Marcus Lee"
              authorTone="amber"
              time="4 seconds ago"
              body={
                <>
                  +1 from infra. The MCP audit trail in the agent run is exactly what compliance asked for last QBR. Filing this under{' '}
                  <span className="text-[#1d9bd1]">#evidence</span>.
                </>
              }
            />
          </div>

          {/* Composer */}
          <div className="px-4 py-3 border-t border-[#383B40]">
            <div className="rounded-lg border border-[#383B40] bg-[#222529] px-3 py-2 flex items-center gap-2 text-[#9D9FA1] text-[13px]">
              <Plus className="w-4 h-4" />
              <span>Reply to thread…</span>
              <div className="flex-1" />
              <Smile className="w-4 h-4" />
              <Send className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Right rail: thread / details */}
        <div className="bg-[#1A1D21] border-l border-[#383B40] flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-[#383B40] flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-white">Thread</p>
              <p className="text-[11.5px] text-[#9D9FA1]">
                <Hash className="w-3 h-3 inline" /> security-incidents
              </p>
            </div>
            <button className="w-6 h-6 rounded hover:bg-[#27242C] flex items-center justify-center text-[#9D9FA1]">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <ThreadParent script={script} />
            <p className="text-[11.5px] text-[#9D9FA1] uppercase tracking-wider mt-3">
              2 replies
            </p>
            <ThreadReply
              author="Sarah Park"
              tone="purple"
              time="12s"
              body={
                meta.prNumber > 0
                  ? 'Reviewing PR now. Holding history-purge until force-push window coordinated.'
                  : 'Reviewing audit timeline. Holding reactivation until device is verified clean.'
              }
            />
            <ThreadReply
              author="Marcus Lee"
              tone="amber"
              time="4s"
              body="MCP audit trail is exactly what compliance asked for. Filing under #evidence."
            />
          </div>
          <div className="px-4 py-3 border-t border-[#383B40]">
            <div className="rounded-lg border border-[#383B40] bg-[#222529] px-3 py-2 flex items-center gap-2 text-[#9D9FA1] text-[13px]">
              <Plus className="w-4 h-4" />
              <span>Reply…</span>
              <div className="flex-1" />
              <Smile className="w-4 h-4" />
              <Send className="w-4 h-4" />
            </div>
            <label className="flex items-center gap-1.5 mt-2 text-[11.5px] text-[#9D9FA1]">
              <input type="checkbox" className="accent-[#1264A3]" />
              Also send to <Hash className="w-3 h-3 inline" /> security-incidents
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sidebar pieces
// ----------------------------------------------------------------------------

function SidebarRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1 text-[#D1D2D3] hover:bg-[#27242C] cursor-pointer">
      <span className="text-[#9D9FA1]">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 px-4 py-1 text-[12px] text-[#9D9FA1]">
        <ChevronDown className="w-3 h-3" />
        <span className="uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ChannelRow({ name, active }: { name: string; active?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-4 py-0.5 cursor-pointer',
        active
          ? 'bg-[#1164A3] text-white font-medium'
          : 'text-[#D1D2D3] hover:bg-[#27242C]',
      )}
    >
      {name === 'security-on-call' ? (
        <Lock className="w-3 h-3" />
      ) : (
        <Hash className="w-3 h-3 opacity-60" />
      )}
      <span className="text-[13px]">{name}</span>
    </div>
  );
}

function DmRow({ name, status }: { name: string; status: 'online' | 'away' | 'bot' }) {
  const dot =
    status === 'online'
      ? 'bg-[#3CC382]'
      : status === 'bot'
        ? 'bg-[#1264A3] border border-white/30'
        : 'bg-[#9D9FA1]/40';
  return (
    <div className="flex items-center gap-1.5 px-4 py-0.5 text-[13px] text-[#D1D2D3] hover:bg-[#27242C] cursor-pointer">
      <span className={cn('w-2.5 h-2.5 rounded-full', dot)} />
      <span>{name}</span>
    </div>
  );
}

function AppRow({ name, badge }: { name: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-0.5 text-[13px] text-[#D1D2D3] hover:bg-[#27242C] cursor-pointer">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-[#9D9FA1]" />
        <span>{name}</span>
      </div>
      {badge && (
        <span className="px-1.5 py-px rounded-full bg-[#9D1D1D] text-white text-[10px] font-bold">
          {badge}
        </span>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Messages
// ----------------------------------------------------------------------------

function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-[#383B40]" />
      <span className="px-3 py-0.5 rounded-full border border-[#383B40] text-[11px] text-[#9D9FA1] font-semibold">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#383B40]" />
    </div>
  );
}

function ContextMessage({
  author,
  authorTone,
  app,
  time,
  body,
}: {
  author: string;
  authorTone: 'blue' | 'purple' | 'amber';
  app?: boolean;
  time: string;
  body: React.ReactNode;
}) {
  const avatarTone =
    authorTone === 'blue'
      ? 'bg-accent-blue/20 border border-accent-blue/40 text-accent-blue'
      : authorTone === 'purple'
        ? 'bg-[#3F2F77]/40 border border-[#5C4A9C]/40 text-[#C9A8E8]'
        : 'bg-[#9C5C25]/40 border border-[#C2823F]/40 text-[#F5C18A]';
  return (
    <div className="flex items-start gap-3">
      <div className={cn('w-9 h-9 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0', avatarTone)}>
        {author.split(' ').map((p) => p[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-bold text-white">{author}</span>
          {app && (
            <span className="text-[10px] px-1.5 py-px rounded bg-[#1264A3] text-white font-semibold">
              APP
            </span>
          )}
          <span className="text-[12px] text-[#9D9FA1]">{time}</span>
        </div>
        <div className="text-[14px] text-[#D1D2D3] leading-snug mt-0.5">{body}</div>
      </div>
    </div>
  );
}

function CursorAgentMessage({ script }: { script: ResolvedScript }) {
  const meta = script.meta;
  return (
    <div className="flex items-start gap-3 group hover:bg-[#1F2125] -mx-2 px-2 py-1 rounded">
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

        <div className="rounded-md border-l-4 border-[#F5A623] bg-[#222529] overflow-hidden mt-1">
          <div className="px-4 py-3 border-b border-[#383B40]">
            <p className="text-[15px] font-bold text-white leading-snug">
              🔒 Security incident contained · {meta.jiraId}
            </p>
            <p className="text-[12px] text-[#9D9FA1] mt-0.5">
              {script.title}
            </p>
          </div>

          <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            <BlockField label="Service" value={meta.prRepo.split('/')[1]} />
            <BlockField label="Severity" value="P0" valueClassName="text-[#F87171] font-semibold" />
            <BlockField label="Run ID" value={meta.agentId} mono />
            <BlockField label="Status" value="Resolved · awaiting human review" />
          </div>

          <div className="px-4 py-3 border-t border-[#383B40]">
            <p className="text-[11px] text-[#9D9FA1] uppercase tracking-wider font-semibold mb-1.5">
              Containment
            </p>
            <p className="text-[13px] text-[#D1D2D3] leading-snug">{meta.remediation}</p>
          </div>

          <div className="px-4 py-3 border-t border-[#383B40]">
            <p className="text-[11px] text-[#9D9FA1] uppercase tracking-wider font-semibold mb-1.5">
              Artifacts
            </p>
            <ul className="text-[13px] space-y-0.5">
              {meta.evidenceLinks.map((link, i) => (
                <li key={i}>
                  <span className="text-[#1d9bd1] hover:underline cursor-pointer">{link.label}</span>{' '}
                  <span className="text-[#9D9FA1] font-mono text-[12px]">{link.ref}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-4 py-3 border-t border-[#383B40] flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11.5px] text-[#9D9FA1]">
              Run trace:
              <span className="font-mono text-[#1d9bd1] hover:underline cursor-pointer">
                api.cursor.com/v1/agents/{meta.agentId}
              </span>
            </div>
            <button className="px-3 py-1 rounded text-[12px] font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15">
              Acknowledge
            </button>
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5">
          <Reaction emoji="👀" count={2} mine />
          <Reaction emoji="✅" count={1} />
          <Reaction emoji="🚨" count={3} />
          <button className="px-1.5 py-0.5 rounded border border-[#383B40] hover:border-[#4A4D52] text-[#9D9FA1] hover:text-white">
            <Smile className="w-3 h-3" />
          </button>
          <button className="ml-2 text-[11.5px] text-[#1d9bd1] hover:underline">
            2 replies · last reply 4s ago · View thread
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemReply({
  author,
  authorTone,
  time,
  body,
}: {
  author: string;
  authorTone: 'purple' | 'amber';
  time: string;
  body: React.ReactNode;
}) {
  return (
    <div className="ml-12 flex items-start gap-3 group hover:bg-[#1F2125] -mx-2 px-2 py-1 rounded">
      <div
        className={cn(
          'w-7 h-7 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0',
          authorTone === 'purple'
            ? 'bg-[#3F2F77] text-white'
            : 'bg-[#9C5C25] text-white',
        )}
      >
        {author.split(' ').map((p) => p[0]).join('').slice(0, 2)}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-bold text-white">{author}</span>
          <span className="text-[12px] text-[#9D9FA1]">{time}</span>
        </div>
        <p className="text-[13px] text-[#D1D2D3] leading-snug">{body}</p>
      </div>
    </div>
  );
}

function ThreadParent({ script }: { script: ResolvedScript }) {
  const meta = script.meta;
  return (
    <div className="rounded-md border-l-4 border-[#F5A623] bg-[#222529] px-3 py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[12.5px] font-bold text-white">Cursor Agent</span>
        <span className="text-[10px] px-1.5 py-px rounded bg-[#1264A3] text-white font-semibold">
          APP
        </span>
        <span className="text-[11px] text-[#9D9FA1]">just now</span>
      </div>
      <p className="text-[12.5px] text-[#D1D2D3] leading-snug mt-0.5">
        🔒 Security incident contained · <span className="font-mono text-[12px]">{meta.jiraId}</span>
      </p>
      <p className="text-[11.5px] text-[#9D9FA1] mt-0.5">{script.title}</p>
    </div>
  );
}

function ThreadReply({
  author,
  tone,
  time,
  body,
}: {
  author: string;
  tone: 'purple' | 'amber';
  time: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          'w-7 h-7 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0',
          tone === 'purple' ? 'bg-[#3F2F77] text-white' : 'bg-[#9C5C25] text-white',
        )}
      >
        {author.split(' ').map((p) => p[0]).join('').slice(0, 2)}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[12.5px] font-bold text-white">{author}</span>
          <span className="text-[11px] text-[#9D9FA1]">{time}</span>
        </div>
        <p className="text-[12.5px] text-[#D1D2D3] leading-snug">{body}</p>
      </div>
    </div>
  );
}

function BlockField({
  label,
  value,
  mono,
  valueClassName,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-[#9D9FA1] uppercase tracking-wider font-semibold">{label}</p>
      <p
        className={cn(
          'text-[13px] text-white',
          mono && 'font-mono text-[12px]',
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Reaction({ emoji, count, mine }: { emoji: string; count: number; mine?: boolean }) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[12px]',
        mine
          ? 'border-[#1d9bd1] bg-[#1d9bd1]/15 text-white'
          : 'border-[#383B40] bg-[#222529] text-[#D1D2D3] hover:border-[#4A4D52]',
      )}
    >
      <span>{emoji}</span>
      <span className="font-semibold">{count}</span>
    </button>
  );
}
