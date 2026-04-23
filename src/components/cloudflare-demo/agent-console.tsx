'use client';

/**
 * Cursor Background Agent console for the Cloudflare credential-stuffing demo.
 *
 * Channel-coded scripted playback. Identical to the Datadog agent-console pattern
 * but with Cloudflare channels (cloudflare-mcp, threat-intel-mcp, wrangler,
 * statuspage-mcp, slack-mcp, siem-mcp) plus the standard model channels
 * (opus / composer / codex).
 *
 * The script's cumulative real-time delays sum to ~RUNNING_PHASE_REAL_MS so the
 * console finishes at exactly the same moment the live left-panel dashboard
 * arrives at the "recovered" stage.
 *
 * Displayed timestamps are scaled by TIME_SCALE so the console reads as ~3 min
 * of agent work even though real wall time is ~22 s.
 */

import { useEffect, useRef, useState } from 'react';
import { Bot, Check } from 'lucide-react';
import {
  RUNNING_PHASE_REAL_MS,
  TIME_SCALE,
} from '@/lib/demo/cloudflare-attack-fixture';

type Status = 'pending' | 'running' | 'done';

type Channel =
  | 'cloudflare'
  | 'threatintel'
  | 'github'
  | 'wrangler'
  | 'statuspage'
  | 'slack'
  | 'siem'
  | 'shell'
  | 'opus'
  | 'composer'
  | 'codex'
  | 'done';

interface Step {
  channel: Channel;
  label: string;
  detail?: string;
  delayMs: number;
}

const CHANNEL_STYLES: Record<Channel, { label: string; color: string; bg: string; border: string }> = {
  cloudflare:  { label: 'cloudflare-mcp',    color: 'text-[#FAAE40]',    bg: 'bg-[#F38020]/15',     border: 'border-[#F38020]/35' },
  threatintel: { label: 'threat-intel-mcp',  color: 'text-[#FCA5A5]',    bg: 'bg-[#7F1D1D]/20',     border: 'border-[#7F1D1D]/45' },
  github:      { label: 'github-mcp',        color: 'text-text-primary', bg: 'bg-text-primary/10',  border: 'border-text-primary/20' },
  wrangler:    { label: 'wrangler · deploy', color: 'text-[#FFAE6B]',    bg: 'bg-[#FFAE6B]/10',     border: 'border-[#FFAE6B]/30' },
  statuspage:  { label: 'statuspage-mcp',    color: 'text-[#6EE7B7]',    bg: 'bg-[#3DB46D]/10',     border: 'border-[#3DB46D]/30' },
  slack:       { label: 'slack-mcp',         color: 'text-[#C4A5DB]',    bg: 'bg-[#4A154B]/25',     border: 'border-[#4A154B]/55' },
  siem:        { label: 'siem-mcp',          color: 'text-[#94A3B8]',    bg: 'bg-[#0F172A]/40',     border: 'border-[#334155]/50' },
  shell:       { label: 'shell',             color: 'text-accent-green', bg: 'bg-accent-green/10',  border: 'border-accent-green/20' },
  opus:        { label: 'opus · plan',       color: 'text-[#D97757]',    bg: 'bg-[#D97757]/10',     border: 'border-[#D97757]/30' },
  composer:    { label: 'composer · patch',  color: 'text-accent-blue',  bg: 'bg-accent-blue/10',   border: 'border-accent-blue/30' },
  codex:       { label: 'codex · review',    color: 'text-[#10a37f]',    bg: 'bg-[#10a37f]/10',     border: 'border-[#10a37f]/30' },
  done:        { label: 'complete',          color: 'text-accent-green', bg: 'bg-accent-green/10',  border: 'border-accent-green/20' },
};

