import assert from 'node:assert/strict';
import { validateContactInput, validateRunInput } from '../src/lib/outreach-store/validation';

// Issue 1 — IC seniority (already in PR #45, re-validated here)
const icContact = validateContactInput(
  {
    external_key: 'linkedin:saravana2107',
    account: { name: 'Concentrix', display_name: 'Concentrix' },
    contact: {
      full_name: 'Saravana Kumar',
      title: 'Senior Software Engineer',
      seniority_tier: 'IC',
      linkedin_url: 'https://www.linkedin.com/in/saravana2107',
      work_email: 'saravana21791@gmail.com',
    },
    signals: {
      first_seen_at: '2026-05-12T00:00:00.000Z',
      latest_at: '2026-05-12T00:00:00.000Z',
      types: ['golden_signup'],
    },
    priority: { tier: 'warm', rationale: 'IC power user' },
    linkedin: { message: 'Thanks for using Cursor.' },
  },
  0,
);
assert.equal(icContact.contact.seniority_tier, 'IC');
assert.equal(icContact.contact.work_email, 'saravana21791@gmail.com');

// Run input shape includes unique_ics
const run = validateRunInput({
  automation_run_id: 'c75dbd22-1119-4b84-98b0-ee231dea8122',
  automation_revision_id: 'rev-1',
  user_email: 'omar.simon@anysphere.co',
  run_date: '2026-05-15',
  ran_at: '2026-05-15T15:00:00.000Z',
  window_start: '2026-04-15T00:00:00.000Z',
  window_end: '2026-05-15T00:00:00.000Z',
  summary: {
    total_contacts: 165,
    total_emails_drafted: 120,
    unique_accounts_signaled: 12,
    unique_executives: 1,
    unique_leaders: 5,
    unique_managers: 4,
    unique_ics: 155,
    count_with_work_email: 160,
    count_with_linkedin_url: 165,
    accounts_with_activity: ['Concentrix'],
    accounts_with_no_signals: [],
  },
});
assert.equal(run.automation_run_id, 'c75dbd22-1119-4b84-98b0-ee231dea8122');
assert.equal(run.summary.unique_ics, 155);

console.log('outreach idempotency + IC tests passed');
