// ============================================================================
//  AGENT-EDITED: site-level configuration for this fork of the template.
// ============================================================================
//
// This file is what the setup agent (or you, by hand) edits to personalize
// the deployed site for your peer team / your target accounts. None of it
// is secret — secrets live in env vars (see .env.example). The values here
// are baked into the build, so changes require a redeploy.
//
// See AGENTS.md for the full setup playbook.
// ============================================================================

export type SetupConfig = {
  /**
   * "Book a 30-minute Demo" link on every personalized prospect demo's
   * next-step CTA. Replace with your Calendly / Cal.com / contact URL.
   */
  bookDemoUrl: string;

  /**
   * Display name shown in the demo's "Prepared by …" footer when a
   * specific rep isn't passed in. Optional — most demos personalize
   * this via the ProspectConfig.rep field instead.
   */
  prospectTeamName: string;

  /**
   * Day-gap between each step of the 6-step ChatGTM email sequence.
   * Index `i` is the gap between Email (i+1) and Email (i+2), so the
   * tuple has length 5 (there are 5 gaps for 6 emails). Used by the
   * Sequences dashboard to compute `next_email_send_date` from
   * `last_email_send_date` + the cadence for the next step. Tweak per
   * team — typical cold sequences widen the gap as the sequence ages
   * to avoid hammering the inbox.
   */
  sequenceCadenceDays: [number, number, number, number, number];
};

export const SETUP_CONFIG: SetupConfig = {
  // EDIT ME: your Calendly (or other) booking URL.
  bookDemoUrl: 'https://calendly.com/omar-simon-anysphere/30min',

  // EDIT ME: your team / brand attribution.
  prospectTeamName: 'Cursor Partnerships',

  // EDIT ME (optional): widening cadence between sequence emails. The
  // default 3/4/5/6/7 means Email 2 is sent 3 days after Email 1,
  // Email 3 is 4 days after Email 2, etc.
  sequenceCadenceDays: [3, 4, 5, 6, 7],
};
