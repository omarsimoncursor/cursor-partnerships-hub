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

const LEVEL_ALIASES: Array<[RegExp, ProspectLevel]> = [
  [/^c[\s\-_]?level$/i, 'c_level'],
  [/\b(ceo|cto|cio|cfo|coo|cmo|cpo|cdo|chief)\b/i, 'c_level'],
  [/\bexecutive\b/i, 'executive'],
  [/\bsvp\b|^senior vp$|^senior vice president$/i, 'svp'],
  [/\bvp\b|^vice president$/i, 'vp'],
  [/\bdirector\b|^dir$/i, 'director'],
  [/\bhead\sof\b/i, 'director'],
  [/\bmanager\b|^mgr$/i, 'manager'],
  [/\bteam[\s\-]?lead\b|\blead engineer\b|\btech[\s\-]?lead\b/i, 'team_lead'],
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
