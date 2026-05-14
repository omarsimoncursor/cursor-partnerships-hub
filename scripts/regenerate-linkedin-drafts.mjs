#!/usr/bin/env node
// Bulk-regenerate the linkedin_draft field on every existing prospect to the
// new template. ChatGTM's Prospecting Blitz prompt has been updated, so this
// is a one-shot pass to fix the historical drafts that landed under the old
// prompt (the "Gergely, your global IT asset management..." class of
// nonsense first sentences).
//
// New template:
//   "{FirstName} - we at Cursor would love the opportunity to partner
//    with {Company}. I built you an interactive demo showing how Cursor
//    agents can accelerate {team_focus}, interested to hear your thoughts"
//
// Walks GET /api/chatgtm/prospects with cursor pagination, regenerates
// the draft per row, PATCHes each one. Dry-run by default — pass --apply
// to commit. Skips already-sent prospects unless --include-sent is set
// (no point rewriting copy that's already pasted into LinkedIn).
//
// Usage:
//   BASE_URL=https://cursor.omarsimon.com \
//   CHATGTM_API_TOKEN=... \
//   node scripts/regenerate-linkedin-drafts.mjs              # dry-run
//
//   ... node scripts/regenerate-linkedin-drafts.mjs --apply  # commit
//
//   --filter-company-domain=unisys.com   # only one account
//   --include-sent                       # also rewrite already-sent
//   --base-url=http://localhost:3000     # local override

const args = parseArgs(process.argv.slice(2));
const BASE_URL =
  (args['base-url'] || process.env.BASE_URL || 'https://cursor.omarsimon.com').replace(/\/$/, '');
const TOKEN = process.env.CHATGTM_API_TOKEN;
const APPLY = !!args.apply;
const INCLUDE_SENT = !!args['include-sent'];
const FILTER_COMPANY_DOMAIN = args['filter-company-domain'] || null;

if (!TOKEN) {
  console.error('Missing CHATGTM_API_TOKEN env var. Set it to the same token ChatGTM uses.');
  process.exit(2);
}

// Map the prospect's classified `team` to a 2-3-word focus phrase that
// slots into "...accelerate {team_focus}, interested to hear your
// thoughts". Falls back to a neutral phrase when team is null / Other /
// any unrecognized value, so we don't generate broken sentences.
const TEAM_FOCUS = {
  'Cloud & Infrastructure': 'cloud infrastructure work',
  'Cybersecurity':          'security operations',
  'Platform':               'platform engineering work',
  'AI/ML':                  'ML model development',
  'Software Engineering':   'engineering velocity',
  'Data Engineering':       'data pipeline work',
  'DevOps':                 'deployment automation',
  'Security':               'security operations',
  'QA':                     'test automation',
  'Cloud':                  'cloud operations',
  'IT/Infrastructure':      'infrastructure operations',
  'Product':                'product development workflows',
  'Design':                 'design system work',
  'Embedded Systems':       'firmware development',
  'Computer Vision':        'computer vision pipelines',
  'Other':                  'engineering workflows',
};
const FALLBACK_FOCUS = 'engineering workflows';

function firstName(fullName) {
  if (!fullName) return '';
  // Split on whitespace; take first non-empty token. B2B sales data
  // doesn't typically carry titles ("Dr.", "Mr.") so this is safe.
  const parts = String(fullName).trim().split(/\s+/);
  return parts[0] || '';
}

function buildDraft(p) {
  const fn = firstName(p.name);
  const focus = TEAM_FOCUS[p.team] || FALLBACK_FOCUS;
  return (
    `${fn} - we at Cursor would love the opportunity to partner with ${p.company_name}. ` +
    `I built you an interactive demo showing how Cursor agents can accelerate ${focus}, ` +
    `interested to hear your thoughts`
  );
}

