import {
  CUSTOMERS,
  parseSelector,
  matchesSelector,
  type CustomerRecord,
} from './customer-store';

export interface ProfileQuery {
  username: string;
}

/**
 * Vulnerable on purpose. The username string is interpolated directly into the
 * Mongo-style selector, so a payload like `' || '1'=='1` collapses the
 * predicate to "always true" and the function returns every record in the
 * store — including hashed passwords and admin flags.
 *
 * The Cursor agent rewrites this function to:
 *   1. Reject usernames that fail an allowlist regex.
 *   2. Pass the value as a parameter to the selector instead of interpolating.
 *
 * `scripts/reset-snyk-demo.sh` rewrites the file back to this state.
 */
export function lookupCustomerProfile(query: ProfileQuery): CustomerRecord[] {
  const tainted = `{ "username": "${query.username}" }`;
  const selector = parseSelector(tainted);
  return CUSTOMERS.filter(record => matchesSelector(record, selector));
}
