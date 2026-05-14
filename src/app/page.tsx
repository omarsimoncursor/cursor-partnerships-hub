'use client';

import { Footer } from '@/components/layout/footer';
import { DemoWorkflows } from '@/components/sections/demo-workflows';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

// Customer-facing landing page. The thesis is simple: Cursor brings
// agentic automation to the technology stacks customers already use.
// Below the hero we render only the demo-workflow showcase so visitors
// can jump straight into a live workflow for the tools they recognize.
//
// Internal partner-facing material (3-way co-sell economics, target
// account grid, prospect builder) still lives at /partnerships and the
// other unlinked routes for anyone with a direct link.
export default function Home() {
  useSmoothScroll();

  return (
    <>
      <main>
        <section className="pt-28 pb-14 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary mb-5">
              Agentic Workflows
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary mb-5">
              Cursor brings agentic automation to existing technology stacks.
            </h1>
            <p className="text-lg text-text-secondary max-w-3xl">
              Pick a tool your team already runs and watch Cursor&apos;s agent take
              it from signal to shipped fix — no rip-and-replace, no new
              dashboard to learn.
            </p>
          </div>
        </section>
        <DemoWorkflows />
      </main>
      <Footer />
    </>
  );
}
