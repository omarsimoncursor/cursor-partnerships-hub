'use client';

/**
 * Schematic world map for the Cloudflare dashboard.
 * - Always renders the same dot positions (deterministic).
 * - `intensity` 0..1 controls the attack-cluster (Eastern Europe) glow.
 * - Baseline orange dots animate gently; attack dots pulse aggressively when
 *   intensity > 0.4 and gradually fade back to amber/green as intensity drops.
 *
 * No external map data — coordinates are hand-tuned in the SVG viewBox so the
 * visual reads as a world map without copying any specific Cloudflare asset.
 */

import { CF_ORANGE, CF_RED, CF_AMBER, CF_GREEN, CF_TEXT_TERTIARY } from './cloudflare-chrome';

interface Dot {
  x: number;
  y: number;
  r: number;
  label?: string;
}

const BASELINE_DOTS: Dot[] = [
  { x: 180, y: 175, r: 3.2, label: 'us-east' },
  { x: 130, y: 180, r: 2.8, label: 'us-west' },
  { x: 195, y: 160, r: 2.2 },
  { x: 215, y: 240, r: 1.8 },
  { x: 245, y: 260, r: 1.6 },
  { x: 380, y: 165, r: 3.4, label: 'eu' },
  { x: 395, y: 175, r: 2.4 },
  { x: 365, y: 150, r: 1.8 },
  { x: 525, y: 195, r: 1.6 },
  { x: 600, y: 195, r: 3.0, label: 'apac' },
  { x: 615, y: 215, r: 2.2 },
  { x: 590, y: 220, r: 1.8 },
  { x: 410, y: 280, r: 1.6 },
  { x: 235, y: 290, r: 2.0 },
  { x: 565, y: 240, r: 2.2 },
];

// Attack cluster around eastern Europe / west Asia.
const ATTACK_DOTS: Dot[] = [
  { x: 425, y: 175, r: 4.2 },
  { x: 432, y: 165, r: 3.4 },
  { x: 440, y: 178, r: 5.5 },
  { x: 415, y: 168, r: 3.2 },
  { x: 448, y: 170, r: 2.8 },
  { x: 420, y: 185, r: 3.6 },
  { x: 437, y: 188, r: 2.4 },
  { x: 445, y: 162, r: 2.0 },
  { x: 410, y: 178, r: 2.2 },
  { x: 430, y: 192, r: 3.0 },
];

// Schematic outline of continents — one path per continent, hand-drawn for the
// demo viewport. Intentionally simplified.
const CONTINENT_PATHS = [
  // North America
  'M 95 130 C 110 110, 145 105, 175 115 L 215 130 L 240 165 L 235 200 L 215 235 L 195 245 L 165 240 L 145 220 L 130 200 L 115 180 L 100 165 Z',
  // South America
  'M 220 250 L 240 245 L 260 270 L 265 305 L 250 340 L 230 345 L 215 320 L 215 285 Z',
  // Europe
  'M 350 130 L 395 120 L 415 130 L 410 155 L 385 175 L 360 175 L 345 160 Z',
  // Africa
  'M 380 195 L 420 200 L 440 230 L 435 270 L 410 315 L 380 320 L 370 285 L 365 245 L 370 215 Z',
  // Asia
  'M 420 100 L 525 95 L 600 130 L 625 175 L 605 215 L 565 220 L 510 200 L 470 195 L 440 175 L 425 145 Z',
  // Oceania
  'M 595 270 L 645 265 L 660 290 L 645 310 L 605 305 Z',
];

export interface WorldMapProps {
  intensity?: number;
  /** Static, no-pulse mode (used when capturing screenshots / printing). */
  paused?: boolean;
  /** Heading shown above the map. */
  heading?: string;
  /** Subhead under the map title. */
  subheading?: string;
}

