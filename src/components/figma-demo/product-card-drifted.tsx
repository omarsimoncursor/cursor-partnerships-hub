'use client';

/**
 * The shipped ProductCard component. It LOOKS slightly off compared to the
 * Figma spec (Marketing/Shop/ProductCard@2.3) — that is intentional. The
 * hardcoded values below have drifted from the canonical tokens defined in
 * `src/lib/demo/design-tokens.ts`. Each drift maps 1:1 to a numbered pin in
 * the QA sweep overlay and a row in the triage-report violations table.
 *
 * The reset script (`scripts/reset-figma-demo.sh`) restores these literals
 * after a fix PR merges so the demo is repeatable.
 */

const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#2a2a30'/>
          <stop offset='100%' stop-color='#16161a'/>
        </linearGradient>
        <radialGradient id='glow' cx='50%' cy='40%' r='50%'>
          <stop offset='0%' stop-color='#A259FF' stop-opacity='0.35'/>
          <stop offset='100%' stop-color='#A259FF' stop-opacity='0'/>
        </radialGradient>
      </defs>
      <rect width='320' height='220' fill='url(#g)'/>
      <rect width='320' height='220' fill='url(#glow)'/>
      <g transform='translate(160 120)'>
        <ellipse cx='0' cy='52' rx='86' ry='10' fill='#000' opacity='0.45'/>
        <path d='M -64 30 Q -54 -38 0 -56 Q 56 -36 66 30 Q 56 52 0 54 Q -56 52 -64 30 Z'
              fill='#f1f1f5' stroke='#dcdce3' stroke-width='1.5'/>
        <path d='M -42 6 Q -16 -36 38 -28' fill='none' stroke='#A259FF' stroke-width='3' stroke-linecap='round'/>
        <circle cx='28' cy='-8' r='5' fill='#A259FF'/>
      </g>
      <text x='20' y='30' font-family='ui-monospace, monospace' font-size='10' fill='#7d7d8a' opacity='0.7'>FW-RUNNER · v3</text>
    </svg>
  `);

interface ProductCardDriftedProps {
  /**
   * Element ids used by the QA sweep overlay to anchor numbered pins
   * to the visible drift points.
   */
  pinAnchors?: {
    card?: string;
    title?: string;
    price?: string;
    cta?: string;
  };
}

export function ProductCardDrifted({ pinAnchors }: ProductCardDriftedProps = {}) {
  return (
    <div
      id={pinAnchors?.card}
      style={{
        background: '#111116',
        borderRadius: 12, // drift: should be tokens.radius.card (16) — pin #1
        padding: 20,      // drift: should be tokens.space.cardPadding (24) — pin #2
        border: '1px solid rgba(255,255,255,0.08)',
        width: 320,
        boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '320 / 220',
          borderRadius: 8,
          backgroundImage: `url("${FALLBACK_PRODUCT_IMAGE}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginBottom: 16,
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(0,0,0,0.45)',
            padding: '3px 8px',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          New
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h3
          id={pinAnchors?.title}
          style={{
            color: '#FFFFFF',
            fontSize: 17,         // drift: should be tokens.font.titleSize (18)
            fontWeight: 700,      // drift: should be tokens.font.titleWeight (600) — pin #3
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
          }}
        >
          Featherweight Runner
        </h3>
        <span
          id={pinAnchors?.price}
          style={{
            color: '#12A67F',     // drift: ΔE ~6 vs tokens.color.priceBadge (#14B892)
            fontSize: 18,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          $128
        </span>
      </div>

      <p
        style={{
          color: 'rgba(255,255,255,0.64)',
          fontSize: 13,
          lineHeight: 1.5,
          margin: '0 0 18px 0',
        }}
      >
        Lightweight trail runner with carbon-plate sole. Ships in 24 hours.
      </p>

      <button
        id={pinAnchors?.cta}
        style={{
          background: '#9A4FFF',  // drift: should be tokens.color.brandAccent (#A259FF) — pin #4
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 10,       // (slightly off — button radius token is 12)
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 600,
          width: '100%',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Add to cart
      </button>
    </div>
  );
}

/**
 * Canonical version (what Figma's frame looks like). Rendered side-by-side
 * with the drifted version in the FullDriftPage takeover. This component
 * always reads from `tokens` directly so it is impossible for it to drift.
 */
export function ProductCardCanonical() {
  return (
    <div
      style={{
        background: '#111116',
        borderRadius: 16,
        padding: 24,
        border: '1px solid rgba(255,255,255,0.08)',
        width: 320,
        boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '320 / 220',
          borderRadius: 8,
          backgroundImage: `url("${FALLBACK_PRODUCT_IMAGE}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginBottom: 16,
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(0,0,0,0.45)',
            padding: '3px 8px',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          New
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h3
          style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 600,
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
          }}
        >
          Featherweight Runner
        </h3>
        <span
          style={{
            color: '#14B892',
            fontSize: 18,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          $128
        </span>
      </div>

      <p
        style={{
          color: 'rgba(255,255,255,0.64)',
          fontSize: 13,
          lineHeight: 1.5,
          margin: '0 0 18px 0',
        }}
      >
        Lightweight trail runner with carbon-plate sole. Ships in 24 hours.
      </p>

      <button
        style={{
          background: '#A259FF',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 12,
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 600,
          width: '100%',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Add to cart
      </button>
    </div>
  );
}
