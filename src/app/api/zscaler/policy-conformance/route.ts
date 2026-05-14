import { NextResponse } from 'next/server';
import {
  EXPECTED_DECISIONS,
  PROBE_REQUESTS,
  evaluateRequest,
  loadWorkforceAdminPolicy,
  summarizeScope,
} from '@/lib/demo/zpa-policy-conformance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { rule, source, filePath } = await loadWorkforceAdminPolicy();
  const scope = summarizeScope(rule);

  const probe = PROBE_REQUESTS.map((req, i) => {
    const result = evaluateRequest(rule, req);
    return {
      ...result,
      expected: EXPECTED_DECISIONS[i],
      pass: result.allow === EXPECTED_DECISIONS[i],
    };
  });

  const allPass = probe.every(r => r.pass);

  return NextResponse.json(
    {
      endpoint: '/api/zscaler/policy-conformance',
      tfFile: filePath.replace(process.cwd() + '/', ''),
      ruleName: rule.name,
      action: rule.action,
      conditionsCount: rule.conditions.length,
      operandsCount: rule.conditions.reduce((n, c) => n + c.operands.length, 0),
      scope,
      probe,
      allPass,
      bytes: source.length,
    },
    { status: allPass ? 200 : 422 }
  );
}