export function WorldMap({
  intensity = 0,
  paused = false,
  heading = 'Edge traffic · last 30 minutes',
  subheading = '275 PoPs · 312 cities · 99.999% availability',
}: WorldMapProps) {
  const clamped = Math.max(0, Math.min(1, intensity));
  const showAttack = clamped > 0.05;
  const attackColor = clamped > 0.6 ? CF_RED : clamped > 0.25 ? CF_AMBER : CF_GREEN;
  const attackOpacityBase = 0.55 + clamped * 0.4;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: CF_TEXT_TERTIARY }}>
            Worldwide
          </p>
          <h3 className="text-[15px] font-semibold text-white">{heading}</h3>
          <p className="text-[11.5px]" style={{ color: CF_TEXT_TERTIARY }}>
            {subheading}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: CF_TEXT_TERTIARY }}>
          <Legend color={CF_ORANGE} label="Healthy" />
          {clamped > 0.05 && <Legend color={attackColor} label="High-bot ASN" pulsing={!paused} />}
        </div>
      </div>

      <div
        className="relative rounded-lg overflow-hidden"
        style={{ background: '#0B121A', border: '1px solid #1A2330' }}
      >
        <svg
          viewBox="0 0 720 360"
          className="block w-full"
          style={{ height: 240 }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background grid */}
          <defs>
            <pattern id="cf-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path
                d="M 36 0 L 0 0 0 36"
                fill="none"
                stroke="#142030"
                strokeWidth="0.5"
              />
            </pattern>
            <radialGradient id="cf-attack-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={attackColor} stopOpacity={Math.min(1, 0.55 + clamped * 0.5)} />
              <stop offset="60%" stopColor={attackColor} stopOpacity={Math.min(0.4, 0.05 + clamped * 0.35)} />
              <stop offset="100%" stopColor={attackColor} stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="720" height="360" fill="url(#cf-grid)" />

          {/* Continents */}
          {CONTINENT_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="#16212E"
              stroke="#243345"
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
          ))}

          {/* Attack cluster glow */}
          {showAttack && (
            <circle
              cx={430}
              cy={177}
              r={70 + clamped * 60}
              fill="url(#cf-attack-glow)"
              opacity={attackOpacityBase}
            />
          )}

          {/* Healthy/baseline dots */}
          {BASELINE_DOTS.map((d, i) => (
            <g key={`b-${i}`}>
              <circle
                cx={d.x}
                cy={d.y}
                r={d.r + 4}
                fill={CF_ORANGE}
                opacity={0.12}
              >
                {!paused && (
                  <animate
                    attributeName="opacity"
                    values="0.05;0.18;0.05"
                    dur={`${4 + (i % 5) * 0.5}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              <circle cx={d.x} cy={d.y} r={d.r} fill={CF_ORANGE} opacity={0.85} />
            </g>
          ))}

          {/* Attack dots */}
          {showAttack &&
            ATTACK_DOTS.map((d, i) => (
              <g key={`a-${i}`} opacity={Math.min(1, 0.4 + clamped)}>
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={d.r + 5}
                  fill={attackColor}
                  opacity={Math.min(0.4, 0.15 + clamped * 0.3)}
                >
                  {!paused && (
                    <animate
                      attributeName="r"
                      values={`${d.r + 4};${d.r + 9};${d.r + 4}`}
                      dur={`${1.4 + (i % 4) * 0.2}s`}
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={d.r}
                  fill={attackColor}
                  opacity={attackOpacityBase}
                />
              </g>
            ))}

          {/* Attack callout — only when intensity high */}
          {clamped > 0.5 && (
            <g>
              <line
                x1={430}
                y1={177}
                x2={510}
                y2={120}
                stroke={attackColor}
                strokeWidth="0.75"
                strokeDasharray="2 2"
                opacity={0.7}
              />
              <rect
                x={510}
                y={104}
                width={138}
                height={32}
                rx={4}
                fill="#0B121A"
                stroke={attackColor}
                strokeWidth="0.75"
                opacity={0.95}
              />
              <text
                x={519}
                y={117}
                fill={attackColor}
                fontSize={9}
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                ASN 14618
              </text>
              <text
                x={519}
                y={129}
                fill="#E5ECF4"
                fontSize={9}
                fontFamily="ui-monospace, monospace"
              >
                {Math.round(clamped * 87)}% bot · {Math.round(40 + clamped * 60)}k req/s
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

function Legend({ color, label, pulsing }: { color: string; label: string; pulsing?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${pulsing ? 'animate-pulse' : ''}`}
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
