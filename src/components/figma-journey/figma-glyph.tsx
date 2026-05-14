/**
 * The classic Figma 5-dot logo rendered inline as SVG.
 *
 * The real Figma logo is 5 primary-shape circles arranged into a rounded "F":
 *   top-left (red),   top-right (orange-red)
 *   middle-left (purple), middle-right (blue)
 *   bottom-left (green)
 *
 * We ship the plain version so the component works without any external assets.
 */
export function FigmaGlyph({ size = 24, className }: { size?: number; className?: string }) {
  const r = size / 2;
  const s = r * 2;
  return (
    <svg
      className={className}
      width={size}
      height={size * 1.5}
      viewBox={`0 0 ${s} ${s * 1.5}`}
      aria-label="Figma"
      role="img"
    >
      <circle cx={r} cy={r} r={r} fill="#F24E1E" />
      <circle cx={s - r} cy={r} r={r} fill="#FF7262" />
      <circle cx={r} cy={s + r} r={r} fill="#A259FF" />
      <circle cx={s - r} cy={s + r} r={r} fill="#1ABCFE" />
      <circle cx={r} cy={2 * s + r} r={r} fill="#0ACF83" />
    </svg>
  );
}

export function FigmaWordmark({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <FigmaGlyph size={size} />
      <span
        className="font-semibold uppercase tracking-[0.14em]"
        style={{ fontSize: size * 0.82, color: 'inherit' }}
      >
        Figma
      </span>
    </span>
  );
}
