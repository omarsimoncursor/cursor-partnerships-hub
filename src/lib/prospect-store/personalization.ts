// Server-side inference for `classified_level` and `mcp_detail` when
// ChatGTM's Prospecting Blitz omits them on ingest. There is NO cron
// job — these fields are expected from the agent on create, and this
// module backfills / infers when they're missing.
//
// Cadence: inference runs (a) on every POST /api/chatgtm/prospects
// upsert when either field is null, and (b) on demand via
// POST /api/chatgtm/admin/dedup-prospects (bundled with the email
// dedup migration).

import type { ProspectLevel } from './levels';
import { normalizeLevel } from './levels';

export const CLASSIFIED_LEVELS = [
  'Executive',
  'Leader (Dir/VP+)',
  'Manager',
  'IC',
] as const;

export type ClassifiedLevel = (typeof CLASSIFIED_LEVELS)[number];

export function inferClassifiedLevel(args: {
  levelNormalized: ProspectLevel;
  levelRaw?: string | null;
  classifiedLevel?: string | null;
}): ClassifiedLevel {
  const existing = (args.classifiedLevel ?? '').trim();
  if (isClassifiedLevel(existing)) return existing;

  const fromNorm = mapNormalizedLevel(args.levelNormalized);
  if (fromNorm) return fromNorm;

  const fromRaw = mapNormalizedLevel(normalizeLevel(args.levelRaw ?? null));
  if (fromRaw) return fromRaw;

  return 'IC';
}

function mapNormalizedLevel(level: ProspectLevel): ClassifiedLevel | null {
  switch (level) {
    case 'c_level':
    case 'executive':
    case 'svp':
      return 'Executive';
    case 'vp':
    case 'director':
      return 'Leader (Dir/VP+)';
    case 'manager':
    case 'team_lead':
      return 'Manager';
    case 'unknown':
      return null;
    default:
      return null;
  }
}

export function isClassifiedLevel(value: string): value is ClassifiedLevel {
  return (CLASSIFIED_LEVELS as readonly string[]).includes(value);
}

export function isPersonalizationReady(
  classifiedLevel: string | null | undefined,
  mcpDetail: string | null | undefined,
): boolean {
  return isClassifiedLevel((classifiedLevel ?? '').trim()) && Boolean((mcpDetail ?? '').trim());
}

export function inferPreferredFirstName(name: string, email: string | null | undefined): string | null {
  const emailLocal = (email ?? '').split('@')[0]?.trim().toLowerCase();
  if (!emailLocal) return null;
  const emailFirst = emailLocal.split(/[._+-]/)[0];
  if (!emailFirst || emailFirst.length < 2) return null;

  const nameFirst = name.trim().split(/\s+/)[0]?.toLowerCase();
  if (!nameFirst || nameFirst === emailFirst) return null;

  // Capitalize first letter for display.
  return emailFirst.charAt(0).toUpperCase() + emailFirst.slice(1);
}

export function generateMcpDetail(args: {
  name: string;
  companyName: string;
  classifiedLevel: ClassifiedLevel;
  team?: string | null;
  levelRaw?: string | null;
  vendorIds?: string[];
  unmatchedTechnologies?: string[];
}): string {
  const role = (args.levelRaw ?? '').trim() || args.classifiedLevel;
  const teamPhrase = args.team?.trim()
    ? `${args.team} team`
    : classifiedTeamPhrase(args.classifiedLevel);

  const techs = [
    ...(args.vendorIds ?? []),
    ...(args.unmatchedTechnologies ?? []).slice(0, 2),
  ]
    .filter(Boolean)
    .slice(0, 3);

  const techPhrase =
    techs.length > 0
      ? techs.join(', ')
      : 'your existing engineering toolchain';

  const opener =
    args.classifiedLevel === 'Executive'
      ? `As ${role} at ${args.companyName}, you're in a strong position to standardize how engineering teams adopt AI-assisted development.`
      : args.classifiedLevel === 'Leader (Dir/VP+)'
      ? `As ${role} at ${args.companyName}, your ${teamPhrase} can move faster when AI tooling plugs directly into day-to-day workflows.`
      : args.classifiedLevel === 'Manager'
      ? `As ${role} at ${args.companyName}, your ${teamPhrase} is likely juggling delivery pressure across ${techPhrase}.`
      : `As an engineer at ${args.companyName}, you're probably experimenting with Cursor alongside ${techPhrase}.`;

  const closer =
    args.classifiedLevel === 'IC'
      ? `Cursor's MCP marketplace and SDK make it easy to wire IDE actions into the tools your team already uses.`
      : `Cursor's MCP marketplace and SDK let your ${teamPhrase} automate workflows across ${techPhrase} without ripping out what's already working.`;

  return `${opener} ${closer}`;
}

function classifiedTeamPhrase(level: ClassifiedLevel): string {
  switch (level) {
    case 'Executive':
      return 'engineering organization';
    case 'Leader (Dir/VP+)':
      return 'platform and delivery teams';
    case 'Manager':
      return 'team';
    case 'IC':
      return 'team';
  }
}

export function resolvePersonalizationFields(args: {
  name: string;
  email?: string | null;
  companyName: string;
  levelRaw?: string | null;
  levelNormalized: ProspectLevel;
  classifiedLevel?: string | null;
  mcpDetail?: string | null;
  team?: string | null;
  vendorIds?: string[];
  unmatchedTechnologies?: string[];
}): {
  classified_level: ClassifiedLevel;
  mcp_detail: string;
  preferred_first_name: string | null;
} {
  const classified_level = inferClassifiedLevel({
    levelNormalized: args.levelNormalized,
    levelRaw: args.levelRaw,
    classifiedLevel: args.classifiedLevel,
  });
  const mcp_detail =
    (args.mcpDetail ?? '').trim() ||
    generateMcpDetail({
      name: args.name,
      companyName: args.companyName,
      classifiedLevel: classified_level,
      team: args.team,
      levelRaw: args.levelRaw,
      vendorIds: args.vendorIds,
      unmatchedTechnologies: args.unmatchedTechnologies,
    });
  return {
    classified_level,
    mcp_detail,
    preferred_first_name: inferPreferredFirstName(args.name, args.email ?? null),
  };
}
