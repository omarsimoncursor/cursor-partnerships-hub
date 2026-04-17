#!/usr/bin/env bash
set -euo pipefail

# Resets the Datadog demo bug files to their original (buggy, sequential) state.
# Run this after merging a fix PR to make the demo repeatable.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
AGG_FILE="$REPO_ROOT/src/lib/demo/aggregate-orders.ts"
STORE_FILE="$REPO_ROOT/src/lib/demo/region-store.ts"

cat > "$AGG_FILE" << 'AGGEOF'
import { fetchRegionOrders, fetchRegionTax, type Region } from './region-store';

const REGIONS: Region[] = ['us-east', 'us-west', 'eu', 'apac', 'latam', 'uk'];

export interface RegionSummary {
  orders: number;
  tax: number;
}

export async function aggregateOrdersByRegion(): Promise<Record<string, RegionSummary>> {
  const byRegion: Record<string, RegionSummary> = {};
  for (const region of REGIONS) {
    const orders = await fetchRegionOrders(region);
    const tax = await fetchRegionTax(region);
    byRegion[region] = { orders: orders.length, tax };
  }
  return byRegion;
}
AGGEOF

cat > "$STORE_FILE" << 'STOREEOF'
export type Region = 'us-east' | 'us-west' | 'eu' | 'apac' | 'latam' | 'uk';

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function fetchRegionOrders(region: Region) {
  await sleep(600);
  return Array.from({ length: 120 + region.length * 3 }, (_, i) => ({
    id: `${region}-${i}`,
    amount: 40 + (i % 17),
  }));
}

export async function fetchRegionTax(region: Region) {
  await sleep(550);
  const seed = region.length * 1733 + region.charCodeAt(0);
  return 1200 + (seed % 800);
}
STOREEOF

cd "$REPO_ROOT"
git add "$AGG_FILE" "$STORE_FILE"
git commit -m "chore: reset datadog demo bug for next run"
echo ""
echo "Demo bug reset. Push to main to redeploy:"
echo "  git push origin main"
