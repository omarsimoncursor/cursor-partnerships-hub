// Normalize the prospect's seniority into a stable enum so the demo
// page can decide which sections to render (notably the ROI
// calculator, which is gated to leadership / executive levels).

export type ProspectLevel =
  | 'team_lead'
  | 'manager'
  | 'director'
  | 'vp'
  | 'svp'
  | 'executive'
  | 'c_level'
  | 'unknown';

// Order matters: more specific patterns (SVP, EVP) must come BEFORE
// the broader VP / Vice President patterns so "Senior Vice President"
// doesn't get demoted to plain VP. Each pattern uses word-boundary
// matches (`\b`) instead of `^...$` anchors so it works inside
// realistic full titles like "Vice President of Engineering" or
// "AVP, Cloud Modernization".
const LEVEL_ALIASES: Array<[RegExp, ProspectLevel]> = [
  // C-suite first — wins over "Chief of Staff" too, which is fine
  // since CoS is more c_level than anything else in our schema.
  [/^c[\s\-_]?level$/i, 'c_level'],
  [/\b(ceo|cto|cio|cfo|coo|cmo|cpo|cdo|chief)\b/i, 'c_level'],

  // SVP / EVP / Senior VP variants must come before plain VP so
  // "Senior Vice President" maps to svp, not vp.
  [/\bsvp\b|\bsenior\s+vp\b|\bsenior\s+vice\s+president\b|\bsr\.?\s+vice\s+president\b|\bsr\.?\s+vp\b/i, 'svp'],
  [/\bevp\b|\bexecutive\s+vice\s+president\b|\bexecutive\s+vp\b/i, 'svp'],

  // Stand-alone "Executive" title only. Things like "Executive Director"
  // resolve to director below, "Executive VP" already resolved to svp
  // above — we don't want to over-flag mid-level "Executive Something"
  // titles as executive.
  [/^executive$/i, 'executive'],

  // Plain VP variants — including AVP (Associate VP), AsstVP, Group VP,
  // Deputy VP, Vice President anywhere in the title, etc.
  [
    /\bvp\b|\bavp\b|\bvice\s+president\b|\bassociate\s+vice\s+president\b|\bassistant\s+vice\s+president\b|\bgroup\s+vp\b|\bdeputy\s+vp\b/i,
    'vp',
  ],

  // Director variants. Plain \bdirector\b covers most real-world
  // titles ("Director of Delivery", "Studio Director", "Senior
  // Director, Cloud Modernization"). "Head of X" is the GSI / studio
  // convention for the same level.
  [/\bdirector\b|\bdir\.?\b|\bhead\s+of\b/i, 'director'],

  // Manager variants. We bias to manager (not team_lead) when both
  // "manager" and "lead" appear in the same title.
  [/\bmanager\b|\bmgr\.?\b/i, 'manager'],

  // Team Lead / Tech Lead / Lead Engineer.
  [/\bteam[\s\-]?lead\b|\blead\s+engineer\b|\btech[\s\-]?lead\b|\bstaff\s+engineer\b|\bprincipal\s+engineer\b/i, 'team_lead'],
];

const LEADERSHIP: ProspectLevel[] = ['director', 'vp', 'svp', 'executive', 'c_level'];

export function normalizeLevel(input: string | null | undefined): ProspectLevel {
  if (!input) return 'unknown';
  const trimmed = String(input).trim();
  if (!trimmed) return 'unknown';
  for (const [re, level] of LEVEL_ALIASES) {
    if (re.test(trimmed)) return level;
  }
  return 'unknown';
}

// The ROI calculator is shown for leaders (Director / VP+) and
// executives. Lower-level individual contributors and managers do not
// need to make budget-shaped arguments, so the demo skips it for
// them and surfaces a workflow-focused page instead.
export function shouldShowRoiCalculator(level: ProspectLevel): boolean {
  return LEADERSHIP.includes(level);
}

export function levelDisplayName(level: ProspectLevel): string {
  switch (level) {
    case 'team_lead': return 'Team Lead';
    case 'manager': return 'Manager';
    case 'director': return 'Director';
    case 'vp': return 'VP';
    case 'svp': return 'SVP';
    case 'executive': return 'Executive';
    case 'c_level': return 'C-Level';
    case 'unknown': return 'Unknown';
  }
}
