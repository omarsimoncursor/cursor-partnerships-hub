'use client';

import clsx from 'clsx';
import { SDK_TOOL_CATALOG, type SdkToolDef } from '@/lib/demo-pack/sdk-tools';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

type Props = {
  orderedIds: string[];
  onChange: (ids: string[]) => void;
};

export function SdkWorkflowBuilder({ orderedIds, onChange }: Props) {
  const steps = orderedIds.map(id => SDK_TOOL_CATALOG.find(t => t.id === id)).filter(Boolean) as SdkToolDef[];

  const addTool = (id: string) => {
    if (orderedIds.includes(id)) return;
    onChange([...orderedIds, id]);
  };

  const removeAt = (i: number) => {
    onChange(orderedIds.filter((_, j) => j !== i));
  };

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= orderedIds.length) return;
    const next = [...orderedIds];
    const t = next[from]!;
    next[from] = next[to]!;
    next[to] = t;
    onChange(next);
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 glass-card p-4 max-h-[380px] overflow-y-auto border-dark-border">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-3">Tool palette</h4>
        <div className="space-y-1.5">
          {SDK_TOOL_CATALOG.map(tool => (
            <button
              key={tool.id}
              type="button"
              onClick={() => addTool(tool.id)}
              className={clsx(
                'w-full text-left rounded-lg px-3 py-2 text-sm transition-colors border',
                orderedIds.includes(tool.id)
                  ? 'border-[var(--prospect-accent-soft)] bg-[var(--prospect-accent-soft)]/40 text-text-primary'
                  : 'border-transparent hover:bg-dark-surface-hover text-text-secondary hover:text-text-primary'
              )}
            >
              <span className="font-mono text-xs text-[var(--prospect-accent,#60a5fa)]">{tool.label}</span>
              <span className="block text-xs text-text-tertiary mt-0.5">{tool.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-3 glass-card p-4 border-[var(--prospect-accent-soft)] min-h-[200px]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Workflow (ordered)</h4>
          <span className="text-xs text-text-tertiary">{steps.length} steps</span>
        </div>
        {steps.length === 0 ? (
          <p className="text-sm text-text-tertiary py-8 text-center">
            Add tools from the palette. Order reflects how Cursor&apos;s agent can chain repository work, MCP calls,
            and long-running tasks.
          </p>
        ) : (
          <ol className="space-y-2">
            {steps.map((tool, i) => (
              <li
                key={`${tool.id}-${i}`}
                className="flex gap-2 items-stretch rounded-lg bg-dark-surface/80 border border-dark-border px-2 py-2"
              >
                <div className="flex flex-col justify-center shrink-0 text-text-tertiary">
                  <button
                    type="button"
                    aria-label="Move up"
                    className="p-0.5 hover:text-text-primary disabled:opacity-30"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    className="p-0.5 hover:text-text-primary disabled:opacity-30"
                    disabled={i === steps.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <span className="font-mono text-xs text-[var(--prospect-accent,#60a5fa)]">{tool.label}</span>
                  <p className="text-xs text-text-secondary mt-0.5 leading-snug">{tool.description}</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove step"
                  onClick={() => removeAt(i)}
                  className="shrink-0 self-center p-2 rounded-md text-text-tertiary hover:text-accent-red hover:bg-dark-surface-hover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export function SdkWorkflowIllustrated({ orderedIds }: Pick<Props, 'orderedIds'>) {
  const steps = orderedIds.map(id => SDK_TOOL_CATALOG.find(t => t.id === id)).filter(Boolean) as SdkToolDef[];
  if (steps.length === 0)
    return (
      <p className="text-sm text-text-tertiary">
        Configure the SDK workflow builder to show a stitched narrative for stakeholders.
      </p>
    );
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface/50 p-6 font-mono text-xs overflow-x-auto">
      <pre className="text-text-secondary whitespace-pre-wrap leading-relaxed">
        <span className="text-[var(--prospect-accent,#60a5fa)]">workflow</span>
        {' {\n'}
        {steps.map((s, i) => (
          <span key={`${s.id}-${i}`}>
            {'  '}
            <span className="text-accent-amber">{i + 1}</span>. {s.label}
            {'  '}<span className="text-text-tertiary">— {s.description}</span>
            {'\n'}
          </span>
        ))}
        {'}'}
      </pre>
    </div>
  );
}
