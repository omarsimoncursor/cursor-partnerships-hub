'use client';

import { CALENDAR } from './story-data';

interface CalendarCollapseProps {
  monthIndex: number;
  collapseRatio?: number;
  className?: string;
}

export function CalendarCollapse({
  monthIndex,
  collapseRatio = 1,
  className = '',
}: CalendarCollapseProps) {
  const gsiMonths = 48;
  const cursorMonths = 15;
  const totalWidth = 100;

  const gsiMonthWidth = (totalWidth / gsiMonths) * (1 - collapseRatio * (1 - cursorMonths / gsiMonths));
  const cursorMonthWidth = totalWidth / cursorMonths;

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9CA3AF]">
              GSI baseline · Apex Global Services
            </p>
            <p className="text-[13px] text-text-primary mt-0.5">
              4 years · $18,000,000 · 911 assets
            </p>
          </div>
          <p className="text-[11px] text-text-tertiary font-mono">
            {gsiMonths} monthly billing cycles
          </p>
        </div>
        <div className="flex h-5 w-full rounded-sm overflow-hidden border border-white/5">
          {Array.from({ length: gsiMonths }).map((_, i) => {
            const quarterMark = i % 12 === 0;
            return (
              <div
                key={i}
                className="h-full"
                style={{
                  width: `${gsiMonthWidth}%`,
                  background: quarterMark
                    ? 'rgba(245, 158, 11, 0.7)'
                    : 'rgba(245, 158, 11, 0.35)',
                  borderRight: quarterMark ? '1px solid rgba(245,158,11,0.9)' : 'none',
                  transition: 'width 800ms cubic-bezier(0.65, 0, 0.35, 1)',
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-text-tertiary font-mono mt-1">
          <span>Kickoff</span>
          <span>Year 1</span>
          <span>Year 2</span>
          <span>Year 3</span>
          <span>Year 4 · finish</span>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#29B5E8]">
              Cursor-accelerated · Acme team retains control
            </p>
            <p className="text-[13px] text-text-primary mt-0.5">
              15 months · $5.4M compute + review · 911 assets
            </p>
          </div>
          <p className="text-[11px] text-text-tertiary font-mono">
            Month {String(monthIndex).padStart(2, '0')} / {cursorMonths}
          </p>
        </div>
        <div className="flex h-5 w-full rounded-sm overflow-hidden border border-[#29B5E8]/30 relative">
          {CALENDAR.map((block, i) => {
            const lit = i <= monthIndex;
            const active = i === monthIndex;
            return (
              <div
                key={i}
                className="h-full relative"
                style={{
                  width: `${cursorMonthWidth}%`,
                  background: lit
                    ? active
                      ? 'rgba(41,181,232,0.95)'
                      : 'rgba(41,181,232,0.65)'
                    : 'rgba(41,181,232,0.1)',
                  borderRight: '1px solid rgba(41,181,232,0.35)',
                  boxShadow: active ? '0 0 12px rgba(41,181,232,0.7)' : 'none',
                  transition: 'background 300ms ease, box-shadow 300ms ease',
                }}
                title={`Month ${block.month} · ${block.assetsCompleted} assets`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-text-tertiary font-mono mt-1">
          <span>Kickoff</span>
          <span>Q1</span>
          <span>Q2</span>
          <span>Q3</span>
          <span>Q4</span>
          <span>Finish</span>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-[#29B5E8]/25 bg-[#29B5E8]/5 px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#7DD3F5] mb-0.5">
            Δ migration clock
          </p>
          <p className="text-[15px] text-text-primary font-semibold">
            33 months of Snowflake credits flowing earlier
          </p>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-mono font-semibold text-[#4ADE80]">~$16M</p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            pulled-forward credits
          </p>
        </div>
      </div>
    </div>
  );
}
