'use client';

import { useEffect, useState } from 'react';

interface SceneImageProps {
  src: string;
  dominantColor: string;
  /** Signature per-act hue painted as a soft radial glow for mood. */
  moodColor?: string;
  alt?: string;
  kenBurns?: boolean;
  vignette?: boolean;
  className?: string;
}

export function SceneImage({
  src,
  dominantColor,
  moodColor,
  alt = '',
  kenBurns = true,
  vignette = true,
  className = '',
}: SceneImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${dominantColor}CC 0%, ${dominantColor}FA 60%, #050811 100%)`,
        }}
      />
      {failed && <AbstractPattern dominantColor={dominantColor} />}
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover ${
            kenBurns ? 'scene-ken-burns' : ''
          }`}
          // Heavy blur abstracts details; brightness still reduced for
          // readability, but saturation is pushed hard so the per-act color
          // mood still reads through (amber, cyan, dusk purple, deep blue).
          style={{
            filter: 'blur(20px) brightness(0.62) saturate(1.65)',
            transform: 'scale(1.06)',
            transformOrigin: 'center',
          }}
        />
      )}
      {/* Per-act mood glow — a soft colored light source placed in the
          upper-left third of the frame so each chapter has an unmistakable
          hue even though the underlying photo is heavily blurred. */}
      {moodColor && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background: `radial-gradient(ellipse 70% 55% at 25% 30%, ${moodColor}55 0%, ${moodColor}22 35%, transparent 70%)`,
          }}
        />
      )}
      <FilmGrain />
      {vignette && (
        <>
          {/* Top + bottom gradient gives the hero title and act-nav/footer
              clean dark bands for legibility, while letting the mid-frame
              color bleed through. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(5,8,17,0.6) 0%, rgba(5,8,17,0.15) 30%, rgba(5,8,17,0.2) 70%, rgba(5,8,17,0.85) 100%)',
            }}
          />
          {/* Softer central vignette — just enough to anchor content cards
              against the blurred scene, without killing the color mood. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 85% 75% at center, rgba(5,8,17,0.15) 0%, rgba(5,8,17,0.45) 100%)',
            }}
          />
        </>
      )}
      <style jsx>{`
        :global(.scene-ken-burns) {
          animation: kenBurns 28s ease-in-out infinite alternate;
          transform-origin: center center;
        }
        /* NOTE: scale stays >= 1.1 the whole time so the 18px blur's
           feathered edges never creep into the viewport. */
        @keyframes kenBurns {
          0% {
            transform: scale(1.12) translate(0.4%, 0.3%);
          }
          100% {
            transform: scale(1.16) translate(-0.8%, -0.5%);
          }
        }
      `}</style>
    </div>
  );
}

function AbstractPattern({ dominantColor }: { dominantColor: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-40"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="scene-glow-a" cx="20%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#29B5E8" stopOpacity="0.35" />
          <stop offset="60%" stopColor={dominantColor} stopOpacity="0.1" />
          <stop offset="100%" stopColor={dominantColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="scene-glow-b" cx="80%" cy="80%" r="40%">
          <stop offset="0%" stopColor="#7DD3F5" stopOpacity="0.18" />
          <stop offset="100%" stopColor={dominantColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#scene-glow-a)" />
      <rect width="1600" height="900" fill="url(#scene-glow-b)" />
      {[180, 360, 540, 720].map((y, i) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="1600"
          y2={y + 30}
          stroke="#29B5E8"
          strokeWidth="0.6"
          opacity={0.12 - i * 0.02}
        />
      ))}
    </svg>
  );
}

function FilmGrain() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.06]"
      style={{
        backgroundImage:
          'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%221.1%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
        backgroundSize: '180px 180px',
      }}
    />
  );
}
