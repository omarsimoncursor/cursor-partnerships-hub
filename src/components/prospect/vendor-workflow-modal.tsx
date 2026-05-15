'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { applyAccountName, type Vendor } from '@/lib/prospect/vendors';
import { getVendorWorkflowScenes } from '@/lib/prospect/vendor-workflow-scenes';
import { GenericWorkflowScenes } from '@/components/prospect/generic-workflow-scenes';
import { track } from '@/lib/prospect/tracker';

type Props = {
  vendor: Vendor;
  account: string;
  pageAccent: string;
  onClose: () => void;
};

export function VendorWorkflowModal({ vendor, account, pageAccent, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const accent = vendor.brand;
  const sceneEntry = getVendorWorkflowScenes(vendor.id);
  const headline = applyAccountName(vendor.scenario.headline, account);
  const subheadline = applyAccountName(vendor.scenario.subheadline, account);

  useEffect(() => {
    track('vendor.modal.open', { vendor: vendor.id });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [vendor.id]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (arguments.length) {
          scroller.scrollTop = value ?? 0;
        }
        return scroller.scrollTop;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: scroller.clientWidth,
          height: scroller.clientHeight,
        };
      },
    });

    ScrollTrigger.defaults({ scroller });

    const ctx = gsap.context(() => {
      gsap.from('[data-modal-hero]', {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
      });
    }, scrollRef);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(refreshTimer);
      ctx.revert();
      ScrollTrigger.defaults({ scroller: window });
      ScrollTrigger.scrollerProxy(scroller, undefined);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.scroller === scroller) trigger.kill();
      });
    };
  }, [onClose, vendor.id]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-dark-bg/95 backdrop-blur-md">
      <header
        className="shrink-0 px-5 md:px-8 py-4 border-b flex items-center gap-4"
        style={{ borderColor: `${accent}33`, background: `${accent}0a` }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
          style={{ background: `${accent}25`, color: accent }}
        >
          {vendor.logo ? (
            <img src={vendor.logo} alt={`${vendor.name} logo`} className="w-full h-full object-contain p-1.5" />
          ) : (
            vendor.name.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: accent }}>
            {vendor.name} + Cursor workflow
          </p>
          <h2 className="text-base md:text-lg font-semibold text-text-primary truncate">{headline}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg border border-dark-border text-text-secondary hover:text-text-primary hover:bg-dark-surface transition-colors"
          aria-label="Close workflow"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <section className="px-6 md:px-10 pt-12 pb-8 text-center border-b border-dark-border">
          <div className="max-w-2xl mx-auto">
            <div data-modal-hero className="inline-flex items-center gap-3 mb-6">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden"
                style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}44` }}
              >
                {vendor.logo ? (
                  <img src={vendor.logo} alt="" className="w-full h-full object-contain p-2" />
                ) : (
                  vendor.name.charAt(0)
                )}
              </div>
              <span className="text-text-tertiary text-xl">+</span>
              <div className="w-11 h-11 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                C
              </div>
            </div>
            <h3 data-modal-hero className="text-2xl md:text-4xl font-bold text-text-primary mb-4">
              {headline}
            </h3>
            <p data-modal-hero className="text-sm md:text-base text-text-secondary leading-relaxed mb-3">
              {subheadline}
            </p>
            <p data-modal-hero className="text-xs text-text-tertiary inline-flex items-center gap-1.5">
              Scroll to experience the workflow
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </p>
          </div>
        </section>

        {sceneEntry ? (
          sceneEntry.scenes.map((Scene, index) => <Scene key={`${vendor.id}-scene-${index}`} />)
        ) : (
          <GenericWorkflowScenes vendor={vendor} account={account} pageAccent={pageAccent} />
        )}

        <div className="h-16" />
      </div>
    </div>
  );
}
