'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Linkedin,
  Loader2,
  RotateCcw,
  Save,
  X,
} from 'lucide-react';

// The minimal shape the dialog needs from a prospect row. Kept narrow
// so callers can pass a row from any of the admin tabs without
// adopting the full SequenceRow type.
//
// `demo_url` + `demo_password` come from the GET response's computed
// fields (the API derives them from the slug + the canonical origin
// + the existing password column). The dialog appends them to the
// composed message that gets copied to the clipboard, because the
// rep's LinkedIn DM workflow needs the demo link inline — the
// upstream Prospecting Blitz writes only the prose into
// `linkedin_draft` and trails off at "...take a look:" expecting the
// URL + password to follow.
export type LinkedinSendTarget = {
  id: string;
  slug?: string;
  name: string;
  company_name: string;
  linkedin_url: string | null;
  linkedin_draft?: string | null;
  linkedin_message?: string | null;
  linkedin_sent: boolean;
  replied?: boolean;
  demo_url?: string | null;
  demo_password?: string | null;
};

type Props = {
  prospect: LinkedinSendTarget;
  apiToken: string;
  onClose: () => void;
  // Called every time the row is mutated (draft saved, sent flipped)
  // so the parent can merge the updated row into local state.
  onUpdated: (patch: { linkedin_draft?: string | null; linkedin_message?: string | null; linkedin_sent?: boolean }) => void;
  /** `prospect` = cold sequence (append demo URL). `intent` = Intent Data tab (copy as-is). */
  mode?: 'prospect' | 'intent';
};

// The dialog is a small state machine driven by the rep's clicks:
//
//   composing -> [Copy & open LinkedIn] -> awaiting_confirm
//   awaiting_confirm -> [Yes, mark as sent] -> done (close)
//                    -> [Not yet]            -> composing
//
// We keep `composing` as the default so the dialog feels neutral when
// the rep just wants to read or edit the draft.
type Phase = 'composing' | 'awaiting_confirm' | 'saving';

