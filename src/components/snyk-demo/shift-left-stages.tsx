'use client';

import { Code as CodeIcon, GitCommit, ShieldCheck, Moon, Activity } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

/**
 * The 5-stage shift-left spine. Visually descended from the Datadog
 * latency sparkline + SLO marker — same idea ("a moving marker against
 * five labelled stages") repointed at security lifecycle.
 */

export type ShiftLeftStageId = 'ide' | 'commit' | 'pr-gate' | 'nightly' | 'prod';

export interface ShiftLeftStageDef {
  id: ShiftLeftStageId;
  short: string;
  full: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  sdk: string;
}

export const SHIFT_LEFT_STAGES: ShiftLeftStageDef[] = [
  { id: 'ide', short: 'IDE', full: 'Inside the editor', icon: CodeIcon, sdk: 'Agent.create({ local: { cwd } })' },
  { id: 'commit', short: 'Commit', full: 'Pre-commit hook', icon: GitCommit, sdk: 'agent.send(...) from husky' },
  { id: 'pr-gate', short: 'PR Gate', full: 'Pre-merge security gate', icon: ShieldCheck, sdk: 'Agent.create({ cloud: { repos: [{ url, prUrl }] } })' },
  { id: 'nightly', short: 'Nightly', full: 'Nightly Snyk re-scan', icon: Moon, sdk: 'Agent.resume(agentId).send(...)' },
  { id: 'prod', short: 'Production', full: 'Production safety net', icon: Activity, sdk: 'POST /v1/agents (snyk webhook)' },
];

interface ShiftLeftStagesProps {
  /** Which stage the demo is dramatizing. The marker lands on this stage. */
  active: ShiftLeftStageId;
  /** Optional list of stages already covered (rendered green). */
  covered?: ShiftLeftStageId[];
  /** Optional compact rendering for the trigger card. */
  variant?: 'full' | 'card';
}

export function ShiftLeftStages({
  active,
  covered = [],
  variant = 'full',
}: ShiftLeftStagesProps) {
  const compact = variant === 'card';
  return (
    <div
      className={`w-full rounded-md border overflow-hidden ${compact ? '' : 'p-4'}`}
      style={{
        background: compact ? '#0E0F2C' : 'transparent',
        borderColor: '#23264F',
      }}
    >
      {!compact && (
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#9F98FF' }}>
            Shift-left coverage · 5 stages
          </p>
          <p className="text-[10.5px] font-mono" style={{ color: '#7C7CA0' }}>
            Cursor SDK ·{' '}
            <span style={{ color: '#9F98FF' }}>@cursor/february v1.0.7</span>
          </p>
        </div>
      )}

      <div className={`relative ${compact ? 'px-3 py-3' : ''}`}>
        {/* Connector line */}
        <div
          className="absolute h-px"
          style={{
            top: compact ? 22 : 18,
            left: compact ? 28 : 18,
            right: compact ? 28 : 18,
            background: '#23264F',
          }}
        />

        <div className="relative flex items-stretch justify-between gap-2">
          {SHIFT_LEFT_STAGES.map(stage => {
            const isActive = stage.id === active;
            const isCovered = covered.includes(stage.id);
            return (
              <Stage
                key={stage.id}
                stage={stage}
                isActive={isActive}
                isCovered={isCovered}
                compact={compact}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stage({
  stage,
  isActive,
  isCovered,
  compact,
}: {
  stage: ShiftLeftStageDef;
  isActive: boolean;
  isCovered: boolean;
  compact: boolean;
}) {
  const Icon = stage.icon;
  const ring =
    isActive
      ? { dot: '#FB7185', glow: 'rgba(251,113,133,0.35)', label: '#FB7185' }
      : isCovered
        ? { dot: '#4ADE80', glow: 'rgba(74,222,128,0)', label: '#4ADE80' }
        : { dot: '#3A3A55', glow: 'rgba(0,0,0,0)', label: '#7C7CA0' };

  return (
    <div className="flex-1 flex flex-col items-center text-center min-w-0 gap-1.5">
      <div
        className={`relative ${compact ? 'w-9 h-9' : 'w-9 h-9'} rounded-full flex items-center justify-center border`}
        style={{
          background: '#0A0B23',
          borderColor: ring.dot,
          boxShadow: isActive ? `0 0 0 3px ${ring.glow}` : 'none',
        }}
      >
        <Icon className="w-4 h-4" />
        <span
          className="absolute inset-0 rounded-full"
          style={{ color: ring.dot, opacity: 0.001 }}
        />
        {isActive && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ background: ring.dot, boxShadow: `0 0 8px ${ring.glow}` }}
          />
        )}
      </div>

      <div className="min-w-0">
        <p
          className={`text-[10.5px] font-medium truncate ${compact ? '' : 'text-[11px]'}`}
          style={{ color: ring.label }}
        >
          {compact ? stage.short : stage.full}
        </p>
        {!compact && (
          <p
            className="text-[10px] font-mono mt-0.5 truncate"
            style={{ color: '#7C7CA0' }}
          >
            {stage.sdk}
          </p>
        )}
      </div>
    </div>
  );
}
