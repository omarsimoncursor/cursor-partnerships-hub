'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { applyAccountName, type Vendor } from '@/lib/prospect/vendors';
import { VendorStage } from './stages';

type Props = {
  vendor: Vendor;
  account: string;
  pageAccent: string;
};

export function GenericWorkflowScenes({ vendor, account, pageAccent }: Props) {
  const { scenario } = vendor;
  const accent = vendor.brand;

  return (
    <div>
      {scenario.steps.map((step, index) => (
        <GenericWorkflowAct
          key={index}
          actNumber={index + 1}
          totalActs={scenario.steps.length}
          label={step.label}
          detail={applyAccountName(step.detail, account)}
          code={step.code}
          vendor={vendor}
          account={account}
          pageAccent={pageAccent}
          stepIndex={index}
          accent={accent}
        />
      ))}

      <OutcomesAct
        vendor={vendor}
        account={account}
        accent={accent}
        actNumber={scenario.steps.length + 1}
      />
    </div>
  );
}

function GenericWorkflowAct({
  actNumber,
  totalActs,
  label,
  detail,
  code,
  vendor,
  account,
  pageAccent,
  stepIndex,
  accent,
}: {
  actNumber: number;
  totalActs: number;
  label: string;
  detail: string;
  code: string;
  vendor: Vendor;
  account: string;
  pageAccent: string;
  stepIndex: number;
  accent: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-act-header]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.from('[data-act-panel]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        opacity: 0,
        y: 32,
        duration: 0.85,
        delay: 0.15,
        ease: 'power3.out',
      });

      gsap.from('[data-act-code]', {
        scrollTrigger: { trigger: '[data-act-panel]', start: 'top 80%' },
        opacity: 0,
        x: -12,
        duration: 0.6,
        delay: 0.35,
        ease: 'power2.out',
      });

      gsap.from('[data-act-bar]', {
        scrollTrigger: { trigger: '[data-act-metrics]', start: 'top 85%' },
        scaleX: 0,
        transformOrigin: 'left',
        stagger: 0.06,
        duration: 0.7,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div data-act-header className="flex items-center gap-3 mb-6">
          <span
            className="text-xs font-mono px-3 py-1 rounded-full"
            style={{ background: `${accent}1a`, color: accent }}
          >
            Act {actNumber} of {totalActs}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-text-primary">{label}</h3>
        </div>
        <p data-act-header className="text-text-secondary mb-10 max-w-2xl leading-relaxed">
          {detail}
        </p>

        <div
          data-act-panel
          className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden"
          style={{ borderColor: `${accent}33` }}
        >
          <div className="px-5 py-3 border-b border-dark-border flex items-center gap-2 text-[11px] font-mono text-text-tertiary">
            <Cpu className="w-3.5 h-3.5" style={{ color: accent }} />
            Cursor agent step {actNumber}
          </div>

          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            <div className="p-5 lg:border-r border-dark-border min-h-[220px]">
              <VendorStage
                vendor={vendor}
                totalSteps={vendor.scenario.steps.length}
                activeStep={stepIndex}
                status="running"
                account={account}
                brand={accent}
                pageAccent={pageAccent}
              />
            </div>

            <div className="p-5 space-y-4">
              <div data-act-metrics className="space-y-2">
                {[72, 58, 84, 46].map((width, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-tertiary w-16">metric {i + 1}</span>
                    <div className="flex-1 h-2 rounded-full bg-dark-bg overflow-hidden">
                      <div
                        data-act-bar
                        className="h-full rounded-full"
                        style={{ width: `${width}%`, background: accent }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <pre
                data-act-code
                className="text-[11px] font-mono px-3 py-2.5 rounded-lg bg-dark-bg border border-dark-border overflow-x-auto"
                style={{ color: accent }}
              >
                {code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OutcomesAct({
  vendor,
  account,
  accent,
  actNumber,
}: {
  vendor: Vendor;
  account: string;
  accent: string;
  actNumber: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-outcome-card]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.65,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-6 md:px-10 border-t border-dark-border">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span
            className="text-xs font-mono px-3 py-1 rounded-full"
            style={{ background: `${accent}1a`, color: accent }}
          >
            Act {actNumber}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-text-primary">Outcome for {account}</h3>
        </div>

        <ul className="grid sm:grid-cols-3 gap-3">
          {vendor.scenario.outcomes.map((outcome, i) => (
            <li
              key={i}
              data-outcome-card
              className="rounded-lg border p-4 bg-dark-surface"
              style={{ borderColor: `${accent}33` }}
            >
              <CheckCircle2 className="w-4 h-4 text-accent-green mb-2" />
              <p className="text-sm text-text-secondary leading-snug flex gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-accent-green shrink-0 mt-0.5" />
                <span>{applyAccountName(outcome, account)}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
