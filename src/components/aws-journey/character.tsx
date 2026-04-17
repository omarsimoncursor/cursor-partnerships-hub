'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CHARACTERS, type CharacterKey } from './data/characters';

interface CharacterProps {
  name: CharacterKey;
  size?: number;
  showTooltip?: boolean;
  compact?: boolean;
}

export function Character({ name, size = 48, showTooltip = true, compact = false }: CharacterProps) {
  const character = CHARACTERS[name];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-center gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-white/10"
        style={{ width: size, height: size, background: character.accent + '22' }}
      >
        <Image
          src={character.avatar}
          alt={character.name}
          width={size}
          height={size}
          className="object-cover"
          unoptimized
        />
      </div>
      {!compact && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">{character.name}</span>
          <span className="text-xs opacity-70">{character.role}</span>
        </div>
      )}

      {showTooltip && hovered && !compact && (
        <div
          className="pointer-events-none absolute -top-2 left-0 z-30 w-64 -translate-y-full rounded-lg border border-white/10 bg-[#111827] p-3 text-xs text-white shadow-xl"
          role="tooltip"
        >
          <div className="mb-1 text-sm font-semibold" style={{ color: character.accent }}>
            {character.name}
          </div>
          <div className="mb-1 opacity-70">{character.role}</div>
          <div className="opacity-85">{character.bio}</div>
        </div>
      )}
    </div>
  );
}

export function CharacterStack({ names, size = 32 }: { names: CharacterKey[]; size?: number }) {
  return (
    <div className="flex items-center">
      {names.map((name, i) => {
        const character = CHARACTERS[name];
        return (
          <div
            key={name}
            className="relative overflow-hidden rounded-full ring-2 ring-white"
            style={{
              width: size,
              height: size,
              marginLeft: i === 0 ? 0 : -(size / 3),
              zIndex: names.length - i,
              background: character.accent + '22',
            }}
          >
            <Image
              src={character.avatar}
              alt={character.name}
              width={size}
              height={size}
              className="object-cover"
              unoptimized
            />
          </div>
        );
      })}
    </div>
  );
}
