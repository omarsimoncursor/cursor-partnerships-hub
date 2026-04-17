'use client';

import { useMemo, useState } from 'react';
import { BRICK_COUNT, buildBricks, DIALECT_META, type AssetBrick } from './story-data';

interface AssetWallProps {
  modernizedThrough?: number;
  heroBrickId?: number | null;
  dense?: boolean;
  interactive?: boolean;
  onBrickHover?: (brick: AssetBrick | null) => void;
  className?: string;
}

const COLS = 33;
const ROWS = Math.ceil(BRICK_COUNT / COLS);

export function AssetWall({
  modernizedThrough = 1,
  heroBrickId = 0,
  dense = false,
  interactive = true,
  onBrickHover,
  className = '',
}: AssetWallProps) {
  const bricks = useMemo(() => buildBricks(), []);
  const [hovered, setHovered] = useState<AssetBrick | null>(null);

  const litIds = useMemo(() => {
    const sorted = [...bricks].sort(
      (a, b) => a.modernizedAtMonth - b.modernizedAtMonth || a.id - b.id
    );
    return new Set(sorted.slice(0, modernizedThrough).map((b) => b.id));
  }, [bricks, modernizedThrough]);

  const handleEnter = (brick: AssetBrick) => {
    setHovered(brick);
    onBrickHover?.(brick);
  };
  const handleLeave = () => {
    setHovered(null);
    onBrickHover?.(null);
  };

  const cellSize = dense ? 10 : 13;
  const cellGap = dense ? 2 : 3;

  return (
    <div className={`relative w-full ${className}`}>
      {!dense && (
        <div className="flex items-center gap-4 mb-3 text-[11px] text-text-tertiary font-mono uppercase tracking-wider">
          <span>
            <span className="text-text-primary tabular-nums">{litIds.size.toLocaleString()}</span>
            {' / '}
            <span className="text-text-tertiary">{BRICK_COUNT.toLocaleString()}</span>
            {' modernized'}
          </span>
          <span className="flex items-center gap-3">
            {Object.entries(DIALECT_META).map(([key, meta]) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-[1px]"
                  style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}80` }}
                />
                {meta.label}
              </span>
            ))}
          </span>
        </div>
      )}

      <div
        className="relative grid w-fit mx-auto"
        style={{ gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`, gap: cellGap }}
        role="group"
        aria-label="Legacy asset inventory"
      >
        {bricks.map((brick) => {
          const lit = litIds.has(brick.id);
          const isHero = brick.id === heroBrickId;
          const dialectColor = DIALECT_META[brick.dialect].color;
          const delayMs = (brick.modernizedAtMonth * 55) % 800;
          return (
            <button
              key={brick.id}
              type="button"
              aria-label={brick.filename}
              onMouseEnter={interactive ? () => handleEnter(brick) : undefined}
              onMouseLeave={interactive ? handleLeave : undefined}
              onFocus={interactive ? () => handleEnter(brick) : undefined}
              onBlur={interactive ? handleLeave : undefined}
              className="brick"
              style={{
                width: cellSize,
                height: cellSize,
                background: lit
                  ? dialectColor
                  : isHero
                    ? 'rgba(41,181,232,0.85)'
                    : 'rgba(237,236,236,0.06)',
                boxShadow: lit
                  ? `0 0 ${dense ? 4 : 6}px ${dialectColor}90`
                  : isHero
                    ? '0 0 10px rgba(41,181,232,0.9)'
                    : 'none',
                border: '1px solid',
                borderColor: lit
                  ? `${dialectColor}80`
                  : isHero
                    ? 'rgba(125,211,245,0.9)'
                    : 'rgba(237,236,236,0.08)',
                borderRadius: 1,
                cursor: interactive ? 'crosshair' : 'default',
                transition: `background-color 220ms ease ${delayMs}ms, box-shadow 220ms ease ${delayMs}ms`,
              }}
            />
          );
        })}
      </div>

      {interactive && hovered && (
        <div
          className="absolute pointer-events-none z-10 rounded-md border bg-[#0A1119]/95 backdrop-blur px-3 py-2 shadow-xl text-[11px]"
          style={{
            left: '50%',
            bottom: '100%',
            transform: 'translate(-50%, -12px)',
            borderColor: `${DIALECT_META[hovered.dialect].color}60`,
            minWidth: 240,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-[1px]"
              style={{ background: DIALECT_META[hovered.dialect].color }}
            />
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: DIALECT_META[hovered.dialect].color }}
            >
              {DIALECT_META[hovered.dialect].label}
            </span>
            <span className="ml-auto text-text-tertiary font-mono">{hovered.loc} LOC</span>
          </div>
          <p className="font-mono text-text-primary truncate">{hovered.filename}</p>
          <p className="text-text-tertiary font-mono mt-0.5">
            last touched {hovered.lastTouched}
          </p>
        </div>
      )}
    </div>
  );
}

export { BRICK_COUNT, ROWS, COLS };
