import { VENDORS } from '@/lib/prospect/vendors';

// Sumble / ChatGTM emit free-form technology strings (e.g. "Snowflake
// Cortex", "Datadog APM", "GH Enterprise"). We canonicalize them to
// the vendor ids in our catalog so the demo page can render the
// matching branded stage. Anything that doesn't match falls through
// to `unmatched` and the demo will render an SDK automation card for
// it via the catch-all DefaultStage.

const ALIASES: Record<string, string[]> = {
  figma: ['figma'],
  datadog: ['datadog', 'dd', 'datadog apm', 'datadog logs'],
  sentry: ['sentry'],
  snyk: ['snyk', 'snyk open source'],
  snowflake: ['snowflake', 'snow', 'snowflake cortex', 'snowflake datacloud'],
  databricks: ['databricks', 'dbx', 'databricks lakehouse', 'unity catalog'],
  aws: ['aws', 'amazon web services', 'amazon aws', 'ec2', 'lambda', 's3', 'eks', 'rds', 'aurora'],
  github: ['github', 'gh', 'github enterprise', 'ghe', 'github actions'],
  gitlab: ['gitlab', 'gl', 'gitlab ee', 'gitlab self-managed'],
  zscaler: ['zscaler', 'zia', 'zpa'],
  jira: ['jira', 'jira software', 'atlassian jira'],
  slack: ['slack'],
  okta: ['okta', 'okta identity'],
  mongodb: ['mongodb', 'mongo', 'atlas', 'mongo atlas'],
};

const LOOKUP: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const [vendor, names] of Object.entries(ALIASES)) {
    for (const n of names) m.set(n.toLowerCase(), vendor);
  }
  // Additionally, allow the canonical vendor name itself to work even
  // when not listed explicitly above.
  for (const v of VENDORS) {
    m.set(v.id.toLowerCase(), v.id);
    m.set(v.name.toLowerCase(), v.id);
  }
  return m;
})();

export type NormalizedTechnologies = {
  vendorIds: string[];
  unmatched: string[];
  raw: string[];
};

export function normalizeTechnologies(input: ReadonlyArray<unknown> | null | undefined): NormalizedTechnologies {
  const raw: string[] = [];
  const seenVendor = new Set<string>();
  const vendorIds: string[] = [];
  const unmatched: string[] = [];

  if (!input || !Array.isArray(input)) {
    return { vendorIds, unmatched, raw };
  }

  for (const item of input) {
    if (typeof item !== 'string') continue;
    const cleaned = item.trim();
    if (!cleaned) continue;
    raw.push(cleaned);

    const key = cleaned.toLowerCase();
    let matched: string | undefined = LOOKUP.get(key);

    // Try a partial match for compound names (e.g. "Snowflake Cortex").
    if (!matched) {
      for (const [alias, vendor] of LOOKUP.entries()) {
        if (key === alias) { matched = vendor; break; }
        if (key.includes(alias) && alias.length >= 4) { matched = vendor; break; }
      }
    }

    if (matched) {
      if (!seenVendor.has(matched)) {
        seenVendor.add(matched);
        vendorIds.push(matched);
      }
    } else {
      unmatched.push(cleaned);
    }
  }

  return { vendorIds, unmatched, raw };
}
