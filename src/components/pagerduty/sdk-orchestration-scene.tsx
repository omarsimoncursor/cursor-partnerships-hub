'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap-init';
import { Brain, Code2, Database, Megaphone } from 'lucide-react';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { FlowPipe } from '@/components/shared/flow-pipe';
import { SdkCodePanel, SDK_SUBAGENTS_SAMPLE } from './sdk-code-panel';

// Act 3 — Multi-subagent orchestration. Mirrors Datadog's analysis-scene
// pipeline + typing terminal, but the three stages are SDK subagents and the
// terminal renders a real `for await (const e of run.stream())` event log.

const PIPELINE_STAGES = [
  {
    icon: Brain,
    model: 'claude-opus-4-thinking',
    modelColor: '#A259FF',
    role: 'triage subagent',
    description:
      'Reads PagerDuty + Datadog APM + git log in parallel. Owns the revert-vs-fix-forward decision. Cites confidence + rationale.',
    detail: 'decision: revert · confidence: 0.93',
  },
  {
    icon: Code2,
    model: 'composer-2',
    modelColor: '#60A5FA',
    role: 'revert subagent',
    description:
      'Generates the revert commit. Scoped to one repo, write-only on src/lib/payments/. Runs typecheck + unit tests before pushing.',
    detail: '1 file · −218 +4 · pure subtractive',
  },
  {
    icon: Megaphone,
    model: 'composer-2',
    modelColor: '#3DB46D',
    role: 'comms subagent',
    description:
      'Posts Statuspage updates and a single Slack #ops summary. No code access. Brand-voice template enforced.',
    detail: '3 Statuspage updates · 1 Slack post',
  },
];

const STREAM_LINES = [
  { text: '// for await (const event of run.stream()) {', prefix: '', color: '#7B8794' },
  { text: '', prefix: '' },
  { text: '[+00.4s] sdk.run.start', prefix: '>', color: '#82AAFF' },
  { text: '         repo: github.com/acme/payments-api', prefix: '' },
  { text: '         token-budget: 50,000', prefix: '' },
  { text: '', prefix: '' },
  {
    text: '[+12.4s] sdk.subagent.spawn  triage',
    prefix: '>',
    color: '#A259FF',
  },
  { text: '         model: claude-opus-4-thinking', prefix: '' },
  { text: '         tools: [pagerduty.read, datadog.read, github.read]', prefix: '' },
  { text: '', prefix: '' },
  {
    text: '[+13.1s] sdk.tool.call       triage  pagerduty.fetchIncident',
    prefix: '>',
    color: '#06AC38',
  },
  { text: "         { id: 'INC-21487' } -> 1.4kB JSON", prefix: '' },
  {
    text: '[+13.7s] sdk.tool.call       triage  datadog.fetchTrace',
    prefix: '>',
    color: '#A689D4',
  },
  { text: '         13 spans · 7.4% 5xx · burn rate 36×', prefix: '' },
  { text: '', prefix: '' },
  {
    text: '[+15.8s] sdk.decision        triage',
    prefix: '>',
    color: '#4ADE80',
  },
  { text: "         { decision: 'revert',", prefix: '' },
  { text: '           confidence: 0.93,', prefix: '' },
  {
    text: "           rationale: 'fix-forward needs schema migration' }",
    prefix: '',
  },
  { text: '', prefix: '' },
  {
    text: '[+16.0s] sdk.subagent.spawn  revert       (parallel)',
    prefix: '>',
    color: '#60A5FA',
  },
  { text: "         model: composer-2 · scope: 'src/lib/payments/'", prefix: '' },
  {
    text: '[+16.0s] sdk.subagent.spawn  comms        (parallel)',
    prefix: '>',
    color: '#3DB46D',
  },
  { text: "         model: composer-2 · scope: 'statuspage|slack'", prefix: '' },
  { text: '', prefix: '' },
  {
    text: '[+17.1s] sdk.pull_request.opened  revert',
    prefix: '>',
    color: '#82AAFF',
  },
  { text: '         github.com/acme/payments-api/pull/318', prefix: '' },
  {
    text: '[+17.4s] sdk.statuspage.update    comms   "Investigating"',
    prefix: '>',
    color: '#3DB46D',
  },
  { text: '', prefix: '' },
  { text: '// } // run.stream()', prefix: '', color: '#7B8794' },
];