async function listAllProspects() {
  const collected = [];
  let cursor = null;
  for (let i = 0; i < 50; i += 1) {
    const url = new URL('/api/chatgtm/prospects', BASE_URL);
    url.searchParams.set('limit', '200');
    if (cursor) url.searchParams.set('cursor', cursor);
    if (FILTER_COMPANY_DOMAIN) url.searchParams.set('company_domain', FILTER_COMPANY_DOMAIN);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GET ${url.pathname}${url.search} failed: ${res.status} ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    for (const p of data.prospects) collected.push(p);
    cursor = data.next_cursor ?? null;
    if (!cursor) break;
  }
  return collected;
}

async function patchProspect(id, body) {
  const res = await fetch(`${BASE_URL}/api/chatgtm/prospects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH /${id} failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

function summaryRow(p, action, oldDraft, newDraft) {
  const tag = (
    action === 'rewrite'    ? '~' :
    action === 'skip-sent'  ? '·' :
    action === 'skip-empty' ? '·' :
    action === 'skip-same'  ? '=' :
                              '?'
  );
  console.log(`  ${tag} ${p.name.padEnd(22)} ${(p.company_name || '?').padEnd(14)} team=${(p.team || '-').padEnd(22)} (${action})`);
  if (action === 'rewrite') {
    console.log(`      old: ${oldDraft || '(empty)'}`);
    console.log(`      new: ${newDraft}`);
  }
}

(async () => {
  console.log(`Base URL:               ${BASE_URL}`);
  console.log(`Mode:                   ${APPLY ? 'APPLY (will PATCH)' : 'DRY-RUN (read-only)'}`);
  console.log(`Include already-sent:   ${INCLUDE_SENT}`);
  if (FILTER_COMPANY_DOMAIN) console.log(`Filter company_domain:  ${FILTER_COMPANY_DOMAIN}`);
  console.log('');

  const prospects = await listAllProspects();
  console.log(`Loaded ${prospects.length} prospects`);
  console.log('');

  let toRewrite = 0;
  let skippedSent = 0;
  let skippedEmpty = 0;
  let skippedSame = 0;
  const errors = [];

  for (const p of prospects) {
    if (!p.linkedin_draft) {
      // Per the user: rewrite EXISTING drafts. Rows without a draft yet
      // are left alone — ChatGTM with the updated prompt will fill them
      // in correctly on the next run.
      summaryRow(p, 'skip-empty');
      skippedEmpty += 1;
      continue;
    }
    if (p.linkedin_sent && !INCLUDE_SENT) {
      summaryRow(p, 'skip-sent');
      skippedSent += 1;
      continue;
    }
    const next = buildDraft(p);
    if (next === p.linkedin_draft) {
      summaryRow(p, 'skip-same');
      skippedSame += 1;
      continue;
    }
    summaryRow(p, 'rewrite', p.linkedin_draft, next);
    toRewrite += 1;
    if (APPLY) {
      try {
        await patchProspect(p.id, { linkedin_draft: next });
      } catch (err) {
        console.error(`      ERROR: ${err.message}`);
        errors.push({ id: p.id, name: p.name, error: err.message });
      }
    }
  }

  console.log('');
  console.log(`Summary:`);
  console.log(`  rewritten:           ${toRewrite}${APPLY ? '' : ' (dry-run; not applied)'}`);
  console.log(`  skipped (no draft):  ${skippedEmpty}`);
  console.log(`  skipped (sent):      ${skippedSent}${INCLUDE_SENT ? '' : ' (override with --include-sent)'}`);
  console.log(`  skipped (no change): ${skippedSame}`);
  if (errors.length > 0) {
    console.log(`  errors:              ${errors.length}`);
    for (const e of errors) console.log(`    [${e.id}] ${e.name}: ${e.error}`);
    process.exit(1);
  }

  if (!APPLY && toRewrite > 0) {
    console.log('');
    console.log('Re-run with --apply to commit.');
  }
})();

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq === -1) {
        out[a.slice(2)] = true;
      } else {
        out[a.slice(2, eq)] = a.slice(eq + 1);
      }
    }
  }
  return out;
}
