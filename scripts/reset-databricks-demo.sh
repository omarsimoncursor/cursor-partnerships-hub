#!/usr/bin/env bash
set -euo pipefail

# Resets the Databricks demo legacy assets to their original (pre-migration)
# state. Run this after merging a fix PR to make the demo repeatable.
#
# The trigger-card demo reads the real legacy PL/SQL + Informatica XML from
# disk via /api/migration/analyze — so the bug files need to be restored to
# the shape that ships on `main`.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
LEGACY_DIR="$REPO_ROOT/src/lib/demo/legacy-oracle"
PLSQL_FILE="$LEGACY_DIR/customer_rfm_segmentation.sql"
INFA_FILE="$LEGACY_DIR/wf_m_customer_rfm.xml"
INDEX_FILE="$LEGACY_DIR/index.ts"

cd "$REPO_ROOT"

if [ ! -d ".git" ]; then
  echo "error: not a git repo. Run from the root of cursor-for-enterprise." >&2
  exit 1
fi

echo "==> Restoring legacy assets from HEAD…"
git checkout HEAD -- "$PLSQL_FILE" "$INFA_FILE" "$INDEX_FILE"

echo "==> Verifying files are readable + parseable…"
for f in "$PLSQL_FILE" "$INFA_FILE" "$INDEX_FILE"; do
  if [ ! -s "$f" ]; then
    echo "error: $f is missing or empty after checkout." >&2
    exit 1
  fi
done

# Sanity-check the PL/SQL still contains the signature idioms the demo asserts.
if ! grep -q "GLOBAL TEMPORARY TABLE"      "$PLSQL_FILE"; then echo "fail: GLOBAL TEMPORARY TABLE missing"  >&2; exit 1; fi
if ! grep -q "CURSOR"                       "$PLSQL_FILE"; then echo "fail: CURSOR missing"                  >&2; exit 1; fi
if ! grep -q "MERGE INTO"                   "$PLSQL_FILE"; then echo "fail: MERGE INTO missing"              >&2; exit 1; fi
if ! grep -q "CONNECT BY"                   "$PLSQL_FILE"; then echo "fail: CONNECT BY missing"              >&2; exit 1; fi
if ! grep -q "NVL("                         "$PLSQL_FILE"; then echo "fail: NVL missing"                     >&2; exit 1; fi
if ! grep -q "TO_CHAR"                      "$PLSQL_FILE"; then echo "fail: TO_CHAR missing"                 >&2; exit 1; fi

# Sanity-check the Informatica mapping still has all four required transforms.
if ! grep -q 'TYPE="Source Qualifier"'      "$INFA_FILE";  then echo "fail: Source Qualifier missing"        >&2; exit 1; fi
if ! grep -q 'TYPE="Expression"'            "$INFA_FILE";  then echo "fail: Expression transform missing"    >&2; exit 1; fi
if ! grep -q 'TYPE="Aggregator"'            "$INFA_FILE";  then echo "fail: Aggregator missing"              >&2; exit 1; fi
if ! grep -q '<WORKFLOW'                    "$INFA_FILE";  then echo "fail: WORKFLOW node missing"           >&2; exit 1; fi

echo "==> Staging restored files…"
git add "$PLSQL_FILE" "$INFA_FILE" "$INDEX_FILE"

if git diff --cached --quiet; then
  echo "Legacy assets already match HEAD. Nothing to commit."
else
  git commit -m "chore: reset databricks demo legacy assets for next run"
fi

echo ""
echo "Databricks demo reset. Push to main to redeploy:"
echo "  git push origin main"
