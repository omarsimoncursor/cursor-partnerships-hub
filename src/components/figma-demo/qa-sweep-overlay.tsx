'use client';

import { useEffect, useRef, useState } from 'react';

interface PinSpec {
  /** 1-4 — display number on the pin */
  n: number;
  /** Absolute position within the overlay container, in CSS units */
  top: string;
  left: string;
  /** Short label that floats next to the pin once landed */
  label: string;
  /** Delay before the pin lands, in seconds */
  at: number;
}

const PINS: PinSpec[] = [
  { n: 1, top: '6px',    left: '6px',   label: 'radius/md  16 → 12',          at: 1.0 },
  { n: 2, top: '12px',   left: '52%',   label: 'space/6  24 → 20',            at: 1.4 },
  { n: 3, top: '60%',    left: '20px',  label: 'font.title  600/18 → 700/17', at: 1.8 },
  { n: 4, top: 'calc(100% - 50px)', left: '50%', label: 'color/brand/accent  ΔE 6.2', at: 2.2 },
];

interface QASweepOverlayProps {
  /** Width of the card the overlay sits on top of (matches card width) */
  width: number;
  /** Triggered after the last pin has landed and a brief hold elapses */
  onComplete: () => void;
}

/**
 * 3-second deterministic QA-sweep animation. Renders:
 * 1. Pixel-grid fade-in (~0.5s)
 * 2. Corner crosshairs sweeping inward (~0.5s)
 * 3. Four numbered pins landing on the visible drift points (1.0s → 2.2s)
 * 4. Brief hold, then onComplete
 *
 * No randomness, no real measurements — every frame is identical between runs.
 */
export function QASweepOverlay({ width, onComplete }: QASweepOverlayProps) {
  const [phase, setPhase] = useState<'grid' | 'crosshairs' | 'pinning' | 'done'>('grid');
  const [pinsLanded, setPinsLanded] = useState<number[]>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase('crosshairs'), 500));
    timers.push(setTimeout(() => setPhase('pinning'), 900));

    PINS.forEach(p => {
      timers.push(
        setTimeout(() => {
          setPinsLanded(prev => (prev.includes(p.n) ? prev : [...prev, p.n]));
        }, p.at * 1000),
      );
    });

    timers.push(
      setTimeout(() => {
        setPhase('done');
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }, 3000),
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={{ width, marginInline: 'auto' }}
      aria-hidden
    >
      {/* Pixel grid */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: phase === 'grid' ? 0.55 : phase === 'crosshairs' ? 0.4 : 0.18,
          backgroundImage: `
            linear-gradient(to right, rgba(162,89,255,0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(162,89,255,0.35) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px',
          mixBlendMode: 'screen',
          borderRadius: 16,
        }}
      />

      {/* Corner crosshairs */}
      <Crosshair show={phase !== 'grid'} corner="tl" />
      <Crosshair show={phase !== 'grid'} corner="tr" />
      <Crosshair show={phase !== 'grid'} corner="bl" />
      <Crosshair show={phase !== 'grid'} corner="br" />

      {/* Scanline */}
      <div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #A259FF 50%, transparent 100%)',
          boxShadow: '0 0 12px rgba(162,89,255,0.8)',
          opacity: phase === 'crosshairs' || phase === 'pinning' ? 0.9 : 0,
          top: phase === 'pinning' ? '100%' : phase === 'crosshairs' ? '0%' : '0%',
          transition: 'top 1.6s linear, opacity 0.3s',
        }}
      />

      {/* Pins */}
      {PINS.map(p => {
        const landed = pinsLanded.includes(p.n);
        return (
          <div
            key={p.n}
            className="absolute"
            style={{
              top: p.top,
              left: p.left,
              transform: landed ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.6)',
              opacity: landed ? 1 : 0,
              transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease-out',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="flex items-center justify-center text-[11px] font-bold text-[#1a0d00] shadow-lg"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  background: '#F5A623',
                  border: '1.5px solid #fff',
                  boxShadow: '0 4px 14px rgba(245,166,35,0.55)',
                }}
              >
                <span style={{ transform: 'rotate(45deg)' }}>{p.n}</span>
              </span>
              <span
                className="font-mono text-[10.5px] px-1.5 py-0.5 rounded whitespace-nowrap"
                style={{
                  background: 'rgba(20, 14, 0, 0.92)',
                  color: '#F5A623',
                  border: '1px solid rgba(245,166,35,0.4)',
                  letterSpacing: '0.01em',
                }}
              >
                {p.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Crosshair({ show, corner }: { show: boolean; corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const positions: Record<typeof corner, React.CSSProperties> = {
    tl: { top: -1, left: -1 },
    tr: { top: -1, right: -1, transform: 'scaleX(-1)' },
    bl: { bottom: -1, left: -1, transform: 'scaleY(-1)' },
    br: { bottom: -1, right: -1, transform: 'scale(-1, -1)' },
  };
  return (
    <svg
      width="22"
      height="22"
      className="absolute"
      style={{
        ...positions[corner],
        opacity: show ? 0.95 : 0,
        transition: 'opacity 220ms ease-out',
      }}
    >
      <path d="M0,0 L18,0 M0,0 L0,18" stroke="#A259FF" strokeWidth="2" />
    </svg>
  );
}
