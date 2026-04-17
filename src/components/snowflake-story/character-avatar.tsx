'use client';

export type CharacterId = 'maya' | 'jordan' | 'samira' | 'cursor' | 'cfo' | 'gsi';

export interface CharacterMeta {
  id: CharacterId;
  name: string;
  role: string;
  accent: string;
  glow: string;
  initials: string;
  pattern: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
}

export const CHARACTERS: Record<CharacterId, CharacterMeta> = {
  maya: {
    id: 'maya',
    name: 'Maya Alfaro',
    role: 'Principal Data Engineer · Acme Analytics',
    accent: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.35)',
    initials: 'MA',
    pattern: 'a',
  },
  jordan: {
    id: 'jordan',
    name: 'Jordan Park',
    role: 'Senior Data Engineer · Reviewer',
    accent: '#A78BFA',
    glow: 'rgba(167, 139, 250, 0.35)',
    initials: 'JP',
    pattern: 'b',
  },
  samira: {
    id: 'samira',
    name: 'Samira Chen',
    role: 'Account Executive · Snowflake',
    accent: '#34D399',
    glow: 'rgba(52, 211, 153, 0.35)',
    initials: 'SC',
    pattern: 'c',
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    role: 'Autonomous engineering agent',
    accent: '#29B5E8',
    glow: 'rgba(41, 181, 232, 0.45)',
    initials: 'C',
    pattern: 'd',
  },
  cfo: {
    id: 'cfo',
    name: 'Dana Whitaker',
    role: 'CFO · Acme Analytics',
    accent: '#F87171',
    glow: 'rgba(248, 113, 113, 0.35)',
    initials: 'DW',
    pattern: 'e',
  },
  gsi: {
    id: 'gsi',
    name: 'Apex Global Services',
    role: 'Incumbent GSI',
    accent: '#9CA3AF',
    glow: 'rgba(156, 163, 175, 0.3)',
    initials: 'AX',
    pattern: 'f',
  },
};

interface CharacterAvatarProps {
  character: CharacterId;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  speaking?: boolean;
  className?: string;
}

const SIZE_PX = { xs: 20, sm: 28, md: 40, lg: 64 };
const TEXT_PX = { xs: '9px', sm: '10px', md: '13px', lg: '18px' };

export function CharacterAvatar({
  character,
  size = 'md',
  speaking = false,
  className = '',
}: CharacterAvatarProps) {
  const meta = CHARACTERS[character];
  const px = SIZE_PX[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
    >
      {speaking && (
        <span
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            boxShadow: `0 0 0 2px ${meta.accent}80, 0 0 20px ${meta.glow}`,
          }}
          aria-hidden="true"
        />
      )}
      <svg width={px} height={px} viewBox="0 0 64 64" className="rounded-full overflow-hidden">
        <defs>
          <linearGradient id={`grad-${meta.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={meta.accent} stopOpacity="0.95" />
            <stop offset="100%" stopColor={meta.accent} stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id={`light-${meta.id}`} cx="30%" cy="25%" r="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="64" height="64" rx="32" fill={`url(#grad-${meta.id})`} />
        <PatternShapes pattern={meta.pattern} accent={meta.accent} />
        <rect width="64" height="64" rx="32" fill={`url(#light-${meta.id})`} />
      </svg>
      <span
        className="absolute font-semibold tracking-wide text-white select-none"
        style={{ fontSize: TEXT_PX[size], textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}
      >
        {meta.initials}
      </span>
    </div>
  );
}

function PatternShapes({ pattern, accent }: { pattern: string; accent: string }) {
  const softWhite = 'rgba(255,255,255,0.22)';
  const softDark = 'rgba(0,0,0,0.18)';
  switch (pattern) {
    case 'a':
      return (
        <g>
          <circle cx="18" cy="46" r="18" fill={softWhite} />
          <circle cx="50" cy="18" r="12" fill={softDark} />
        </g>
      );
    case 'b':
      return (
        <g>
          <rect x="-4" y="26" width="72" height="14" fill={softWhite} transform="rotate(-22 32 32)" />
        </g>
      );
    case 'c':
      return (
        <g>
          <circle cx="40" cy="32" r="22" fill={softWhite} />
          <circle cx="46" cy="28" r="22" fill={accent} opacity="0.85" />
        </g>
      );
    case 'd':
      return (
        <g>
          <path d="M 32 12 L 52 32 L 32 52 L 12 32 Z" fill={softWhite} opacity="0.55" />
          <circle cx="32" cy="32" r="6" fill="#ffffff" opacity="0.9" />
        </g>
      );
    case 'e':
      return (
        <g>
          <rect x="0" y="18" width="64" height="4" fill={softWhite} />
          <rect x="0" y="30" width="64" height="4" fill={softWhite} />
          <rect x="0" y="42" width="64" height="4" fill={softWhite} />
        </g>
      );
    case 'f':
      return (
        <g>
          <rect x="12" y="12" width="40" height="40" rx="4" fill={softWhite} />
          <rect x="20" y="20" width="24" height="24" rx="2" fill={softDark} />
        </g>
      );
    default:
      return null;
  }
}
