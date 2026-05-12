'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Code2, FileText, GitPullRequest, MessageSquare, RotateCcw } from 'lucide-react';
import type { Workflow } from '@/lib/sdk-demo/types';
import { pickScript } from '@/lib/sdk-demo/scripts/pick-script';
import { WorkflowBuilder } from '@/components/sdk-demo/builder/workflow-builder';
import { RuntimeSplit } from '@/components/sdk-demo/runtime/runtime-split';
import { ArtifactStrip, type SdkArtifact } from '@/components/sdk-demo/runtime/artifact-strip';
import { ArtifactModal } from '@/components/sdk-demo/artifacts/artifact-modal';
import { SdkCallTrace } from '@/components/sdk-demo/artifacts/sdk-call-trace';
import { AuditTimeline } from '@/components/sdk-demo/artifacts/audit-timeline';
import { JiraTicket } from '@/components/sdk-demo/artifacts/jira-ticket';
import { GithubPrPreview } from '@/components/sdk-demo/artifacts/github-pr-preview';
import { SlackThread } from '@/components/sdk-demo/artifacts/slack-thread';
import { track } from '@/lib/prospect/tracker';

type Phase = 'draft' | 'running' | 'complete';

const EMPTY_WORKFLOW: Workflow = {
  toolId: null,
  eventId: null,
  actionIds: [],
  mcpIds: [],
  pinnedMcpIds: [],
  excludedMcpIds: [],
};

type Props = {
  /**
   * Show the centered "Cursor SDK" / "Build a real security automation,
   * live." hero above the workflow builder. Defaults to true. Set to
   * false when embedding inside another page that already has its own
   * section header (e.g. the personalized prospect demo).
   */
  hero?: boolean;
};

/**
 * The full, multi-phase Cursor SDK live demo, ported out of
 * `/partnerships/cursor-sdk/demo/page.tsx` so it can also be embedded
 * inside other surfaces (e.g. the personalized prospect demo at
 * `/p/[slug]`) without duplicating the state machine + artifact tree.
 *
 * Owns its own `phase` / `workflow` / `artifact` state and renders:
 *   draft   -> WorkflowBuilder
 *   running -> RuntimeSplit (live agent stream)
 *   complete -> RuntimeSplit + ArtifactStrip (Jira, PR, Slack, audit, trace)
 *
 * The Reset / Edit workflow controls are rendered as an inline toolbar
 * above the demo body so they remain available regardless of host
 * page (the previous version put them in the page nav, which doesn't
 * exist when embedded).
 */
