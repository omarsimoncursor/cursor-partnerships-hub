import { NextResponse } from 'next/server';
import { readLegacyAssets } from '@/lib/demo/legacy-oracle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * /api/migration/analyze
 *
 * Simulates a real ~5 second legacy-platform scan. The stored proc + Informatica
 * XML are actually read from disk (so the demo can honestly say "we read the
 * real legacy file"), then padded with project-scale numbers so the takeover
 * page has concrete figures to quote.
 */

const SCAN_LATENCY_MS = 4800;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET() {
  const start = Date.now();

  const [legacy] = await Promise.all([
    readLegacyAssets(),
    sleep(SCAN_LATENCY_MS),
  ]);

  const elapsedMs = Date.now() - start;

  return NextResponse.json({
    endpoint: '/api/migration/analyze',
    generatedAt: new Date().toISOString(),
    elapsedMs,
    legacyLoc: 47_412,
    filesAnalyzed: {
      plsql: 184,
      informatica: 312,
      other: 97,
    },
    sampledFile: {
      plsql: {
        filename: legacy.plsql.filename,
        loc: legacy.plsql.loc,
        idioms: legacy.plsql.idioms,
      },
      informatica: {
        filename: legacy.informatica.filename,
        loc: legacy.informatica.loc,
        transforms: legacy.informatica.transforms,
      },
    },
    dialectIdioms: [
      'cursor loops',
      'MERGE',
      'CONNECT BY',
      'ROWNUM',
      'NVL/DECODE',
      'global temp tables',
      'TO_CHAR date fmt',
    ],
    gsiBaseline: { years: 5, usd: 22_000_000 },
    cursorBaseline: { months: 18, usd: 6_800_000 },
    annualOnPremCost: 14_700_000,
    proposedAnnualDatabricksCost: 3_900_000,
    pulledForwardArr: 45_000_000,
    pulledForwardArrMonths: 42,
    firstWorkflowToMigrate: 'customer_rfm_segmentation',
    totalOracleTb: 18,
  });
}
