import {
  formatSignalRawValue,
  formatSignalType,
  formatPriorityTier,
} from '../src/lib/outreach-store/signal-labels';

let failed = false;

if (formatSignalType('golden_signup') !== 'Signed up for Cursor') {
  console.error('golden_signup label');
  failed = true;
}
if (formatSignalRawValue('signup_email_matches_employer', true) !== 'Yes') {
  console.error('bool format');
  failed = true;
}
if (formatPriorityTier('hot') !== 'Hot — reach out soon') {
  console.error('priority tier');
  failed = true;
}

if (failed) process.exit(1);
console.log('signal-labels tests passed');
