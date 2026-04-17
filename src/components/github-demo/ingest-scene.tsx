'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap-init';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { Folder, File, FolderOpen, Search, Brain, CheckCircle2 } from 'lucide-react';

const FILE_TREE_ITEMS = [
  { name: 'src', type: 'folder', indent: 0, delay: 0 },
  { name: 'services', type: 'folder', indent: 1, delay: 0.1 },
  { name: 'auth', type: 'folder', indent: 2, delay: 0.2 },
  { name: 'session-manager.ts', type: 'file', indent: 3, delay: 0.25, scanned: true },
  { name: 'token-store.ts', type: 'file', indent: 3, delay: 0.3, scanned: true },
  { name: 'token-refresh.ts', type: 'file', indent: 3, delay: 0.35, scanned: true },
  { name: 'legacy-auth.ts', type: 'file', indent: 3, delay: 0.4, scanned: true },
  { name: 'payment', type: 'folder', indent: 2, delay: 0.5 },
  { name: 'gateway.ts', type: 'file', indent: 3, delay: 0.55 },
  { name: 'stripe-client.ts', type: 'file', indent: 3, delay: 0.6 },
  { name: 'middleware', type: 'folder', indent: 1, delay: 0.7 },
  { name: 'rate-limiter.ts', type: 'file', indent: 2, delay: 0.75, scanned: true },
  { name: 'cors.ts', type: 'file', indent: 2, delay: 0.8 },
  { name: 'auth-guard.ts', type: 'file', indent: 2, delay: 0.85, scanned: true },
  { name: 'api', type: 'folder', indent: 1, delay: 0.9 },
  { name: 'users', type: 'folder', indent: 2, delay: 0.95 },
  { name: 'profile.ts', type: 'file', indent: 3, delay: 1.0, scanned: true },
  { name: 'settings.ts', type: 'file', indent: 3, delay: 1.05 },
  { name: 'utils', type: 'folder', indent: 1, delay: 1.1 },
  { name: 'cache.ts', type: 'file', indent: 2, delay: 1.15, scanned: true },
  { name: 'redis-client.ts', type: 'file', indent: 2, delay: 1.2, scanned: true },
  { name: 'config.ts', type: 'file', indent: 2, delay: 1.25 },
];

const ANALYSIS_LINES = [
  { text: 'Indexing repository...', prefix: '>' },
  { text: 'Parsing 127 TypeScript files across 23 modules...', prefix: '>' },
  { text: 'Building dependency graph...', prefix: '>' },
  { text: '', prefix: '' },
  { text: 'PR #347 context loaded:', prefix: '>', color: '#60a5fa' },
  { text: '  6 files changed, 236 additions, 199 deletions', color: '#60a5fa' },
  { text: '  3 review comments flagging code issues', color: '#d29922' },
  { text: '', prefix: '' },
  { text: 'Cross-referencing with codebase patterns...', prefix: '>' },
  { text: '  Found 8 files related to review feedback', color: '#4ade80' },
  { text: '  Identified shared patterns in auth module', color: '#4ade80' },
  { text: '  Mapped dependency chain: 4 downstream consumers', color: '#4ade80' },
  { text: '', prefix: '' },
  { text: 'Context ready. Preparing refactor plan...', prefix: '>', color: '#4ade80' },
];

const INGEST_STEPS = [
  { icon: Search, label: 'Indexing repository', detail: '127 files parsed' },
  { icon: Folder, label: 'Loading PR context', detail: '6 changed files + 3 comments' },
  { icon: Brain, label: 'Cross-referencing patterns', detail: '8 related files identified' },
  { icon: CheckCircle2, label: 'Context ready', detail: 'Full dependency map built' },
];

export function IngestScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-ingest-tree]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-tree-item]', {
        scrollTrigger: {
          trigger: '[data-ingest-tree]',
          start: 'top 80%',
        },
        opacity: 0,
        x: -10,
        stagger: 0.04,
        duration: 0.3,
        delay: 0.5,
        ease: 'power3.out',
      });

      gsap.from('[data-ingest-panel]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          onEnter: () => setShowTyping(true),
        },
        opacity: 0,
        x: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-ingest-step]', {
        scrollTrigger: {
          trigger: '[data-ingest-steps]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 15,
        stagger: 0.2,
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
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 2</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Cursor Ingests the Repo</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Cursor indexes the entire repository, loads the PR context with review comments, and maps dependencies across the codebase.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* File tree with scanning animation */}
          <div data-ingest-tree className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
            <div className="px-4 py-2 border-b border-dark-border bg-dark-bg flex items-center gap-2">
              <Search className="w-4 h-4 text-accent-blue" />
              <span className="text-xs text-text-tertiary font-mono">Scanning repository</span>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {FILE_TREE_ITEMS.map((item, i) => (
                <div
                  key={i}
                  data-tree-item
                  className={`flex items-center gap-1.5 py-1 text-xs ${
                    item.scanned ? 'text-[#238636]' : 'text-[#8b949e]'
                  }`}
                  style={{ paddingLeft: `${item.indent * 14 + 4}px` }}
                >
                  {item.type === 'folder' ? (
                    <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <File className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="font-mono">{item.name}</span>
                  {item.scanned && (
                    <CheckCircle2 className="w-3 h-3 text-[#238636] ml-auto shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-dark-border bg-dark-bg">
              <div className="flex items-center justify-between text-[10px] text-text-tertiary">
                <span>127 files indexed</span>
                <span className="text-[#238636]">8 files relevant to PR</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-[#238636] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Analysis terminal */}
          <div data-ingest-panel className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
            <div className="px-4 py-2 border-b border-dark-border bg-dark-bg flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent-blue" />
              <span className="text-xs text-text-tertiary">Cursor Context Engine</span>
            </div>
            <div className="p-4 min-h-[320px]">
              {showTyping && (
                <TypingAnimation
                  lines={ANALYSIS_LINES}
                  speed={20}
                  className="text-xs"
                />
              )}
            </div>
          </div>
        </div>

        {/* Ingest steps */}
        <div data-ingest-steps className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INGEST_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} data-ingest-step className="glass-card p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-blue/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent-blue" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">{step.label}</p>
                  <p className="text-[10px] text-text-tertiary">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
