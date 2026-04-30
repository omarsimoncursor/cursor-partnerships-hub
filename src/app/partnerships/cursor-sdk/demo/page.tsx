'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, FileText, GitPullRequest, MessageSquare, RotateCcw } from 'lucide-react';
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

type Phase = 'draft' | 'running' | 'complete';

const EMPTY_WORKFLOW: Workflow = {
  toolId: null,
  eventId: null,
  actionIds: [],
  mcpIds: [],
};

export default function CursorSdkDemoPage() {
  const [phase, setPhase] = useState<Phase>('draft');
  const [workflow, setWorkflow] = useState<Workflow>(EMPTY_WORKFLOW);
  const [artifact, setArtifact] = useState<SdkArtifact | null>(null);

  const script = useMemo(() => pickScript(workflow), [workflow]);

  const handleRun = useCallback(() => {
    setPhase('running');
    setArtifact(null);
  }, []);

  const handleComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  const handleReset = useCallback(() => {
    setPhase('draft');
    setWorkflow(EMPTY_WORKFLOW);
    setArtifact(null);
  }, []);

  const handleNewRun = useCallback(() => {
    setPhase('draft');
    setArtifact(null);
  }, []);

  const isRuntime = phase === 'running' || phase === 'complete';

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships/cursor-sdk"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to SDK overview
          </Link>
          <div className="flex items-center gap-3">
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
            <span className="text-sm text-text-tertiary font-mono">Live SDK Demo</span>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-16">
        {phase === 'draft' && (
          <div className="px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 mt-2">
                <p className="text-[11px] font-mono text-accent-blue uppercase tracking-[0.2em] mb-2">
                  Cursor SDK · @cursor/february · v1.0.7
                </p>
                <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                  Build a real security automation, live.
                </h1>
                <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
                  Pick which security tool sends the alert, which kind of alert it is, and what you
                  want the agent to do in response. The TypeScript on the right updates as you
                  click — that&apos;s the actual code a customer would deploy. Hit{' '}
                  <span className="text-accent-blue font-semibold">Run automation</span> to watch
                  the agent execute the workflow you just built.
                </p>
                <p className="text-xs text-text-tertiary mt-3 max-w-xl mx-auto">
                  In a hurry? Tap a starter workflow chip below to load a curated combination. You
                  can edit it before you run.
                </p>
              </div>
              <WorkflowBuilder workflow={workflow} onChange={setWorkflow} onRun={handleRun} />
            </div>
          </div>
        )}

        {isRuntime && (
          <div className="px-6">
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

            {phase === 'complete' && <ArtifactStrip script={script} onOpen={setArtifact} />}
          </div>
        )}
      </main>

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