export function LinkedinSendDialog({ prospect, apiToken, onClose, onUpdated, mode = 'prospect' }: Props) {
  const isIntent = mode === 'intent';
  const initialDraft = isIntent
    ? (prospect.linkedin_message ?? prospect.linkedin_draft ?? '')
    : (prospect.linkedin_draft ?? '');
  const [draft, setDraft] = useState(initialDraft);
  const [phase, setPhase] = useState<Phase>('composing');
  const [error, setError] = useState<string | null>(null);
  // Lightweight inline status — used for the "Copied!" / "Saved!"
  // feedback chips. Cleared on a timer so the UI doesn't get sticky.
  const [status, setStatus] = useState<'copied' | 'saved' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-focus the textarea on mount so a rep who keyboards into the
  // dialog (Tab from the row) lands right on the editable field.
  useEffect(() => {
    textareaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Auto-clear the inline status pill after 1.5s.
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 1500);
    return () => clearTimeout(t);
  }, [status]);

  const draftChanged = (draft.trim() || null) !== (initialDraft.trim() || null);
  const draftCharCount = draft.length;
  const draftField = isIntent ? 'linkedin_message' : 'linkedin_draft';
  const patchBase = isIntent
    ? `/api/outreach/contacts/${prospect.id}`
    : `/api/chatgtm/prospects/${prospect.id}`;

  // Compose the full message that actually gets pasted into LinkedIn.
  // Intent contacts: agent copy only (training thank-you). Cold prospects:
  // append demo URL + password when not already in the draft.
  const composedMessage = (() => {
    if (isIntent) return draft.trim();
    const lines: string[] = [draft];
    const trimmed = draft.trim();
    const lower = trimmed.toLowerCase();
    const hasUrl = prospect.demo_url
      ? lower.includes(prospect.demo_url.toLowerCase())
      : false;
    const hasPassword = prospect.demo_password
      ? trimmed.includes(prospect.demo_password)
      : false;
    const appendBits: string[] = [];
    if (prospect.demo_url && !hasUrl) {
      appendBits.push(prospect.demo_url);
    }
    if (prospect.demo_password && !hasPassword) {
      appendBits.push(`Password: ${prospect.demo_password}`);
    }
    if (appendBits.length > 0 && trimmed.length > 0) {
      // Blank line separator between prose and link block.
      lines.push('', ...appendBits);
    } else if (appendBits.length > 0) {
      // No prose yet — just the bits, no leading blank.
      lines.push(...appendBits);
    }
    return lines.join('\n');
  })();
  const composedCharCount = composedMessage.length;

  // LinkedIn caps connection-request notes at 300 characters. The
  // counter is informational only — most reps DM (no 300-char cap)
  // and even when they connect-with-note, the trailing URL + password
  // are typically pasted in a follow-up DM rather than the connect
  // note itself. We highlight the *draft* length past 300 so the rep
  // notices, but don't block.
  const draftOverLimit = draftCharCount > 300;

  const patch = async (body: Record<string, unknown>): Promise<boolean> => {
    setPhase('saving');
    setError(null);
    try {
      const res = await fetch(patchBase, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const fieldHint = typeof data?.field === 'string' ? `${data.field}: ` : '';
        setError(fieldHint + (data?.message || data?.detail || `Save failed (${res.status})`));
        setPhase('composing');
        return false;
      }
      return true;
    } catch (err) {
      setError((err as Error).message);
      setPhase('composing');
      return false;
    }
  };

  const onSaveDraft = async () => {
    const next = draft.trim() || null;
    const ok = await patch({ [draftField]: next });
    if (ok) {
      onUpdated(isIntent ? { linkedin_message: next } : { linkedin_draft: next });
      setStatus('saved');
      setPhase('composing');
    }
  };

  // The headline action: write the draft to clipboard, open the
  // prospect's LinkedIn URL in a new tab. Both happen inside the same
  // user-gesture click handler so neither browser API is blocked.
  // After this fires, we switch to the "Did you actually send?"
  // confirmation step — confirming flips linkedin_sent on the row.
  const onCopyAndOpen = async () => {
    if (!prospect.linkedin_url) {
      setError('This prospect has no linkedin_url on file. Add one via the prospect Edit modal first.');
      return;
    }
    setError(null);

    // 1. Persist any in-modal edits to the draft (best effort —
    //    don't block the open if the save fails; the rep cares about
    //    sending, not about the round-trip).
    if (draftChanged) {
      const ok = await patch({ [draftField]: draft.trim() || null });
      if (ok) {
        onUpdated(
          isIntent
            ? { linkedin_message: draft.trim() || null }
            : { linkedin_draft: draft.trim() || null },
        );
      }
      // If save failed the error banner is already populated; we still
      // open the LinkedIn tab so the rep isn't stuck.
    }

    // 2. Copy the composed message (draft + demo_url + demo_password)
    //    to the clipboard. Same content the "Will be copied" preview
    //    in the UI shows. Modern Clipboard API with a hidden-textarea
    //    + execCommand fallback for browsers that lock the API down.
    let copied = false;
    try {
      await navigator.clipboard.writeText(composedMessage);
      copied = true;
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = composedMessage;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copied = true;
      } catch {
        copied = false;
      }
    }
    if (copied) setStatus('copied');

    // 3. Open the LinkedIn profile in a new tab. We don't link
    //    straight to /messaging because LinkedIn's compose-message
    //    deep link requires the member URN (not exposed in the public
    //    profile URL). Opening the profile with the message ready in
    //    the clipboard is the smoothest workflow available without
    //    LinkedIn API access.
    window.open(prospect.linkedin_url, '_blank', 'noopener,noreferrer');

    // 4. Move to the "did you actually send?" confirmation step.
    setPhase('awaiting_confirm');
  };

  const onConfirmSent = async () => {
    const ok = await patch({ linkedin_sent: true });
    if (ok) {
      onUpdated({ linkedin_sent: true });
      onClose();
    }
  };

  const onMarkUnsent = async () => {
    const ok = await patch({ linkedin_sent: false });
    if (ok) {
      onUpdated({ linkedin_sent: false });
      onClose();
    }
  };

  const noUrl = !prospect.linkedin_url;
  const sendDisabled = noUrl || (!isIntent && prospect.replied);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-dark-border bg-dark-bg shadow-2xl">
        <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <div className="min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary inline-flex items-center gap-1.5">
              <Linkedin className="w-3 h-3 text-[#0a66c2]" />
              LinkedIn outreach
            </p>
            <h2 className="text-base font-semibold text-text-primary truncate">
              {prospect.name}{' '}
              <span className="text-text-tertiary">— {prospect.company_name}</span>
            </h2>
            {prospect.linkedin_url ? (
              <a
                href={prospect.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-accent-blue hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
              >
                {prospect.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-[11px] text-accent-red font-mono mt-0.5 inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                No LinkedIn URL on file
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-tertiary hover:text-text-primary"
            aria-label="Close LinkedIn dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="px-6 py-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="li-draft" className="text-xs text-text-secondary">
                Message draft
              </label>
              <span
                className={`text-[10px] font-mono tabular-nums ${
                  draftOverLimit ? 'text-accent-amber' : 'text-text-tertiary'
                }`}
                title="LinkedIn caps connection-request notes at 300 characters. DMs are much longer (~8000)."
              >
                {draftCharCount} chars{draftOverLimit ? ' (300+ for connect note)' : ''}
              </span>
            </div>
            <textarea
              id="li-draft"
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              placeholder="Write a personalized note. The rep usually drafts via the Prospecting Blitz; edit here if it needs a tweak. The demo URL + password are appended automatically — see the preview below."
              className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors resize-y"
            />
          </div>

          {/* Demo link block — read-only chips so the rep can grab
              the URL or password individually if they want, plus a
              clear note that they're auto-appended to the copied
              message. Hides cleanly when both are missing. */}
          {(prospect.demo_url || prospect.demo_password) && !isIntent && (
            <div className="rounded-lg border border-dark-border bg-dark-surface/50 p-3 space-y-2">
              <p className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary">
                Demo link (auto-appended to the copied message)
              </p>
              {prospect.demo_url && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary font-mono w-[60px] shrink-0">URL</span>
                  <CopyableValue value={prospect.demo_url} />
                </div>
              )}
              {prospect.demo_password && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary font-mono w-[60px] shrink-0">Password</span>
                  <CopyableValue value={prospect.demo_password} />
                </div>
              )}
            </div>
          )}

          {/* Will-be-copied preview. Source of truth for what hits
              the clipboard — no surprises for the rep. Renders the
              composed message verbatim with whitespace preserved so
              it matches LinkedIn's paste output character-for-char. */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-text-secondary inline-flex items-center gap-1.5">
                <Copy className="w-3 h-3" />
                Will be copied to your clipboard
              </p>
              <span className="text-[10px] font-mono tabular-nums text-text-tertiary">
                {composedCharCount} chars
              </span>
            </div>
            <pre className="w-full px-3 py-2 rounded-md bg-dark-surface/30 border border-dark-border text-[12px] text-text-primary whitespace-pre-wrap break-words font-sans max-h-40 overflow-y-auto">
              {composedMessage || (
                <span className="text-text-tertiary italic">
                  (write a draft above to see the full message)
                </span>
              )}
            </pre>
          </div>

          {phase === 'awaiting_confirm' ? (
            <div className="rounded-lg border border-accent-blue/40 bg-accent-blue/5 p-4">
              <p className="text-sm text-text-primary">
                <Check className="inline w-4 h-4 text-accent-green mr-1.5 align-text-bottom" />
                Message copied. LinkedIn opened in a new tab.
              </p>
              <p className="text-[12px] text-text-secondary mt-1.5 leading-snug">
                Click <span className="text-text-primary font-medium">Message</span> on{' '}
                <span className="font-mono text-text-primary">{prospect.name}</span>&apos;s
                profile and paste, then come back here:
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={onConfirmSent}
                  disabled={phase === 'awaiting_confirm' && !!error ? false : false}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-accent-green text-dark-bg disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  Yes, mark as sent
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('composing')}
                  className="px-4 py-2 rounded-md text-sm text-text-secondary border border-dark-border hover:border-dark-border-hover hover:bg-dark-surface transition-colors"
                >
                  Not yet
                </button>
              </div>
            </div>
          ) : prospect.linkedin_sent ? (
            <div className="rounded-lg border border-accent-green/30 bg-accent-green/5 p-3">
              <p className="text-[12px] text-accent-green inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Already sent. Use the buttons below to re-open LinkedIn or undo the sent flag.
              </p>
            </div>
          ) : !isIntent && prospect.replied ? (
            <div className="rounded-lg border border-accent-amber/40 bg-accent-amber/5 p-3">
              <p className="text-[12px] text-text-secondary">
                This prospect already replied — sending another LinkedIn note is probably noise.
                The button below still works if you need it.
              </p>
            </div>
          ) : null}

          {error && (
            <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-xs text-accent-red inline-flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-t border-dark-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={!draftChanged || phase === 'saving'}
              title={
                draftChanged
                  ? 'Persist the draft without copying or opening LinkedIn'
                  : 'No changes to save'
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-dark-border hover:bg-dark-surface text-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {phase === 'saving' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save draft
            </button>
            {prospect.linkedin_sent && (
              <button
                type="button"
                onClick={onMarkUnsent}
                disabled={phase === 'saving'}
                title="Undo the linkedin_sent flag (sets it back to false)"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-dark-border hover:bg-dark-surface text-text-secondary transition-colors disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Mark as unsent
              </button>
            )}
            {status === 'copied' && (
              <span className="text-[11px] text-accent-green inline-flex items-center gap-1">
                <Check className="w-3 h-3" />
                Copied
              </span>
            )}
            {status === 'saved' && (
              <span className="text-[11px] text-accent-green inline-flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm text-text-secondary border border-dark-border hover:border-dark-border-hover hover:bg-dark-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onCopyAndOpen}
              disabled={sendDisabled || phase === 'saving' || !composedMessage.trim()}
              title={
                noUrl
                  ? 'Add a LinkedIn URL on the prospect first'
                  : !composedMessage.trim()
                  ? 'Write a draft first'
                  : 'Copy the full message (draft + demo URL + password) to your clipboard and open LinkedIn in a new tab'
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-[#0a66c2] text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {phase === 'saving' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <Linkedin className="w-4 h-4" />
                </>
              )}
              Copy &amp; open LinkedIn
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Read-only inline value with a copy-to-clipboard button. Used in
// the "Demo link" block to expose the URL + password as individual
// chips alongside the auto-append behavior, so the rep can grab one
// piece independently if they're, e.g., quoting just the password
// in a follow-up reply.
function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore clipboard restrictions
    }
  };
  return (
    <div className="flex-1 min-w-0 flex items-center gap-1.5">
      <code className="flex-1 min-w-0 truncate font-mono text-[11px] text-text-primary bg-dark-surface px-2 py-1 rounded border border-dark-border">
        {value}
      </code>
      <button
        type="button"
        onClick={onCopy}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
        className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-dark-surface-hover transition-colors"
        aria-label="Copy"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
