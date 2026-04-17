'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check, UserCircle2 } from 'lucide-react';

type Status = 'pending' | 'running' | 'done';

type Channel =
  | 'snowflake'
  | 'cortex'
  | 'dbt'
  | 'github'
  | 'jira'
  | 'shell'
  | 'opus'
  | 'composer'
  | 'codex'
  | 'codegen'
  | 'human'
  | 'done';

interface Step {
  channel: Channel;
  label: string;
  detail?: string;
  /** Real time (ms) the playback waits before this step appears. */
  delayMs: number;
  /**
   * How much agent wall-clock time (ms) this step represents on the displayed
   * timeline. Decoupled from delayMs so a 50-min "awaiting reviewer" pause
   * can show as `+02:14:00` while only consuming ~1.8s of real playback.
   */
  displayedMs: number;
}

const CHANNEL_STYLES: Record<Channel, { label: string; color: string; bg: string; border: string }> = {
  snowflake: { label: 'snowflake-mcp',       color: 'text-[#7DD3F5]',    bg: 'bg-[#29B5E8]/10',    border: 'border-[#29B5E8]/35' },
  cortex:    { label: 'cortex · ai',          color: 'text-[#B8E3F4]',    bg: 'bg-[#7CC5DC]/10',    border: 'border-[#7CC5DC]/35' },
  dbt:       { label: 'dbt',                  color: 'text-[#FF9476]',    bg: 'bg-[#FF694A]/10',    border: 'border-[#FF694A]/30' },
  github:    { label: 'github-mcp',           color: 'text-text-primary', bg: 'bg-text-primary/10', border: 'border-text-primary/20' },
  jira:      { label: 'jira-mcp',             color: 'text-[#4C9AFF]',    bg: 'bg-[#0052CC]/15',    border: 'border-[#4C9AFF]/30' },
  shell:     { label: 'shell',                color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
  opus:      { label: 'opus · triage',        color: 'text-[#D97757]',    bg: 'bg-[#D97757]/10',    border: 'border-[#D97757]/30' },
  composer:  { label: 'composer · modernize', color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/30' },
  codex:     { label: 'codex · review',       color: 'text-[#10a37f]',    bg: 'bg-[#10a37f]/10',    border: 'border-[#10a37f]/30' },
  codegen:   { label: 'codegen',              color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/20' },
  human:     { label: 'human · review',       color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/30' },
  done:      { label: 'complete',             color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
};

// ---------------------------------------------------------------------------
// SCRIPT
//
// One asset modernization (1 BTEQ + 1 T-SQL stored proc + 1 Informatica map)
// modeled as a realistic enterprise workflow. Total displayed time ≈ 4h 04m,
// of which ≈ 1h 35m is human review (two checkpoints) and ≈ 2h 29m is agent
// + automation (Opus / Composer / Codex / Cortex / dbt / shell / GitHub /
// Jira) wall time. Compresses to ~30s of real playback.
// ---------------------------------------------------------------------------

const M = 60_000;       // 1 minute in displayed ms
const MIN_30S = 30_000; // 30 seconds in displayed ms

const RAW_SCRIPT: Step[] = [
  // ──────────────────────── Phase 1: Snowflake intake (~14 min) ─────────────
  { channel: 'snowflake', delayMs: 350, displayedMs: 1.5 * M, label: 'Connecting to account acme-analytics',         detail: 'region us-east-1.aws · role ANALYTICS_ENGINEER · MFA via Okta SSO' },
  { channel: 'snowflake', delayMs: 300, displayedMs: 1   * M, label: 'Listing databases',                            detail: 'prod_analytics · dev_analytics · raw_landing · migration_staging' },
  { channel: 'snowflake', delayMs: 350, displayedMs: 1.5 * M, label: 'Listing warehouses · checking entitlements',   detail: 'XS_MODERNIZATION_WH · Running · Auto-suspend 60s · Edition: Enterprise' },
  { channel: 'snowflake', delayMs: 350, displayedMs: 1.5 * M, label: 'Verifying Cortex AI entitlement',              detail: 'SNOWFLAKE.CORTEX.COMPLETE · SEARCH · SUMMARIZE · ✓ enabled (mistral-large)' },
  { channel: 'snowflake', delayMs: 400, displayedMs: 3   * M, label: 'Pulling query history · fct_daily_revenue',     detail: 'last 5 queries · stale 14h 22m · 4 downstream pipelines blocked · finance Q2 dashboard offline' },
  { channel: 'snowflake', delayMs: 500, displayedMs: 4   * M, label: 'Inventorying legacy repo via gitsense',         detail: '247 BTEQ · 412 T-SQL · 184 Informatica · 68 SSIS · 63,180 LOC · 2,118 unique idioms' },
  { channel: 'snowflake', delayMs: 300, displayedMs: 1   * M, label: 'First asset picked',                            detail: 'daily_revenue_rollup.bteq (214 LOC) + usp_enrich_customers_360.sql (156 LOC) + wf_customers_360.xml' },

  // ──────────────────────── Phase 2: Opus long-context triage (~25 min) ─────
  { channel: 'opus',      delayMs: 700, displayedMs: 6   * M, label: 'Claude Opus: long-context triage',              detail: 'reading both files end-to-end · cross-referencing dim_product, fx_rates, dim_customer' },
  { channel: 'opus',      delayMs: 600, displayedMs: 5   * M, label: 'Idioms tagged (BTEQ)',                          detail: 'QUALIFY · MULTISET VOLATILE · COLLECT STATISTICS · Teradata date math · effective-dated FX subquery' },
  { channel: 'opus',      delayMs: 500, displayedMs: 4   * M, label: 'Idioms tagged (T-SQL)',                         detail: 'MERGE · CROSS APPLY · OUTER APPLY · OPENJSON · FOR JSON PATH · DATETIME2 · SYSDATETIMEOFFSET' },
  { channel: 'opus',      delayMs: 800, displayedMs: 8   * M, label: 'Drafting modernization plan',                   detail: 'staging CTE + incremental fct + Snowpark proc + Cortex semantic-diff macro + dbt snapshot' },

  // ──────────────────────── Phase 3: Provenance hunt (~3 min) ───────────────
  { channel: 'github',    delayMs: 300, displayedMs: 1   * M, label: 'git log --all -- legacy/*.bteq legacy/*.sql',   detail: 'fetching commit history across modernization-staging branch + main' },
  { channel: 'github',    delayMs: 300, displayedMs: 1   * M, label: 'BTEQ last touched 2.3y ago',                    detail: 'commit 7c91ab2 · j.oshea@acme.com (left in 2024 · per Workday)' },
  { channel: 'github',    delayMs: 300, displayedMs: 1   * M, label: 'T-SQL proc last touched 11m ago',               detail: 'commit 4b8312e · m.alfaro@acme.com (still on team · principal data engineer)' },

  // ──────────────────────── Phase 4: Triage report (~5 min) ─────────────────
  { channel: 'codegen',   delayMs: 600, displayedMs: 5   * M, label: 'Writing modernization triage report',           detail: 'docs/modernization/2026-04-17-daily-revenue-rollup.md · 312 lines · idiom map + verification plan' },

  // ──────────────────────── Phase 5: Human review #1 — plan (~31 min) ───────
  { channel: 'human',     delayMs: 350, displayedMs: 1   * M, label: 'Plan posted to #data-platform · pinged @analytics-leads', detail: 'Slack thread #C078ELT · Linear sub-issue CUR-5202.1 created' },
  { channel: 'human',     delayMs: 1500,displayedMs: 25  * M, label: 'Awaiting data engineer review',                 detail: 'm.alfaro@acme.com · sla 1h · 3 in-flight modernization PRs ahead in queue' },
  { channel: 'human',     delayMs: 600, displayedMs: 4   * M, label: 'Reviewer left 3 comments',                      detail: '(1) currency rounding — banker\u2019s vs half-up · (2) late-arriving FX rows · (3) ON COMMIT scope on staging CTE' },
  { channel: 'composer',  delayMs: 500, displayedMs: 4   * M, label: 'Plan revised to fold reviewer feedback',        detail: 'half-up rounding macro · FX lookback CTE (24h) · transient table dropped in favor of CTE' },

  // ──────────────────────── Phase 6: Composer modernization (~33 min) ───────
  { channel: 'composer',  delayMs: 1000,displayedMs: 9   * M, label: 'Composer: BTEQ → dbt staging + incremental fct',detail: 'MULTISET VOLATILE → 3 CTEs · QUALIFY → native QUALIFY · COLLECT STATS dropped (auto micro-partitions)' },
  { channel: 'composer',  delayMs: 900, displayedMs: 8   * M, label: 'Composer: T-SQL proc → Snowpark Python',         detail: 'CROSS APPLY → LATERAL FLATTEN · OPENJSON → PARSE_JSON+FLATTEN · FOR JSON PATH → OBJECT_CONSTRUCT' },
  { channel: 'composer',  delayMs: 700, displayedMs: 6   * M, label: 'Composer: Informatica XML → dbt snapshot',      detail: 'wf_customers_360.xml · 6 transforms parsed · snapshot strategy: check_cols on loyalty_tier' },
  { channel: 'composer',  delayMs: 500, displayedMs: 4   * M, label: 'Tests + cortex_semantic_diff macro emitted',    detail: '14 dbt tests · macros/cortex_semantic_diff.sql wraps SNOWFLAKE.CORTEX.COMPLETE' },
  { channel: 'composer',  delayMs: 400, displayedMs: 3   * M, label: 'Late-arriving FX handled via 24h lookback CTE', detail: 'addresses reviewer comment #2 · idempotent on backfills' },

  // ──────────────────────── Phase 7: Static verify (~4 min) ─────────────────
  { channel: 'dbt',       delayMs: 300, displayedMs: 1   * M, label: 'dbt compile',                                   detail: '✓ 1 model compiled · 0 errors · 0 warnings · target dev' },
  { channel: 'dbt',       delayMs: 200, displayedMs: MIN_30S,  label: 'dbt parse · manifest.json written',             detail: '14 nodes · 6 sources · 4 tests · 2 macros' },
  { channel: 'shell',     delayMs: 350, displayedMs: 2   * M, label: 'tsc --noEmit · npm run lint',                   detail: 'Snowpark TS glue clean · ESLint 0 errors · prettier 0 diffs' },

  // ──────────────────────── Phase 8: First test run + iteration (~22 min) ───
  { channel: 'dbt',       delayMs: 400, displayedMs: 2   * M, label: 'dbt run --select fct_daily_revenue --target dev',detail: 'XS_MODERNIZATION_WH · 12.8s · 1.4M rows merged' },
  { channel: 'dbt',       delayMs: 250, displayedMs: MIN_30S,  label: '\u2717 FAILURE — NULL on currency_code (4 rows)', detail: 'legacy XOF (West African franc) rows lacking FX rate · failing not_null test' },
  { channel: 'opus',      delayMs: 500, displayedMs: 4   * M, label: 'Diagnosing: deprecated currency, missing FX rate',detail: 'XOF deprecated 2023 · 4 dormant orders · proper fix is exclude in seeds, not silent COALESCE' },
  { channel: 'composer',  delayMs: 700, displayedMs: 5   * M, label: 'Patching: deprecated_currencies seed + macro',  detail: 'seeds/deprecated_currencies.csv · macros/exclude_deprecated_fx.sql · documented in dbt docs' },
  { channel: 'dbt',       delayMs: 350, displayedMs: 1.5 * M, label: 'dbt run (retry) · \u2713 SUCCESS · 12.8s',         detail: '1.4M rows · 0 NULL currency · same wall time' },
  { channel: 'dbt',       delayMs: 400, displayedMs: 3   * M, label: 'dbt test --select fct_daily_revenue',           detail: '14 tests scheduled · 13 passed · 1 failed' },
  { channel: 'dbt',       delayMs: 250, displayedMs: MIN_30S,  label: '\u2717 13 / 14 passed — relationships test on dim_currency', detail: 'orphaned currency in fx_rates not in dim_currency seed' },
  { channel: 'composer',  delayMs: 600, displayedMs: 4   * M, label: 'Patching: dim_currency seed update + warn-only test', detail: '+3 currencies in seed · severity downgraded to warn for dormant codes (cited in PR risk)' },
  { channel: 'dbt',       delayMs: 300, displayedMs: 1   * M, label: 'dbt test (retry) · \u2713 14 / 14 passed',         detail: '0 errors · 0 warnings · model docs coverage 100%' },

  // ──────────────────────── Phase 9: Cortex + row equivalence (~22 min) ─────
  { channel: 'cortex',    delayMs: 700, displayedMs: 5   * M, label: 'Cortex semantic diff via SNOWFLAKE.CORTEX.COMPLETE', detail: 'mistral-large · before_spec (BTEQ) vs after_spec (dbt model) · prompt cached in CUR-5202' },
  { channel: 'cortex',    delayMs: 300, displayedMs: 1   * M, label: '\u2713 no semantic drift detected',                detail: 'date grain unchanged · MERGE upsert preserved · category hierarchy intact · currency conversion equivalent' },
  { channel: 'codex',     delayMs: 700, displayedMs: 6   * M, label: 'Codex: building row-equivalence harness',       detail: 'snowflake_procs/diff_fct_daily_revenue.py · 1% sample · seed pinned in macros/sampling.sql' },
  { channel: 'shell',     delayMs: 800, displayedMs: 6   * M, label: 'Loading Teradata snapshot from S3 stage',       detail: '@stage_teradata_snapshot/2026-04-17/fct_daily_revenue.parquet · 142 MB' },
  { channel: 'codex',     delayMs: 400, displayedMs: 3   * M, label: 'Comparing rows · top-10 rank · monetary sums',   detail: 'JOIN on (order_date, region_code, category_name) · diff_revenue, diff_orders, diff_rank' },
  { channel: 'codex',     delayMs: 300, displayedMs: 1   * M, label: 'row \u0394 0 · \u03A3 revenue \u0394 $0.00 · top-10 rank \u0394 0', detail: 'sample n = 14,237 · monetary sums match to the cent · zero rank inversions' },

  // ──────────────────────── Phase 10: PR draft + Jira (~8 min) ──────────────
  { channel: 'github',    delayMs: 300, displayedMs: 1   * M, label: 'Creating branch feat/modernize-daily-revenue-rollup', detail: 'base: main · 7 files staged (5 dbt + 2 seeds)' },
  { channel: 'github',    delayMs: 700, displayedMs: 5   * M, label: 'Composer drafting PR body',                     detail: 'idiom map · cortex diff · row-equiv result · credits + latency table · risk + rollback' },
  { channel: 'github',    delayMs: 300, displayedMs: 1   * M, label: 'Opening pull request #318 (DRAFT)',             detail: 'feat(dw): daily revenue rollup — Teradata BTEQ \u2192 Snowflake + dbt (1/247)' },
  { channel: 'jira',      delayMs: 300, displayedMs: 1   * M, label: 'CUR-5202 \u2192 In Review · linked PR #318',       detail: 'Epic CUR-5201 · components Data/Analytics · sla: review within 8 business hours' },

  // ──────────────────────── Phase 11: Human review #2 — PR (~85 min) ────────
  { channel: 'human',     delayMs: 350, displayedMs: 1   * M, label: 'PR pinned in #data-platform · paged @analytics-leads', detail: 'reviewer suggestion: j.park@acme.com (principal · owns mart conventions)' },
  { channel: 'human',     delayMs: 1800,displayedMs: 50  * M, label: 'Awaiting senior reviewer (j.park@acme.com)',    detail: 'reviewer in 1:1 · expected back ~15:35 PDT · agent idle · no work scheduled' },
  { channel: 'human',     delayMs: 600, displayedMs: 6   * M, label: 'Reviewer left 4 comments on the PR',            detail: '(1) warehouse sizing rationale · (2) backfill strategy · (3) dbt docs blocks missing · (4) naming vs mart conventions' },
  { channel: 'composer',  delayMs: 900, displayedMs: 8   * M, label: 'Addressing comments: backfill macro for 90-day re-load', detail: 'macros/backfill_fct_daily_revenue.sql · idempotent · CI-callable · documented' },
  { channel: 'composer',  delayMs: 700, displayedMs: 6   * M, label: 'dbt docs blocks added · naming aligned to mart_ convention', detail: 'fct_daily_revenue \u2192 mart_daily_revenue (matches mart_customer_360 pattern) · 22 doc blocks' },
  { channel: 'dbt',       delayMs: 400, displayedMs: 2   * M, label: 'dbt compile + test (re-verify after rename)',    detail: '\u2713 1 model · \u2713 14 tests · refs updated · downstream models patched' },

  // ──────────────────────── Phase 12: Final approval (~6 min) ───────────────
  { channel: 'github',    delayMs: 300, displayedMs: 1   * M, label: 'Pushed 2 commits · re-requested review',         detail: 'commit 9f1c4d2 (backfill) · commit b3a82e7 (rename + docs) · CI re-running' },
  { channel: 'human',     delayMs: 500, displayedMs: 4   * M, label: 'Reviewer approved · ready to merge',             detail: 'j.park@acme.com: "LGTM · merge in Friday change window · ping me when staging soak finishes"' },
  { channel: 'jira',      delayMs: 300, displayedMs: 1   * M, label: 'CUR-5202 \u2192 Approved · awaiting merge window',  detail: 'change record CHG-44218 · scheduled Fri 17:00 PDT · rollback plan attached' },
  { channel: 'done',      delayMs: 300, displayedMs: MIN_30S,  label: 'Artifacts ready · awaiting human merge',          detail: 'Snowsight workspace · Triage report · Jira ticket · PR #318 · 1 of 247 BTEQ assets modernized' },
];

// Pre-compute cumulative displayed elapsed for each step.
const SCRIPT: Array<Step & { displayedElapsed: number }> = (() => {
  let cumulative = 0;
  return RAW_SCRIPT.map(step => {
    cumulative += step.displayedMs;
    return { ...step, displayedElapsed: cumulative };
  });
})();

interface AgentConsoleProps {
  onComplete?: () => void;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `+${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  if (mins > 0) {
    return `+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `+${String(secs).padStart(2, '0')}s`;
}

export function AgentConsole({ onComplete }: AgentConsoleProps) {
  const [visibleSteps, setVisibleSteps] = useState<
    Array<Step & { displayedElapsed: number; status: Status }>
  >([]);
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

  const durationLabel =
    visibleSteps.length > 0
      ? formatElapsed(visibleSteps[visibleSteps.length - 1].displayedElapsed)
      : '+00s';

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
            <p className="text-[11px] text-text-tertiary font-mono">
              cursor/partnerships-hub · main · agent + reviewer wall clock
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              finished ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'
            }`}
          />
          <span className="text-[11px] text-text-tertiary font-mono">{durationLabel}</span>
        </div>
      </div>

      {/* Console body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[320px]"
      >
        {visibleSteps.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2">Waiting for Snowflake webhook…</p>
        )}
        {visibleSteps.map((step, i) => {
          const style = CHANNEL_STYLES[step.channel];
          const isActive = step.status === 'running';
          const isHuman = step.channel === 'human';
          return (
            <div
              key={i}
              className="flex gap-2.5 items-start leading-relaxed"
              style={{ animation: 'agentFadeIn 0.2s ease-out' }}
            >
              <span className="text-text-tertiary shrink-0 w-[96px]">
                {formatElapsed(step.displayedElapsed)}
              </span>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border inline-flex items-center gap-1 ${style.bg} ${style.border} ${style.color} whitespace-nowrap`}
              >
                {isHuman && <UserCircle2 className="w-3 h-3" />}
                {style.label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5">
                  {isActive ? (
                    <span className="inline-block w-3 h-3 mt-0.5 shrink-0">
                      <span className="block w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
                    </span>
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
