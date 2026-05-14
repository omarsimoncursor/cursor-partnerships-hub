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
};

export const SETUP_CONFIG: SetupConfig = {
  // EDIT ME: your Calendly (or other) booking URL.
  bookDemoUrl: 'https://calendly.com/omar-simon-anysphere/30min',

  // EDIT ME: your team / brand attribution.
  prospectTeamName: 'Cursor Partnerships',
};
