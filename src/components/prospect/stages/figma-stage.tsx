'use client';

import type { StageProps } from './types';

export function FigmaStage({ activeStep, status, account, brand, pageAccent }: StageProps) {
  const isComplete = status === 'complete';
  const showJsx = activeStep >= 2 || isComplete;
  const showDiff = activeStep >= 3 || isComplete;

  // Use the prospect's accent on the rendered "production preview" so it
  // visually proves the agent emitted code branded for the account.
  const previewAccent = pageAccent;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg/70 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface/60">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          figma.com / {account.toLowerCase()} / Checkout v3 — frame
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}22`, color: brand }}>
          FIGMA MCP
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-dark-border">
        {/* LEFT: Figma canvas */}
        <div className="relative p-3 bg-[#1e1e1e]">
          <p className="text-[9px] font-mono uppercase tracking-wider text-text-tertiary mb-2">design / checkout-v3</p>
          <div className="rounded-lg p-3 space-y-2 border border-white/10" style={{ background: '#262626' }}>
            <div className="h-3 w-2/3 rounded bg-white/15" />
            <div className="h-2 w-1/2 rounded bg-white/10" />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded p-2" style={{ background: '#1f1f1f' }}>
                <div className="h-2 w-1/2 rounded bg-white/15 mb-1" />
                <div className="h-1.5 w-3/4 rounded bg-white/10" />
              </div>
              <div className="rounded p-2" style={{ background: '#1f1f1f' }}>
                <div className="h-2 w-1/2 rounded bg-white/15 mb-1" />
                <div className="h-1.5 w-3/4 rounded bg-white/10" />
              </div>
            </div>
            <div
              className="h-7 rounded mt-3 flex items-center justify-center text-[10px] font-medium"
              style={{ background: brand, color: '#fff' }}
            >
              Pay now
            </div>
          </div>

          {/* Selection marquee that traces the frame as the agent reads it */}
          {activeStep >= 0 && activeStep < 2 && (
            <div
              className="absolute inset-3 rounded-lg pointer-events-none"
              style={{
                border: `1.5px dashed ${brand}`,
                boxShadow: `0 0 0 1px ${brand}33, 0 0 12px ${brand}55`,
                animation: 'fadeIn 0.3s',
              }}
            />
          )}

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {['--brand', '--bg-card', '--text-on-brand', 'space-2', 'space-3', 'radius-md'].map(t => (
              <span
                key={t}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: activeStep >= 1 ? `${brand}33` : 'rgba(255,255,255,0.06)',
                  color: activeStep >= 1 ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'background 0.4s, color 0.4s',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: Cursor editor with generated code */}
        <div className="bg-dark-bg/90">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-dark-border bg-dark-surface/60">
            <span className="text-[9px] font-mono uppercase tracking-wider text-text-tertiary">
              {showJsx ? 'cursor / Checkout.tsx' : 'cursor / awaiting plan…'}
            </span>
            <span className="ml-auto text-[9px] font-mono text-text-tertiary">tsx</span>
          </div>
          {!showJsx ? (
            <div className="p-6 flex flex-col items-center justify-center h-full text-text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full mb-2 animate-pulse" style={{ background: brand }} />
              <p className="text-[10px] font-mono">cursor.editor.applyEdits(plan)…</p>
            </div>
          ) : (
            <pre className="p-3 text-[10.5px] font-mono leading-relaxed text-text-secondary overflow-x-auto">
{`export function Checkout() {
  return (
    <Card className="bg-card">
      <h2>Order summary</h2>
      <p className="text-muted">3 items</p>
      <Grid cols={2}>
        <Field label="Total" value="$128.00" />
        <Field label="Tax"   value="$10.24" />
      </Grid>
      `}<span style={{ color: previewAccent }}>{`<Button variant="brand">Pay now</Button>`}</span>{`
    </Card>
  );
}`}
            </pre>
          )}
          {showDiff && (
            <div className="border-t border-dark-border px-3 py-2 flex items-center gap-3 text-[10px] font-mono text-text-tertiary">
              <span className="text-accent-green">+ 4 components</span>
              <span className="text-accent-green">+ 12 tokens</span>
              <span>{'\u2022'}</span>
              <span>0 visual drift</span>
              <span className="ml-auto px-1.5 py-0.5 rounded" style={{ background: `${brand}22`, color: brand }}>
                pixel-diff: matches prod
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
