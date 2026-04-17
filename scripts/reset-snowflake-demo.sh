#!/usr/bin/env bash
set -euo pipefail

# Resets the Snowflake demo legacy files to their original, vendor-locked state.
# Run this after merging a modernization PR so the demo can be re-played.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
BTEQ_FILE="$REPO_ROOT/src/lib/demo/legacy-teradata/daily_revenue_rollup.bteq"
TSQL_FILE="$REPO_ROOT/src/lib/demo/legacy-sqlserver/usp_enrich_customers_360.sql"
INFA_FILE="$REPO_ROOT/src/lib/demo/legacy-informatica/wf_customers_360.xml"

cd "$REPO_ROOT"

echo "→ Restoring legacy BTEQ, T-SQL, and Informatica files from HEAD..."
git checkout HEAD -- \
  "$BTEQ_FILE" \
  "$TSQL_FILE" \
  "$INFA_FILE"

# Sanity checks: each file must parse on the ~5 dialect-specific idioms the
# modernization targets. If any are missing, the demo won't read right.
echo "→ Verifying BTEQ still contains the Teradata idioms..."
grep -q "MULTISET VOLATILE" "$BTEQ_FILE"
grep -q "QUALIFY" "$BTEQ_FILE"
grep -q "COLLECT STATISTICS" "$BTEQ_FILE"

echo "→ Verifying T-SQL still contains the SQL Server idioms..."
grep -q "CROSS APPLY" "$TSQL_FILE"
grep -q "OPENJSON" "$TSQL_FILE"
grep -q "MERGE INTO" "$TSQL_FILE"

echo "→ Verifying Informatica XML still contains the mapping..."
grep -q "m_customer_360_enrich" "$INFA_FILE"
grep -q "Source Qualifier" "$INFA_FILE"

BTEQ_LOC=$(wc -l < "$BTEQ_FILE" | tr -d ' ')
TSQL_LOC=$(wc -l < "$TSQL_FILE" | tr -d ' ')
INFA_LOC=$(wc -l < "$INFA_FILE" | tr -d ' ')

echo ""
echo "Snowflake demo reset complete."
echo "  BTEQ         : $BTEQ_LOC lines"
echo "  T-SQL proc   : $TSQL_LOC lines"
echo "  Informatica  : $INFA_LOC lines"
echo ""
echo "Commit + push to redeploy:"
echo "  git commit --allow-empty -m 'chore: reset snowflake demo legacy files'"
echo "  git push origin main"
