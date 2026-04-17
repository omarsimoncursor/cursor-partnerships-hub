'use client';

import { useState } from 'react';
import { IDIOMS, type IdiomNode } from './story-data';
import { ArrowRight } from 'lucide-react';

interface IdiomConstellationProps {
  revealed?: number;
  className?: string;
}

export function IdiomConstellation({ revealed = IDIOMS.length, className = '' }: IdiomConstellationProps) {
  const [selectedId, setSelectedId] = useState<string | null>(IDIOMS[0]?.id ?? null);
  const selected = IDIOMS.find((i) => i.id === selectedId) ?? null;

  const edges: Array<[IdiomNode, IdiomNode]> = [];
  for (let i = 0; i < IDIOMS.length; i++) {
    for (let j = i + 1; j < IDIOMS.length; j++) {
      if (IDIOMS[i].dialect === IDIOMS[j].dialect) {
        edges.push([IDIOMS[i], IDIOMS[j]]);
      }
    }
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 ${className}`}>
      <div className="relative aspect-[4/3] rounded-xl border border-white/10 overflow-hidden bg-[radial-gradient(ellipse_at_30%_40%,rgba(41,181,232,0.12)_0%,transparent_70%)]">
        <svg viewBox="0 0 100 75" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7DD3F5" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#29B5E8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#29B5E8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {edges.map(([a, b], i) => {
            if (IDIOMS.findIndex((n) => n.id === a.id) >= revealed) return null;
            if (IDIOMS.findIndex((n) => n.id === b.id) >= revealed) return null;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y * 0.75}
                x2={b.x}
                y2={b.y * 0.75}
                stroke="#29B5E8"
                strokeWidth="0.15"
                opacity="0.35"
              />
            );
          })}

          {IDIOMS.map((node, i) => {
            if (i >= revealed) return null;
            const active = node.id === selectedId;
            return (
              <g
                key={node.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedId(node.id)}
                onMouseEnter={() => setSelectedId(node.id)}
              >
                <circle
                  cx={node.x}
                  cy={node.y * 0.75}
                  r={node.r * 0.7}
                  fill="url(#starGlow)"
                  opacity={active ? 0.95 : 0.6}
                  style={{ transition: 'opacity 200ms ease, r 200ms ease' }}
                />
                <circle
                  cx={node.x}
                  cy={node.y * 0.75}
                  r={active ? 1.4 : 1}
                  fill={active ? '#7DD3F5' : '#29B5E8'}
                  style={{ transition: 'all 200ms ease' }}
                />
                <text
                  x={node.x}
                  y={node.y * 0.75 - node.r * 0.7 - 1.5}
                  textAnchor="middle"
                  fontSize="2.4"
                  fontFamily="JetBrains Mono, monospace"
                  fill={active ? '#E5F6FB' : '#7DD3F5'}
                  opacity={active ? 1 : 0.8}
                >
                  {node.legacy}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute top-3 left-4 text-[10px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5]/80">
          Dialect idiom constellation
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0A1119]/80 backdrop-blur p-5 min-h-[280px]">
        {selected ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B]">
                {selected.dialect}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                idiom
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <code className="text-[15px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded">
                {selected.legacy}
              </code>
              <ArrowRight className="w-4 h-4 text-text-tertiary" />
              <code className="text-[15px] font-mono text-[#29B5E8] bg-[#29B5E8]/10 px-2 py-1 rounded">
                {selected.snowflake}
              </code>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">{selected.note}</p>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary">
                Coverage
              </p>
              <p className="text-[11px] font-mono text-text-secondary">
                Found in{' '}
                <span className="text-[#7DD3F5]">
                  {selected.dialect === 'Teradata'
                    ? '247 of 247 BTEQ'
                    : selected.dialect === 'T-SQL'
                      ? '412 of 412 T-SQL'
                      : '184 Informatica'}
                </span>{' '}
                assets
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-text-tertiary">Hover a node to inspect.</p>
        )}
      </div>
    </div>
  );
}
