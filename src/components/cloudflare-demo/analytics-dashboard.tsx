'use client';

/**
 * Pixel-perfect Cloudflare Analytics dashboard for `acme-app.com`.
 * Used as the trigger UI on the idle phase. Includes:
 *   - top nav + sub-nav (chrome)
 *   - 4 zone-summary cards
 *   - requests / status-codes line chart
 *   - bot-score histogram + top-countries / top-UAs tables
 *   - the world-map widget (centerpiece)
 *   - bottom-right floating CTA: "Simulate credential-stuffing wave"
 *
 * The dashboard is rendered in its baseline state. The `attack-simulator`
 * component animates the same numbers in-place during the 5s spike.
 */

import { Activity, Server, ShieldCheck, Wifi, ChevronRight } from 'lucide-react';
import {
  CloudflareTopNav,
  CloudflareSubNav,
  CF_BG,
  CF_PANEL,
  CF_BORDER,
  CF_BORDER_HARD,
  CF_TEXT_PRIMARY,
  CF_TEXT_TERTIARY,
  CF_ORANGE,
  CF_GREEN,
  CF_BLUE,
  CF_RED,
} from './cloudflare-chrome';
import { WorldMap } from './world-map';
import {
  interpolateAt,
  formatReqPerSec,
  type InterpolatedState,
} from '@/lib/demo/cloudflare-attack-fixture';

interface AnalyticsDashboardProps {
  /** When provided, the dashboard renders the live attack/mitigation animation. */
  liveOffsetMs?: number;
  /** Static mode (no animation, baseline state). */
  paused?: boolean;
  /** When true, the dashboard reacts as the attack ramps up (used by attack-simulator). */
  attackProgress?: number;
  /** Optional click handler for the "Simulate credential-stuffing wave" floating CTA. */
  onSimulate?: () => void;
  /** Hide the floating simulate CTA (used inside the running phase). */
  hideSimulateCta?: boolean;
  /** Compact mode = smaller paddings, used in the split-screen left panel. */
  compact?: boolean;
}

