'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Code2, Copy, Play, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { applyAccountName, VENDORS, type Vendor, type VendorWorkflowStep } from '@/lib/prospect/vendors';

type ComposerStep = VendorWorkflowStep & {
  vendorId: string;
  vendorName: string;
  vendorBrand: string;
  uid: string;
};

type Preset = {
  name: string;
  description: string;
  steps: { vendorId: string; index: number }[];
};

const PRESETS: Preset[] = [
  {
    name: 'Datadog SLO breach to merged PR',
    description: 'Catch a breach, fix the code, post a Slack update, open the PR.',
    steps: [
      { vendorId: 'datadog', index: 0 },
      { vendorId: 'datadog', index: 1 },
      { vendorId: 'slack', index: 0 },
      { vendorId: 'github', index: 0 },
    ],
  },
  {
    name: 'Sentry error to targeted patch',
    description: 'Pull the Sentry issue, write a failing test, ship a patch with a Jira transition.',
    steps: [
      { vendorId: 'sentry', index: 0 },
      { vendorId: 'sentry', index: 1 },
      { vendorId: 'jira', index: 1 },
      { vendorId: 'github', index: 0 },
    ],
  },
  {
    name: 'Snyk nightly CVE sweep',
    description: 'Pull critical CVEs, apply the lowest-risk fix, open a PR for the security team.',
    steps: [
      { vendorId: 'snyk', index: 0 },
      { vendorId: 'snyk', index: 1 },
      { vendorId: 'github', index: 0 },
    ],
  },
  {
    name: 'Figma design to PR',
    description: 'Pull a Figma frame, sync tokens, pixel-diff, and open a PR.',
    steps: [
      { vendorId: 'figma', index: 0 },
      { vendorId: 'figma', index: 1 },
      { vendorId: 'figma', index: 2 },
      { vendorId: 'github', index: 0 },
    ],
  },
  {
    name: 'Zscaler nightly drift correction',
    description: 'Snapshot live tenant, diff, apply corrections, open the PR for audit.',
    steps: [
      { vendorId: 'zscaler', index: 0 },
      { vendorId: 'zscaler', index: 1 },
      { vendorId: 'github', index: 0 },
    ],
  },
];

let uidCounter = 0;
const nextUid = () => `s-${Date.now().toString(36)}-${(uidCounter++).toString(36)}`;

function buildStep(v: Vendor, index: number): ComposerStep {
  const step = v.composerSteps[index] || v.composerSteps[0];
  return {
    ...step,
    vendorId: v.id,
    vendorName: v.name,
    vendorBrand: v.brand,
    uid: nextUid(),
  };
}

function buildPresetSteps(preset: Preset, available: Vendor[]): ComposerStep[] {
  const byId = new Map(available.map(v => [v.id, v]));
  const out: ComposerStep[] = [];
  for (const ref of preset.steps) {
    const v = byId.get(ref.vendorId);
    if (!v) continue;
    out.push(buildStep(v, ref.index));
  }
  return out;
}

type Props = {
  account: string;
  accent: string;
  vendorIds: string[];
};

