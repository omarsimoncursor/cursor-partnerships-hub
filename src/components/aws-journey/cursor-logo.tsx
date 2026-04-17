'use client';

/**
 * Inline Cursor brand mark. The "C" is a hexagonal faceted shape inside a
 * rounded square. Two props:
 *   - tone: "dark" (default, dark bg + light mark) | "light" (light bg + dark mark)
 *   - label: optional right-hand text, e.g. "Cursor Cloud Agent"
 */
export function CursorLogo({
  size = 20,
  tone = 'dark',
  label,
  className,
}: {
  size?: number;
  tone?: 'dark' | 'light';
  label?: string;
  className?: string;
}) {
  const bg = tone === 'dark' ? '#14120B' : '#F0EFEA';
  const fg = tone === 'dark' ? '#EDECEC' : '#14120B';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        aria-label="Cursor"
        role="img"
        style={{ flexShrink: 0 }}
      >
        <rect width="400" height="400" rx="96" fill={bg} />
        <path
          d="M270.015 124.958L155.919 59.086C152.256 56.97 147.735 56.97 144.071 59.086L29.981 124.958C26.901 126.736 25 130.025 25 133.587V266.419C25 269.981 26.901 273.269 29.981 275.048L144.077 340.92C147.74 343.036 152.261 343.036 155.925 340.92L270.02 275.048C273.1 273.269 275.001 269.981 275.001 266.419V133.587C275.001 130.025 273.1 126.736 270.02 124.958ZM262.848 138.911L152.706 329.682C151.961 330.968 149.995 330.443 149.995 328.954V204.039C149.995 201.543 148.662 199.234 146.498 197.981L38.321 135.526C37.036 134.781 37.561 132.816 39.05 132.816H259.334C262.462 132.816 264.417 136.206 262.853 138.917H262.848V138.911Z"
          fill={fg}
          transform="translate(50, 50)"
        />
      </svg>
      {label && (
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: tone === 'dark' ? '#F3F4F6' : '#14120B' }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

/**
 * "Cursor Cloud Agent" pill-badge — tighter, intended for inline use in headers
 * or act rails. Automatically includes the logo.
 */
export function CursorCloudAgentBadge({
  tone = 'dark',
  size = 'md',
  className,
}: {
  tone?: 'dark' | 'light';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const pad = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const fontSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  const logoPx = size === 'sm' ? 12 : 14;
  const border = tone === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(20,18,11,0.18)';
  const bg = tone === 'dark' ? 'rgba(20,18,11,0.5)' : 'rgba(240,239,234,0.8)';
  const color = tone === 'dark' ? '#F3F4F6' : '#14120B';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.16em] ${pad} ${fontSize} ${className ?? ''}`}
      style={{ borderColor: border, background: bg, color }}
    >
      <CursorLogo size={logoPx} tone={tone} />
      <span>Cursor Cloud Agent</span>
    </span>
  );
}
