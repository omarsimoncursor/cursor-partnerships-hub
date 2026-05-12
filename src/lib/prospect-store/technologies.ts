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

// Strings Sumble emits that aren't real automation targets — programming
// languages, frontend frameworks, build tooling, CSS libraries, etc. They
// would otherwise render as awkward "Wire React into a Cursor cloud agent
// via REST/SDK" cards on the demo page. We silently drop them from the
// `unmatched` list (they're still preserved verbatim in `technologies_raw`
// for the audit trail).
const NOISE_TERMS = new Set<string>([
  // Languages
  'python', 'java', 'javascript', 'typescript', 'kotlin', 'swift', 'scala',
  'c#', 'c++', 'c', 'ruby', 'go', 'golang', 'rust', 'php', 'perl', 'r',
  'objective-c', 'dart', 'elixir', 'erlang', 'haskell', 'lua',
  // Frontend frameworks + libraries
  'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'vuejs', 'angular',
  'angularjs', 'svelte', 'sveltekit', 'ember', 'ember.js', 'next', 'next.js',
  'nextjs', 'nuxt', 'nuxt.js', 'gatsby', 'remix', 'solid', 'solid.js', 'qwik',
  'redux', 'mobx', 'recoil', 'zustand', 'jotai',
  // CSS / styling
  'tailwind', 'tailwindcss', 'tailwind css', 'bootstrap', 'sass', 'scss',
  'less', 'styled-components', 'emotion',
  // Build / transpile
  'webpack', 'vite', 'esbuild', 'babel', 'rollup', 'parcel', 'turbopack',
  'swc', 'rome',
  // Backend frameworks (mostly languages, not automation targets)
  'express', 'express.js', 'fastify', 'koa', 'nestjs', 'nest.js', 'django',
  'flask', 'fastapi', 'rails', 'ruby on rails', 'spring', 'spring boot',
  'laravel', 'symfony', 'asp.net', '.net', 'dotnet', 'gin', 'echo',
  // Mobile
  'react native', 'react-native', 'flutter', 'ionic',
  // Dev tooling that isn't really a workflow target on its own
  'eslint', 'prettier', 'tsc',
  // Generic categories
  'rest', 'rest api', 'graphql', 'grpc', 'websocket', 'websockets',
]);

export type NormalizedTechnologies = {
  vendorIds: string[];
  unmatched: string[];
  raw: string[];
  // Items that were quietly filtered out (languages, frontend frameworks,
  // etc.). Surfaced in the API response and stored on the prospect row so
  // ChatGTM / the rep can audit what was dropped.
  filtered: string[];
};

export function normalizeTechnologies(input: ReadonlyArray<unknown> | null | undefined): NormalizedTechnologies {
  const raw: string[] = [];
  const seenVendor = new Set<string>();
  const vendorIds: string[] = [];
  const unmatched: string[] = [];
  const filtered: string[] = [];

  if (!input || !Array.isArray(input)) {
    return { vendorIds, unmatched, raw, filtered };
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
      continue;
    }

    if (NOISE_TERMS.has(key)) {
      filtered.push(cleaned);
      continue;
    }

    unmatched.push(cleaned);
  }

  return { vendorIds, unmatched, raw, filtered };
}
