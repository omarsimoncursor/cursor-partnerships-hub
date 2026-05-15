'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, PlayCircle, Shield, Cloud, Cpu, Globe2 } from 'lucide-react';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

export default function CloudflarePartnership() {
  useSmoothScroll();

  return (
    <div className="min-h-screen">
      {/* Minimal nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partnerships
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Partnership Demo</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#F38020]/20 border border-[#F38020]/30 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-[#FAAE40]" />
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            Cloudflare sees the whole internet.
            <span className="block text-[#FAAE40]">Cursor acts on what it sees.</span>
          </h1>
          <p className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            When Cloudflare detects an L7 attack, a credential-stuffing wave, or a misbehaving ASN, Cursor coordinates a 3-layer mitigation across edge config, Workers, and application code &mdash; all without paging a human.
          </p>
          <p className="text-sm text-text-tertiary mb-8 max-w-lg mx-auto">
            One signal. Three defense layers. From edge WAF rule to app-side detector PR in under 3 minutes.
          </p>

          {/* Live demo CTA */}
          <div className="flex justify-center">
            <Link
              href="/partnerships/cloudflare/demo"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                         bg-[#F38020] text-white font-medium text-sm
                         hover:bg-[#FAAE40] transition-all duration-200
                         shadow-[0_0_32px_rgba(243,128,32,0.35)] hover:shadow-[0_0_48px_rgba(243,128,32,0.5)]"
            >
              <PlayCircle className="w-4 h-4" />
              Run the live edge-mitigation demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Acts — short narrative-style sections (text only) */}
      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-mono text-[#FAAE40] uppercase tracking-[0.2em] mb-3">
            Act 1 · The signal
          </p>
          <h2 className="text-3xl font-semibold text-text-primary mb-4">
            Bot Management score collapses on /api/auth/login.
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Cloudflare Bot Management observes 87% of new sessions on{' '}
            <span className="font-mono text-text-primary">/api/auth/login</span> scoring below 5 within
            90 seconds. The Logpush integration shows 4.3M auth attempts at 0.4% success
            rate &mdash; a textbook credential-stuffing wave. Source ASN 14618 dominates the source
            distribution. The webhook fires.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-mono text-[#FAAE40] uppercase tracking-[0.2em] mb-3">
            Act 2 · The plan
          </p>
          <h2 className="text-3xl font-semibold text-text-primary mb-4">
            Three layers, one workflow.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <PlanCard
              icon={<Shield className="w-4 h-4" />}
              layer="Layer 1 — Edge WAF rule"
              detail="Narrow scope: ASN + UA + endpoint. Log mode → 60s observe → Block. Auto-rollback on first false positive."
            />
            <PlanCard
              icon={<Cpu className="w-4 h-4" />}
              layer="Layer 2 — Worker rate-limit"
              detail="Tightens per-IP rate-limit for low-bot-score traffic. Deployed via wrangler to canary, then production."
            />
            <PlanCard
              icon={<Globe2 className="w-4 h-4" />}
              layer="Layer 3 — App-side detector"
              detail="CAPTCHA on suspicious-IP, lockout-threshold tightening. Draft PR — security-team review required."
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-mono text-[#FAAE40] uppercase tracking-[0.2em] mb-3">
            Act 3 · The trust
          </p>
          <h2 className="text-3xl font-semibold text-text-primary mb-4">
            Guardrails &mdash; not guesswork.
          </h2>
          <p className="text-text-secondary leading-relaxed">
            The agent is bounded by hard rules: WAF rules always deploy in Log mode first.
            Whole-country / whole-ASN blocks always require a human. Workers ship via canary.
            Application authentication code never auto-merges. Every action flushes to SIEM via
            Cloudflare Logpush.
          </p>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            See it run.
          </h2>
          <p className="text-text-secondary mb-8">
            One click simulates a credential-stuffing wave on a pixel-perfect Cloudflare Analytics
            dashboard. Watch the dashboard recover in real time as the agent ships each mitigation.
          </p>
          <Link
            href="/partnerships/cloudflare/demo"
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full
                       bg-[#F38020] text-white font-semibold text-base
                       hover:bg-[#FAAE40] transition-all duration-200
                       shadow-[0_0_32px_rgba(243,128,32,0.4)]"
          >
            <PlayCircle className="w-4 h-4" />
            Run the live demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <div className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/partnerships/datadog"
            className="example-cta-pulse group block rounded-xl border-2 p-8 transition-all duration-300 hover:scale-[1.02]"
            style={{
              borderColor: 'rgba(99, 44, 166, 0.5)',
              backgroundColor: 'rgba(99, 44, 166, 0.12)',
              ['--pulse-color' as string]: 'rgba(99, 44, 166, 0.3)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#A689D4]">
                  Next Partnership Demo
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                  Datadog + Cursor: From SLO Breach to Automated PR
                </h3>
                <p className="text-sm text-text-primary/70 leading-relaxed">
                  See how Datadog catches a P99 SLO breach and Cursor parallelizes the slow path in 2 minutes flat.
                </p>
              </div>
              <div className="shrink-0 w-14 h-14 rounded-full bg-[#632CA6]/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRight className="w-6 h-6 text-[#A689D4]" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ icon, layer, detail }: { icon: React.ReactNode; layer: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-5">
      <div className="w-9 h-9 rounded-lg bg-[#F38020]/15 border border-[#F38020]/30 flex items-center justify-center text-[#FAAE40] mb-3">
        {icon}
      </div>
      <p className="text-[11px] font-mono text-[#FAAE40] uppercase tracking-wider mb-1.5">{layer}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}
