'use client';

import {
  Bug,
  ChevronDown,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  ThumbsUp,
} from 'lucide-react';
import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';

interface JiraTicketProps {
  script: ResolvedScript;
}

export function JiraTicket({ script }: JiraTicketProps) {
  const meta = script.meta;
  const project = meta.jiraId.split('-').slice(0, 2).join('-');

  return (
    <div className="w-full h-full bg-[#1D2125] text-[#B6C2CF] font-sans overflow-y-auto">
      {/* Top Jira bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2C333A] bg-[#161A1D] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-[#0052CC]">
            <span className="text-white text-[11px] font-bold">J</span>
          </div>
          <span className="text-[13px] text-[#9FADBC] font-medium">Jira</span>
          <span className="text-[#7C8A99] text-xs">/</span>
          <span className="text-[13px] text-[#9FADBC]">{project}</span>
          <span className="text-[#7C8A99] text-xs">/</span>
          <span className="text-[13px] text-[#9FADBC]">{meta.jiraId}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search"
            className="bg-[#22272B] border border-[#2C333A] rounded text-[12px] px-2 py-1 text-[#B6C2CF] placeholder:text-[#7C8A99] w-40"
          />
          <div className="w-6 h-6 rounded-full bg-[#1F845A]/30 flex items-center justify-center text-[10px] font-bold text-[#57D9A3]">
            JS
          </div>
        </div>
      </div>

      {/* Breadcrumb / issue key */}
      <div className="px-8 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Bug className="w-3.5 h-3.5 text-[#F87462]" />
          <span className="text-[12px] text-[#7C8A99] hover:text-[#9FADBC] cursor-pointer">
            {meta.jiraId}
          </span>
        </div>
        <h1 className="text-[22px] font-semibold text-[#B6C2CF] leading-tight">
          {meta.jiraSummary}
        </h1>
      </div>

      {/* Action row */}
      <div className="px-8 py-3 border-b border-[#2C333A] flex items-center gap-2 flex-wrap">
        <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F845A] text-white text-[12px] font-medium hover:bg-[#22A06B]">
          <span>Awaiting Review</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] text-[#9FADBC] hover:bg-[#2C333A]">
          <ThumbsUp className="w-3 h-3" />
          Vote
        </button>
        <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] text-[#9FADBC] hover:bg-[#2C333A]">
          <Paperclip className="w-3 h-3" />
          Attach
        </button>
        <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] text-[#9FADBC] hover:bg-[#2C333A]">
          <Link2 className="w-3 h-3" />
          Link issue
        </button>
        <div className="ml-auto">
          <button className="p-1 rounded text-[#9FADBC] hover:bg-[#2C333A]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 px-8 py-6">
        <div className="min-w-0">
          {/* Description */}
          <Section title="Description">
            <div className="text-[13.5px] leading-relaxed space-y-3">
              <p>{meta.incidentSummary}</p>
            </div>
          </Section>

          {/* Root cause */}
          <Section title="Root cause">
            <p className="text-[13.5px] leading-relaxed">{meta.rootCause}</p>
          </Section>

          {/* Remediation */}
          <Section title="Remediation taken">
            <p className="text-[13.5px] leading-relaxed">{meta.remediation}</p>
          </Section>

          {/* Linked */}
          <Section title="Linked artifacts">
            <div className="space-y-1.5">
              {meta.evidenceLinks.map((link, i) => (
                <LinkRow
                  key={i}
                  type={link.label.toLowerCase().includes('pr') ? 'blocks' : 'relates to'}
                  refLabel={link.ref}
                  title={link.label}
                  status={i === 0 ? 'Resolved' : 'Awaiting Review'}
                  statusColor={i === 0 ? 'bg-[#1F845A]' : 'bg-[#0052CC]'}
                />
              ))}
            </div>
          </Section>

          {/* Activity */}
          <section className="mt-6">
            <div className="flex items-center gap-6 border-b border-[#2C333A] mb-4">
              <button className="pb-2 text-[13px] font-medium text-[#B6C2CF] border-b-2 border-[#4C9AFF]">
                Comments
              </button>
              <button className="pb-2 text-[13px] text-[#7C8A99] hover:text-[#9FADBC]">
                History
              </button>
              <button className="pb-2 text-[13px] text-[#7C8A99] hover:text-[#9FADBC]">
                Work log
              </button>
            </div>

            <div className="space-y-4">
              <Comment
                author="Cursor Agent"
                pill="Automation"
                time="38 seconds ago"
                avatarBg="bg-accent-blue/20"
                avatarColor="text-accent-blue"
                avatarInitial="C"
                body={`Opened from a webhook fired by ${webhookSourceFor(script)}. All containment actions complete. ${meta.prNumber > 0 ? `Cleanup change proposed in PR #${meta.prNumber}, awaiting human review.` : 'Awaiting human triage.'}`}
              />
              <Comment
                author="Sarah Park"
                pill="Security on-call"
                time="12 seconds ago"
                avatarBg="bg-[#3F2F77]/40"
                avatarColor="text-[#C9A8E8]"
                avatarInitial="SP"
                body={
                  meta.prNumber > 0
                    ? `Thanks Cursor — reviewing PR #${meta.prNumber} now. Holding any history-purge until we coordinate the force-push window with the service owners.`
                    : 'Reviewing the audit timeline now. Will reactivate the user once we confirm the device is clean.'
                }
              />
            </div>
          </section>
        </div>

        {/* Right column: details */}
        <aside className="min-w-0 space-y-4">
          <DetailsCard meta={meta} />
          <AutomationCard script={script} />
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Comment({
  author,
  pill,
  time,
  avatarBg,
  avatarColor,
  avatarInitial,
  body,
}: {
  author: string;
  pill: string;
  time: string;
  avatarBg: string;
  avatarColor: string;
  avatarInitial: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${avatarBg}`}>
        <span className={`text-xs font-semibold ${avatarColor}`}>{avatarInitial}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[13px] font-semibold text-[#B6C2CF]">{author}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#2C333A] text-[#9FADBC]">
            {pill}
          </span>
          <span className="text-[12px] text-[#7C8A99]">· {time}</span>
        </div>
        <div className="rounded-md border border-[#2C333A] bg-[#161A1D] p-3 text-[13px] leading-relaxed">
          {body}
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[12px] text-[#7C8A99]">
          <button className="hover:text-[#9FADBC] flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> Reply
          </button>
          <button className="hover:text-[#9FADBC]">Edit</button>
          <button className="hover:text-[#9FADBC]">Delete</button>
        </div>
      </div>
    </div>
  );
}

function DetailsCard({ meta }: { meta: ResolvedScript['meta'] }) {
  return (
    <div className="rounded-lg border border-[#2C333A] bg-[#161A1D] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#2C333A]">
        <p className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider">Details</p>
      </div>
      <dl className="p-4 space-y-3 text-[12.5px]">
        <DetailRow label="Assignee" value="Cursor Agent" avatar="C" avatarBg="bg-accent-blue/20" avatarColor="text-accent-blue" />
        <DetailRow label="Reporter" value="Cursor SDK Webhook" avatar="W" avatarBg="bg-[#1F845A]/30" avatarColor="text-[#57D9A3]" />
        <DetailRow label="Reviewer" value="@security-team" avatar="S" avatarBg="bg-[#3F2F77]/40" avatarColor="text-[#C9A8E8]" />
        <div>
          <dt className="text-[#7C8A99] mb-1">Priority</dt>
          <dd className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C9372C]" />
            <span className="text-[#B6C2CF]">P0 / Highest</span>
          </dd>
        </div>
        <div>
          <dt className="text-[#7C8A99] mb-1">Issue type</dt>
          <dd className="flex items-center gap-1.5">
            <Bug className="w-3 h-3 text-[#F87462]" />
            <span className="text-[#B6C2CF]">Security incident</span>
          </dd>
        </div>
        <div>
          <dt className="text-[#7C8A99] mb-1">Labels</dt>
          <dd className="flex flex-wrap gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">cursor-sdk</span>
            <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">automated</span>
            <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">mcp</span>
          </dd>
        </div>
        <div>
          <dt className="text-[#7C8A99] mb-1">Components</dt>
          <dd className="text-[#B6C2CF]">
            {meta.prRepo.split('/')[1]}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function AutomationCard({ script }: { script: ResolvedScript }) {
  const meta = script.meta;
  const cumulative = script.steps.reduce((s, x) => s + x.delayMs, 0);
  const billed = ((cumulative * 2.6) / 1000).toFixed(1);
  return (
    <div className="rounded-lg border border-[#2C333A] bg-[#161A1D] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#2C333A]">
        <p className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider">
          Automation
        </p>
      </div>
      <div className="p-4 space-y-2 text-[12.5px]">
        <p>
          <span className="text-[#7C8A99]">Created by </span>
          <span className="font-medium text-[#B6C2CF]">Cursor Background Agent</span>
        </p>
        <p>
          <span className="text-[#7C8A99]">Run id </span>
          <span className="font-mono text-[11.5px] text-[#4C9AFF]">{meta.agentId}</span>
        </p>
        <p>
          <span className="text-[#7C8A99]">Triggered by </span>
          <span className="font-mono text-[11.5px] text-[#B6C2CF]">{webhookSourceFor(script)}</span>
        </p>
        <p>
          <span className="text-[#7C8A99]">Resolution time </span>
          <span className="font-mono text-[#57D9A3]">{billed}s</span>
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  avatar,
  avatarBg,
  avatarColor,
}: {
  label: string;
  value: string;
  avatar: string;
  avatarBg: string;
  avatarColor: string;
}) {
  return (
    <div>
      <dt className="text-[#7C8A99] mb-1">{label}</dt>
      <dd className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${avatarBg}`}>
          <span className={`text-[10px] font-semibold ${avatarColor}`}>{avatar}</span>
        </div>
        <span className="text-[#B6C2CF]">{value}</span>
      </dd>
    </div>
  );
}

function LinkRow({
  type,
  refLabel,
  title,
  status,
  statusColor,
}: {
  type: string;
  refLabel: string;
  title: string;
  status: string;
  statusColor: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-[13px]">
      <span className="text-[11px] text-[#7C8A99] w-20 shrink-0">{type}</span>
      <span className="text-[#4C9AFF] font-mono text-[12px] hover:underline cursor-pointer shrink-0">
        {refLabel}
      </span>
      <span className="text-[#B6C2CF] truncate flex-1 min-w-0">{title}</span>
      <span
        className={`text-[10px] font-medium text-white px-1.5 py-0.5 rounded ${statusColor} shrink-0`}
      >
        {status}
      </span>
    </div>
  );
}

function webhookSourceFor(script: ResolvedScript): string {
  switch (script.id) {
    case 'gitguardian-secret':
      return 'gitguardian-webhook / secret.exposed';
    case 'wiz-public-bucket':
      return 'wiz-webhook / issue.opened';
    case 'okta-anomaly':
      return 'okta-webhook / auth.anomaly';
    case 'snyk-vuln':
      return 'snyk-webhook / vulnerability.new';
    case 'crowdstrike-detection':
      return 'crowdstrike-webhook / detection.high';
    default:
      return 'cursor-sdk / webhook';
  }
}
