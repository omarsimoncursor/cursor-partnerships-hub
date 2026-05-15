'use client';

import { useEffect, useRef } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Bell,
  ChevronDown,
  Clock,
  HelpCircle,
  Phone,
  RotateCcw,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';
import type { IncidentTriggeredError } from './oncall-board';

interface FullIncidentPageProps {
  error: Error;
  onGo: () => void;
  onReset: () => void;
}

function asIncident(error: Error): IncidentTriggeredError | null {
  if (error.name === 'IncidentTriggeredError') {
    return error as IncidentTriggeredError;
  }
  return null;
}

export function FullIncidentPage({ error, onGo, onReset }: FullIncidentPageProps) {
  const goRef = useRef<HTMLButtonElement>(null);
  const inc = asIncident(error);

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const incidentId = inc?.incidentId ?? 'INC-21487';
  const service = inc?.service ?? 'payments-api';
  const errorRate = inc?.errorRatePct ?? 7.4;
  const monitorId = inc?.monitorId ?? '42971';
  const monitorName = inc?.monitorName ?? 'payments-api 5xx error rate';

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: '#0E0E12' }}>
      {/* Pulsing red incident bar */}
      <div className="h-1 w-full bg-[#DC3545] animate-pulse sticky top-0" />

      {/* Mock PagerDuty top bar — full bleed */}
      <header
        className="h-12 flex items-center gap-3 px-4 border-b"
        style={{ background: '#06AC38', borderColor: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white/15 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 text-white" fill="currentColor" />
          </div>
          <span className="text-sm font-bold text-white">PagerDuty</span>
        </div>
        <span className="text-white/70 text-xs">·</span>
        <button className="flex items-center gap-1.5 text-[12px] text-white/85 hover:text-white">
          acme-eng <ChevronDown className="w-3 h-3" />
        </button>
        <div className="flex-1 max-w-xl ml-3">
          <div className="flex items-center gap-2 px-3 h-7 rounded bg-white/10 text-white/90">
            <Search className="w-3.5 h-3.5 text-white/70" />
            <span className="text-[12px] font-mono">incident:{incidentId}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-white/85">
          <Bell className="w-4 h-4" />
          <HelpCircle className="w-4 h-4" />
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-[11px] font-bold">
            AC
          </div>
        </div>
      </header>

      {/* Pulsing red incident header */}
      <div
        className="px-6 py-5 border-b relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(220,53,69,0.18), rgba(220,53,69,0.04))', borderColor: '#2A1A1F' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-[#DC3545] animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#DC3545]/20 border border-[#DC3545]/40 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 text-[#FF6373]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-[#FF6373]">
                  Triggered · P1 · Major
                </span>
                <span className="w-1 h-1 rounded-full bg-[#DC3545] animate-pulse" />
                <span className="text-[11px] text-text-tertiary font-mono">
                  03:14:22 PT · Apr 23
                </span>
              </div>
              <h1 className="text-2xl md:text-[28px] font-semibold text-white leading-tight">
                {incidentId} · {service} 5xx burst
              </h1>
              <p className="text-sm text-white/70 mt-1.5">
                Service:{' '}
                <span className="font-mono text-white">{service}</span>{' '}
                · Escalation policy:{' '}
                <span className="font-mono text-white">Payments-Pri</span>{' '}
                · Urgency:{' '}
                <span className="text-[#FF6373] font-mono">High</span>
              </p>
            </div>

            {/* Greyed-out chrome buttons */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                disabled
                className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white/40 text-[12.5px] font-medium cursor-not-allowed"
                title="Acknowledge — only the on-call may ack"
              >
                Acknowledge
              </button>
              <button
                disabled
                className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white/40 text-[12.5px] font-medium cursor-not-allowed"
                title="Resolve — incident is still triggered"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="max-w-6xl mx-auto px-6 py-7">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Alert source */}
          <BodyCard label="Alert source" tone="amber">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded bg-[#632CA6]/30 border border-[#632CA6]/40 flex items-center justify-center text-[10px] font-bold text-[#A689D4]">
                D
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] text-white font-medium truncate">
                  Datadog monitor #{monitorId}
                </p>
                <p className="text-[11px] text-text-tertiary font-mono truncate">{monitorName}</p>
              </div>
            </div>
            <p className="text-[11.5px] text-text-secondary font-mono leading-relaxed">
              <span className="text-[#FF6373]">5xx</span> error rate{' '}
              <span className="text-white">{errorRate}%</span>
              <span className="text-text-tertiary"> &gt; threshold </span>5%
              <br />
              for 3 min · burn rate 36×
            </p>
          </BodyCard>

          {/* Incident timeline (just one entry) */}
          <BodyCard label="Incident timeline" tone="amber">
            <ol className="relative border-l border-[#DC3545]/40 ml-1.5 mt-1 space-y-3">
              <li className="ml-3">
                <span className="absolute -left-[5px] mt-1 w-2.5 h-2.5 rounded-full bg-[#DC3545] ring-2 ring-[#0E0E12]" />
                <div>
                  <span className="text-[10.5px] font-mono text-[#FF6373] uppercase tracking-wider">
                    Triggered
                  </span>
                  <p className="text-[12px] text-white">
                    Datadog monitor fired
                  </p>
                  <p className="text-[10.5px] text-text-tertiary font-mono">03:14:22 PT</p>
                </div>
              </li>
              <li className="ml-3 opacity-40">
                <span className="absolute -left-[5px] mt-1 w-2.5 h-2.5 rounded-full bg-text-tertiary/40 ring-2 ring-[#0E0E12]" />
                <div>
                  <span className="text-[10.5px] font-mono text-text-tertiary uppercase tracking-wider">
                    Pending
                  </span>
                  <p className="text-[12px] text-text-secondary italic">
                    Awaiting acknowledgement…
                  </p>
                </div>
              </li>
            </ol>
          </BodyCard>

          {/* On-call rotation */}
          <BodyCard label="Who's on-call" tone="neutral">
            <div className="space-y-2.5">
              <OncallRow
                tier="Primary"
                name="Alex Chen"
                detail="03:14 AM PT · phone ringing in 0:47…"
                tone="amber"
                avatar="AC"
              />
              <OncallRow
                tier="Secondary"
                name="Jordan Patel"
                detail="paged at 03:19 if unack'd"
                tone="neutral"
                avatar="JP"
              />
              <OncallRow
                tier="Manager"
                name="Sam Rivera"
                detail="paged at 03:24 if unack'd"
                tone="neutral"
                avatar="SR"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-dark-border">
              <p className="text-[10.5px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
                Escalation
              </p>
              <p className="text-[11.5px] text-text-secondary">
                Payments-Pri policy · 5-min steps · 3 levels
              </p>
            </div>
          </BodyCard>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-7 max-w-3xl mx-auto">
          <div className="flex-1 h-px bg-dark-border" />
          <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.25em]">
            Demo
          </span>
          <div className="flex-1 h-px bg-dark-border" />
        </div>

        {/* CTA */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[#06AC38]/10 border border-[#06AC38]/25">
            <ShieldAlert className="w-3 h-3 text-[#57D990]" />
            <span className="text-[10.5px] font-mono text-[#57D990] uppercase tracking-wider">
              Cursor agent on-call · suppressing the page
            </span>
          </div>
          <p className="text-base text-white font-medium mb-5">
            Watch a Cursor agent ack, triage, revert, and resolve this incident in 4 minutes — with zero humans paged.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full bg-[#06AC38] text-white font-semibold text-base
                         hover:bg-[#08C443] transition-all duration-200 flex items-center gap-2
                         shadow-[0_0_32px_rgba(6,172,56,0.4)] hover:shadow-[0_0_48px_rgba(6,172,56,0.55)]
                         cursor-pointer"
            >
              Watch Cursor handle this page
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onReset}
              className="px-5 py-3 rounded-full border border-dark-border text-text-secondary font-medium text-sm
                         hover:bg-dark-surface-hover hover:text-text-primary transition-colors cursor-pointer
                         flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <p className="mt-4 text-[11px] text-text-tertiary flex items-center justify-center gap-1.5">
            <Clock className="w-3 h-3" />
            All agent activity is scripted playback — no real PagerDuty calls
          </p>
        </div>
      </div>
    </div>
  );
}

function BodyCard({
  label,
  tone,
  children,
}: {
  label: string;
  tone: 'amber' | 'neutral';
  children: React.ReactNode;
}) {
  const borderColor =
    tone === 'amber' ? 'border-[#DC3545]/25' : 'border-dark-border';
  return (
    <div className={`rounded-xl border ${borderColor} bg-dark-surface p-4`}>
      <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

function OncallRow({
  tier,
  name,
  detail,
  tone,
  avatar,
}: {
  tier: string;
  name: string;
  detail: string;
  tone: 'amber' | 'neutral';
  avatar: string;
}) {
  const dot = tone === 'amber' ? 'bg-[#F5A623] animate-pulse' : 'bg-text-tertiary/50';
  const detailColor = tone === 'amber' ? 'text-[#F5A623]' : 'text-text-tertiary';
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-[#06AC38]/15 border border-[#06AC38]/25 flex items-center justify-center text-[10px] font-bold text-[#57D990] shrink-0">
        {avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1 h-1 rounded-full ${dot}`} />
          <span className="text-[10.5px] font-mono text-text-tertiary uppercase tracking-wider">
            {tier}
          </span>
        </div>
        <p className="text-[12.5px] text-white font-medium truncate flex items-center gap-1.5">
          <Users className="w-3 h-3 text-text-tertiary" />
          {name}
        </p>
        <p className={`text-[10.5px] font-mono truncate ${detailColor}`}>{detail}</p>
      </div>
    </div>
  );
}
