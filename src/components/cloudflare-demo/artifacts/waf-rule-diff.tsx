'use client';

/**
 * Pixel-perfect Cloudflare WAF custom-rules editor — side-by-side before/after
 * showing the new rule highlighted, plus the deploy log proving Log-mode →
 * 60s observation → Block.
 */

import {
  Shield,
  Plus,
  Edit3,
  Search,
  ChevronDown,
} from 'lucide-react';
import {
  CF_BG,
  CF_PANEL,
  CF_BORDER,
  CF_BORDER_HARD,
  CF_TEXT_PRIMARY,
  CF_TEXT_SECONDARY,
  CF_TEXT_TERTIARY,
  CF_ORANGE,
  CF_GREEN,
  CF_AMBER,
  CloudflareTopNav,
} from '../cloudflare-chrome';

interface ExistingRule {
  id: string;
  name: string;
  expression: string;
  action: 'log' | 'block' | 'challenge' | 'js_challenge';
  priority: number;
}

const EXISTING_RULES: ExistingRule[] = [
  {
    id: 'waf-001',
    name: 'Block high-risk countries (legacy)',
    expression: '(ip.geoip.country in {"KP" "IR"})',
    action: 'block',
    priority: 5,
  },
  {
    id: 'waf-002',
    name: 'Challenge unknown bots',
    expression: '(cf.bot_management.score lt 30 and not cf.bot_management.verified_bot)',
    action: 'js_challenge',
    priority: 10,
  },
  {
    id: 'waf-003',
    name: 'Allow good bots',
    expression: '(cf.bot_management.verified_bot)',
    action: 'log',
    priority: 20,
  },
];

const NEW_RULE: ExistingRule = {
  id: 'waf-2c8a4f',
  name: 'Credential-stuffing — ASN 14618 / curl on /api/auth/login',
  expression:
    '(ip.geoip.asnum eq 14618 and http.user_agent contains "curl/7.81") and http.request.uri.path eq "/api/auth/login"',
  action: 'block',
  priority: 1,
};

interface DeployEvent {
  time: string;
  label: string;
  detail: string;
  tone: 'info' | 'amber' | 'green';
}

const DEPLOY_LOG: DeployEvent[] = [
  {
    time: '14:23:45',
    label: 'Rule created · Log mode',
    detail: 'PUT /zones/acme-app.com/firewall/rules · action=log · priority=1 · author=cursor-agent',
    tone: 'info',
  },
  {
    time: '14:23:45',
    label: 'Observation window opened · 60 s',
    detail: 'Auto-promote to Block if false-positive rate stays at 0',
    tone: 'amber',
  },
  {
    time: '14:24:21',
    label: '1.92M log-only matches',
    detail: 'Top match path /api/auth/login · 0 unique non-attack source IPs',
    tone: 'amber',
  },
  {
    time: '14:24:45',
    label: 'Observation passed · 0 false positives',
    detail: 'Rule eligible for promotion',
    tone: 'green',
  },
  {
    time: '14:24:46',
    label: 'Promoted to Block',
    detail: 'PATCH /zones/acme-app.com/firewall/rules/waf-2c8a4f · action=block · req/s dropped 55% within 5s',
    tone: 'green',
  },
];

