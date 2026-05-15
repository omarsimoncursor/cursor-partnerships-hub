'use client';

import { Phone } from 'lucide-react';
import { McpFlowDiagram } from '@/components/shared/mcp-flow-diagram';
import { SdkCodePanel, SDK_CREATE_SAMPLE, SDK_HANDLER_SAMPLE } from './sdk-code-panel';

// Act 2 — A real PagerDuty V3 webhook payload is delivered to a Cursor SDK
// agent running in the customer's sandbox. Re-uses the Datadog McpFlowDiagram
// to keep the visualization vocabulary consistent across partner demos.

const PAYLOAD_LINES = [
  '{ "event_type": "incident.triggered",',
  '  "event": { "id": "INC-21487",',
  '    "service": "payments-api",',
  '    "priority": { "summary": "P1" },',
  '    "alert_source": "datadog/monitor/42971" } }',
];

const SEMANTIC_RESULTS = [
  {
    file: 'src/lib/payments/transfer.ts',
    relevance: '98%',
    reason: 'Touched by v1.43.0 (regression suspect)',
  },
  {
    file: 'src/lib/payments/handler.ts',
    relevance: '91%',
    reason: 'Calls into transfer.ts on every charge',
  },
  {
    file: 'src/lib/payments/settlement-worker.ts',
    relevance: '84%',
    reason: 'Holds the contended row lock',
  },
  {
    file: 'db/migrations/2026-04-19_transfers.sql',
    relevance: '71%',
    reason: 'Schema change (would block fix-forward)',
  },
];

export function SdkActivatedScene() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">
            Act 2
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            The Cursor SDK Activates
          </h2>
        </div>
        <p className="text-text-secondary mb-16 max-w-2xl">
          No engineer needed. The PagerDuty webhook hits your sandboxed worker. The Cursor SDK
          spawns an agent, queries the semantic index over{' '}
          <span className="font-mono text-text-primary">payments-api</span>, and locates every
          file that touches the failing path — in under 200 ms.
        </p>

        <McpFlowDiagram
          sourceIcon={Phone}
          sourceName="PagerDuty"
          sourceColor="#06AC38"
          payloadLines={PAYLOAD_LINES}
          eventBadge={{ label: 'priority', value: 'P1' }}
          semanticResults={SEMANTIC_RESULTS}
        />

        {/* Below the diagram: the actual SDK code that produces this flow */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-5">
            <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-[0.18em] mb-1">
              Built on @cursor/sdk · public beta
            </p>
            <h3 className="text-lg font-semibold text-text-primary">
              The diagram above is{' '}
              <span className="text-[#57D990]">~30 lines of TypeScript</span> in your repo.
            </h3>
          </div>
          <SdkCodePanel
            tabs={[SDK_CREATE_SAMPLE, SDK_HANDLER_SAMPLE]}
            accentColor="#06AC38"
            title="The PagerDuty handler"
            badge="@cursor/sdk · runs in your VPC"
          />
          <p className="text-[11px] text-text-tertiary text-center mt-3">
            Same runtime, harness, and models that power Cursor desktop. Token-billed. Auditable.
            Sandbox-enforced.
          </p>
        </div>
      </div>
    </section>
  );
}
