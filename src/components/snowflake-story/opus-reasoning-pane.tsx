'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, FileCode2 } from 'lucide-react';

interface OpusStep {
  kind: 'scan' | 'think' | 'tag' | 'plan';
  text: string;
  loc?: number;
}

const SCRIPT: OpusStep[] = [
  { kind: 'scan', text: 'Indexing acme-analytics/legacy-elt/ @ HEAD', loc: 0 },
  { kind: 'scan', text: 'Walking Teradata BTEQ repository · 247 files · 58,320 LOC', loc: 58_320 },
  { kind: 'scan', text: 'Walking SQL Server T-SQL · 412 stored procedures', loc: 63_180 },
  { kind: 'scan', text: 'Parsing Informatica PowerCenter XML · 184 workflows', loc: 63_180 },
  { kind: 'think', text: 'Building cross-platform dependency graph · 2,417 edges resolved' },
  { kind: 'tag', text: 'Dialect idioms detected: QUALIFY, MULTISET VOLATILE, COLLECT STATISTICS' },
  { kind: 'tag', text: 'T-SQL idioms: MERGE · CROSS APPLY · OPENJSON · DATETIME2 w/ offset' },
  { kind: 'tag', text: 'Informatica transforms: Lookup · Aggregator · Router · Joiner · Update Strategy' },
  { kind: 'think', text: 'Scoring modernization priority by staleness × business criticality' },
  { kind: 'plan', text: 'First asset: daily_revenue_rollup.bteq — 214 LOC · P1 · 14h stale · revenue mart' },
  { kind: 'plan', text: 'Companion: usp_enrich_customers_360.sql — 156 LOC · feeds customer-360' },
  { kind: 'plan', text: 'Pattern match → 37 BTEQ scripts share the same revenue-rollup shape. Template reuse.' },
  { kind: 'plan', text: 'Inventory complete. Ready for human review.' },
];

interface OpusReasoningPaneProps {
  autoplay?: boolean;
  className?: string;
}

export function OpusReasoningPane({ autoplay = true, className = '' }: OpusReasoningPaneProps) {
  const [shownSteps, setShownSteps] = useState<OpusStep[]>([]);
  const [locDisplayed, setLocDisplayed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoplay) return;
    let i = 0;
    const tick = () => {
      if (i >= SCRIPT.length) return;
      const next = SCRIPT[i];
      setShownSteps((prev) => [...prev, next]);
      if (next.loc !== undefined) setLocDisplayed(next.loc);
      i++;
      id = window.setTimeout(tick, i < 5 ? 700 : 950);
    };
    let id = window.setTimeout(tick, 600);
    return () => window.clearTimeout(id);
  }, [autoplay]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [shownSteps]);

  return (
    <div className={`rounded-xl border border-[#29B5E8]/20 bg-[#07101B]/90 backdrop-blur overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-[#0A1221]">
        <div className="w-6 h-6 rounded flex items-center justify-center bg-[#D97757]/20 border border-[#D97757]/35">
          <Sparkles className="w-3 h-3 text-[#D97757]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-mono text-[#F5D5C8] leading-tight">opus · triage</p>
          <p className="text-[10px] font-mono text-text-tertiary leading-tight">
            200K-token context · streaming reasoning
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10">
          <FileCode2 className="w-3 h-3 text-[#7DD3F5]" />
          <p className="text-[10.5px] font-mono text-text-secondary tabular-nums">
            {locDisplayed.toLocaleString()} LOC
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 text-[11.5px] font-mono min-h-[280px] max-h-[340px]"
      >
        {shownSteps.map((step, i) => (
          <OpusLine key={i} step={step} isLatest={i === shownSteps.length - 1} />
        ))}
        {shownSteps.length < SCRIPT.length && (
          <div className="flex items-center gap-2 text-text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] animate-pulse" />
            <span>thinking…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function OpusLine({ step, isLatest }: { step: OpusStep; isLatest: boolean }) {
  const tonePalette: Record<OpusStep['kind'], { color: string; label: string }> = {
    scan: { color: '#7DD3F5', label: 'scan' },
    think: { color: '#D97757', label: 'think' },
    tag: { color: '#C084FC', label: 'tag' },
    plan: { color: '#4ADE80', label: 'plan' },
  };
  const tone = tonePalette[step.kind];
  return (
    <div
      className="flex items-start gap-3 animate-[dialogueEnter_320ms_cubic-bezier(0.16,1,0.3,1)_both]"
      style={{ opacity: isLatest ? 1 : 0.85 }}
    >
      <span
        className="shrink-0 text-[9.5px] uppercase tracking-wider pt-0.5"
        style={{ color: tone.color, width: 38 }}
      >
        {tone.label}
      </span>
      <span className="text-text-primary leading-relaxed">
        {step.text}
        {isLatest && (
          <span className="inline-block w-1.5 h-3 align-middle ml-0.5 bg-text-primary/60 animate-pulse" />
        )}
      </span>
    </div>
  );
}