export function WafRuleDiff() {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: CF_BG, color: CF_TEXT_PRIMARY }}>
      <CloudflareTopNav />

      {/* Sub-breadcrumb */}
      <div
        className="px-4 py-2.5 border-b text-[12px] flex items-center gap-2"
        style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD, color: CF_TEXT_SECONDARY }}
      >
        <span>Security</span>
        <span style={{ color: CF_TEXT_TERTIARY }}>/</span>
        <span>WAF</span>
        <span style={{ color: CF_TEXT_TERTIARY }}>/</span>
        <span className="text-white font-medium">Custom rules</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-mono" style={{ color: CF_TEXT_TERTIARY }}>
            Sorted by priority
          </span>
          <ChevronDown className="w-3 h-3" style={{ color: CF_TEXT_TERTIARY }} />
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: CF_TEXT_TERTIARY }}>
              acme-app.com · 4 active custom rules
            </p>
            <h1 className="text-[20px] font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: CF_ORANGE }} />
              WAF custom rules
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 h-8 rounded text-[12px]"
              style={{ background: CF_PANEL, border: `1px solid ${CF_BORDER_HARD}` }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: CF_TEXT_TERTIARY }} />
              <span style={{ color: CF_TEXT_TERTIARY }}>Search rules…</span>
            </div>
            <button
              className="px-3 h-8 rounded text-white text-[12.5px] font-medium flex items-center gap-1.5"
              style={{ background: CF_ORANGE }}
            >
              <Plus className="w-3.5 h-3.5" />
              Create rule
            </button>
          </div>
        </div>

        {/* Side-by-side diff */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <RulesPanel
            title="Before"
            subtitle="3 rules · last edited 14d ago"
            rules={EXISTING_RULES}
            highlightNew={false}
          />
          <RulesPanel
            title="After (auto-deployed by cursor-agent)"
            subtitle="4 rules · highlighted rule added 2m 14s ago"
            rules={[NEW_RULE, ...EXISTING_RULES]}
            highlightNew
          />
        </div>

        {/* Rule expression detail */}
        <div
          className="rounded-lg border overflow-hidden mb-5"
          style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
        >
          <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: CF_BORDER_HARD }}>
            <Edit3 className="w-3.5 h-3.5" style={{ color: CF_TEXT_TERTIARY }} />
            <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
              Rule expression · waf-2c8a4f
            </p>
            <span
              className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#6EE7B7' }}
            >
              ACTION · BLOCK
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-[10.5px] font-mono uppercase tracking-wider mb-1" style={{ color: CF_TEXT_TERTIARY }}>
                Expression (Cloudflare Rules language)
              </p>
              <pre
                className="rounded-md p-3 text-[12px] font-mono leading-relaxed overflow-x-auto"
                style={{ background: CF_BG, border: `1px solid ${CF_BORDER_HARD}`, color: CF_TEXT_PRIMARY }}
              >
{`(
  ip.geoip.asnum eq 14618
  and http.user_agent contains "curl/7.81"
)
and http.request.uri.path eq "/api/auth/login"`}
              </pre>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[12px]">
              <KV k="Scope" v="1 endpoint · 1 ASN · 1 UA family" />
              <KV k="Risk" v="Narrow · no country / org-level effect" />
              <KV k="Rollback" v="Single PATCH to action=log" />
            </div>
          </div>
        </div>

        {/* Deploy log */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
        >
          <div className="px-4 py-2.5 border-b flex items-center" style={{ borderColor: CF_BORDER_HARD }}>
            <p className="text-[11px] font-semibold text-white uppercase tracking-wider">Deploy log</p>
            <span
              className="ml-auto text-[10.5px] font-mono"
              style={{ color: CF_TEXT_TERTIARY }}
            >
              audit-trail · sent to Logpush → SIEM
            </span>
          </div>
          <ul className="divide-y" style={{ borderColor: CF_BORDER }}>
            {DEPLOY_LOG.map((e, i) => {
              const dotColor =
                e.tone === 'green' ? CF_GREEN : e.tone === 'amber' ? CF_AMBER : CF_ORANGE;
              return (
                <li key={i} className="px-4 py-2.5 flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
                  <span
                    className="text-[11px] font-mono shrink-0 w-[68px]"
                    style={{ color: CF_TEXT_TERTIARY }}
                  >
                    {e.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] text-white">{e.label}</p>
                    <p className="text-[11px]" style={{ color: CF_TEXT_TERTIARY }}>
                      {e.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RulesPanel({
  title,
  subtitle,
  rules,
  highlightNew,
}: {
  title: string;
  subtitle: string;
  rules: ExistingRule[];
  highlightNew: boolean;
}) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: CF_BORDER_HARD }}>
        <p className="text-[12.5px] font-semibold text-white">{title}</p>
        <p className="text-[11px]" style={{ color: CF_TEXT_TERTIARY }}>{subtitle}</p>
      </div>
      <ul className="divide-y" style={{ borderColor: CF_BORDER }}>
        {rules.map((r, i) => {
          const isNew = highlightNew && i === 0;
          return (
            <li
              key={r.id}
              className="px-4 py-3 flex items-start gap-3"
              style={isNew ? { background: 'rgba(16,185,129,0.08)' } : undefined}
            >
              <span
                className="mt-1 w-5 h-5 rounded-full text-[10.5px] font-mono flex items-center justify-center shrink-0"
                style={{
                  background: isNew ? CF_GREEN : CF_BORDER_HARD,
                  color: isNew ? '#062a1d' : CF_TEXT_TERTIARY,
                  fontWeight: 700,
                }}
              >
                {r.priority}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[12.5px] text-white truncate">{r.name}</p>
                  {isNew && (
                    <span
                      className="text-[9.5px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                      style={{ background: 'rgba(16,185,129,0.18)', color: '#6EE7B7' }}
                    >
                      NEW
                    </span>
                  )}
                </div>
                <p
                  className="text-[10.5px] font-mono truncate"
                  style={{ color: CF_TEXT_TERTIARY }}
                  title={r.expression}
                >
                  {r.expression}
                </p>
              </div>
              <ActionPill action={r.action} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ActionPill({ action }: { action: ExistingRule['action'] }) {
  const colors: Record<ExistingRule['action'], { bg: string; color: string }> = {
    block: { bg: 'rgba(220,38,38,0.18)', color: '#FCA5A5' },
    log: { bg: 'rgba(243,128,32,0.15)', color: '#FAAE40' },
    challenge: { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D' },
    js_challenge: { bg: 'rgba(167,139,250,0.18)', color: '#C4B5FD' },
  };
  const c = colors[action];
  return (
    <span
      className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 self-start mt-0.5"
      style={{ background: c.bg, color: c.color }}
    >
      {action}
    </span>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: CF_TEXT_TERTIARY }}>{k}</p>
      <p className="text-[12.5px]" style={{ color: CF_TEXT_PRIMARY }}>{v}</p>
    </div>
  );
}