// ~30 steps. Cumulative delayMs aligned to fixture stage realMs so dashboard
// and console always tick in lockstep:
//   waf-log-mode      8,500 ms
//   waf-blocking     11,000 ms
//   worker-rate-limit 15,000 ms
//   recovered        19,500 ms
const SCRIPT: Step[] = [
  // ---- Intake (cloudflare) — first ~1.6s, dashboard already cresting ----
  { channel: 'cloudflare',  delayMs: 400, label: 'Fetching Analytics for spike window',           detail: 'GET /zones/acme-app.com/analytics · last 5min · 30s buckets' },
  { channel: 'cloudflare',  delayMs: 400, label: 'Bot Management score collapse confirmed',       detail: '87% of new traffic scored < 5 · /api/auth/login only' },
  { channel: 'cloudflare',  delayMs: 400, label: 'Pulling Logpush · failed-auth events',          detail: '4.3M auth attempts in 90s · 0.4% success rate' },
  { channel: 'cloudflare',  delayMs: 400, label: 'Source IP enumeration · ASN 14618',             detail: '8.4k distinct IPs · 1 ASN · top UA curl/7.81.0' },

  // ---- Threat correlation ----
  { channel: 'threatintel', delayMs: 500, label: 'Correlating ASN 14618 against intel feeds',     detail: 'Spamhaus · AbuseIPDB · CF Radar · 87% confidence credential-stuffing infra' },
  { channel: 'threatintel', delayMs: 400, label: 'Threat assessment written',                     detail: 'Known botnet · 14d activity history · prior attacks on 23 zones' },

  // ---- Plan (opus) ----
  { channel: 'opus',        delayMs: 800, label: 'Claude Opus: drafting 3-layer plan',            detail: 'Layer 1 edge-immediate · Layer 2 edge-rate-limit · Layer 3 app-long-term' },
  { channel: 'opus',        delayMs: 700, label: 'Plan: scope WAF rule narrowly',                 detail: 'ASN 14618 + UA curl/7.81.0 + endpoint /api/auth/login (no broader blocking)' },
  { channel: 'opus',        delayMs: 500, label: 'Plan: Log mode → 60s observation → Block',      detail: 'Auto-rollback if false-positive rate > 0.1%' },

  // ---- Composer · WAF rule generation + review ----
  { channel: 'composer',    delayMs: 700, label: 'Composer: generating WAF custom rule',          detail: '(ip.geoip.asnum eq 14618 and http.user_agent contains "curl/7.81") and http.request.uri.path eq "/api/auth/login"' },
  { channel: 'codex',       delayMs: 500, label: 'Codex: reviewing rule scope',                   detail: '✓ Single endpoint · single ASN · single UA · no country/org-level effect' },

  // ---- Deploy WAF in Log mode (lands ~8.5s — fixture stage waf-log-mode) ----
  { channel: 'cloudflare',  delayMs: 800, label: 'Deploying WAF custom rule',                     detail: 'PUT /zones/acme-app.com/firewall/rules · action=log · priority=1' },
  { channel: 'cloudflare',  delayMs: 700, label: 'Rule live · ID waf-2c8a4f · Log mode',          detail: 'Observation window 60s · auto-promote on 0 false positives' },
  { channel: 'shell',       delayMs: 700, label: 'Polling Analytics for false positives',        detail: 'GET /analytics/firewall_events · log-mode matches · last 60s' },
  { channel: 'shell',       delayMs: 1500, label: 'Observation window passed · 0 false positives', detail: '1.92M log-only matches · 0 legitimate users affected' },

  // ---- Promote to Block (lands ~11s — fixture stage waf-blocking) ----
  { channel: 'cloudflare',  delayMs: 1300, label: 'Promoting WAF rule to Block',                  detail: 'PATCH /zones/acme-app.com/firewall/rules/waf-2c8a4f · action=block' },

  // ---- Worker rate-limit patch ----
  { channel: 'github',      delayMs: 400, label: 'Branch security/auth-rate-limit-tighten',       detail: 'base: main · workers/auth-rate-limit.ts' },
  { channel: 'composer',    delayMs: 800, label: 'Composer: tightening Worker rate limit',        detail: 'rps=5/min/IP for bot-score < 5 · was 100/s/IP' },
  { channel: 'shell',       delayMs: 600, label: 'wrangler dev — local smoke test',               detail: '✓ rate-limit binding hit · 429 returned for sub-5 bot scores' },
  { channel: 'wrangler',    delayMs: 800, label: 'wrangler deploy --env preview',                 detail: 'Uploaded auth-rate-limit (3.2 KiB) · canary route 1% · 0 errors in 30s' },

  // ---- Worker production deploy (lands ~15s — fixture stage worker-rate-limit) ----
  { channel: 'wrangler',    delayMs: 1300, label: 'wrangler deploy --env production',             detail: 'Promoted to 100% · workers.dev/.../auth-rate-limit · build d4f2a' },

  // ---- App-side patch (PR only, no auto-merge) ----
  { channel: 'composer',    delayMs: 700, label: 'Composer: app-side detector + lockout',         detail: 'src/lib/auth/credential-stuffing-detector.ts · CAPTCHA on suspicious-IP' },
  { channel: 'codex',       delayMs: 500, label: 'Codex: pre-PR review on app-side patch',        detail: '⚠ Security-sensitive · marking PR as Draft · awaiting human review' },
  { channel: 'github',      delayMs: 700, label: 'Opening PR #318 (DRAFT)',                       detail: 'security: tighten /api/auth/login rate limit during credential-stuffing event' },

  // ---- Communication ----
  { channel: 'statuspage',  delayMs: 500, label: 'Statuspage update · "Mitigated · Monitoring"',  detail: 'status.acme-app.com/incidents/cf-2026-04-23-2342' },
  { channel: 'slack',       delayMs: 500, label: 'Slack #sec-ops summary posted',                 detail: '3 layers landed · 0 humans paged · attack absorbed at edge' },
  { channel: 'siem',        delayMs: 500, label: 'SIEM audit-trail entries flushed',              detail: 'Logpush → S3 → Splunk · 7 actions · all signed by cursor-agent' },

  // ---- Recovery confirmation (lands ~19.5s — fixture stage recovered) ----
  { channel: 'cloudflare',  delayMs: 600, label: 'Verifying Analytics post-mitigation',           detail: 'req/s back to 12.2k baseline · bot-score distribution restored · error rate 0.7%' },
  { channel: 'done',        delayMs: 500, label: 'Mitigation complete · 4 artifacts ready',       detail: 'Attack detail · WAF rule diff · Worker PR · Postmortem' },
];

