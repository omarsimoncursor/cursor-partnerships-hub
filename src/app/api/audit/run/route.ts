import { NextResponse } from 'next/server';
import { inspectLegacyAssets } from '@/lib/demo/legacy-teradata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SIMULATED_PHASES_MS = [900, 1100, 1300, 1100, 800];

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

export async function GET() {
  const start = Date.now();

  const assets = await inspectLegacyAssets();

  for (const phase of SIMULATED_PHASES_MS) {
    await sleep(phase);
  }

  const elapsedMs = Date.now() - start;

  return NextResponse.json({
    endpoint: '/api/audit/run',
    completedAt: new Date().toISOString(),
    elapsedMs,

    legacyLoc: 63_180,
    filesAnalyzed: { bteq: 247, tsql: 412, informatica: 184, ssis: 68 },
    dialectIdioms: [
      'QUALIFY',
      'COLLECT STATS',
      'MULTISET VOLATILE',
      'MERGE',
      'CROSS APPLY',
      'OPENJSON',
      'Teradata date math',
    ],

    gsiBaseline: { years: 4, usd: 18_000_000 },
    cursorBaseline: { months: 15, usd: 5_400_000 },

    annualLegacyCost: 8_200_000,
    proposedAnnualSnowflakeCost: 2_300_000,

    pulledForwardCreditsUsd: 16_000_000,
    pulledForwardMonths: 33,

    brokenPipelineCount: 4,
    stalestPipelineHours: 14,
    stalestPipelineMinutes: 22,

    firstScriptToMigrate: 'daily_revenue_rollup',
    inspected: assets,
  });
}
