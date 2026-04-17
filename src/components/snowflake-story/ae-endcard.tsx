'use client';

import { CharacterAvatar } from './character-avatar';
import { Rocket, TrendingUp, Sparkles, ArrowRight, RotateCcw, Share } from 'lucide-react';

interface AeEndcardProps {
  onRestart: () => void;
  onExport?: () => void;
}

export function AeEndcard({ onRestart, onExport }: AeEndcardProps) {
  return (
    <div className="rounded-2xl border border-[#29B5E8]/25 bg-gradient-to-br from-[#0B1E31]/90 via-[#0A1628]/90 to-[#05101C]/95 backdrop-blur p-7 md:p-9">
      <div className="flex items-center gap-3 mb-5">
        <CharacterAvatar character="samira" size="lg" />
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5]">
            For you · Snowflake Account Executive
          </p>
          <p className="text-[15px] text-text-primary mt-0.5">
            Samira&apos;s handoff to the next AE pitch
          </p>
        </div>
      </div>

      <blockquote className="relative pl-5 border-l-2 border-[#29B5E8]/40 mb-6">
        <p className="text-[17px] md:text-[19px] text-text-primary leading-relaxed">
          &ldquo;The GSI offered Acme a 4-year migration. We closed it in 15 months with their own
          team on the keyboard. Credits started flowing on <em>asset #1</em>, not asset #911. This
          is the demo you play on your next modernization call.&rdquo;
        </p>
        <p className="mt-2 text-[11.5px] font-mono text-text-tertiary">
          Samira Chen · AE · Snowflake Major Accounts
        </p>
      </blockquote>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Outcome
          icon={<TrendingUp className="w-4 h-4" />}
          title="~$16M pulled-forward credits"
          body="33 months earlier than the GSI baseline. That's $16M of quota retirement sitting in your current quarter, not 2030."
          accent="#4ADE80"
        />
        <Outcome
          icon={<Rocket className="w-4 h-4" />}
          title="Win-rate lift vs Databricks + BigQuery"
          body='Speed-of-migration is the axis Snowflake loses on today. Cursor flips the ground truth — and this demo shows it in 8 minutes.'
          accent="#7DD3F5"
        />
        <Outcome
          icon={<Sparkles className="w-4 h-4" />}
          title="Cortex · Snowpark · Dynamic Tables"
          body="Modernized code lights up the native features that drive credit expansion. The expansion motion is baked into the migration motion."
          accent="#29B5E8"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={onExport}
          className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#29B5E8] text-[#0A1419] font-semibold text-[13px] hover:bg-[#4FC3EE] transition-all duration-200 shadow-[0_0_24px_rgba(41,181,232,0.35)] hover:shadow-[0_0_36px_rgba(41,181,232,0.5)] cursor-pointer"
        >
          <Share className="w-3.5 h-3.5" />
          Export talking points for next AE pitch
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-white/15 text-text-secondary hover:text-text-primary hover:bg-white/5 text-[13px] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Play the story again
        </button>
      </div>
    </div>
  );
}

function Outcome({
  icon, title, body, accent,
}: {
  icon: React.ReactNode; title: string; body: string; accent: string;
}) {
  return (
    <div
      className="rounded-xl border px-4 py-3.5"
      style={{ borderColor: `${accent}30`, background: `${accent}08` }}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center mb-2"
        style={{ background: `${accent}18`, color: accent }}
      >
        {icon}
      </div>
      <p className="text-[13px] font-semibold text-text-primary mb-1 leading-tight">{title}</p>
      <p className="text-[12px] text-text-secondary leading-relaxed">{body}</p>
    </div>
  );
}
