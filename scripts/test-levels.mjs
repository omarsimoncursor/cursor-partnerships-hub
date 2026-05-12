#!/usr/bin/env node
// Regression test for src/lib/prospect-store/levels.ts. Run with:
//   node scripts/test-levels.mjs
//
// We can't pull TS modules directly with plain `node` so the regex
// list is duplicated here. If you change LEVEL_ALIASES in the source,
// keep this in sync — the assertions below pin the contract that
// ChatGTM's outbound payloads rely on.

const LEVEL_ALIASES = [
  [/^c[\s\-_]?level$/i, 'c_level'],
  [/\b(ceo|cto|cio|cfo|coo|cmo|cpo|cdo|chief)\b/i, 'c_level'],
  [/\bsvp\b|\bsenior\s+vp\b|\bsenior\s+vice\s+president\b|\bsr\.?\s+vice\s+president\b|\bsr\.?\s+vp\b/i, 'svp'],
  [/\bevp\b|\bexecutive\s+vice\s+president\b|\bexecutive\s+vp\b/i, 'svp'],
  [
    /\bvp\b|\bavp\b|\bvice\s+president\b|\bassociate\s+vice\s+president\b|\bassistant\s+vice\s+president\b|\bgroup\s+vp\b|\bdeputy\s+vp\b/i,
    'vp',
  ],
  [/^executive$/i, 'executive'],
  [/\bdirector\b|\bdir\.?\b|\bhead\s+of\b/i, 'director'],
  [/\bmanager\b|\bmgr\.?\b/i, 'manager'],
  [/\bteam[\s\-]?lead\b|\blead\s+engineer\b|\btech[\s\-]?lead\b|\bstaff\s+engineer\b|\bprincipal\s+engineer\b/i, 'team_lead'],
];

function normalizeLevel(input) {
  if (!input) return 'unknown';
  const trimmed = String(input).trim();
  if (!trimmed) return 'unknown';
  for (const [re, level] of LEVEL_ALIASES) {
    if (re.test(trimmed)) return level;
  }
  return 'unknown';
}

const LEADERSHIP = new Set(['director', 'vp', 'svp', 'executive', 'c_level']);
function shouldShowRoiCalculator(level) {
  return LEADERSHIP.has(level);
}

// Each case: [raw_title, expected_level, expected_roi]
const CASES = [
  // Cases that ChatGTM reported as broken (Anindya Saha, Vivek Kumar,
  // Rajesh Sreepada, Anand Kumar) — Vice President / AVP variants in
  // longer titles. These regress-tested previously to `unknown`.
  ['Vice President', 'vp', true],
  ['Vice President of Engineering', 'vp', true],
  ['Vice President, Cloud Modernization', 'vp', true],
  ['Vice President - Studio Lead', 'vp', true],
  ['AVP', 'vp', true],
  ['AVP, Engineering', 'vp', true],
  ['AVP - Cloud Modernization', 'vp', true],
  ['Associate Vice President', 'vp', true],
  ['Assistant Vice President', 'vp', true],
  ['Group VP', 'vp', true],

  // SVP / EVP variants must beat plain VP.
  ['SVP', 'svp', true],
  ['EVP', 'svp', true],
  ['Senior Vice President', 'svp', true],
  ['Senior Vice President, Studios', 'svp', true],
  ['Senior VP', 'svp', true],
  ['Sr. Vice President', 'svp', true],
  ['Sr VP', 'svp', true],
  ['EVP of Sales', 'svp', true],
  ['Executive Vice President', 'svp', true],

  // Existing cases that previously worked — still must work after the
  // regex rewrite.
  ['Director of Delivery', 'director', true],
  ['Studio Director', 'director', true],
  ['Technology Director', 'director', true],
  ['Senior Director, Cloud', 'director', true],
  ['VP', 'vp', true],
  ['VP of Engineering', 'vp', true],
  ['VP, Engineering', 'vp', true],
  ['VP-Engineering', 'vp', true],
  ['Engineering Manager', 'manager', false],
  ['Delivery Manager', 'manager', false],
  ['Team Lead', 'team_lead', false],
  ['Tech Lead', 'team_lead', false],
  ['Chief Technology Officer', 'c_level', true],
  ['CTO', 'c_level', true],
  ['Head of Platform', 'director', true],

  // Falsy / unknown.
  ['', 'unknown', false],
  ['Software Engineer', 'unknown', false],
  ['Product Manager', 'manager', false],
];

let pass = 0;
let fail = 0;
const failures = [];

for (const [raw, expectedLevel, expectedRoi] of CASES) {
  const actualLevel = normalizeLevel(raw);
  const actualRoi = shouldShowRoiCalculator(actualLevel);
  const levelOk = actualLevel === expectedLevel;
  const roiOk = actualRoi === expectedRoi;
  if (levelOk && roiOk) {
    pass += 1;
  } else {
    fail += 1;
    failures.push({
      raw,
      expected: { level: expectedLevel, roi: expectedRoi },
      actual: { level: actualLevel, roi: actualRoi },
    });
  }
}

console.log(`\n  ${pass} passed, ${fail} failed (${CASES.length} total)`);

if (failures.length > 0) {
  console.log('\n  Failures:');
  for (const f of failures) {
    console.log(`    "${f.raw}"`);
    console.log(`      expected: level=${f.expected.level} roi=${f.expected.roi}`);
    console.log(`      actual:   level=${f.actual.level} roi=${f.actual.roi}`);
  }
  process.exit(1);
}

console.log('  All level / ROI normalization assertions hold.\n');
