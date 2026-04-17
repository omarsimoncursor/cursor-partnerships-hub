'use client';

import { CharacterAvatar } from '../character-avatar';
import { Check, GitBranch, GitPullRequestArrow } from 'lucide-react';

export function GithubPrPreview() {
  return (
    <div className="w-full h-full bg-[#0D1117] text-[#E6EDF3] overflow-y-auto">
      <TopBar />
      <div className="max-w-[1100px] mx-auto px-6 py-6">
        <Hero />
        <Body />
        <Checks />
        <Merge />
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="h-11 flex items-center gap-4 px-5 border-b border-[#30363D] bg-[#010409]">
      <div className="flex items-center gap-2 text-[12.5px] font-semibold">
        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="#010409">
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
        </span>
        <span className="text-[#E6EDF3]">acme-analytics</span>
        <span className="text-[#7D8590]">/</span>
        <span className="text-[#2F81F7]">data-platform</span>
      </div>
      <span className="text-[#7D8590] text-[12px]">Pull request</span>
      <span className="text-[#7D8590] font-mono text-[12px]">#318</span>
      <span className="ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#2DA44E]/15 text-[#3FB950] border border-[#3FB950]/30">
        <Check className="w-3 h-3" /> Approved · queued
      </span>
    </header>
  );
}

