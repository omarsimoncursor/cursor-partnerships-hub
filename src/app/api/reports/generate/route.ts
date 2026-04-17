import { NextResponse } from 'next/server';
import { aggregateOrdersByRegion } from '@/lib/demo/aggregate-orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  const byRegion = await aggregateOrdersByRegion();
  const elapsedMs = Date.now() - start;

  const totalOrders = Object.values(byRegion).reduce((n, r) => n + r.orders, 0);
  const totalTax = Object.values(byRegion).reduce((n, r) => n + r.tax, 0);

  return NextResponse.json({
    endpoint: '/api/reports/generate',
    generatedAt: new Date().toISOString(),
    elapsedMs,
    byRegion,
    totals: {
      orders: totalOrders,
      tax: totalTax,
    },
  });
}
