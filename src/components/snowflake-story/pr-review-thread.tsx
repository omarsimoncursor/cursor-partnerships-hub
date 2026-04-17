'use client';

import { useEffect, useState } from 'react';
import { CharacterAvatar, type CharacterId } from './character-avatar';
import { Check, MessageSquare, GitPullRequestArrow, Sparkles } from 'lucide-react';

interface Comment {
  author: CharacterId;
  kind: 'review' | 'comment' | 'approval' | 'iteration' | 'ai';
  time: string;
  title?: string;
  body: React.ReactNode;
  code?: string;
}

const COMMENTS: Comment[] = [
  {
    author: 'cursor',
    kind: 'review',
    time: 'T+2h 14m',
    title: 'Pull request opened',
    body: (
      <p>
        <span className="font-mono text-[#7DD3F5]">
          feat(dw): daily revenue rollup — Teradata BTEQ → Snowflake + dbt (1/911)
        </span>
        <span className="text-text-tertiary">
          {' '}· 14 tests · Cortex verified · row-delta harness Δ=0
        </span>
      </p>
    ),
  },
  {
    author: 'jordan',
    kind: 'comment',
    time: 'T+2h 38m',
    title: 'Review · first pass',
    body: (
      <div className="space-y-2">
        <p>Good structure. Three things before I can stamp this:</p>
        <ul className="space-y-1 list-decimal list-inside text-text-secondary">
          <li>
            Currency rounding — the legacy BTEQ uses banker&apos;s rounding, not half-up. Let&apos;s
            keep the behavior identical so finance reconciliation stays clean.
          </li>
          <li>
            Late-arriving FX rows — the macro assumes FX is present at run time. Add a retry with
            a 6-hour window or we&apos;ll drop rows silently on the first missed close.
          </li>
          <li>
            <span className="font-mono text-[#7DD3F5]">ON COMMIT</span> scope on the staging CTE
            reads odd. Drop to a transient if you actually need cross-step state.
          </li>
        </ul>
      </div>
    ),
  },
  {
    author: 'cursor',
    kind: 'iteration',
    time: 'T+2h 51m',
    title: 'Patch applied',
    body: (
      <p>
        Applied all three. New commits: <span className="font-mono text-[#7DD3F5]">8c3a7e1</span>{' '}
        (banker&apos;s rounding macro), <span className="font-mono text-[#7DD3F5]">42f9bd2</span>{' '}
        (late-FX retry window + seed), <span className="font-mono text-[#7DD3F5]">09de41a</span>{' '}
        (dropped the CTE, swapped to a transient staging table). Re-ran the row-equivalence
        harness — still Δ=0.
      </p>
    ),
    code:
      '+ {% macro bankers_round(col, places=2) %}\n+   round_half_even({{ col }}, {{ places }})\n+ {% endmacro %}',
  },
  {
    author: 'cursor',
    kind: 'ai',
    time: 'T+2h 53m',
    title: 'Cortex AI · second semantic diff',
    body: (
      <p>
        <span className="font-mono text-[#29B5E8]">SNOWFLAKE.CORTEX.COMPLETE(&apos;mistral-large&apos;, …)</span>
        <br />
        Verdict: <span className="text-[#4ADE80]">no drift</span>. Banker&apos;s rounding fully
        idempotent on the 90-day window. FX retry window matches the legacy SSIS grace period.
      </p>
    ),
  },
  {
    author: 'jordan',
    kind: 'comment',
    time: 'T+3h 12m',
    title: 'dbt test failure',
    body: (
      <p>
        <span className="font-mono text-[#F87171]">✗ FAIL · not_null_currency_code · 4 rows</span>
        <br />
        Currency code is NULL on 4 rows — looks like the <span className="font-mono">XOF</span>{' '}
        (CFA franc) FX rate was deprecated in 2023 and the original BTEQ silently dropped those
        rows. Let&apos;s do the right thing here, not the legacy-compat thing.
      </p>
    ),
  },
  {
    author: 'cursor',
    kind: 'iteration',
    time: 'T+3h 24m',
    title: 'Patch applied · deprecated currency seed',
    body: (
      <p>
        Added <span className="font-mono text-[#7DD3F5]">seeds/deprecated_currencies.csv</span>{' '}
        (XOF, SLL) with deprecation dates + explicit exclusion macro. 4 rows now surface in a
        new <span className="font-mono">exceptions/deprecated_fx.sql</span> audit table instead of
        silently vanishing. 14 / 14 tests pass.
      </p>
    ),
  },
  {
    author: 'jordan',
    kind: 'approval',
    time: 'T+3h 47m',
    title: 'Approved · queued for Friday change window',
    body: (
      <p>
        Nice work on the deprecated-currency catch. Merging to{' '}
        <span className="font-mono">main</span> Friday 05:00 PT behind the change window, after
        staging burn-in. Cursor, please open the backfill ticket — I want the 4 exception rows
        reviewed by finance before we retire the BTEQ in prod.
      </p>
    ),
  },
];

