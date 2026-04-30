'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AlertOctagon, Clock, Phone, Users } from 'lucide-react';

// Act 1 — pixel of a PagerDuty incident dashboard moments after the page
// triggers. Mirrors the Datadog Act 1 scaffolding (header, banner, grid)
// but renders PD chrome instead of APM.

export function PageFiresScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-pd-dashboard]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-pd-banner]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        delay: 0.6,
        ease: 'back.out(1.5)',
      });

      gsap.from('[data-pd-tick]', {
        scrollTrigger: { trigger: '[data-pd-timeline]', start: 'top 80%' },
        opacity: 0,
        x: -8,
        stagger: 0.08,
        duration: 0.4,
        ease: 'power3.out',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">
            Act 1
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">The Page Fires</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          PagerDuty triggers a P1 incident on{' '}
          <span className="font-mono text-text-primary">payments-api</span> at 03:14 AM. Without
          an auto-pilot, the on-call&apos;s phone is about to ring. Here&apos;s what the incident
          looks like the moment before that happens.
        </p>

        {/* PagerDuty incident dashboard mock */}
        <div
          data-pd-dashboard
          className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden"
        >
          {/* Top bar (PD green) */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-dark-border bg-[#06AC38]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-white/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-white" fill="currentColor" />
              </div>
              <span className="text-sm text-white font-semibold">PagerDuty</span>
              <span className="text-white/70 text-xs">·</span>
              <span className="text-xs text-white/95 font-mono">acme-eng</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-white/85 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Live · auto-refresh 30s
              </span>
            </div>
          </div>

          {/* Pulsing red incident banner */}
          <div
            data-pd-banner
            className="mx-4 mt-4 p-4 rounded-lg bg-[#DC3545]/12 border border-[#DC3545]/30 flex items-start gap-3"
          >
            <AlertOctagon className="w-5 h-5 text-[#FF6373] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#FF6373]">
                  Triggered · P1 · Major
                </span>
                <span className="w-1 h-1 rounded-full bg-[#DC3545] animate-pulse" />
                <span className="text-[10.5px] text-text-tertiary font-mono">
                  03:14:22 PT
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary mb-1">
                INC-21487 · payments-api 5xx burst
              </p>
              <p className="text-xs text-text-secondary font-mono">
                Datadog monitor #42971 · 5xx rate{' '}
                <span className="text-[#FF6373]">7.4%</span> &gt; threshold 5% for 3 min · burn
                rate 36×
              </p>
            </div>
          </div>

          {/* Body grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* On-call rotation */}
            <div className="rounded-lg border border-dark-border bg-dark-bg p-3.5">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
                On-call rotation
              </p>
              <OncallRow
                tier="Primary"
                name="Alex Chen"
                detail="phone ringing in 0:47…"
                tone="amber"
                avatar="AC"
              />
              <OncallRow
                tier="Secondary"
                name="Jordan Patel"
                detail="paged at 03:19"
                tone="neutral"
                avatar="JP"
              />
              <OncallRow
                tier="Manager"
                name="Sam Rivera"
                detail="paged at 03:24"
                tone="neutral"
                avatar="SR"
              />
            </div>

            {/* Service detail */}
            <div className="rounded-lg border border-dark-border bg-dark-bg p-3.5">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
                Service
              </p>
              <KV label="Service" value="payments-api" mono />
              <KV label="Team" value="Payments-Pri" />
              <KV label="Tier" value="Tier 1 · customer-facing" />
              <KV label="Last deploy" value="v1.43.0 (27s ago)" mono highlight />
              <KV label="Region" value="us-west-2 · us-east-1 · eu-west-1" />
            </div>

            {/* Live timeline */}
            <div
              data-pd-timeline
              className="rounded-lg border border-dark-border bg-dark-bg p-3.5"
            >
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
                Incident timeline
              </p>
              <ol className="relative border-l border-[#DC3545]/30 ml-1.5 space-y-2.5">
                <li data-pd-tick className="ml-3">
                  <span className="absolute -left-[5px] mt-1 w-2.5 h-2.5 rounded-full bg-[#DC3545] ring-2 ring-dark-bg" />
                  <p className="text-[10px] font-mono text-[#FF6373] uppercase tracking-wider">
                    Triggered
                  </p>
                  <p className="text-[12px] text-text-primary leading-snug">
                    Datadog monitor fired
                  </p>
                  <p className="text-[10px] text-text-tertiary font-mono">03:14:22 PT</p>
                </li>
                <li data-pd-tick className="ml-3 opacity-40">
                  <span className="absolute -left-[5px] mt-1 w-2.5 h-2.5 rounded-full bg-text-tertiary/40 ring-2 ring-dark-bg" />
                  <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                    Pending
                  </p>
                  <p className="text-[12px] text-text-secondary italic">
                    Awaiting acknowledgement…
                  </p>
                </li>
                <li data-pd-tick className="ml-3 opacity-25">
                  <span className="absolute -left-[5px] mt-1 w-2.5 h-2.5 rounded-full bg-text-tertiary/40 ring-2 ring-dark-bg" />
                  <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                    Pending
                  </p>
                  <p className="text-[12px] text-text-secondary italic">
                    Will escalate to Jordan…
                  </p>
                </li>
              </ol>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="px-6 py-3 border-t border-dark-border bg-dark-bg flex items-center justify-between text-[10.5px] text-text-tertiary font-mono">
            <span>
              Severity:{' '}
              <span className="text-[#FF6373]">P1</span> · Urgency:{' '}
              <span className="text-[#FF6373]">High</span> · Customer impact:{' '}
              <span className="text-text-primary">~1,840 failed requests</span>
            </span>
            <span>
              MTTA target:{' '}
              <span className="text-text-primary">5 min</span> · MTTR target:{' '}
              <span className="text-text-primary">30 min</span>
            </span>
          </div>
        </div>
      </div>
    </section>
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
    <div className="flex items-center gap-2.5 py-1.5">
      <div className="w-7 h-7 rounded-full bg-[#06AC38]/15 border border-[#06AC38]/25 flex items-center justify-center text-[10px] font-bold text-[#57D990] shrink-0">
        {avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1 h-1 rounded-full ${dot}`} />
          <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
            {tier}
          </span>
        </div>
        <p className="text-[12px] text-text-primary font-medium truncate flex items-center gap-1.5">
          <Users className="w-3 h-3 text-text-tertiary" />
          {name}
        </p>
        <p className={`text-[10px] font-mono truncate ${detailColor}`}>{detail}</p>
      </div>
    </div>
  );
}

function KV({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className="text-[11px] text-text-tertiary shrink-0 w-24">{label}</span>
      <span
        className={`text-[11.5px] truncate ${mono ? 'font-mono' : ''} ${
          highlight ? 'text-[#FFB766] font-semibold' : 'text-text-primary'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
