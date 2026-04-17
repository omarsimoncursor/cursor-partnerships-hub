'use client';

import { useEffect, useRef, useId } from 'react';
import { gsap } from '@/lib/gsap-init';

interface FlowPipeProps {
  /** Width of the SVG container in pixels */
  width?: number;
  /** Height of the SVG container in pixels */
  height?: number;
  /** Pipe color (hex or CSS color) */
  color?: string;
  /** Direction of data flow */
  direction?: 'right' | 'left' | 'down' | 'up';
  /** Curvature amount (0 = straight, 0.5 = gentle curve, 1 = S-curve) */
  curvature?: number;
  /** Number of concurrent data packets flowing */
  packetCount?: number;
  /** Travel duration per packet in seconds */
  duration?: number;
  /** Optional label rendered mid-path */
  label?: string;
  /** Whether to draw the path on mount (true) or instantly (false) */
  animated?: boolean;
  /** Orient as vertical pipe (overrides direction logic) */
  vertical?: boolean;
  /** Extra class for the wrapper */
  className?: string;
}

export function FlowPipe({
  width = 160,
  height = 60,
  color = '#60A5FA',
  direction = 'right',
  curvature = 0,
  packetCount = 3,
  duration = 2.4,
  label,
  animated = true,
  vertical = false,
  className = '',
}: FlowPipeProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, '');

  const isVertical = vertical || direction === 'down' || direction === 'up';
  const reverse = direction === 'left' || direction === 'up';

  const w = isVertical ? height : width;
  const h = isVertical ? width : height;

  // Build path from left to right (we rotate visually via transform when vertical)
  const startX = 8;
  const endX = w - 8;
  const midY = h / 2;
  const curveOffset = curvature * (h / 2);

  const pathD = curvature === 0
    ? `M ${startX} ${midY} L ${endX} ${midY}`
    : `M ${startX} ${midY} C ${w * 0.3} ${midY - curveOffset}, ${w * 0.7} ${midY + curveOffset}, ${endX} ${midY}`;

  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const length = path.getTotalLength();

    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = animated ? `${length}` : '0';

    const ctx = gsap.context(() => {
      if (animated && containerRef.current) {
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      }

      // Launch each packet staggered
      const packets = containerRef.current?.querySelectorAll<SVGCircleElement>(`[data-packet="${uid}"]`);
      packets?.forEach((packet, idx) => {
        gsap.set(packet, { opacity: 0 });
        const tl = gsap.timeline({
          repeat: -1,
          delay: animated ? 0.8 + (idx * duration) / packetCount : (idx * duration) / packetCount,
        });
        tl.to(packet, { opacity: 1, duration: 0.2 }, 0)
          .to(packet, {
            duration,
            ease: 'none',
            motionPath: {
              path,
              align: path,
              alignOrigin: [0.5, 0.5],
              start: reverse ? 1 : 0,
              end: reverse ? 0 : 1,
            },
          }, 0)
          .to(packet, { opacity: 0, duration: 0.2 }, duration - 0.2);
      });
    }, containerRef);

    return () => ctx.revert();
  }, [animated, duration, packetCount, reverse, uid]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        width: isVertical ? height : width,
        height: isVertical ? width : height,
      }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        style={{
          overflow: 'visible',
          transform: isVertical ? 'rotate(90deg)' : 'none',
          transformOrigin: 'center',
          position: isVertical ? 'absolute' : 'static',
          top: isVertical ? '50%' : undefined,
          left: isVertical ? '50%' : undefined,
          marginTop: isVertical ? -h / 2 : undefined,
          marginLeft: isVertical ? -w / 2 : undefined,
        }}
      >
        <defs>
          {/* Pipe glow filter */}
          <filter id={`pipe-glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Packet glow filter */}
          <filter id={`packet-glow-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gradient for packets */}
          <radialGradient id={`packet-gradient-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background pipe track (subtle) */}
        <path
          d={pathD}
          stroke={color}
          strokeOpacity={0.1}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />

        {/* Main pipe with draw-in animation */}
        <path
          ref={pathRef}
          d={pathD}
          stroke={color}
          strokeOpacity={0.5}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="3 5"
        />

        {/* Data packets - glowing orbs */}
        {Array.from({ length: packetCount }).map((_, i) => (
          <circle
            key={i}
            data-packet={uid}
            r={4}
            fill={`url(#packet-gradient-${uid})`}
            filter={`url(#packet-glow-${uid})`}
          />
        ))}
      </svg>

      {/* Optional mid-path label */}
      {label && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold tracking-wider uppercase pointer-events-none"
          style={{
            background: `${color}15`,
            color,
            border: `1px solid ${color}30`,
            backdropFilter: 'blur(4px)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
