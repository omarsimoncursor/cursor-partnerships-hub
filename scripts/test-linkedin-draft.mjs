#!/usr/bin/env node
// Regression test for src/lib/prospect-store/linkedin-draft-template.ts.
// Run with:
//   node scripts/test-linkedin-draft.mjs
//
// We can't pull TS modules directly with plain `node` so the template +
// firstNameFor() are duplicated here. If you change the source, keep
// this in sync — the assertions below pin the contract that the
// Sequences-tab "Fill drafts" toolbar relies on.

const DEFAULT_LINKEDIN_DRAFT_TEMPLATE =
  "{firstName} - i put together a personalized interactive demo to illustrate how Cursor agents can automate workflows across existing technology stacks. If you have a moment to take a look, I'd love to hear your thoughts!";

function firstNameFor(name) {
  if (!name) return null;
  const trimmed = String(name).trim();
  if (!trimmed) return null;
  const commaIdx = trimmed.indexOf(',');
  const head = commaIdx >= 0 ? trimmed.slice(commaIdx + 1).trim() : trimmed;
  const firstToken = head.split(/\s+/)[0] || '';
  const cleaned = firstToken.replace(/[^\p{L}\p{M}'\-]+$/u, '').trim();
  if (!cleaned) return null;
  if (cleaned.length > 40) return cleaned.slice(0, 40);
  return cleaned;
}

function buildDefaultLinkedinDraft(name) {
  const first = firstNameFor(name) || 'there';
  return DEFAULT_LINKEDIN_DRAFT_TEMPLATE.replace('{firstName}', first);
}

const FIRST_NAME_CASES = [
  // [input, expected]
  ['Anindya Saha', 'Anindya'],
  ['Vivek Kumar', 'Vivek'],
  ['Rajesh Sreepada', 'Rajesh'],
  ['Anand Kumar', 'Anand'],
  ['Jane', 'Jane'],
  ['Jane.', 'Jane'],
  ['  Jane  Doe  ', 'Jane'],
  ['Saha, Anindya', 'Anindya'],
  ['Doe, John Q.', 'John'],
  ["O'Brien Patrick", "O'Brien"],
  ['Marie-Claire Dubois', 'Marie-Claire'],
  ['', null],
  ['   ', null],
  [null, null],
  [undefined, null],
  ['Jose', 'Jose'],
  // Capped at 40 chars
  ['Supercalifragilisticexpialidocious-Longname Z', 'Supercalifragilisticexpialidocious-Longn'],
];

let pass = 0;
let fail = 0;
const failures = [];

for (const [input, expected] of FIRST_NAME_CASES) {
  const actual = firstNameFor(input);
  if (actual === expected) {
    pass += 1;
  } else {
    fail += 1;
    failures.push({ fn: 'firstNameFor', input, expected, actual });
  }
}

const DRAFT_CASES = [
  [
    'Anindya Saha',
    "Anindya - i put together a personalized interactive demo to illustrate how Cursor agents can automate workflows across existing technology stacks. If you have a moment to take a look, I'd love to hear your thoughts!",
  ],
  [
    null,
    "there - i put together a personalized interactive demo to illustrate how Cursor agents can automate workflows across existing technology stacks. If you have a moment to take a look, I'd love to hear your thoughts!",
  ],
  [
    'Saha, Anindya',
    "Anindya - i put together a personalized interactive demo to illustrate how Cursor agents can automate workflows across existing technology stacks. If you have a moment to take a look, I'd love to hear your thoughts!",
  ],
];

for (const [input, expected] of DRAFT_CASES) {
  const actual = buildDefaultLinkedinDraft(input);
  if (actual === expected) {
    pass += 1;
  } else {
    fail += 1;
    failures.push({ fn: 'buildDefaultLinkedinDraft', input, expected, actual });
  }
}

console.log(`\n  ${pass} passed, ${fail} failed (${FIRST_NAME_CASES.length + DRAFT_CASES.length} total)`);

if (failures.length > 0) {
  console.log('\n  Failures:');
  for (const f of failures) {
    console.log(`    ${f.fn}(${JSON.stringify(f.input)})`);
    console.log(`      expected: ${JSON.stringify(f.expected)}`);
    console.log(`      actual:   ${JSON.stringify(f.actual)}`);
  }
  process.exit(1);
}

console.log('  All LinkedIn-draft template assertions hold.\n');