export function SdkOrchestrationScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-pd-pipe-stage]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-pd-pipe-arrow]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        opacity: 0,
        scale: 0,
        stagger: 0.3,
        duration: 0.4,
        delay: 0.8,
        ease: 'back.out(2)',
      });

      gsap.from('[data-pd-stream]', {
        scrollTrigger: {
          trigger: '[data-pd-stream]',
          start: 'top 80%',
          onEnter: () => setShowTyping(true),
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-pd-subagent-code]', {
        scrollTrigger: { trigger: '[data-pd-subagent-code]', start: 'top 85%' },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">
            Act 3
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            Multi-Subagent Orchestration via the SDK
          </h2>
        </div>
        <p className="text-text-secondary mb-4 max-w-2xl">
          The Cursor SDK&apos;s parent agent spawns three async subagents — each with its own
          model, scope, and tool allowlist. Triage owns the decision; revert and comms run in
          parallel after the decision lands.
        </p>
        <div className="flex items-center gap-2 mb-12">
          <Database className="w-4 h-4 text-accent-blue" />
          <span className="text-sm text-accent-blue font-medium">
            Cursor 2.5 async subagents &mdash; subagents can spawn their own subagents
          </span>
        </div>

        {/* Pipeline visualization */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0 mb-12">
          {PIPELINE_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={i} className="flex items-center flex-1">
                <div data-pd-pipe-stage className="glass-card p-5 flex-1 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stage.modelColor}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: stage.modelColor }} />
                    </div>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full truncate max-w-[120px]"
                      style={{
                        backgroundColor: `${stage.modelColor}15`,
                        color: stage.modelColor,
                      }}
                    >
                      {stage.model}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">{stage.role}</h3>
                  <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                    {stage.description}
                  </p>
                  <div className="pt-3 border-t border-dark-border">
                    <p className="text-[10px] text-text-tertiary uppercase mb-1">Output</p>
                    <p
                      className="text-xs font-mono break-words"
                      style={{ color: stage.modelColor }}
                    >
                      {stage.detail}
                    </p>
                  </div>
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-5"
                    style={{ backgroundColor: stage.modelColor }}
                  />
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div
                    data-pd-pipe-arrow
                    className="hidden md:flex items-center justify-center w-16 shrink-0"
                  >
                    <FlowPipe
                      width={64}
                      height={40}
                      color={PIPELINE_STAGES[i + 1].modelColor}
                      packetCount={2}
                      duration={1.4}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SDK run.stream() terminal */}
        <div
          data-pd-stream
          className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden mb-10"
        >
          <div className="px-4 py-2 border-b border-dark-border bg-dark-bg flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#A259FF]" />
            <span className="text-xs text-text-tertiary font-mono">
              run.stream() &mdash; normalized SDK events
            </span>
            <span className="ml-auto text-[10px] font-mono text-accent-green flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              streaming
            </span>
          </div>
          <div className="p-4 min-h-[420px] font-mono">
            {showTyping && <TypingAnimation lines={STREAM_LINES} speed={12} className="text-xs" />}
          </div>
        </div>

        {/* Subagents code snippet */}
        <div data-pd-subagent-code>
          <SdkCodePanel
            tabs={[SDK_SUBAGENTS_SAMPLE]}
            accentColor="#A259FF"
            title="Each subagent is a few lines of config"
            badge="@cursor/sdk · subagents"
          />
        </div>
      </div>
    </section>
  );
}
