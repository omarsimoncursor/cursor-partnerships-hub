'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check, UserCheck } from 'lucide-react';

type Status = 'pending' | 'running' | 'done';

type Channel =
  | 'aws'
  | 'bedrock'
  | 'cdk'
  | 'github'
  | 'jira'
  | 'shell'
  | 'opus'
  | 'composer'
  | 'codex'
  | 'cloudwatch'
  | 'codegen'
  | 'review'
  | 'done';

interface Step {
  channel: Channel;
  label: string;
  detail?: string;
  /** Real-time delay (ms) before this step renders. Controls playback pacing. */
  delayMs: number;
  /** Displayed elapsed time (ms) shown next to this step. Drives the realistic timeline. */
  elapsedMs: number;
}

const CHANNEL_STYLES: Record<Channel, { label: string; color: string; bg: string; border: string }> = {
  aws:        { label: 'aws-knowledge-mcp',  color: 'text-[#FF9900]',    bg: 'bg-[#FF9900]/10',    border: 'border-[#FF9900]/30' },
  bedrock:    { label: 'bedrock · reason',   color: 'text-[#01A88D]',    bg: 'bg-[#01A88D]/10',    border: 'border-[#01A88D]/30' },
  cdk:        { label: 'cdk',                color: 'text-[#4C9AFF]',    bg: 'bg-[#0972D3]/10',    border: 'border-[#0972D3]/35' },
  github:     { label: 'github-mcp',         color: 'text-text-primary', bg: 'bg-text-primary/10', border: 'border-text-primary/20' },
  jira:       { label: 'jira-mcp',           color: 'text-[#4C9AFF]',    bg: 'bg-[#0052CC]/15',    border: 'border-[#4C9AFF]/30' },
  shell:      { label: 'shell',              color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
  opus:       { label: 'opus · triage',      color: 'text-[#D97757]',    bg: 'bg-[#D97757]/10',    border: 'border-[#D97757]/30' },
  composer:   { label: 'composer · extract', color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/30' },
  codex:      { label: 'codex · review',     color: 'text-[#10a37f]',    bg: 'bg-[#10a37f]/10',    border: 'border-[#10a37f]/30' },
  cloudwatch: { label: 'cloudwatch',         color: 'text-[#E7157B]',    bg: 'bg-[#E7157B]/10',    border: 'border-[#E7157B]/30' },
  codegen:    { label: 'codegen',            color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/20' },
  review:     { label: 'human · review',     color: 'text-[#FF9900]',    bg: 'bg-[#FF9900]/15',    border: 'border-[#FF9900]/45' },
  done:       { label: 'shipped',            color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
};

const MIN = 60 * 1000;
const HR = 60 * MIN;
const DAY = 24 * HR;
function t(days: number, hours = 0, minutes = 0): number {
  return days * DAY + hours * HR + minutes * MIN;
}

const SCRIPT: Step[] = [
  // -------- Day 1: discovery, plan, first draft --------
  { channel: 'aws',      delayMs: 450, elapsedMs: t(0, 0, 2),  label: 'AWS Knowledge MCP intake',                detail: 'aws___recommend · "Java EE monolith → Lambda + Aurora" · 4 SOPs returned' },
  { channel: 'aws',      delayMs: 500, elapsedMs: t(0, 0, 8),  label: 'Pulled Well-Architected pillars',         detail: 'OPS 05 · SEC 02 · REL 09 · PERF 04 · COST 06 · SUS 03 (with question IDs)' },
  { channel: 'aws',      delayMs: 400, elapsedMs: t(0, 0, 18), label: 'Inventoried monolith scope',              detail: '1.18M LOC · 38 bounded contexts · WebSphere 8.5 + Oracle 12c' },
  { channel: 'aws',      delayMs: 400, elapsedMs: t(0, 0, 28), label: 'Picked extraction target',                detail: 'OrdersService · 14,200 LOC · target Lambda + Aurora Serverless v2' },

  { channel: 'bedrock',  delayMs: 800, elapsedMs: t(0, 1, 12), label: 'Bedrock long-context reasoning',          detail: '523 LOC of Java EE + persistence.xml + PL/SQL loaded · decomposition plan drafted' },
  { channel: 'opus',     delayMs: 700, elapsedMs: t(0, 2, 30), label: 'Opus boundary-violation audit',           detail: 'Shared Oracle pool · JNDI in hot path · REF_CURSOR · WebSphere-pinned JPA · checked NamingException' },
  { channel: 'github',   delayMs: 500, elapsedMs: t(0, 3, 40), label: 'Provenance hunt',                         detail: 'git log --since=36.months · last non-trivial author 18mo ago (no longer at company)' },
  { channel: 'codegen',  delayMs: 600, elapsedMs: t(0, 5, 30), label: 'Modernization triage report drafted',     detail: 'docs/modernization/2026-04-17-orders-service.md · MAP phase + Well-Arch citations' },

  { channel: 'composer', delayMs: 800, elapsedMs: t(0, 8, 15), label: 'Composer: Lambda handler v1',             detail: 'services/orders/src/handlers/create-order.ts · AWS SDK v3 · Powertools · 118 LOC' },
  { channel: 'composer', delayMs: 700, elapsedMs: t(0, 11, 40), label: 'Composer: CDK stack v1',                 detail: 'services/orders/infra/orders-stack.ts · Function · Cluster · Secret · VpcEndpoint · RestApi' },
  { channel: 'composer', delayMs: 700, elapsedMs: t(0, 15, 20), label: 'Composer: Aurora PG migration',          detail: 'pg_reserve_inventory replaces SP_RESERVE_INVENTORY (PL/pgSQL) · 87 LOC' },
  { channel: 'composer', delayMs: 500, elapsedMs: t(0, 18, 30), label: 'Composer: integration test seed',        detail: 'tests/integration/create-order.test.ts + events/create-order.json (12 cases)' },

  // -------- Day 2: codex review, iteration, dev deploy --------
  { channel: 'codex',    delayMs: 700, elapsedMs: t(1, 4, 15),  label: 'Codex: IAM v1 audit',                    detail: '3 over-privileged actions found · scope rds-data:* → cluster ARN · scope secretsmanager:* → secret ARN' },
  { channel: 'codex',    delayMs: 500, elapsedMs: t(1, 5, 30),  label: 'Codex: VPC posture review',              detail: 'Lambda private ✓ · Aurora private ✓ · NAT removed in favor of VPC endpoints' },
  { channel: 'codex',    delayMs: 500, elapsedMs: t(1, 6, 45),  label: 'Codex: cost forecast',                   detail: 'Lambda $1.24K · Aurora ACU $3.80K · CW $0.82K · SM $0.48K · ~$6.34K/yr (vs ~$220K on-prem slice)' },
  { channel: 'composer', delayMs: 600, elapsedMs: t(1, 7, 30),  label: 'Composer iteration v2',                  detail: '3 IAM tightenings applied · diff +18 −9 · re-run codex audit clean' },
  { channel: 'cdk',      delayMs: 500, elapsedMs: t(1, 9, 0),   label: 'cdk synth + cdk diff',                   detail: '1 stack synthesized · +14 resources · 0 destroyed · IAM unchanged · no drift' },

  // -------- Day 2 evening: HUMAN architecture review checkpoint --------
  { channel: 'review',   delayMs: 1100, elapsedMs: t(1, 16, 30), label: 'Human review · Architecture (gate 1/4)', detail: 'AWS SA + customer architect signed off on decomposition plan. Note: prefer RDS Data API over RDS Proxy for wave 1; revisit at wave 5.' },

  // -------- Day 3: dev deploy + smoke --------
  { channel: 'shell',     delayMs: 500, elapsedMs: t(2, 9, 30),  label: 'cdk deploy --profile dev',              detail: 'stack orders-dev CREATE_COMPLETE · 3m 47s · 14 resources · API Gateway URL emitted' },
  { channel: 'shell',     delayMs: 500, elapsedMs: t(2, 10, 15), label: 'sam local + integration tests',         detail: '12 tests · 0 failed · CreateOrderFn 200 · 412ms local · pg_reserve_inventory parity ✓' },
  { channel: 'cloudwatch', delayMs: 500, elapsedMs: t(2, 15, 0), label: 'CloudWatch dev smoke (4h soak)',        detail: 'p99 340ms · error 0% · cold start 872ms · ACU util 0.62 · logs clean' },

  // -------- Day 4: HUMAN security review --------
  { channel: 'review',   delayMs: 1000, elapsedMs: t(3, 11, 0),  label: 'Human review · Security (gate 2/4)',    detail: 'SecOps confirmed IAM least-priv ✓ · Secrets Manager rotation 30d ✓ · KMS CMK ✓ · no public Aurora ✓. Action: enforce CloudTrail S3 bucket policy (filed CUR-5310).' },

  // -------- Day 6: HUMAN FinOps review --------
  { channel: 'review',   delayMs: 1000, elapsedMs: t(5, 14, 0),  label: 'Human review · FinOps (gate 3/4)',      detail: 'Approved $6.3K/yr steady-state estimate. Reserved Aurora capacity model deferred to wave 3 (after 6 contexts in prod).' },

  // -------- Day 7-10: stage deploy + load test --------
  { channel: 'shell',     delayMs: 600, elapsedMs: t(6, 9, 30),  label: 'cdk deploy --profile stage',            detail: 'stack orders-stage CREATE_COMPLETE · 4m 12s · multi-AZ · provisioned concurrency 10' },
  { channel: 'shell',     delayMs: 600, elapsedMs: t(7, 11, 0),  label: 'k6 load test · 2× peak prod',           detail: '1.4M req · p99 412ms · error 0.001% · cold starts 6/min · ACU autoscaled 0.5 → 2.4' },
  { channel: 'cloudwatch', delayMs: 500, elapsedMs: t(9, 16, 0), label: 'CloudWatch stage soak (3 days)',        detail: 'p99 408ms 99th-pct · 0 high-sev alarms · Aurora replication lag 12ms p99 · DLQ depth 0' },

  // -------- Day 11: HUMAN cutover review --------
  { channel: 'review',   delayMs: 1100, elapsedMs: t(10, 11, 0), label: 'Human review · Cutover go/no-go (gate 4/4)', detail: 'Joint review: customer architect + AWS SA + Cursor agent. Approved 5d dual-write window, traffic shift 5% / 25% / 50% / 100% over 36h.' },

  // -------- Day 12-17: dual write, parity, cutover --------
  { channel: 'shell',     delayMs: 500, elapsedMs: t(11, 9, 0),  label: 'Dual-write enabled',                    detail: 'feature flag orders.dual_write = true · monolith remains source of truth · drift sentinel armed' },
  { channel: 'cloudwatch', delayMs: 500, elapsedMs: t(14, 14, 0), label: 'Dual-write parity soak (3 days)',      detail: 'reservation parity 100% · revenue ledger parity 100% · 0 drift events · 0 DLQ messages' },
  { channel: 'shell',     delayMs: 600, elapsedMs: t(16, 10, 0), label: 'Traffic shift 5% → 25% → 50% → 100%',   detail: '36h shift complete · monolith reads disabled · cutover gate passed · hyper-care started' },

  // -------- Day 21-22: PR review + merge --------
  { channel: 'github',   delayMs: 500, elapsedMs: t(20, 17, 30), label: 'PR #482 marked Ready for review',       detail: 'feat(modernize): extract OrdersService → Lambda + Aurora Serverless v2 (1/38)' },
  { channel: 'review',   delayMs: 900, elapsedMs: t(21, 9, 0),   label: 'Human review · Senior code review',     detail: '2 reviewers · 4 inline comments resolved · approved · merging into main' },
  { channel: 'github',   delayMs: 500, elapsedMs: t(21, 9, 30),  label: 'PR #482 merged',                        detail: 'squash-merged · cursor-agent + acme-platform-eng · CI green' },
  { channel: 'jira',     delayMs: 500, elapsedMs: t(21, 9, 40),  label: 'CUR-5302 → Done',                       detail: 'parent epic CUR-5301: 1 / 38 contexts shipped to prod · est. portfolio ship 18 months' },

  // -------- Final --------
  { channel: 'done',     delayMs: 500, elapsedMs: t(21, 10, 0),  label: 'OrdersService live on AWS',             detail: '22 calendar days · 4 human review gates passed · 1 / 38 bounded contexts shipped to prod' },
];

interface AgentConsoleProps {
  onComplete?: () => void;
}

function formatElapsed(ms: number): string {
  const totalMin = Math.floor(ms / MIN);
  const days = Math.floor(totalMin / (24 * 60));
  const hours = Math.floor((totalMin % (24 * 60)) / 60);
  const minutes = totalMin % 60;
  if (days > 0) {
    return `+${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  return `+${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

const REVIEW_GATE_TOTAL = SCRIPT.filter(s => s.channel === 'review').length;

export function AgentConsole({ onComplete }: AgentConsoleProps) {
  const [visibleSteps, setVisibleSteps] = useState<Array<Step & { status: Status }>>([]);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    SCRIPT.forEach((step, i) => {
      cumulative += step.delayMs;
      const tt = setTimeout(() => {
        setVisibleSteps(prev => {
          const updated = prev.map(s => ({ ...s, status: 'done' as Status }));
          return [...updated, { ...step, status: 'running' as Status }];
        });

        if (i === SCRIPT.length - 1) {
          const done = setTimeout(() => {
            setVisibleSteps(prev => prev.map(s => ({ ...s, status: 'done' as Status })));
            setFinished(true);
            onComplete?.();
          }, 500);
          timers.push(done);
        }
      }, cumulative);
      timers.push(tt);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleSteps.length]);

  const currentElapsed =
    visibleSteps.length > 0 ? visibleSteps[visibleSteps.length - 1].elapsedMs : 0;
  const reviewGatesPassed = visibleSteps.filter(
    s => s.channel === 'review' && s.status === 'done',
  ).length;

  return (
    <div className="w-full h-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary leading-none mb-0.5">
              Cursor Background Agent
              <span className="text-text-tertiary font-normal"> + customer reviewers</span>
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">
              cursor/partnerships-hub · main · feat/modernize-orders-service
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-text-tertiary font-mono">
          <span className="inline-flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-[#FF9900]" />
            {reviewGatesPassed} / {REVIEW_GATE_TOTAL} gates
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              finished ? 'bg-accent-green' : 'bg-[#FF9900] animate-pulse'
            }`}
          />
          <span>{formatElapsed(currentElapsed)}</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[320px]"
      >
        {visibleSteps.length === 0 && (
          <div className="px-1 py-2 space-y-1.5">
            <p className="text-text-tertiary italic">Waiting for EventBridge webhook…</p>
            <p className="text-[10.5px] text-text-tertiary/70">
              Realistic timeline: ~22 calendar days end-to-end · agent work compressed, human review gates explicit
            </p>
          </div>
        )}
        {visibleSteps.map((step, i) => {
          const style = CHANNEL_STYLES[step.channel];
          const isActive = step.status === 'running';
          const isReview = step.channel === 'review';
          return (
            <div
              key={i}
              className="flex gap-2.5 items-start leading-relaxed"
              style={{ animation: 'awsAgentFadeIn 0.2s ease-out' }}
            >
              <span className="text-text-tertiary shrink-0 w-[78px]">
                {formatElapsed(step.elapsedMs)}
              </span>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${style.bg} ${style.border} ${style.color} whitespace-nowrap`}
              >
                {style.label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5">
                  {isActive ? (
                    <span className="inline-block w-3 h-3 mt-0.5 shrink-0">
                      <span
                        className={`block w-1.5 h-1.5 rounded-full animate-pulse ${
                          isReview ? 'bg-[#FF9900]' : 'bg-accent-amber'
                        }`}
                      />
                    </span>
                  ) : isReview ? (
                    <UserCheck className="w-3 h-3 mt-0.5 text-[#FF9900] shrink-0" />
                  ) : (
                    <Check className="w-3 h-3 mt-0.5 text-accent-green shrink-0" />
                  )}
                  <span
                    className={`break-words ${
                      isReview ? 'text-[#FF9900] font-semibold' : 'text-text-primary'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {step.detail && (
                  <div className="text-text-tertiary text-[11px] ml-5 mt-0.5 break-words">
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes awsAgentFadeIn {
          from {
            opacity: 0;
            transform: translateY(-2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
