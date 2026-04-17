'use client';

import { Zap } from 'lucide-react';
import { McpFlowDiagram } from '@/components/shared/mcp-flow-diagram';

const PAYLOAD_LINES = [
  '{ "source": "datadog-mcp",',
  '  "event": "anomaly.detected",',
  '  "severity": "P1", "service": "checkout-api",',
  '  "metric": "p99_latency", "value": "2,340ms",',
  '  "threshold": "500ms" }',
];

const SEMANTIC_RESULTS = [
  { file: 'src/api/checkout/handler.ts', relevance: '98%', reason: 'Primary endpoint handler' },
  { file: 'src/services/payment/gateway.ts', relevance: '87%', reason: 'Downstream dependency' },
  { file: 'src/services/inventory/check.ts', relevance: '85%', reason: 'Concurrent call path' },
  { file: 'src/middleware/rate-limiter.ts', relevance: '72%', reason: 'Latency contributor' },
];

export function EditorScene() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 2</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Cloud Agent Activated via MCP</h2>
        </div>
        <p className="text-text-secondary mb-16 max-w-xl">
          No engineer needed. The Datadog MCP automatically streams the anomaly payload to a Cursor Cloud Agent, which queries its semantic index to instantly locate every relevant code path.
        </p>

        <McpFlowDiagram
          sourceIcon={Zap}
          sourceName="Datadog"
          sourceColor="#632CA6"
          payloadLines={PAYLOAD_LINES}
          eventBadge={{ label: 'severity', value: 'P1' }}
          semanticResults={SEMANTIC_RESULTS}
        />
      </div>
    </section>
  );
}
