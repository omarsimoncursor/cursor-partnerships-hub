import { NextResponse } from 'next/server';
import {
  BAD_DEPLOY,
  DEPLOY_TIMELINE,
  INCIDENT_SEED,
} from '@/lib/demo/payments-deploy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Plays the simulated v1.43.0 rollout. Real wall-time matches the on-screen
// progress so the prospect feels the deploy roll out before the incident fires.
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST() {
  const start = Date.now();

  for (const stage of DEPLOY_TIMELINE) {
    await sleep(stage.durationMs);
  }

  const elapsedMs = Date.now() - start;

  return NextResponse.json({
    ok: true,
    badDeploy: BAD_DEPLOY,
    version: INCIDENT_SEED.deployVersion,
    elapsedMs,
    incident: BAD_DEPLOY ? INCIDENT_SEED : null,
  });
}
