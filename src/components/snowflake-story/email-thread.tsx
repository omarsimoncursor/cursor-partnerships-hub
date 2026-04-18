'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Mail, Paperclip } from 'lucide-react';
import { CHARACTERS, type CharacterId } from './character-avatar';

export interface EmailMessage {
  /** Participant speaking on this message. */
  from: CharacterId;
  /** Who they're writing to — a role title string (e.g. "VP Data", "Data Platform team"). */
  to: string;
  /** Displayed timestamp (e.g. "Tue 9:42pm"). */
  time: string;
  /** Subject line. First message sets the thread subject; replies show "Re:" automatically. */
  subject: string;
  /** Body. Can be plain text or rich nodes (paragraphs, lists). */
  body: ReactNode;
  /** Optional chips shown under the subject line — attachments, labels, etc. */
  attachments?: Array<{ label: string; kind?: 'pdf' | 'sheet' | 'slide' | 'code' }>;
  /** Optional hold override (ms) before next message auto-reveals. */
  holdMs?: number;
}

interface EmailThreadProps {
  /** Display label for the thread — e.g. "Internal thread · #data-platform". */
  label?: string;
  /** Ordered messages in the thread. */
  messages: EmailMessage[];
  /** Whether to play messages in sequentially (default true). */
  autoplay?: boolean;
  /** Shown on dark themes the client is an always-legible dark Gmail-ish surface; on light themes a cream email card. */
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Internal email thread — the story vehicle for the demo. We replaced chat
 * bubbles with emails so the story reads like a sequence of realistic internal
 * communications. Every message is attributed by role title (no personal
 * names) and types out one beat at a time when autoplay is on.
 */
export function EmailThread({
  label,
  messages,
  autoplay = true,
  tone = 'dark',
  className = '',
}: EmailThreadProps) {
  const [visibleCount, setVisibleCount] = useState(autoplay ? 1 : messages.length);

  useEffect(() => {
    if (!autoplay) return;
    if (visibleCount >= messages.length) return;
    const current = messages[visibleCount - 1];
    const hold = current?.holdMs ?? 3400;
    const t = setTimeout(() => setVisibleCount((n) => n + 1), hold);
    return () => clearTimeout(t);
  }, [visibleCount, autoplay, messages]);

  const rootSubject = messages[0]?.subject ?? '(no subject)';
  const rendered = messages.slice(0, visibleCount);

  const themeVars =
    tone === 'dark'
      ? {
          bg: '#0D1524',
          surface: '#111B2C',
          surfaceAlt: '#0A1221',
          border: 'rgba(255,255,255,0.08)',
          borderStrong: 'rgba(255,255,255,0.14)',
          text: '#E6EDF3',
          muted: 'rgba(230,237,243,0.55)',
          eyebrow: '#7DD3F5',
        }
      : {
          bg: '#FFFFFF',
          surface: '#FFFFFF',
          surfaceAlt: '#F7F5EF',
          border: 'rgba(17,24,39,0.10)',
          borderStrong: 'rgba(17,24,39,0.18)',
          text: '#1F2937',
          muted: 'rgba(31,41,55,0.6)',
          eyebrow: '#2563EB',
        };

  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] ${className}`}
      style={{
        background: themeVars.bg,
        borderColor: themeVars.border,
        color: themeVars.text,
      }}
    >
      <header
        className="flex items-center gap-2.5 px-4 py-2.5 border-b"
        style={{ borderColor: themeVars.border, background: themeVars.surfaceAlt }}
      >
        <Mail className="w-3.5 h-3.5" style={{ color: themeVars.eyebrow }} />
        <p
          className="text-[11px] font-mono uppercase tracking-[0.2em]"
          style={{ color: themeVars.eyebrow }}
        >
          {label ?? 'Internal email thread'}
        </p>
        <span className="ml-auto text-[10.5px] font-mono" style={{ color: themeVars.muted }}>
          {rendered.length} / {messages.length}
        </span>
      </header>

      <div
        className="px-4 py-3 border-b font-semibold text-[14px]"
        style={{ borderColor: themeVars.border, color: themeVars.text }}
      >
        {rootSubject}
      </div>

      <ol className="divide-y" style={{ borderColor: themeVars.border }}>
        {rendered.map((m, i) => {
          const isReply = i > 0;
          const isNewest = i === rendered.length - 1 && autoplay;
          const meta = CHARACTERS[m.from];
          return (
            <li
              key={i}
              className="px-4 py-3 email-enter"
              style={{
                animationDelay: `${i * 30}ms`,
                background: i % 2 === 0 ? themeVars.surface : themeVars.surfaceAlt,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}aa)`,
                    boxShadow: isNewest ? `0 0 0 2px ${meta.accent}40` : 'none',
                  }}
                  aria-hidden="true"
                >
                  {meta.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[12.5px] font-semibold" style={{ color: meta.accent }}>
                      {meta.name}
                    </span>
                    <span className="text-[11px]" style={{ color: themeVars.muted }}>
                      &lt;{roleHandle(meta.name)}&gt;
                    </span>
                    <span
                      className="ml-auto text-[11px] font-mono"
                      style={{ color: themeVars.muted }}
                    >
                      {m.time}
                    </span>
                  </div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: themeVars.muted }}>
                    to <span style={{ color: themeVars.text }}>{m.to}</span>
                  </div>
                  <div
                    className="mt-1 text-[12.5px] font-semibold"
                    style={{ color: themeVars.text }}
                  >
                    {isReply ? 'Re: ' : ''}
                    {m.subject}
                  </div>
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.attachments.map((a, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-mono"
                          style={{
                            background: `${meta.accent}15`,
                            color: meta.accent,
                            border: `1px solid ${meta.accent}30`,
                          }}
                        >
                          <Paperclip className="w-3 h-3" />
                          {a.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className="mt-2 text-[13.5px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: themeVars.text }}
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {rendered.length < messages.length && autoplay && (
          <li
            className="flex items-center gap-2 px-4 py-2.5 text-[11.5px] font-mono"
            style={{ color: themeVars.muted }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: themeVars.eyebrow }}
            />
            {CHARACTERS[messages[rendered.length].from].name.toLowerCase()} is typing…
          </li>
        )}
      </ol>

      <style jsx>{`
        :global(.email-enter) {
          animation: emailEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes emailEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function roleHandle(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z]+/g, '.')
      .replace(/^\.+|\.+$/g, '') + '@acme.com'
  );
}
