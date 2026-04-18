'use client';

import { ReactNode, useEffect, useState } from 'react';
import { CHARACTERS, type CharacterId } from './character-avatar';
import { Sparkles } from 'lucide-react';

export interface ChatMessage {
  from: CharacterId;
  /** Displayed timestamp (e.g. "10:14 AM"). */
  time: string;
  /** Message body — can be plain text or rich children. */
  body: ReactNode;
  /** Optional small preview chip rendered under the message (a file, a diff, a tool call). */
  attachments?: Array<{ label: string; sub?: string; tone?: string }>;
  /** Hold (ms) before next message auto-reveals. */
  holdMs?: number;
}

interface ChatThreadProps {
  /** Channel/DM label, e.g. "#data-platform" or "DM · Cursor". */
  label?: string;
  messages: ChatMessage[];
  autoplay?: boolean;
  /**
   * Which side does Cursor render on. Cursor messages get a tinted bubble;
   * other participants render as a normal Slack-style message row with avatar.
   */
  cursorAlignment?: 'left' | 'right';
  className?: string;
}

/**
 * Cursor-agent chat surface. Looks like a Slack thread (or an in-IDE agent
 * chat) — explicitly NOT the email client. We use this for any message where
 * Cursor is one of the participants, because that's how teams actually talk
 * to the agent.
 */
export function ChatThread({
  label = '#data-platform',
  messages,
  autoplay = true,
  cursorAlignment = 'right',
  className = '',
}: ChatThreadProps) {
  const [visibleCount, setVisibleCount] = useState(autoplay ? 1 : messages.length);

  useEffect(() => {
    if (!autoplay) return;
    if (visibleCount >= messages.length) return;
    const current = messages[visibleCount - 1];
    const hold = current?.holdMs ?? 2400;
    const t = setTimeout(() => setVisibleCount((n) => n + 1), hold);
    return () => clearTimeout(t);
  }, [visibleCount, autoplay, messages]);

  const rendered = messages.slice(0, visibleCount);
  const nextMsg = visibleCount < messages.length ? messages[visibleCount] : null;

  return (
    <div
      className={`rounded-xl border overflow-hidden flex flex-col bg-[#0E1320] ${className}`}
      style={{
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: '0 10px 40px -20px rgba(0,0,0,0.6)',
      }}
    >
      <header
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0A0F1B' }}
      >
        <Sparkles className="h-3.5 w-3.5 text-[#29B5E8]" />
        <p className="text-[12px] font-mono text-white/85">{label}</p>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10.5px] font-mono text-white/45">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
          live · Cursor in channel
        </span>
      </header>

      <ol className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {rendered.map((m, i) => {
          const isCursor = m.from === 'cursor';
          const meta = CHARACTERS[m.from];
          const align =
            isCursor && cursorAlignment === 'right' ? 'items-end' : 'items-start';
          const bubbleSide =
            isCursor && cursorAlignment === 'right' ? 'flex-row-reverse' : 'flex-row';
          const bubbleColor = isCursor
            ? {
                bg: 'linear-gradient(135deg, rgba(41,181,232,0.18), rgba(41,181,232,0.08))',
                border: 'rgba(41,181,232,0.45)',
                text: '#E6F7FE',
              }
            : {
                bg: 'rgba(255,255,255,0.04)',
                border: 'rgba(255,255,255,0.08)',
                text: '#E6EDF3',
              };

          return (
            <li
              key={i}
              className={`flex flex-col ${align} chat-enter`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className={`flex ${bubbleSide} items-end gap-2 max-w-[90%]`}>
                <div
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}aa)`,
                  }}
                  aria-hidden="true"
                >
                  {meta.initials}
                </div>
                <div
                  className="rounded-2xl border px-3.5 py-2"
                  style={{
                    background: bubbleColor.bg,
                    borderColor: bubbleColor.border,
                    color: bubbleColor.text,
                    borderTopLeftRadius:
                      isCursor && cursorAlignment === 'right' ? 16 : 4,
                    borderTopRightRadius:
                      isCursor && cursorAlignment === 'right' ? 4 : 16,
                  }}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: meta.accent }}
                    >
                      {meta.name}
                    </span>
                    {isCursor && (
                      <span className="rounded bg-[#29B5E8]/20 px-1 py-px text-[9px] font-mono uppercase tracking-wider text-[#7DD3F5]">
                        agent
                      </span>
                    )}
                    <span className="ml-2 text-[10px] font-mono text-white/45">
                      {m.time}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[13px] leading-relaxed">{m.body}</div>
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {m.attachments.map((a, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
                          style={{
                            background: `${a.tone ?? meta.accent}12`,
                            borderColor: `${a.tone ?? meta.accent}45`,
                          }}
                        >
                          <span
                            className="font-mono text-[11px]"
                            style={{ color: a.tone ?? meta.accent }}
                          >
                            {a.label}
                          </span>
                          {a.sub && (
                            <span className="text-[10.5px] font-mono text-white/45">
                              · {a.sub}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {nextMsg && autoplay && (
          <li className="flex items-center gap-2 px-2 text-[11px] font-mono text-white/45">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#29B5E8]" />
            {CHARACTERS[nextMsg.from].name.toLowerCase()} is typing…
          </li>
        )}
      </ol>

      <footer
        className="flex items-center gap-2 border-t px-3 py-2 text-[11px] font-mono text-white/40"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/20" />
        Composed in IDE · Cursor reads back from this channel
      </footer>

      <style jsx>{`
        :global(.chat-enter) {
          animation: chatEnter 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes chatEnter {
          from {
            opacity: 0;
            transform: translateY(6px);
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