export function AnalyticsDashboard({
  liveOffsetMs,
  paused,
  attackProgress = 0,
  onSimulate,
  hideSimulateCta,
  compact,
}: AnalyticsDashboardProps) {
  // If liveOffsetMs is set, derive everything from the fixture interpolator.
  // Otherwise interpolate between baseline (idle) and the cresting attack stage
  // using attackProgress 0..1.
  const live = liveOffsetMs != null ? interpolateAt(liveOffsetMs) : null;
  const attackBlend = attackProgress;
  const reqPerSec = live
    ? live.reqPerSec
    : 12000 + 72000 * attackBlend;
  const botPct = live ? live.botPct : 4 + 83 * attackBlend;
  const errorPct = live ? live.errorPct : 0.6 + 10.8 * attackBlend;
  const intensity = live ? live.threatIntensity : Math.min(1, attackBlend);
  const statusLabel = live
    ? live.statusLabel
    : attackBlend < 0.05
      ? 'All systems normal'
      : attackBlend < 0.7
        ? 'Anomaly detected · ASN 14618'
        : 'Active attack · credential-stuffing in progress';
  const statusTone: 'normal' | 'attack' | 'mitigating' | 'recovered' = live
    ? live.statusTone
    : attackBlend < 0.05
      ? 'normal'
      : 'attack';

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: CF_BG, color: CF_TEXT_PRIMARY }}
    >
      <CloudflareTopNav />
      <CloudflareSubNav />

      <div className={`flex-1 overflow-y-auto ${compact ? 'p-4' : 'p-5'}`}>
        {/* Status banner */}
        <StatusBanner label={statusLabel} tone={statusTone} live={live} />

        {/* Zone summary cards */}
        <div className={`grid grid-cols-2 ${compact ? 'lg:grid-cols-4' : 'md:grid-cols-4'} gap-3 mt-4`}>
          <SummaryCard
            icon={<Wifi className="w-3.5 h-3.5" />}
            label="Requests"
            value={`${formatReqPerSec(reqPerSec)}/s`}
            delta={
              attackBlend > 0.05 || (live && live.threatIntensity > 0.05)
                ? `+${(((reqPerSec - 12000) / 12000) * 100).toFixed(0)}%`
                : 'normal'
            }
            tone={attackBlend > 0.4 || (live && live.threatIntensity > 0.4) ? 'attack' : 'neutral'}
          />
          <SummaryCard
            icon={<Server className="w-3.5 h-3.5" />}
            label="Bandwidth"
            value="480 Mbps"
            delta="−2%"
            tone="neutral"
          />
          <SummaryCard
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            label="Cache hit"
            value="99.4%"
            delta="stable"
            tone="neutral"
          />
          <SummaryCard
            icon={<Activity className="w-3.5 h-3.5" />}
            label={attackBlend > 0.05 || (live && live.threatIntensity > 0.05) ? 'Threats blocked' : 'Threats blocked'}
            value={
              live && live.threatIntensity > 0.4
                ? formatThreatNumber(412 + Math.round(live.progress * 12000))
                : attackBlend > 0.4
                  ? formatThreatNumber(412 + Math.round(attackBlend * 8400))
                  : '412'
            }
            delta={attackBlend > 0.4 || (live && live.threatIntensity > 0.4) ? '+ live' : 'last hr'}
            tone={attackBlend > 0.4 || (live && live.threatIntensity > 0.4) ? 'mitigating' : 'neutral'}
          />
        </div>

        {/* Charts row: requests line + status-code bars */}
        <div className={`grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 mt-3`}>
          <DashboardCard title="Requests / cached / uncached" subtitle="last 30 min · 30s buckets">
            <RequestsChart attackProgress={attackBlend} live={live} />
          </DashboardCard>
          <DashboardCard title="Status codes" subtitle={`/api/auth/login · 4xx surge${errorPct > 5 ? '' : ' (low)'}`}>
            <StatusCodeBars errorPct={errorPct} />
          </DashboardCard>
        </div>

        {/* Bot Score histogram + top tables */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3`}>
          <DashboardCard
            title="Bot Management score"
            subtitle="distribution of new sessions · last 5 min"
          >
            <BotScoreHistogram botPct={botPct} />
          </DashboardCard>
          <DashboardCard title="Top countries" subtitle="by requests · last 30 min">
            <TopCountriesTable attackProgress={attackBlend} live={live} />
          </DashboardCard>
          <DashboardCard title="Top user-agents" subtitle="last 5 min">
            <TopUserAgentsTable attackProgress={attackBlend} live={live} />
          </DashboardCard>
        </div>

        {/* World map */}
        <div className="mt-3">
          <DashboardCard padding={false}>
            <div className="p-4">
              <WorldMap intensity={intensity} paused={paused} />
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Floating CTA */}
      {onSimulate && !hideSimulateCta && (
        <button
          onClick={onSimulate}
          className="absolute bottom-6 right-6 z-10 px-5 py-3 rounded-full text-white font-medium text-sm
                     shadow-[0_8px_32px_rgba(243,128,32,0.45)]
                     hover:shadow-[0_12px_44px_rgba(243,128,32,0.6)]
                     transition-all duration-200 cursor-pointer flex items-center gap-2"
          style={{ background: CF_ORANGE }}
        >
          Simulate credential-stuffing wave
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function formatThreatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ----- Status banner -----

function StatusBanner({
  label,
  tone,
  live,
}: {
  label: string;
  tone: 'normal' | 'attack' | 'mitigating' | 'recovered';
  live: InterpolatedState | null;
}) {
  const colors =
    tone === 'attack'
      ? { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.35)', dot: CF_RED, text: '#FCA5A5' }
      : tone === 'mitigating'
        ? { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.35)', dot: '#F59E0B', text: '#FCD34D' }
        : tone === 'recovered'
          ? { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.35)', dot: CF_GREEN, text: '#6EE7B7' }
          : { bg: 'rgba(243,128,32,0.06)', border: 'rgba(243,128,32,0.25)', dot: CF_GREEN, text: CF_TEXT_SECONDARY };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg border text-[12.5px]"
      style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
    >
      <span
        className={`w-2 h-2 rounded-full ${tone !== 'normal' && tone !== 'recovered' ? 'animate-pulse' : ''}`}
        style={{ background: colors.dot }}
      />
      <span className="font-medium">{label}</span>
      {live && (
        <span className="ml-auto font-mono text-[11px]" style={{ color: CF_TEXT_TERTIARY }}>
          monitor: bot-mgmt-/api/auth/login
        </span>
      )}
    </div>
  );
}

// ----- Reusable card -----

function DashboardCard({
  title,
  subtitle,
  children,
  padding = true,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  padding?: boolean;
}) {
  return (
    <div
      className="rounded-lg border"
      style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
    >
      {title && (
        <div className="px-4 py-3 border-b" style={{ borderColor: CF_BORDER }}>
          <p className="text-[13px] font-semibold text-white leading-none mb-1">{title}</p>
          {subtitle && (
            <p className="text-[11px]" style={{ color: CF_TEXT_TERTIARY }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={padding ? 'p-4' : ''}>{children}</div>
    </div>
  );
}

// ----- Summary card -----

function SummaryCard({
  icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  tone: 'neutral' | 'attack' | 'mitigating';
}) {
  const deltaColor =
    tone === 'attack'
      ? '#FCA5A5'
      : tone === 'mitigating'
        ? '#FCD34D'
        : CF_TEXT_TERTIARY;
  return (
    <div
      className="rounded-lg border px-4 py-3"
      style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: CF_TEXT_TERTIARY }}>
        {icon}
        <p className="text-[10.5px] uppercase tracking-wider font-mono">{label}</p>
      </div>
      <p className={`text-[20px] font-semibold leading-tight tabular-nums ${tone === 'attack' ? 'text-[#FCA5A5]' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-[11px] font-mono mt-1" style={{ color: deltaColor }}>
        {delta}
      </p>
    </div>
  );
}

