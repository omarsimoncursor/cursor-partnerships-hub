'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { CodeBlock } from '@/components/ui/code-block';
import { Clock, Zap, Shield } from 'lucide-react';

const BEFORE_CODE = `  // BUG: Race condition - check and decrement are not atomic
  const available = await inventory.getCount(item.id);
  if (available >= quantity) {
    await inventory.decrement(item.id, quantity);
    return { status: "confirmed", items: quantity };
  }
  return { status: "partial", items: available };`;

const AFTER_CODE = `  // FIX: Atomic transaction prevents concurrent read/write
  const result = await db.transaction(async (tx) => {
    const available = await inventory.getCount(item.id, { tx });
    if (available >= quantity) {
      await inventory.decrement(item.id, quantity, { tx });
      return { status: "confirmed", items: quantity };
    }
    return { status: "partial", items: available };
  });
  return result;`;

export function FixScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-glfix-before]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        x: -20,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.from('[data-glfix-after]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        },
        opacity: 0,
        x: 20,
        duration: 0.7,
        delay: 0.3,
        ease: 'power3.out',
      });

      gsap.from('[data-glfix-metric]', {
        scrollTrigger: {
          trigger: '[data-glfix-metrics]',
          start: 'top 80%',
        },
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 3</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Root Cause + Fix</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Cursor identifies the race condition and generates a fix that wraps the inventory operations in an atomic transaction.
        </p>

        {/* Before / After diff */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div data-glfix-before>
            <p className="text-xs font-mono text-accent-red mb-2 uppercase tracking-wider">Before</p>
            <CodeBlock
              code={BEFORE_CODE}
              filename="processor.ts (lines 31-37)"
              deletions={[1, 2, 3, 4, 5, 6, 7]}
            />
          </div>
          <div data-glfix-after>
            <p className="text-xs font-mono text-accent-green mb-2 uppercase tracking-wider">After</p>
            <CodeBlock
              code={AFTER_CODE}
              filename="processor.ts (lines 31-40)"
              additions={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
            />
          </div>
        </div>

        {/* AI explanation */}
        <div className="glass-card p-6 mb-12 border-[#FC6D26]/20">
          <h4 className="text-sm font-semibold text-[#FC6D26] mb-3">Cursor&apos;s Explanation</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            The original code reads the inventory count and then decrements it in two separate operations. Under concurrent load, multiple requests can read the same count before any of them decrement, leading to overselling. Wrapping both the check and decrement in a <code className="text-[#FC6D26] font-mono text-xs">db.transaction()</code> ensures atomicity: only one request can modify the inventory at a time, preventing the race condition the test caught.
          </p>
        </div>

        {/* Impact metrics */}
        <div data-glfix-metrics className="grid grid-cols-3 gap-4">
          <div data-glfix-metric className="glass-card p-5 text-center">
            <Clock className="w-6 h-6 text-accent-green mx-auto mb-3" />
            <p className="text-2xl font-bold text-text-primary mb-1">3 min</p>
            <p className="text-xs text-text-tertiary">Time to generate fix</p>
          </div>
          <div data-glfix-metric className="glass-card p-5 text-center">
            <Shield className="w-6 h-6 text-[#FC6D26] mx-auto mb-3" />
            <p className="text-2xl font-bold text-text-primary mb-1">Race condition</p>
            <p className="text-xs text-text-tertiary">Root cause identified</p>
          </div>
          <div data-glfix-metric className="glass-card p-5 text-center">
            <Zap className="w-6 h-6 text-accent-amber mx-auto mb-3" />
            <p className="text-2xl font-bold text-text-primary mb-1">1.5 hrs</p>
            <p className="text-xs text-text-tertiary">Average manual debug time saved</p>
          </div>
        </div>
      </div>
    </section>
  );
}