function Hero() {
  return (
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold text-[#E6EDF3] leading-tight mb-2">
        feat(dw): daily revenue rollup — Teradata BTEQ → Snowflake + dbt{' '}
        <span className="text-[#7D8590] font-normal">(1 / 911)</span>
      </h1>
      <div className="flex items-center gap-3 flex-wrap text-[12.5px] text-[#7D8590]">
        <span className="inline-flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5" />
          <span className="font-mono text-[#2F81F7]">feat/modernize-daily-revenue-rollup</span>
          <span className="mx-1">into</span>
          <span className="font-mono text-[#2F81F7]">main</span>
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1.5">
          <CharacterAvatar character="cursor" size="xs" />
          <span className="text-[#E6EDF3]">Cursor</span>
          opened · 4h 03m ago (wall) · 2h 16m agent · 1h 47m review
        </span>
      </div>
    </div>
  );
}

function Body() {
  return (
    <article className="mb-6 rounded-lg border border-[#30363D] bg-[#0D1117] p-5 text-[13.5px] text-[#E6EDF3] leading-relaxed">
      <p className="mb-3">
        Replaces the legacy Teradata BTEQ script with a Snowflake-native dbt model. Companion
        T-SQL stored procedure + Informatica mapping also modernized into dbt / Snowpark
        equivalents. Cortex-AI semantic diff + 1% row-equivalence harness confirm byte-identical
        revenue sums against the Teradata source.
      </p>

      <H2>Idiom mapping</H2>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-[12px] border border-[#30363D] rounded">
          <thead className="bg-[#161B22]">
            <tr className="text-left">
              <th className="px-3 py-2 font-semibold">Legacy idiom</th>
              <th className="px-3 py-2 font-semibold">Dialect</th>
              <th className="px-3 py-2 font-semibold">Snowflake equivalent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363D]">
            {[
              ['QUALIFY ROW_NUMBER()…', 'Teradata', 'QUALIFY ROW_NUMBER()… (native)'],
              ['MULTISET VOLATILE TABLE', 'Teradata', 'CTE / transient temp'],
              ['COLLECT STATISTICS', 'Teradata', 'micro-partition stats (automatic)'],
              ['(DATE - 1), ADD_MONTHS', 'Teradata', 'DATEADD, DATE_TRUNC'],
              ['MERGE ... WHEN MATCHED', 'T-SQL', 'MERGE INTO (Snowflake)'],
              ['CROSS APPLY', 'T-SQL', 'LATERAL FLATTEN'],
              ['OPENJSON / FOR JSON PATH', 'T-SQL', 'PARSE_JSON + FLATTEN'],
            ].map(([l, d, s]) => (
              <tr key={l}>
                <td className="px-3 py-2 font-mono text-[#F5A623]">{l}</td>
                <td className="px-3 py-2 text-[#7D8590]">{d}</td>
                <td className="px-3 py-2 font-mono text-[#7DD3F5]">{s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Verification</H2>
      <ul className="list-disc list-inside space-y-1 text-[12.5px]">
        <li>
          <strong>Cortex semantic diff</strong> — <span className="font-mono text-[#3FB950]">no drift</span>.
          Grain, FX, hierarchy unchanged.
        </li>
        <li>
          <strong>Row-equivalence (1% sample)</strong> —{' '}
          <span className="font-mono text-[#3FB950]">Δ = 0</span> across 14,017 rows · revenue Σ
          Δ = <span className="font-mono text-[#3FB950]">$0.00</span> · top-10 customer rank drift
          = 0.
        </li>
        <li>
          <strong>Latency</strong> — Teradata <span className="font-mono">3,412s</span> → Snowflake
          XS WH <span className="font-mono text-[#3FB950]">12.8s</span>{' '}
          (<span className="font-mono">266× faster</span>).
        </li>
        <li>
          <strong>Deprecated FX rows</strong> — 4 <span className="font-mono">XOF</span> rows
          surfaced in <span className="font-mono">exceptions/deprecated_fx.sql</span> for finance
          review (legacy BTEQ silently dropped them).
        </li>
      </ul>

      <H2>Wall-clock breakdown</H2>
      <div className="rounded border border-[#30363D] overflow-hidden">
        <table className="w-full text-[12px]">
          <tbody>
            <TimingRow label="Opus triage · plan drafted" v="14m" agent />
            <TimingRow label="Maya reviewed plan" v="20m" human />
            <TimingRow label="Composer edit (dbt + Snowpark)" v="37m" agent />
            <TimingRow label="Static + test (iteration 1)" v="12m" agent />
            <TimingRow label="Jordan PR review · round 1" v="28m" human />
            <TimingRow label="Patch (rounding + FX + transient)" v="28m" agent />
            <TimingRow label="Jordan PR review · round 2" v="35m" human />
            <TimingRow label="Patch (deprecated_currencies seed)" v="21m" agent />
            <TimingRow label="Cortex + row-equivalence verify" v="24m" agent />
            <TimingRow label="Final approval + queue for merge" v="24m" human />
            <tr>
              <td className="px-3 py-2 text-[12.5px] font-semibold text-[#E6EDF3]">Total wall-clock</td>
              <td className="px-3 py-2 text-[12.5px] font-mono text-[#E6EDF3] text-right">4h 03m</td>
              <td className="px-3 py-2 text-[11px] text-[#7D8590] text-right">agent 2h 16m · human 1h 47m</td>
            </tr>
          </tbody>
        </table>
      </div>

      <H2>Portfolio context</H2>
      <ul className="list-disc list-inside space-y-1 text-[12.5px]">
        <li>
          1 / 911 assets modernized · 247 BTEQ + 412 T-SQL + 184 Informatica + 68 SSIS remaining.
        </li>
        <li>
          Est. portfolio finish: <strong>15 months</strong> (vs GSI baseline{' '}
          <strong>4 years, $18M</strong>).
        </li>
        <li>
          Projected steady-state: <span className="font-mono">$2.3M/yr</span> Snowflake credits vs
          legacy <span className="font-mono">$8.2M/yr</span> Teradata + Informatica TCO.
        </li>
      </ul>
    </article>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-5 mb-2 text-[15px] font-semibold text-[#E6EDF3] border-b border-[#30363D] pb-1">
      {children}
    </h2>
  );
}

function TimingRow({
  label, v, agent, human,
}: { label: string; v: string; agent?: boolean; human?: boolean }) {
  return (
    <tr className="odd:bg-[#0D1117] even:bg-[#161B22]">
      <td className="px-3 py-1.5 text-[#E6EDF3]">{label}</td>
      <td className="px-3 py-1.5 text-right font-mono text-[#E6EDF3]">{v}</td>
      <td className="px-3 py-1.5 text-right">
        {agent && (
          <span className="inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded bg-[#1F6FEB]/15 text-[#2F81F7] border border-[#2F81F7]/30">
            agent
          </span>
        )}
        {human && (
          <span className="inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded bg-[#6639BA]/15 text-[#A371F7] border border-[#A371F7]/30">
            human
          </span>
        )}
      </td>
    </tr>
  );
}

function Checks() {
  const checks = [
    { name: 'dbt compile', time: '1.2s' },
    { name: 'dbt parse', time: '0.4s' },
    { name: 'dbt test (14 / 14)', time: '11.4s' },
    { name: 'row-equivalence harness · Δ = 0', time: '0.6s' },
    { name: 'cortex semantic diff · no drift', time: '3.1s' },
    { name: 'tsc --noEmit (glue)', time: '1.1s' },
    { name: 'reviewer-approved · Jordan Park', time: '—' },
  ];
  return (
    <div className="rounded-lg border border-[#30363D] bg-[#0D1117] mb-4 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363D] bg-[#161B22]">
        <Check className="w-4 h-4 text-[#3FB950]" />
        <p className="text-[13px] font-semibold text-[#E6EDF3]">
          All checks have passed{' '}
          <span className="text-[#7D8590] font-normal">(after 2 iteration cycles)</span>
        </p>
      </div>
      <ul className="divide-y divide-[#30363D]">
        {checks.map((c) => (
          <li key={c.name} className="flex items-center gap-3 px-4 py-2">
            <Check className="w-3.5 h-3.5 text-[#3FB950]" />
            <span className="text-[12.5px] text-[#E6EDF3] flex-1">{c.name}</span>
            <span className="text-[11.5px] font-mono text-[#7D8590]">{c.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Merge() {
  return (
    <div className="rounded-lg border border-[#3FB950]/35 bg-[#3FB950]/10 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#3FB950]/20 flex items-center justify-center border border-[#3FB950]/40">
          <GitPullRequestArrow className="w-4 h-4 text-[#3FB950]" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#E6EDF3]">
            Approved · queued for Friday change window
          </p>
          <p className="text-[12px] text-[#7D8590]">
            Scheduled merge · Fri 05:00 PT · staging burn-in complete · rollback plan in runbook
          </p>
        </div>
        <button className="ml-auto px-3 py-1.5 rounded bg-[#2DA44E] text-white font-semibold text-[12px] hover:bg-[#2C974B] cursor-pointer">
          Reschedule merge
        </button>
      </div>
    </div>
  );
}
