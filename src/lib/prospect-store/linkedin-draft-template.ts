// Default LinkedIn DM draft used as the fallback when a prospect lands
// in the system without one (e.g. ChatGTM's Prospecting Blitz failed to
// generate one, or an admin created the prospect by hand). The
// Prospecting Blitz still owns the per-prospect personalized draft —
// this template is only the safety net so the Sequences-tab `Send LI`
// dialog always has something to copy.
//
// Convention (see `linkedin-send-dialog.tsx`): the stored draft holds
// ONLY the prose. The dialog auto-appends the demo URL + password when
// composing the clipboard payload, deduping if the prose already
// contains them. So this template is prose-only — no `[demo url]` /
// `[demo password]` placeholders to substitute.

export const DEFAULT_LINKEDIN_DRAFT_TEMPLATE =
  '{firstName} - i put together a personalized interactive demo to illustrate how Cursor agents can automate workflows across existing technology stacks. If you have a moment to take a look, I\'d love to hear your thoughts!';

/**
 * Pick a usable "first name" from a stored full name. Handles the
 * shapes ChatGTM pushes (`"First Last"`, `"First Middle Last"`,
 * `"Last, First"`) and a couple of common edge cases (initials,
 * lowercase, surrounding whitespace). Returns `null` when the input
 * doesn't yield a usable token — callers should fall back to a
 * neutral salutation.
 */
export function firstNameFor(name: string | null | undefined): string | null {
  if (!name) return null;
  const trimmed = String(name).trim();
  if (!trimmed) return null;

  // "Last, First" -> "First". The comma is a strong-enough signal
  // that this is the rep's convention; we ignore anything before it.
  const commaIdx = trimmed.indexOf(',');
  const head = commaIdx >= 0 ? trimmed.slice(commaIdx + 1).trim() : trimmed;

  // Take the first whitespace-separated token. Drop trailing
  // punctuation (e.g. `"Jane."`).
  const firstToken = head.split(/\s+/)[0] || '';
  const cleaned = firstToken.replace(/[^\p{L}\p{M}'\-]+$/u, '').trim();
  if (!cleaned) return null;

  // Cap length so a malformed value (e.g. an email address) doesn't
  // overflow the draft. 40 chars is well past every reasonable name.
  if (cleaned.length > 40) return cleaned.slice(0, 40);
  return cleaned;
}

/**
 * Render the default LinkedIn draft for a prospect. The template
 * starts with the first name + " - " so callers should pass through
 * the prospect's full name and let `firstNameFor()` derive the
 * salutation. When no usable first name is available the template
 * still substitutes `there` (so the message reads "there - i put
 * together…") rather than leaving a literal `{firstName}` in place.
 */
export function buildDefaultLinkedinDraft(name: string | null | undefined): string {
  const first = firstNameFor(name) || 'there';
  return DEFAULT_LINKEDIN_DRAFT_TEMPLATE.replace('{firstName}', first);
}
