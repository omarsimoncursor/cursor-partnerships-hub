import assert from 'node:assert/strict';
import {
  inferClassifiedLevel,
  inferPreferredFirstName,
  isPersonalizationReady,
  resolvePersonalizationFields,
} from '../src/lib/prospect-store/personalization';

assert.equal(
  inferClassifiedLevel({ levelNormalized: 'vp', levelRaw: 'VP Engineering' }),
  'Leader (Dir/VP+)',
);
assert.equal(
  inferClassifiedLevel({ levelNormalized: 'unknown', levelRaw: 'Senior Engineer' }),
  'IC',
);
assert.equal(inferPreferredFirstName('Robert Barnett', 'bobby.barnett@kla.com'), 'Bobby');
assert.equal(inferPreferredFirstName('Jane Doe', 'jane.doe@kla.com'), null);

const resolved = resolvePersonalizationFields({
  name: 'Rodney Smedt',
  email: 'rodney.smedt@kla.com',
  companyName: 'KLA',
  levelRaw: 'Director of Engineering',
  levelNormalized: 'director',
  vendorIds: ['datadog', 'github'],
  unmatchedTechnologies: [],
});
assert.equal(resolved.classified_level, 'Leader (Dir/VP+)');
assert.ok(resolved.mcp_detail.length > 40);
assert.equal(isPersonalizationReady(resolved.classified_level, resolved.mcp_detail), true);
assert.equal(isPersonalizationReady(resolved.classified_level, null), false);

console.log('personalization tests passed');