export function CursorSdkLiveDemo({ hero = true }: Props = {}) {
  const [phase, setPhase] = useState<Phase>('draft');
  const [workflow, setWorkflow] = useState<Workflow>(EMPTY_WORKFLOW);
  const [artifact, setArtifact] = useState<SdkArtifact | null>(null);

  const script = useMemo(() => pickScript(workflow), [workflow]);

  const handleRun = useCallback(() => {
    setPhase('running');
    setArtifact(null);
    track('sdk.run', {
      tool: workflow.toolId,
      event: workflow.eventId,
      action_count: workflow.actionIds.length,
      mcp_count: workflow.mcpIds.length,
    });
  }, [workflow]);

  const handleComplete = useCallback(() => {
    setPhase('complete');
    track('sdk.complete', {
      tool: workflow.toolId,
      event: workflow.eventId,
      action_count: workflow.actionIds.length,
    });
  }, [workflow]);

  const handleReset = useCallback(() => {
    setPhase('draft');
    setWorkflow(EMPTY_WORKFLOW);
    setArtifact(null);
    track('sdk.reset');
  }, []);

  const handleNewRun = useCallback(() => {
    setPhase('draft');
    setArtifact(null);
  }, []);

  // Detect starter-workflow loads (any time the workflow.toolId changes
  // from null -> set without going through the draft picker, i.e. all
  // four IDs land at once). Cleanest signal: a starter is loaded if
  // toolId becomes non-null and we go from 0 actions to several actions
  // in the same change.
  const lastWorkflowRef = useRef<Workflow>(EMPTY_WORKFLOW);
  const handleWorkflowChange = useCallback((next: Workflow) => {
    const prev = lastWorkflowRef.current;
    if (
      next.toolId &&
      (prev.toolId !== next.toolId || prev.actionIds.length === 0) &&
      next.actionIds.length >= 2
    ) {
      track('sdk.starter_loaded', {
        tool: next.toolId,
        event: next.eventId,
        action_count: next.actionIds.length,
      });
    }
    lastWorkflowRef.current = next;
    setWorkflow(next);
  }, []);

  const handleArtifactOpen = useCallback((next: SdkArtifact | null) => {
    if (next) track('sdk.artifact_opened', { artifact: next });
    setArtifact(next);
  }, []);

  const isRuntime = phase === 'running' || phase === 'complete';
  const isDirty =
    workflow.toolId !== null ||
    workflow.eventId !== null ||
    workflow.actionIds.length > 0 ||
    workflow.pinnedMcpIds.length > 0 ||
    workflow.excludedMcpIds.length > 0;

  return (
    <div className="w-full">
      {/* Inline control toolbar — replaces the page-level nav buttons so the
          demo is fully self-contained when embedded. Hidden in the draft
          phase if nothing has been touched yet (looks cleaner). */}
      {(isRuntime || isDirty) && (
        <div className="flex items-center justify-end gap-2 mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary mr-auto">
            Live SDK demo
          </span>
          {isRuntime && (
            <button
              onClick={handleNewRun}
              className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors px-2.5 py-1 rounded-md hover:bg-dark-surface-hover cursor-pointer"
              title="Edit the workflow"
            >
              Edit workflow
            </button>
          )}
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors px-2.5 py-1 rounded-md hover:bg-dark-surface-hover cursor-pointer"
            title="Reset demo"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      )}

      {phase === 'draft' && (
        <div>
          {hero && (
            <div className="text-center mb-8 mt-2">
              <p className="text-[11px] font-mono text-accent-blue uppercase tracking-[0.2em] mb-2">
                Cursor SDK
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Build a real security automation, live.
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
                Pick which security tool sends the alert, which kind of alert it is, and what you
                want the agent to do in response. The TypeScript on the right updates as you
                click — that&apos;s actual code being built in real time. Hit{' '}
                <span className="text-accent-blue font-semibold">Run automation</span> to watch
                the agent execute the workflow.
              </p>
            </div>
          )}
          <WorkflowBuilder workflow={workflow} onChange={handleWorkflowChange} onRun={handleRun} />
        </div>
      )}

      {isRuntime && (
        <div>
          <div className="text-center mb-6 mt-2 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/20 mb-3">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  phase === 'complete' ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'
                }`}
              />
              <span
                className={`text-[11px] font-mono uppercase tracking-wider ${
                  phase === 'complete' ? 'text-accent-green' : 'text-accent-amber'
                }`}
              >
                {phase === 'complete' ? 'Run complete' : 'Agent running'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
              {phase === 'complete'
                ? 'Five artifacts ready for review.'
                : 'Cursor SDK is running the workflow you just built.'}
            </h2>
            <p className="text-[12.5px] text-text-secondary mt-2 leading-relaxed">
              {phase === 'complete' ? (
                <>
                  The agent is done. Below are the five artifacts a real reviewer would receive,
                  each rendered in the actual UI of the tool that produces it.
                </>
              ) : (
                <>
                  On the <span className="text-accent-amber font-semibold">left</span>, the
                  structured events your code receives from <span className="font-mono text-accent-blue">run.stream()</span>.
                  On the <span className="text-accent-blue font-semibold">right</span>, a live
                  visualization of the Cursor agent calling your selected tools.
                </>
              )}
            </p>
            <p className="text-xs text-text-tertiary mt-1 font-mono">
              Script: <span className="text-text-secondary">{script.title}</span>
            </p>
          </div>

          <RuntimeSplit script={script} onComplete={handleComplete} finished={phase === 'complete'} />

          {phase === 'complete' && <ArtifactStrip script={script} onOpen={handleArtifactOpen} />}
        </div>
      )}

      {artifact === 'sdk-trace' && (
        <ArtifactModal
          onClose={() => setArtifact(null)}
          title="SDK Call Trace"
          subtitle="Every SDK + MCP call the run made, with timing and status"
          icon={<Code2 className="w-4 h-4" />}
          iconBg="bg-accent-blue/30"
          iconBorder="border-accent-blue/40"
          iconColor="text-accent-blue"
          url={`api.cursor.com/v1/agents/${script.meta.agentId}/runs`}
          frame="macbook"
          whatIsThis={{
            what: 'A developer-facing trace of every SDK and MCP call the agent made.',
            who: 'Platform engineers, security operations.',
            why: 'Drop the run ID into Splunk and you can replay exactly what the agent did, with timing.',
          }}
        >
          <SdkCallTrace script={script} agentId={script.meta.agentId} />
        </ArtifactModal>
      )}

      {artifact === 'audit' && (
        <ArtifactModal
          onClose={() => setArtifact(null)}
          title="Audit Timeline"
          subtitle="CISO-facing chronological record of every action the agent took"
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-[#0F62FE]/20"
          iconBorder="border-[#0F62FE]/40"
          iconColor="text-[#0F62FE]"
          url={`docs/security-incidents/${script.meta.jiraId}.md`}
          frame="document"
          whatIsThis={{
            what: 'A clean chronological document of the entire incident response.',
            who: 'CISOs, GRC, external auditors.',
            why: 'This is the document a CISO forwards unedited. SOC 2 and ISO 27001 evidence-grade.',
          }}
        >
          <AuditTimeline script={script} />
        </ArtifactModal>
      )}

      {artifact === 'jira' && (
        <ArtifactModal
          onClose={() => setArtifact(null)}
          title="Jira Ticket"
          subtitle="Incident ticket with linked artifacts and status timeline"
          icon={<span className="text-[#4C9AFF] text-sm font-bold leading-none">J</span>}
          iconBg="bg-[#0052CC]/20"
          iconBorder="border-[#4C9AFF]/40"
          iconColor="text-[#4C9AFF]"
          url={`acme-corp.atlassian.net/browse/${script.meta.jiraId}`}
          frame="browser"
          whatIsThis={{
            what: 'The Jira ticket the security team uses to track this incident.',
            who: 'Security team leads, incident response coordinators.',
            why: 'Linked to every artifact the agent produced. Closes the ticket-tracking loop the security team already runs in.',
          }}
        >
          <JiraTicket script={script} />
        </ArtifactModal>
      )}

      {artifact === 'pr' && (
        <ArtifactModal
          onClose={() => setArtifact(null)}
          title="GitHub Pull Request"
          subtitle="Cursor proposes; reviewer approves. Agents do not auto-merge."
          icon={<GitPullRequest className="w-4 h-4" />}
          iconBg="bg-accent-green/20"
          iconBorder="border-accent-green/40"
          iconColor="text-accent-green"
          url={
            script.meta.prNumber > 0
              ? `github.com/${script.meta.prRepo}/pull/${script.meta.prNumber}`
              : `github.com/${script.meta.prRepo}`
          }
          frame="browser"
          whatIsThis={{
            what: 'The actual code change the agent proposes to fix the underlying issue.',
            who: 'Engineers, AppSec reviewers.',
            why: 'A human reviews and merges. Cursor never auto-merges to main. Switch to the Files changed tab to see the diff.',
          }}
        >
          <GithubPrPreview script={script} />
        </ArtifactModal>
      )}

      {artifact === 'slack' && (
        <ArtifactModal
          onClose={() => setArtifact(null)}
          title="Slack Thread"
          subtitle="Structured incident summary in #security-incidents"
          icon={<MessageSquare className="w-4 h-4" />}
          iconBg="bg-[#4A154B]/30"
          iconBorder="border-[#4A154B]/50"
          iconColor="text-[#E4A6E0]"
          url="acme.slack.com/archives/C0SECURITY"
          frame="browser"
          whatIsThis={{
            what: 'The structured incident summary the agent posts in #security-incidents.',
            who: 'On-call humans, security leadership, engineering managers.',
            why: 'A single message answers: what happened, what was done, where to look. The on-call ack in seconds.',
          }}
        >
          <SlackThread script={script} />
        </ArtifactModal>
      )}
    </div>
  );
}