// Sanity check: cumulative delay should land near RUNNING_PHASE_REAL_MS.
// (Compile-time docu only — this is checked by manual walkthrough.)
void RUNNING_PHASE_REAL_MS;

interface AgentConsoleProps {
  onComplete?: () => void;
}

function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000;
  const totalMs = Math.floor(ms);
  const mins = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds) % 60;
  const millis = totalMs % 1000;
  if (mins > 0) {
    return `+${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }
  return `+${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}s`;
}

export function AgentConsole({ onComplete }: AgentConsoleProps) {
  const [visibleSteps, setVisibleSteps] = useState<Array<Step & { elapsed: number; status: Status }>>([]);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    SCRIPT.forEach((step, i) => {
      cumulative += step.delayMs;
      const t = setTimeout(() => {
        const elapsed = (performance.now() - startRef.current) * TIME_SCALE;
        setVisibleSteps(prev => {
          const updated = prev.map(s => ({ ...s, status: 'done' as Status }));
          return [...updated, { ...step, elapsed, status: 'running' as Status }];
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
      ? formatElapsed(visibleSteps[visibleSteps.length - 1].elapsed)
      : '+00.000s';

  return (
    <div className="w-full h-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary leading-none mb-0.5">Cursor Background Agent</p>
            <p className="text-[11px] text-text-tertiary font-mono">cursor/partnerships-hub · main · cloudflare-mitigation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${finished ? 'bg-accent-green' : 'bg-[#F38020] animate-pulse'}`} />
          <span className="text-[11px] text-text-tertiary font-mono">{durationLabel}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[320px]">
        {visibleSteps.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2">Waiting for Cloudflare webhook…</p>
        )}
        {visibleSteps.map((step, i) => {
          const style = CHANNEL_STYLES[step.channel];
          const isActive = step.status === 'running';
          return (
            <div
              key={i}
              className="flex gap-2.5 items-start leading-relaxed"
              style={{ animation: 'agentFadeIn 0.2s ease-out' }}
            >
              <span className="text-text-tertiary shrink-0 w-[88px]">{formatElapsed(step.elapsed)}</span>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${style.bg} ${style.border} ${style.color} whitespace-nowrap`}
              >
                {style.label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5">
                  {isActive ? (
                    <span className="inline-block w-3 h-3 mt-0.5 shrink-0">
                      <span className="block w-1.5 h-1.5 rounded-full bg-[#F38020] animate-pulse" />
                    </span>
                  ) : (
                    <Check className="w-3 h-3 mt-0.5 text-accent-green shrink-0" />
                  )}
                  <span className="text-text-primary break-words">{step.label}</span>
                </div>
                {step.detail && (
                  <div className="text-text-tertiary text-[11px] ml-5 mt-0.5 break-words">{step.detail}</div>
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
