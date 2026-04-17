'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertOctagon, X } from 'lucide-react';

interface DeckSlide {
  title: string;
  body: React.ReactNode;
  chip?: string;
}

export function GsiDeckFlipper({ className = '' }: { className?: string }) {
  const [index, setIndex] = useState(0);

  const slides: DeckSlide[] = [
    {
      chip: 'Phase 0 · Discovery',
      title: '6 months to inventory your legacy ELT',
      body: (
        <div className="space-y-3 text-[13px] text-white/80 leading-relaxed">
          <p>
            Our 8-person discovery pod will interview your data team, rebuild the BTEQ lineage
            graph, and produce a modernization scope document.
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-white/65">
            <li>$2.4M fixed-fee · 6-month engagement</li>
            <li>30+ stakeholder interviews across 4 business units</li>
            <li>Deliverable: a 400-page PDF you&apos;ll read once</li>
          </ul>
        </div>
      ),
    },
    {
      chip: 'Phase 1 · Migration',
      title: '4 years of sustained engineering effort',
      body: (
        <div className="space-y-3 text-[13px] text-white/80 leading-relaxed">
          <p>
            A rotating bench of 14 consultants will rewrite your 911 legacy assets into the target
            Snowflake platform, quarter by quarter.
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-white/65">
            <li>48 months · 14 offshore engineers · 2 onshore leads</li>
            <li>Knowledge transfer via weekly Confluence pages</li>
            <li>Acme loses visibility into its own business logic</li>
          </ul>
        </div>
      ),
    },
    {
      chip: 'Phase 2 · Verification',
      title: 'UAT runs alongside for 9 months',
      body: (
        <div className="space-y-3 text-[13px] text-white/80 leading-relaxed">
          <p>
            Legacy Teradata stays online in parallel for Acme&apos;s finance team to hand-check
            monthly closes. Dual-running is what every enterprise does.
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-white/65">
            <li>$4.1M in parallel licensing across Teradata + Informatica + Snowflake</li>
            <li>Manual reconciliation by 3 analysts, every close</li>
            <li>Net-new Snowflake credits consumed: near zero</li>
          </ul>
        </div>
      ),
    },
    {
      chip: 'Commercials',
      title: '$18,000,000 · fixed fee · net 60',
      body: (
        <div className="space-y-3 text-[13px] text-white/80 leading-relaxed">
          <p>
            Comfortable, predictable, quarterly-billed. No surprises in year 3 when the engagement
            stretches.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <GsiStat label="Total cost" value="$18.0M" />
            <GsiStat label="Duration" value="48 months" />
            <GsiStat label="FTE load" value="16 avg" />
            <GsiStat label="Change orders" value="typical: 2–3" subtle />
          </div>
        </div>
      ),
    },
    {
      chip: 'Outcome — AE reads between the lines',
      title: 'Snowflake credits start flowing in month 40',
      body: (
        <div className="space-y-3 text-[13px] text-white/80 leading-relaxed">
          <p>
            With dual-run, no production assets land on Snowflake until UAT wraps in month 40. For
            Samira Chen, that&apos;s 40 months of zero quota retirement on the Acme account.
          </p>
          <div className="mt-2 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2">
            <p className="text-[12px] text-red-300 font-semibold flex items-center gap-2">
              <AlertOctagon className="w-3.5 h-3.5" />
              Snowflake AE impact: no credits for 3.3 years
            </p>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[index];
  const canPrev = index > 0;
  const canNext = index < slides.length - 1;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="rounded-xl border border-[#3D4656] overflow-hidden bg-[linear-gradient(180deg,#1A2332_0%,#0F1723_100%)]">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-[#141D2C]">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-[#9CA3AF]/30">
            <span className="text-[9px] font-bold text-white">A</span>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold text-white/80 leading-tight">
              Apex Global Services
            </p>
            <p className="text-[9.5px] text-white/40 leading-tight">
              Confidential · Acme Analytics · Modernization Proposal v7
            </p>
          </div>
          <span className="ml-auto text-[9px] font-mono text-white/40">
            {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
        </div>

        <div key={index} className="relative min-h-[300px] px-6 py-6 slide-enter">
          {slide.chip && (
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.22em] text-[#9CA3AF] mb-3">
              {slide.chip}
            </span>
          )}
          <h3 className="text-[22px] font-semibold text-white leading-tight mb-4 max-w-xl">
            {slide.title}
          </h3>
          {slide.body}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 border-t border-white/5 bg-[#141D2C]">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            className="inline-flex items-center gap-1 h-7 px-2 rounded text-[11px] text-white/70 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <div className="flex-1 flex items-center justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: i === index ? '#9CA3AF' : 'rgba(255,255,255,0.15)',
                  transform: i === index ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
            disabled={!canNext}
            className="inline-flex items-center gap-1 h-7 px-2 rounded text-[11px] text-white/70 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative rounded-xl border border-red-400/30 bg-red-400/5 px-4 py-3">
        <span className="absolute -top-2 left-4 text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-[#1A0A0A] text-red-300 border border-red-400/35">
          CFO · inbound · sticky-note
        </span>
        <div className="flex items-start gap-2 pt-1">
          <X className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-[12.5px] text-white/85 leading-relaxed italic">
            &ldquo;We&apos;re not signing an $18M SOW for a 4-year engagement with this GSI. Find
            another path.&rdquo;
          </p>
        </div>
        <p className="text-[10.5px] text-red-300/80 font-mono mt-1.5 ml-5">
          Dana Whitaker · CFO · Tuesday 4:18pm
        </p>
      </div>

      <style jsx>{`
        :global(.slide-enter) {
          animation: slideEnter 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes slideEnter {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function GsiStat({ label, value, subtle }: { label: string; value: string; subtle?: boolean }) {
  return (
    <div
      className="rounded-md border px-3 py-2"
      style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
    >
      <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">{label}</p>
      <p className={`text-[16px] font-mono ${subtle ? 'text-white/60' : 'text-white font-semibold'}`}>
        {value}
      </p>
    </div>
  );
}
