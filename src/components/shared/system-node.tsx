'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SystemNodeProps {
  icon?: LucideIcon;
  customIcon?: ReactNode;
  label: string;
  sublabel?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  status?: 'idle' | 'active' | 'success';
}

const SIZES = {
  sm: { tile: 48, icon: 20, label: 'text-[10px]', sublabel: 'text-[9px]', gap: 'gap-2' },
  md: { tile: 64, icon: 26, label: 'text-[11px]', sublabel: 'text-[10px]', gap: 'gap-2.5' },
  lg: { tile: 84, icon: 34, label: 'text-sm', sublabel: 'text-[11px]', gap: 'gap-3' },
};

export function SystemNode({
  icon: Icon,
  customIcon,
  label,
  sublabel,
  color = '#60A5FA',
  size = 'md',
  pulse = false,
  status = 'idle',
}: SystemNodeProps) {
  const s = SIZES[size];
  const statusColor = status === 'success' ? '#4ADE80' : status === 'active' ? color : 'transparent';

  return (
    <div className={`flex flex-col items-center ${s.gap}`}>
      <div className="relative">
        {/* Outer glow aura */}
        <div
          className="absolute inset-0 rounded-2xl blur-xl opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}80 0%, transparent 70%)`,
            transform: 'scale(1.3)',
          }}
        />
        {/* Tile */}
        <div
          className="relative rounded-2xl flex items-center justify-center"
          style={{
            width: s.tile,
            height: s.tile,
            background: `linear-gradient(145deg, ${color}20, ${color}05)`,
            border: `1px solid ${color}40`,
            boxShadow: `
              0 8px 24px ${color}20,
              inset 0 1px 0 rgba(255,255,255,0.08),
              inset 0 -1px 0 rgba(0,0,0,0.2)
            `,
          }}
        >
          {customIcon ? (
            <div style={{ color, width: s.icon, height: s.icon }}>{customIcon}</div>
          ) : Icon ? (
            <Icon style={{ color, width: s.icon, height: s.icon }} />
          ) : null}

          {/* Pulse ring */}
          {pulse && (
            <>
              <div
                className="absolute inset-0 rounded-2xl animate-ping"
                style={{ border: `1px solid ${color}`, animationDuration: '2.5s' }}
              />
            </>
          )}

          {/* Status dot */}
          {status !== 'idle' && (
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
              }}
            >
              {status === 'active' && (
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: statusColor }} />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <p className={`${s.label} font-semibold text-text-primary leading-tight`}>{label}</p>
        {sublabel && <p className={`${s.sublabel} text-text-tertiary mt-0.5`}>{sublabel}</p>}
      </div>
    </div>
  );
}
