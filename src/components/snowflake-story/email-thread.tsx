'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ChevronLeft, Inbox, Reply, Star } from 'lucide-react';
import { CHARACTERS, type CharacterId } from './character-avatar';

export interface EmailMessage {
  /** Participant speaking on this message. */
  from: CharacterId;
  /** Who they're writing to — a role title string (e.g. "VP Data", "Data Platform team"). */
  to: string;
  /** Optional cc list, role-title strings. */
  cc?: string[];
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
  /** Display label for the thread — e.g. "Internal · Acme data platform". */
  label?: string;
  /** Ordered messages in the thread. */
  messages: EmailMessage[];
  /** Whether to play messages in sequentially (default true). */
  autoplay?: boolean;
  /** "dark" renders Apple Mail dark mode; "light" renders the standard light client. */
  tone?: 'dark' | 'light';
  className?: string;
}

interface ThemeVars {
  appBg: string;
  toolbarBg: string;
  paneBg: string;
  divider: string;
  dividerStrong: string;
  text: string;
  muted: string;
  subjectText: string;
  fromText: string;
  link: string;
  /** Highlighted top "thread" header (subject etc). */
  threadBarBg: string;
  /** Selected message background tint. */
  selectedTint: string;
}

/**
 * Internal email thread, styled to look like Apple Mail. Apple Mail renders
 * each message as a distinct card stacked vertically inside a single thread
 * pane: sender name (bold) + grey email address, recipient line, right-aligned
 * date, subject shown only once at the top, and a clean body.
 *
 * We use this for any thread that does NOT involve Cursor — Cursor agent
 * exchanges always use ChatThread, because that's how teams actually talk to
 * an in-IDE agent.
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

  const theme: ThemeVars =
    tone === 'dark'
      ? {
          appBg: '#1C1C1E',
          toolbarBg: 'rgba(28,28,30,0.92)',
          paneBg: '#1C1C1E',
          divider: 'rgba(255,255,255,0.07)',
          dividerStrong: 'rgba(255,255,255,0.13)',
          text: '#F5F5F7',
          muted: 'rgba(235,235,245,0.55)',
          subjectText: '#FFFFFF',
          fromText: '#F5F5F7',
          link: '#0A84FF',
          threadBarBg: 'rgba(255,255,255,0.04)',
          selectedTint: 'rgba(10,132,255,0.06)',
        }
      : {
          appBg: '#F6F4F1',
          toolbarBg: '#F6F4F1',
          paneBg: '#FFFFFF',
          divider: 'rgba(60,60,67,0.10)',
          dividerStrong: 'rgba(60,60,67,0.18)',
          text: '#1D1D1F',
          muted: 'rgba(60,60,67,0.6)',
          subjectText: '#1D1D1F',
          fromText: '#1D1D1F',
          link: '#0A84FF',
          threadBarBg: '#F2EFEA',
          selectedTint: 'rgba(10,132,255,0.05)',
        };

  const rootSubject = messages[0]?.subject ?? '(no subject)';
  const rendered = messages.slice(0, visibleCount);
  const nextMsg = visibleCount < messages.length ? messages[visibleCount] : null;

  return (
    <div
      className={`overflow-hidden rounded-xl border ${className}`}
      style={{
        background: theme.appBg,
        borderColor: theme.dividerStrong,
        color: theme.text,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
        boxShadow: '0 18px 50px -25px rgba(0,0,0,0.55)',
      }}
    >
      {/* Apple Mail toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: theme.divider, background: theme.toolbarBg }}
      >
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" aria-hidden="true" />
        </span>
        <ChevronLeft className="ml-2 h-3.5 w-3.5" style={{ color: theme.muted }} />
        <Inbox className="h-3.5 w-3.5" style={{ color: theme.muted }} />
        <span className="text-[11.5px]" style={{ color: theme.muted }}>
          {label ?? 'Inbox · Acme Analytics'}
        </span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-mono"
          style={{
            background: tone === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            color: theme.muted,
          }}
        >
          {rendered.length} of {messages.length}
        </span>
      </div>

      {/* Thread header (subject only) */}
      <div
        className="px-5 py-3 border-b"
        style={{ background: theme.threadBarBg, borderColor: theme.divider }}
      >
        <div className="flex items-start gap-3">
          <Star
            className="mt-1 h-3.5 w-3.5"
            style={{ color: tone === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,67,0.4)' }}
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-[16px] font-semibold leading-tight"
              style={{ color: theme.subjectText }}
            >
              {rootSubject}
            </p>
            <p className="mt-0.5 text-[11.5px]" style={{ color: theme.muted }}>
              {messages.length} {messages.length === 1 ? 'message' : 'messages'} · Acme
              Analytics · Internal
            </p>
          </div>
        </div>
      </div>

      {/* Stack of messages */}
      <ol style={{ background: theme.paneBg }}>
        {rendered.map((m, i) => {
          const isNewest = i === rendered.length - 1 && autoplay;
          const meta = CHARACTERS[m.from];
          return (
            <li
              key={i}
              className="px-5 py-4 email-enter"
              style={{
                animationDelay: `${i * 40}ms`,
                borderBottom: i < rendered.length - 1 ? `1px solid ${theme.divider}` : 'none',
                background: isNewest ? theme.selectedTint : 'transparent',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}aa)`,
                  }}
                  aria-hidden="true"
                >
                  {meta.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className="text-[14px] font-semibold leading-tight"
                      style={{ color: theme.fromText }}
                    >
                      {meta.name}
                    </span>
                    <span className="text-[12px]" style={{ color: theme.muted }}>
                      &lt;{roleHandle(meta.name)}&gt;
                    </span>
                    <span
                      className="ml-auto text-[11.5px]"
                      style={{ color: theme.muted, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {m.time}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12px]" style={{ color: theme.muted }}>
                    <span>To:</span>
                    <span style={{ color: theme.text }}>{m.to}</span>
                    {m.cc && m.cc.length > 0 && (
                      <>
                        <span>·</span>
                        <span>Cc:</span>
                        <span style={{ color: theme.text }}>{m.cc.join(', ')}</span>
                      </>
                    )}
                  </div>
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.attachments.map((a, j) => (
                        <Attachment key={j} label={a.label} tone={tone} />
                      ))}
                    </div>
                  )}
                  <div
                    className="mt-3 text-[14px] leading-[1.55] whitespace-pre-wrap"
                    style={{ color: theme.text }}
                  >
                    {m.body}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
                      style={{
                        color: theme.link,
                        background:
                          tone === 'dark' ? 'rgba(10,132,255,0.12)' : 'rgba(10,132,255,0.08)',
                      }}
                    >
                      <Reply className="h-3 w-3" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {nextMsg && autoplay && (
          <li
            className="flex items-center gap-2 px-5 py-3 text-[11.5px]"
            style={{ color: theme.muted }}
          >
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: theme.link }}
            />
            <span style={{ fontFamily: 'inherit' }}>
              {CHARACTERS[nextMsg.from].name} is composing a reply…
            </span>
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

function Attachment({ label, tone }: { label: string; tone: 'dark' | 'light' }) {
  const ext = label.split('.').pop()?.toLowerCase() ?? '';
  const palette: Record<string, { bg: string; fg: string }> = {
    pdf: { bg: '#FF453A', fg: '#FFFFFF' },
    csv: { bg: '#34C759', fg: '#FFFFFF' },
    xlsx: { bg: '#34C759', fg: '#FFFFFF' },
    sql: { bg: '#5E5CE6', fg: '#FFFFFF' },
    patch: { bg: '#FF9F0A', fg: '#1D1D1F' },
    pptx: { bg: '#FF9F0A', fg: '#1D1D1F' },
  };
  const p = palette[ext] ?? { bg: '#8E8E93', fg: '#FFFFFF' };

  return (
    <span
      className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[11px]"
      style={{
        background: tone === 'dark' ? 'rgba(255,255,255,0.04)' : '#F5F2EE',
        borderColor: tone === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(60,60,67,0.10)',
        color: tone === 'dark' ? '#F5F5F7' : '#1D1D1F',
      }}
    >
      <span
        className="inline-flex h-5 w-7 items-center justify-center rounded-sm font-mono text-[9px] font-bold uppercase tracking-wider"
        style={{ background: p.bg, color: p.fg }}
      >
        {ext || 'doc'}
      </span>
      <span className="truncate max-w-[200px]" title={label}>
        {label}
      </span>
    </span>
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
