'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check, Clock, UserCheck } from 'lucide-react';

type Status = 'pending' | 'running' | 'done';

type Channel =
  | 'databricks'
  | 'unity'
  | 'github'
  | 'jira'
  | 'shell'
  | 'opus'
  | 'composer'
  | 'codex'
  | 'codegen'
  | 'human'
  | 'gate'
  | 'done';

interface Step {
  channel: Channel;
  /** Calendar timestamp displayed in the left gutter, e.g. `Day 0 · 09:14`. */
  time: string;
  label: string;
  detail?: string;
  /** Real wall-clock delay for playback pacing (~25–30s total run). */
  delayMs: number;
}

const CHANNEL_STYLES: Record<Channel, { label: string; color: string; bg: string; border: string }> = {
  databricks: { label: 'databricks-mcp',     color: 'text-[#FF6B55]',    bg: 'bg-[#FF3621]/15',    border: 'border-[#FF3621]/35' },
  unity:      { label: 'unity-catalog',      color: 'text-[#7DD3FC]',    bg: 'bg-[#00A1C9]/10',    border: 'border-[#00A1C9]/30' },
  github:     { label: 'github-mcp',         color: 'text-text-primary', bg: 'bg-text-primary/10', border: 'border-text-primary/20' },
  jira:       { label: 'jira-mcp',           color: 'text-[#4C9AFF]',    bg: 'bg-[#0052CC]/15',    border: 'border-[#4C9AFF]/30' },
  shell:      { label: 'shell',              color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
  opus:       { label: 'opus · triage',      color: 'text-[#D97757]',    bg: 'bg-[#D97757]/10',    border: 'border-[#D97757]/30' },
  composer:   { label: 'composer · migrate', color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/30' },
  codex:      { label: 'codex · review',     color: 'text-[#10a37f]',    bg: 'bg-[#10a37f]/10',    border: 'border-[#10a37f]/30' },
  codegen:    { label: 'codegen',            color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/20' },
  human:      { label: 'human-review',       color: 'text-[#E2B36A]',    bg: 'bg-[#E2B36A]/10',    border: 'border-[#E2B36A]/30' },
  gate:       { label: 'lifecycle-gate',     color: 'text-text-tertiary',bg: 'bg-dark-bg',         border: 'border-dark-border' },
  done:       { label: 'complete',           color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
};

// Realistic enterprise lifecycle per workflow:
//   Phase 1 — Day 0 morning · agent automated work (~40 min compute)
//   Phase 2 — Day 1–2      · code review by named reviewer
//   Phase 3 — Day 2–16     · DLT shadow / parallel-run window (2 weekly refreshes)
//   Phase 4 — Day 16–17    · stakeholder sign-off (3 named approvers)
//   Phase 5 — Day 18       · CAB-approved cutover window
//
// Played back in ~25–30s of real time so the rep can show it without waiting
// 18 days. The displayed timestamps in the left gutter are calendar times,
// not real elapsed.
const SCRIPT: Step[] = [
  // -------- Phase 1 · Day 0 — agent automated work --------
  { channel: 'databricks', time: 'Day 0 · 09:14', delayMs: 350, label: 'Connecting to workspace acme-dw-prod',           detail: 'databricks workspace get · https://acme.cloud.databricks.com · region us-west-2' },
  { channel: 'databricks', time: 'Day 0 · 09:14', delayMs: 400, label: 'Reading Unity Catalog schemas',                  detail: 'main.legacy_migration · main.customer_analytics · bronze · silver · gold' },
  { channel: 'databricks', time: 'Day 0 · 09:15', delayMs: 400, label: 'Listing SQL Warehouses + DLT pipelines',         detail: 'serverless-sql-large · 1 existing DLT pipeline · 0 in main.customer_analytics' },
  { channel: 'databricks', time: 'Day 0 · 09:15', delayMs: 400, label: 'Inventorying Informatica repo',                  detail: 'ACME_PC_REPO · 312 workflows · 184 stored procs · 18 TB Oracle source' },
  { channel: 'databricks', time: 'Day 0 · 09:16', delayMs: 400, label: 'First workflow pulled from migration queue',     detail: 'customer_rfm_segmentation · PL/SQL 214 LOC · wf_m_customer_rfm.xml · 6 transforms' },

  { channel: 'opus',       time: 'Day 0 · 09:18', delayMs: 700, label: 'Claude Opus: long-context triage',               detail: 'Reads full stored proc + mapping XML + ACME_DW schema · forms migration plan' },
  { channel: 'opus',       time: 'Day 0 · 09:21', delayMs: 700, label: 'Idioms mapped: 6 dialect-specific',              detail: '2× explicit cursors · 1× global temp table · MERGE · CONNECT BY · NVL/DECODE · TO_CHAR YYYYMM' },

  { channel: 'github',     time: 'Day 0 · 09:23', delayMs: 500, label: 'Pulling PL/SQL provenance',                      detail: 'git log --follow customer_rfm_segmentation.sql · last touched 3y ago · commit 8bd4f1e' },
  { channel: 'github',     time: 'Day 0 · 09:23', delayMs: 350, label: 'Original author offboarded',                     detail: 'alex.chen@acme · left 2023-04 · noted in PR for reviewer context' },

  { channel: 'codegen',    time: 'Day 0 · 09:25', delayMs: 600, label: 'Writing migration triage report',                detail: 'docs/migration/2026-04-17-customer-rfm-segmentation.md · idiom map + verification plan' },

  { channel: 'composer',   time: 'Day 0 · 09:28', delayMs: 800, label: 'Composer: transpiling PL/SQL → Spark SQL',       detail: 'Cursor + FETCH loops → ROW_NUMBER() OVER (...) · temp tables → DLT silver' },
  { channel: 'composer',   time: 'Day 0 · 09:32', delayMs: 700, label: 'MERGE INTO + CONNECT BY rewrite',                detail: 'MERGE INTO delta.customers · WITH RECURSIVE for tier rollup · NVL/DECODE → COALESCE/CASE' },
  { channel: 'composer',   time: 'Day 0 · 09:35', delayMs: 600, label: 'Parsing wf_m_customer_rfm.xml',                  detail: 'Source Qualifier · Expression · Aggregator · 2× Expression · Target' },
  { channel: 'composer',   time: 'Day 0 · 09:38', delayMs: 700, label: 'Emitting DLT pipeline customer_rfm_pipeline.py', detail: '@dlt.table decorators · 3 tables (bronze/silver/gold) · expectations on recency_days ≥ 0' },
  { channel: 'composer',   time: 'Day 0 · 09:40', delayMs: 400, label: 'databricks.yml asset bundle written',            detail: 'bundle: acme-migration · pipelines.customer_rfm · target dev / staging / prod' },

  { channel: 'unity',      time: 'Day 0 · 09:42', delayMs: 500, label: 'Registering Unity Catalog tables',               detail: 'main.customer_analytics.rfm_scores_silver · main.customer_analytics.rfm_scores_gold' },
  { channel: 'unity',      time: 'Day 0 · 09:43', delayMs: 500, label: 'Applying grants + recording lineage',            detail: 'GRANT SELECT to analytics_reader, marketing_ops · OWNER = data-platform · lineage attached' },

  { channel: 'codex',      time: 'Day 0 · 09:46', delayMs: 600, label: 'Codex: static review',                           detail: 'Output equivalence harness queued · 2 minor concerns surfaced for human review' },
  { channel: 'shell',      time: 'Day 0 · 09:48', delayMs: 450, label: 'databricks bundle validate',                     detail: '✓ 4 resources · 0 warnings · asset bundle v1.12.3' },
  { channel: 'shell',      time: 'Day 0 · 09:51', delayMs: 600, label: 'Row-equivalence harness · 1% Oracle sample',     detail: '142K rows · row delta 0 · monetary Σ delta $0.00 · quintile drift 0%' },
  { channel: 'shell',      time: 'Day 0 · 09:53', delayMs: 500, label: 'Photon vs Oracle (1% sample)',                   detail: 'Oracle: 8m 12s · Databricks Photon: 14.3s · 34× faster · DBU est. $0.42' },

  { channel: 'github',     time: 'Day 0 · 09:54', delayMs: 400, label: 'Branch feat/migrate-customer-rfm-segmentation',  detail: 'base: main · 4 files · +187 −0' },
  { channel: 'github',     time: 'Day 0 · 09:55', delayMs: 500, label: 'Opening pull request #241',                      detail: 'feat(migration): customer RFM segmentation — Oracle PL/SQL → Databricks DLT (1/312)' },
  { channel: 'jira',       time: 'Day 0 · 09:55', delayMs: 400, label: 'CUR-5102 → Code Review',                         detail: 'Epic CUR-5101 · linked PR #241 · routed to data-platform on-call: @maria.rodriguez' },

  // -------- Phase 2 · Day 0–2 — code review --------
  { channel: 'gate',       time: 'Day 0 · 09:56 → Day 1 · 10:30', delayMs: 1300, label: 'Awaiting human code review · 24h 34m',  detail: 'Cursor agent does NOT self-merge. PR sits in review queue with 2 Codex-flagged questions attached.' },

  { channel: 'human',      time: 'Day 1 · 10:30', delayMs: 700, label: 'Maria Rodriguez (data-platform lead) opens PR',  detail: 'Reads triage doc · inspects DLT pipeline · runs row-delta harness locally on 1% sample' },
  { channel: 'human',      time: 'Day 1 · 11:45', delayMs: 600, label: '3 review comments posted',                       detail: 'recursive CTE depth assertion · monetary Σ expectation · tier rollup edge case' },

  { channel: 'composer',   time: 'Day 1 · 14:15', delayMs: 700, label: 'Agent responds to review comments',              detail: 'commit 4f9e2c1 · assert recursive depth ≤ 8 · @dlt.expect on Σ · docstring expanded' },
  { channel: 'shell',      time: 'Day 1 · 14:18', delayMs: 500, label: 'Re-running row-equivalence harness',             detail: '✓ all expectations pass · 2 review comments resolved · awaiting re-review' },

  { channel: 'human',      time: 'Day 2 · 11:00', delayMs: 600, label: 'Maria Rodriguez approves PR',                    detail: '2 comments resolved · 1 sign-off recorded · cleared to deploy to staging' },

  // -------- Phase 3 · Day 2–16 — DLT shadow / parallel run --------
  { channel: 'gate',       time: 'Day 2 · 14:00', delayMs: 900, label: 'Parallel run scheduled · DLT shadow mode',       detail: 'Pipeline deployed to staging · runs alongside Oracle weekly job · auto-compares each Monday refresh' },

  { channel: 'shell',      time: 'Day 9 · 03:15', delayMs: 700, label: 'Parallel run #1 complete (week 1)',              detail: 'refresh #1 vs Oracle · row delta 0 · monetary Σ delta $0.00 · 14.2M rows · 1/2 weekly checks pass' },
  { channel: 'shell',      time: 'Day 16 · 03:15', delayMs: 600, label: 'Parallel run #2 complete (week 2)',             detail: 'refresh #2 vs Oracle · row delta 0 · monetary Σ delta $0.00 · 2/2 weekly checks pass' },

  // -------- Phase 4 · Day 16–17 — stakeholder sign-off --------
  { channel: 'gate',       time: 'Day 16 · 10:30', delayMs: 800, label: 'Stakeholder sign-off requested',                detail: '@derek.tan (analytics-marketing, downstream) · @priya.iyer (BI engineering) · @sam.koh (data governance)' },

  { channel: 'human',      time: 'Day 16 · 16:42', delayMs: 500, label: 'Derek Tan (analytics-marketing) signs off',     detail: 'Validated weekly marketing pull-down · downstream segments unchanged · 7-day shadow data verified' },
  { channel: 'human',      time: 'Day 17 · 09:18', delayMs: 500, label: 'Priya Iyer (BI engineering) signs off',         detail: 'Looker dashboards repointed at gold table · refresh validated · BI SLO unchanged' },
  { channel: 'human',      time: 'Day 17 · 16:00', delayMs: 500, label: 'Sam Koh (data governance) signs off',           detail: 'Unity Catalog grants reviewed · classifications preserved · audit trail complete · CAB notified' },

  // -------- Phase 5 · Day 18 — cutover --------
  { channel: 'gate',       time: 'Day 18 · 03:00', delayMs: 800, label: 'CAB-approved cutover window opens',             detail: 'Oracle weekly job paused (kept as 30-day fallback) · DLT pipeline promoted dev → staging → prod' },

  { channel: 'shell',      time: 'Day 18 · 03:15', delayMs: 500, label: 'databricks bundle deploy --target prod',        detail: '✓ pipeline customer_rfm_pipeline promoted · 4 Unity Catalog grants applied' },
  { channel: 'shell',      time: 'Day 18 · 03:58', delayMs: 700, label: 'First production refresh complete',             detail: '14.2M input · 3.1M output · 42.7s · DBU 0.08 ($0.42) · 34× faster than Oracle' },
  { channel: 'jira',       time: 'Day 18 · 04:00', delayMs: 500, label: 'CUR-5102 → Done · workflow 1/312 migrated',     detail: 'Cutover successful · downstream BI refreshed · Oracle source archived (30-day retention)' },

  { channel: 'done',       time: 'Day 18 · 04:00', delayMs: 500, label: '1 / 312 workflows migrated',                    detail: '~18 days end-to-end · ~40 min agent compute · 4 human checkpoints · 2 weekly parallel runs · clean cutover' },
];

interface AgentConsoleProps {
  onComplete?: () => void;
}

export function AgentConsole({ onComplete }: AgentConsoleProps) {
  const [visibleSteps, setVisibleSteps] = useState<Array<Step & { status: Status }>>([]);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    SCRIPT.forEach((step, i) => {
      cumulative += step.delayMs;
      const t = setTimeout(() => {
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
      timers.push(t);
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

  const latestTime = visibleSteps.length > 0 ? visibleSteps[visibleSteps.length - 1].time : 'Day 0 · 09:14';

  return (
    <div className="w-full h-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary leading-none mb-0.5">Cursor Background Agent</p>
            <p className="text-[11px] text-text-tertiary font-mono">~18-day workflow lifecycle · played back at warp speed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${finished ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'}`} />
          <span className="text-[11px] text-text-tertiary font-mono">{latestTime}</span>
        </div>
      </div>

      {/* Console body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[320px]">
        {visibleSteps.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2">Waiting for Databricks workspace webhook…</p>
        )}
        {visibleSteps.map((step, i) => {
          const style = CHANNEL_STYLES[step.channel];
          const isActive = step.status === 'running';
          const isGate = step.channel === 'gate';

          if (isGate) {
            return (
              <div
                key={i}
                className="flex gap-2.5 items-start leading-relaxed pt-2 mt-1 border-t border-dashed border-dark-border"
                style={{ animation: 'agentFadeIn 0.2s ease-out' }}
              >
                <span className="text-text-tertiary shrink-0 w-[140px] text-[10.5px]">
                  {step.time}
                </span>
                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border border-dashed border-text-tertiary/30 text-text-tertiary bg-dark-bg whitespace-nowrap">
                  lifecycle gate
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3 h-3 mt-0.5 text-text-tertiary shrink-0" />
                    <span className="text-text-secondary italic break-words">{step.label}</span>
                  </div>
                  {step.detail && (
                    <div className="text-text-tertiary text-[11px] ml-5 mt-0.5 break-words italic">
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={i}
              className="flex gap-2.5 items-start leading-relaxed"
              style={{ animation: 'agentFadeIn 0.2s ease-out' }}
            >
              <span className="text-text-tertiary shrink-0 w-[140px] text-[10.5px]">
                {step.time}
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
                      <span className="block w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
                    </span>
                  ) : step.channel === 'human' ? (
                    <UserCheck className="w-3 h-3 mt-0.5 text-[#E2B36A] shrink-0" />
                  ) : (
                    <Check className="w-3 h-3 mt-0.5 text-accent-green shrink-0" />
                  )}
                  <span className="text-text-primary break-words">{step.label}</span>
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
        @keyframes agentFadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
