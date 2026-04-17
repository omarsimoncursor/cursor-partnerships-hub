import { NextResponse } from 'next/server';
import { scanLegacyMonolith } from '@/lib/demo/legacy-monolith';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

const SCAN_STAGES = [
  { label: 'Scanning monolith…', ms: 900 },
  { label: 'Inferring bounded contexts…', ms: 1300 },
  { label: 'Matching to AWS managed services…', ms: 1200 },
  { label: 'Estimating TCO swing…', ms: 900 },
  { label: 'Citing Well-Architected pillars…', ms: 700 },
] as const;

export async function GET() {
  const start = Date.now();

  const { scan } = await scanLegacyMonolith();
  for (const stage of SCAN_STAGES) {
    await sleep(stage.ms);
  }

  const elapsedMs = Date.now() - start;

  return NextResponse.json({
    endpoint: '/api/aws-assess/run',
    generatedAt: new Date().toISOString(),
    elapsedMs,
    legacyLoc: 1_182_400,
    filesAnalyzed: { java: 4217, jsp: 612, xml: 418, plsql: 287 },
    websphereVersion: '8.5.5.20',
    oracleVersion: '12c (12.1.0.2)',
    boundedContexts: [
      { name: 'OrdersService', loc: 14_200, target: 'Lambda + Aurora Serverless v2' },
      { name: 'InventoryService', loc: 9_800, target: 'Lambda + DynamoDB' },
      { name: 'BillingService', loc: 22_100, target: 'ECS Fargate + Aurora PG' },
      { name: 'ShippingService', loc: 8_400, target: 'Lambda + Step Functions' },
      { name: 'CatalogService', loc: 18_600, target: 'Lambda + OpenSearch Serverless' },
    ],
    totalBoundedContexts: 38,
    gsiBaseline: { years: 5, usd: 14_000_000 },
    cursorBaseline: { months: 18, usd: 3_800_000 },
    annualOnPremCost: 8_400_000,
    proposedAnnualAwsCost: 2_100_000,
    pulledForwardManagedServiceArrUsd: 11_000_000,
    mapCreditEligible: true,
    firstBoundedContextToExtract: 'OrdersService',
    wellArchitectedPillars: ['OPS', 'SEC', 'REL', 'PERF', 'COST', 'SUS'],
    legacyFiles: scan.files,
    totalBoundaryViolations: scan.totalViolations,
  });
}