export function SdkComposer({ account, accent, vendorIds }: Props) {
  const availableVendors = useMemo(
    () => VENDORS.filter(v => vendorIds.includes(v.id)),
    [vendorIds]
  );

  const initial = useMemo(() => {
    if (availableVendors.length === 0) return [];
    const first = availableVendors[0];
    const last = availableVendors.find(v => v.id === 'github') || availableVendors[availableVendors.length - 1];
    const steps = [buildStep(first, 0)];
    if (last && last.id !== first.id) steps.push(buildStep(last, 0));
    return steps;
    // We only want this to seed once for the initial selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [steps, setSteps] = useState<ComposerStep[]>(initial);
  const [running, setRunning] = useState(false);
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const presetsForStack = useMemo(() => {
    const ids = new Set(vendorIds);
    return PRESETS.filter(p => p.steps.some(s => ids.has(s.vendorId)));
  }, [vendorIds]);

  const addStep = (vendorId: string, index: number) => {
    const v = availableVendors.find(vv => vv.id === vendorId);
    if (!v) return;
    setSteps(prev => [...prev, buildStep(v, index)]);
  };

  const removeStep = (uid: string) => {
    setSteps(prev => prev.filter(s => s.uid !== uid));
  };

  const moveStep = (uid: string, dir: -1 | 1) => {
    setSteps(prev => {
      const idx = prev.findIndex(s => s.uid === uid);
      if (idx === -1) return prev;
      const swap = idx + dir;
      if (swap < 0 || swap >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const loadPreset = (preset: Preset) => {
    const next = buildPresetSteps(preset, availableVendors);
    if (next.length === 0) return;
    setSteps(next);
    setActiveUid(null);
    setRunning(false);
  };

  const code = useMemo(() => buildSdkSnippet(account, steps), [account, steps]);

  const runPlayback = () => {
    if (running || steps.length === 0) return;
    setRunning(true);
    setActiveUid(steps[0].uid);
  };

  useEffect(() => {
    if (!running || !activeUid) return;
    const idx = steps.findIndex(s => s.uid === activeUid);
    if (idx === -1) {
      setRunning(false);
      setActiveUid(null);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      const next = steps[idx + 1];
      if (!next) {
        setRunning(false);
        setActiveUid(null);
      } else {
        setActiveUid(next.uid);
      }
    }, 950);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [running, activeUid, steps]);

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setRunning(false);
    setActiveUid(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard restrictions
    }
  };

  if (availableVendors.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        Pick at least one vendor in the builder to enable the SDK composer.
      </p>
    );
  }

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-6">
      {/* Palette */}
      <aside className="space-y-5">
        <div>
          <h4 className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Presets
          </h4>
          <div className="space-y-2">
            {presetsForStack.length === 0 && (
              <p className="text-xs text-text-tertiary">
                No matching presets for the selected stack.
              </p>
            )}
            {presetsForStack.map(p => (
              <button
                key={p.name}
                onClick={() => loadPreset(p)}
                className="w-full text-left rounded-md border border-dark-border hover:border-dark-border-hover bg-dark-surface hover:bg-dark-surface px-3 py-2 transition-colors"
              >
                <p className="text-xs font-medium text-text-primary mb-0.5 leading-tight">{p.name}</p>
                <p className="text-[11px] text-text-tertiary leading-snug">{p.description}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary mb-3 flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> Step palette
          </h4>
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {availableVendors.map(v =>
              v.composerSteps.map((step, i) => (
                <button
                  key={`${v.id}-${i}`}
                  onClick={() => addStep(v.id, i)}
                  className="w-full text-left rounded-md border border-dark-border hover:border-dark-border-hover bg-dark-surface hover:bg-dark-surface px-2.5 py-2 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ background: v.brand }}
                    />
                    <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: v.brand }}>
                      {v.name}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-text-primary leading-tight">{step.label}</p>
                  <p className="text-[11px] text-text-tertiary leading-snug">{step.detail}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Canvas + code */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runPlayback}
            disabled={running || steps.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-all"
            style={{ background: accent, color: '#0a0a0a' }}
          >
            <Play className="w-3.5 h-3.5" />
            {running ? 'Replaying...' : 'Replay workflow'}
          </button>
          {(running || activeUid) && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs text-text-tertiary hover:text-text-primary border border-dark-border hover:border-dark-border-hover transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          <button
            onClick={() => setSteps([])}
            disabled={steps.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs text-text-tertiary hover:text-text-primary border border-dark-border hover:border-dark-border-hover transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
          <span className="text-[11px] text-text-tertiary font-mono ml-auto">
            {steps.length} step{steps.length === 1 ? '' : 's'}
          </span>
        </div>

        {steps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-dark-border p-10 text-center">
            <p className="text-sm text-text-secondary mb-1">Workflow is empty.</p>
            <p className="text-xs text-text-tertiary">
              Add steps from the palette on the left, or load a preset.
            </p>
          </div>
        ) : (
          <ol className="space-y-2">
            {steps.map((s, i) => {
              const isActive = running && activeUid === s.uid;
              const isDone = running && steps.findIndex(x => x.uid === activeUid) > i;
              return (
                <li
                  key={s.uid}
                  className="grid grid-cols-[auto_1fr_auto] items-stretch gap-3 rounded-lg border px-3 py-2.5 transition-all"
                  style={{
                    borderColor: isActive ? `${s.vendorBrand}66` : isDone ? `${s.vendorBrand}33` : 'rgba(237,236,236,0.08)',
                    background: isActive ? `${s.vendorBrand}14` : isDone ? `${s.vendorBrand}08` : 'rgba(237,236,236,0.02)',
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono"
                      style={{
                        background: isDone ? s.vendorBrand : 'transparent',
                        color: isDone ? '#0a0a0a' : s.vendorBrand,
                        border: !isDone ? `1px solid ${s.vendorBrand}55` : 'none',
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[10px] uppercase tracking-wider font-mono"
                        style={{ color: s.vendorBrand }}
                      >
                        {s.vendorName}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-text-primary animate-pulse">
                          running
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text-primary leading-tight">{s.label}</p>
                    <p className="text-[11px] text-text-tertiary mb-1.5">{applyAccountName(s.detail, account)}</p>
                    <pre className="text-[11px] font-mono px-2 py-1 rounded bg-dark-bg border border-dark-border overflow-x-auto" style={{ color: s.vendorBrand }}>
                      {s.code}
                    </pre>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => moveStep(s.uid, -1)}
                      disabled={i === 0}
                      className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-20"
                      aria-label="Move step up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveStep(s.uid, 1)}
                      disabled={i === steps.length - 1}
                      className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-20"
                      aria-label="Move step down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeStep(s.uid)}
                      className="p-1 text-text-tertiary hover:text-accent-red"
                      aria-label="Remove step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border bg-dark-surface">
            <span className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary inline-flex items-center gap-1.5">
              <Code2 className="w-3 h-3" /> Generated SDK workflow
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-[12px] font-mono leading-relaxed text-text-primary overflow-x-auto whitespace-pre">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
}

function buildSdkSnippet(account: string, steps: ComposerStep[]): string {
  const importLines = ["import { CursorAgent } from '@cursor/sdk';"];
  const seenVendors = new Set<string>();
  for (const s of steps) {
    if (!seenVendors.has(s.vendorId)) {
      seenVendors.add(s.vendorId);
      importLines.push(`import { ${s.vendorId} } from '@cursor/sdk/integrations/${s.vendorId}';`);
    }
  }

  const body =
    steps.length === 0
      ? '  // Add steps from the palette to render code'
      : steps.map(s => `  // ${s.vendorName}: ${s.label}\n  ${s.code};`).join('\n\n');

  return `${importLines.join('\n')}

// Branded for ${account}. Run on a schedule, in CI, or as a Cursor cloud agent.
const agent = new CursorAgent({ account: '${account.toLowerCase()}' });

await agent.run(async (cursor) => {
${body}
});`;
}
