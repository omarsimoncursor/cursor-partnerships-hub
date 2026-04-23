#!/usr/bin/env bash
set -euo pipefail

# Resets the Snyk demo bug files to their original (vulnerable) state.
# Run this after merging a fix PR to make the demo repeatable.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
PROFILE_FILE="$REPO_ROOT/src/lib/demo/customer-profile.ts"

cat > "$PROFILE_FILE" << 'PROFEOF'
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
PROFEOF

cd "$REPO_ROOT"
git add "$PROFILE_FILE"
git commit -m "chore: reset snyk demo bug for next run"
echo ""
echo "Demo bug reset. Push to main to redeploy:"
echo "  git push origin main"
