// Pre-set company defaults so a ChatGTM payload with just a name (no
// domain, no accent, no tech list) still produces a fully branded
// demo. The accents below are the closest match to each company's
// public brand color; the default tech stacks reflect what these
// companies publicly disclose using (annual reports, careers pages,
// etc.) and are only used as a fallback when ChatGTM doesn't pass
// technologies along.

export type CompanyDefaults = {
  domain: string;
  name: string;
  accent: string;
  defaultTechs: string[];
  notes?: string;
};

export const COMPANY_SEEDS: CompanyDefaults[] = [
  {
    name: 'Unisys',
    domain: 'unisys.com',
    accent: '#FFB81C',
    defaultTechs: ['AWS', 'Azure', 'GitHub', 'Datadog', 'Snowflake', 'Jira'],
    notes: 'Global IT services + ClearPath Forward modernization. Heavy AWS + Azure footprint.',
  },
  {
    name: 'Cognizant',
    domain: 'cognizant.com',
    accent: '#1A4DA1',
    defaultTechs: ['AWS', 'Azure', 'Snowflake', 'Databricks', 'GitHub', 'Jira', 'Slack'],
    notes: 'Tier-1 GSI delivering enterprise modernization. Strong AWS + Azure + Snowflake practices.',
  },
  {
    name: 'Concentrix',
    domain: 'concentrix.com',
    accent: '#0033A0',
    defaultTechs: ['AWS', 'Snowflake', 'Datadog', 'GitHub', 'Slack', 'Okta'],
    notes: 'CX engineering arm (incl. ex-PK Technology). Builds custom platforms for F500 clients.',
  },
  {
    name: 'KLA',
    domain: 'kla.com',
    accent: '#0099D8',
    defaultTechs: ['AWS', 'Databricks', 'Snowflake', 'GitHub', 'Jira', 'Datadog', 'MongoDB'],
    notes: 'Semiconductor process control. Heavy compute + analytics workloads on AWS + Databricks.',
  },
  {
    name: 'Globant',
    // Brand green per the Globant wordmark. ChatGTM confirmed #BFD730 is the
    // best match against their internal style guide; the demo page picks
    // this up automatically when the inbound payload omits company_accent.
    domain: 'globant.com',
    accent: '#BFD730',
    defaultTechs: ['AWS', 'GitHub', 'Datadog', 'Sentry', 'Snowflake', 'Slack', 'Jira'],
    notes: 'Digital engineering pure-play; operates Globant.AI. Mostly AWS, Datadog, GitHub.',
  },
];

const SEED_BY_DOMAIN = new Map<string, CompanyDefaults>(
  COMPANY_SEEDS.map((c) => [c.domain.toLowerCase(), c]),
);

const SEED_BY_NAME = new Map<string, CompanyDefaults>(
  COMPANY_SEEDS.map((c) => [c.name.toLowerCase(), c]),
);

const FALLBACK_ACCENT = '#60a5fa';
const FALLBACK_TECHS = ['AWS', 'GitHub', 'Datadog', 'Snowflake', 'Slack', 'Jira'];

export function resolveCompanyDefaults(
  name: string,
  domain: string,
): CompanyDefaults {
  const cleanedDomain = domain.toLowerCase();
  const seed = SEED_BY_DOMAIN.get(cleanedDomain) || SEED_BY_NAME.get(name.toLowerCase());
  if (seed) {
    return { ...seed, domain: cleanedDomain || seed.domain, name };
  }
  return {
    name,
    domain: cleanedDomain || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`,
    accent: FALLBACK_ACCENT,
    defaultTechs: FALLBACK_TECHS.slice(),
  };
}