// ----- Requests chart -----

function RequestsChart({
  attackProgress,
  live,
}: {
  attackProgress: number;
  live: InterpolatedState | null;
}) {
  // Pre-baked baseline series (60 buckets) with a tiny jitter pattern.
  const BASELINE: number[] = Array.from({ length: 60 }, (_, i) => {
    const wave = Math.sin(i / 4) * 800 + Math.cos(i / 7) * 600;
    return 11500 + wave;
  });

  // Bring in the latest series tail to reflect the current state.
  // Last 10 buckets reflect the live attack curve.
  const latestValue = live ? live.reqPerSec : 12000 + 72000 * attackProgress;
  const series = BASELINE.map((v, i) => {
    if (i < 50) return v;
    const t = (i - 50) / 9;
    return v + (latestValue - v) * t;
  });

  const w = 560;
  const h = 160;
  const maxY = Math.max(90000, latestValue * 1.1);
  const stepX = w / (series.length - 1);
  const coords = series.map((v, i) => ({
    x: i * stepX,
    y: h - (v / maxY) * (h - 16) - 8,
  }));
  const path = coords
    .map((c, i) => (i === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`))
    .join(' ');
  const fillPath = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="block">
        <defs>
          <linearGradient id="cf-req-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CF_ORANGE} stopOpacity="0.35" />
            <stop offset="100%" stopColor={CF_ORANGE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Y-axis hash lines */}
        {[0.25, 0.5, 0.75].map(p => (
          <line
            key={p}
            x1="0"
            y1={h * p}
            x2={w}
            y2={h * p}
            stroke="#1A2330"
            strokeWidth="0.5"
          />
        ))}
        <path d={fillPath} fill="url(#cf-req-fill)" />
        <path d={path} fill="none" stroke={CF_ORANGE} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle
          cx={coords[coords.length - 1].x}
          cy={coords[coords.length - 1].y}
          r="3"
          fill={CF_ORANGE}
        />
      </svg>
      <div className="flex items-center justify-between mt-1 text-[10.5px] font-mono" style={{ color: CF_TEXT_TERTIARY }}>
        <span>−30 min</span>
        <span>now</span>
      </div>
    </div>
  );
}

// ----- Status code bars -----

function StatusCodeBars({ errorPct }: { errorPct: number }) {
  const ok = Math.max(0, 100 - errorPct - 0.4);
  const bar = (label: string, value: number, color: string) => (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-mono w-8" style={{ color: CF_TEXT_TERTIARY }}>
        {label}
      </span>
      <div className="flex-1 h-3 rounded-sm overflow-hidden" style={{ background: '#0E1620' }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-mono tabular-nums w-12 text-right" style={{ color: CF_TEXT_PRIMARY }}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
  return (
    <div className="space-y-2.5">
      {bar('2xx', ok, CF_GREEN)}
      {bar('3xx', 0.4, CF_BLUE)}
      {bar('4xx', errorPct, CF_RED)}
      {bar('5xx', 0.0, '#7C2D12')}
    </div>
  );
}

// ----- Bot score histogram -----

function BotScoreHistogram({ botPct }: { botPct: number }) {
  // 10 buckets: 0..9 (low → high human-likelihood). Cloudflare Bot Score uses
  // the inverse convention (low = bot), which we follow here.
  // Baseline: ~80% in 6..9, ~20% in 0..3.
  // As `botPct` rises, the left half (0..4) inflates.
  const bots = botPct / 100;
  const buckets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
    if (i <= 4) {
      // Bot side
      return 4 + bots * 26 + (4 - i) * 2;
    } else {
      // Human side
      const baseline = 18 - (i - 5) * 1.5;
      return Math.max(2, baseline - bots * 8);
    }
  });
  const max = Math.max(...buckets);
  return (
    <div>
      <div className="flex items-end gap-1 h-[80px]">
        {buckets.map((v, i) => {
          const isBot = i <= 4;
          const color = isBot
            ? bots > 0.4
              ? CF_RED
              : bots > 0.15
                ? '#F59E0B'
                : '#7C2D12'
            : CF_GREEN;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-300"
              style={{
                height: `${(v / max) * 100}%`,
                background: color,
                opacity: isBot ? 0.95 : 0.7,
              }}
              title={`bot-score ${i} · ${v.toFixed(1)}%`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] font-mono" style={{ color: CF_TEXT_TERTIARY }}>
        <span>← bot</span>
        <span>human →</span>
      </div>
    </div>
  );
}

// ----- Top countries -----

function TopCountriesTable({
  attackProgress,
  live,
}: {
  attackProgress: number;
  live: InterpolatedState | null;
}) {
  const intensity = live ? live.threatIntensity : Math.min(1, attackProgress);
  const RU_PCT = 5 + intensity * 53;
  const rows = [
    { country: 'United States', pct: 28 - intensity * 12, flag: '🇺🇸' },
    { country: 'Germany', pct: 14 - intensity * 6, flag: '🇩🇪' },
    { country: 'Japan', pct: 11 - intensity * 4, flag: '🇯🇵' },
    { country: 'Russia', pct: RU_PCT, flag: '🇷🇺', hot: intensity > 0.3 },
    { country: 'Brazil', pct: 7 - intensity * 2, flag: '🇧🇷' },
  ];
  return (
    <table className="w-full text-[12px]">
      <tbody className="divide-y" style={{ borderColor: CF_BORDER }}>
        {rows.map(r => (
          <tr key={r.country}>
            <td className="py-1.5 pr-2 w-5 text-center">{r.flag}</td>
            <td className="py-1.5 pr-2" style={{ color: r.hot ? '#FCA5A5' : CF_TEXT_PRIMARY }}>
              {r.country}
              {r.hot && <span className="ml-1.5 text-[9.5px] font-mono text-[#FCA5A5]">attack</span>}
            </td>
            <td className="py-1.5 text-right tabular-nums font-mono" style={{ color: CF_TEXT_TERTIARY }}>
              {r.pct.toFixed(1)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ----- Top user-agents -----

function TopUserAgentsTable({
  attackProgress,
  live,
}: {
  attackProgress: number;
  live: InterpolatedState | null;
}) {
  const intensity = live ? live.threatIntensity : Math.min(1, attackProgress);
  const curl = 1 + intensity * 71;
  const rows = [
    { ua: 'curl/7.81.0', pct: curl, hot: intensity > 0.3, mono: true },
    { ua: 'Chrome 124 (macOS)', pct: 22 - intensity * 14 },
    { ua: 'Chrome 124 (Windows)', pct: 18 - intensity * 11 },
    { ua: 'Safari 17 (iOS)', pct: 12 - intensity * 6 },
    { ua: 'Firefox 125 (macOS)', pct: 6 - intensity * 2 },
  ];
  return (
    <table className="w-full text-[12px]">
      <tbody className="divide-y" style={{ borderColor: CF_BORDER }}>
        {rows.map(r => (
          <tr key={r.ua}>
            <td
              className={`py-1.5 pr-2 truncate max-w-[160px] ${r.mono ? 'font-mono' : ''}`}
              style={{ color: r.hot ? '#FCA5A5' : CF_TEXT_PRIMARY }}
              title={r.ua}
            >
              {r.ua}
              {r.hot && <span className="ml-1.5 text-[9.5px] font-mono text-[#FCA5A5]">bot</span>}
            </td>
            <td className="py-1.5 text-right tabular-nums font-mono" style={{ color: CF_TEXT_TERTIARY }}>
              {r.pct.toFixed(1)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