interface PrReviewThreadProps {
  autoplay?: boolean;
  onOpenPr?: () => void;
  className?: string;
}

export function PrReviewThread({ autoplay = true, onOpenPr, className = '' }: PrReviewThreadProps) {
  const [revealed, setRevealed] = useState(autoplay ? 1 : COMMENTS.length);

  useEffect(() => {
    if (!autoplay) return;
    if (revealed >= COMMENTS.length) return;
    const delay = revealed === 0 ? 400 : 1400;
    const t = setTimeout(() => setRevealed((n) => Math.min(COMMENTS.length, n + 1)), delay);
    return () => clearTimeout(t);
  }, [revealed, autoplay]);

  return (
    <div className={`rounded-xl border border-[#29B5E8]/20 bg-[#0A1221]/80 backdrop-blur overflow-hidden ${className}`}>
      <header className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 bg-[#0D1828]">
        <GitPullRequestArrow className="w-4 h-4 text-[#7DD3F5]" />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-mono text-text-primary leading-tight truncate">
            #318 · daily_revenue_rollup — Teradata BTEQ → Snowflake + dbt
          </p>
          <p className="text-[10.5px] font-mono text-text-tertiary leading-tight">
            acme-analytics/data-platform · feat/modernize-daily-revenue-rollup
          </p>
        </div>
        {onOpenPr && (
          <button
            onClick={onOpenPr}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium text-[#7DD3F5] bg-[#29B5E8]/10 border border-[#29B5E8]/30 hover:bg-[#29B5E8]/20 cursor-pointer"
          >
            Open in GitHub
          </button>
        )}
      </header>

      <div className="max-h-[440px] overflow-y-auto">
        <ol className="relative">
          {COMMENTS.slice(0, revealed).map((c, i) => (
            <CommentCard key={i} comment={c} isLast={i === revealed - 1} />
          ))}
        </ol>
        {revealed < COMMENTS.length && (
          <div className="flex items-center gap-2 px-4 py-3 text-[11px] text-text-tertiary font-mono">
            <span className="w-1 h-1 rounded-full bg-[#29B5E8] animate-pulse" />
            <span>{COMMENTS[revealed].author} is typing…</span>
          </div>
        )}
      </div>

      {revealed === COMMENTS.length && (
        <footer className="border-t border-white/5 bg-[#0D1828] px-4 py-2.5 flex items-center gap-2">
          <Check className="w-4 h-4 text-[#4ADE80]" />
          <p className="text-[12px] text-[#4ADE80] font-medium">
            All checks passed · 2 iteration cycles · approved by Jordan
          </p>
          <p className="ml-auto text-[10.5px] font-mono text-text-tertiary">
            total · 4h 03m wall · 2h 16m agent · 1h 47m review
          </p>
        </footer>
      )}
    </div>
  );
}

function CommentCard({ comment, isLast }: { comment: Comment; isLast: boolean }) {
  const kindMeta: Record<Comment['kind'], { label: string; accent: string; icon: React.ReactNode }> = {
    review: { label: 'PR', accent: '#7DD3F5', icon: <GitPullRequestArrow className="w-3 h-3" /> },
    comment: { label: 'comment', accent: '#A78BFA', icon: <MessageSquare className="w-3 h-3" /> },
    iteration: { label: 'patch', accent: '#29B5E8', icon: <Sparkles className="w-3 h-3" /> },
    ai: { label: 'AI', accent: '#29B5E8', icon: <Sparkles className="w-3 h-3" /> },
    approval: { label: 'approved', accent: '#4ADE80', icon: <Check className="w-3 h-3" /> },
  };
  const meta = kindMeta[comment.kind];
  return (
    <li className={`relative flex gap-3 px-4 py-3 ${isLast ? '' : 'border-b border-white/5'}`}>
      <CharacterAvatar character={comment.author} size="sm" speaking={isLast} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold text-text-primary">
            {comment.title ?? 'left a comment'}
          </span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-mono uppercase tracking-wider"
            style={{
              color: meta.accent,
              background: `${meta.accent}15`,
              border: `1px solid ${meta.accent}30`,
            }}
          >
            {meta.icon}
            {meta.label}
          </span>
          <span className="ml-auto text-[10px] font-mono text-text-tertiary">{comment.time}</span>
        </div>
        <div className="text-[12.5px] text-text-secondary leading-relaxed">{comment.body}</div>
        {comment.code && (
          <pre className="mt-2 rounded-md border border-white/10 bg-[#05080F] px-3 py-2 text-[11px] font-mono text-[#7DD3F5] whitespace-pre overflow-x-auto">
            {comment.code}
          </pre>
        )}
      </div>
    </li>
  );
}
