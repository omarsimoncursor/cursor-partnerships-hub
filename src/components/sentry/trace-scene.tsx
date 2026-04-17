'use client';

import { AlertCircle } from 'lucide-react';
import { McpFlowDiagram } from '@/components/shared/mcp-flow-diagram';

const PAYLOAD_LINES = [
  '{ "source": "sentry-mcp",',
  '  "event": "issue.escalated", "level": "error",',
  '  "title": "TypeError: Cannot read properties of undefined",',
  '  "culprit": "processPayment (src/services/payment.ts)",',
  '  "events": 1847, "users_affected": 312 }',
];

const SEMANTIC_RESULTS = [
  { file: 'src/services/payment.ts', relevance: '99%', reason: 'Error origin (line 47)' },
  { file: 'src/services/stripe-client.ts', relevance: '94%', reason: 'Upstream caller' },
  { file: 'src/api/orders/create.ts', relevance: '88%', reason: 'Entry point' },
  { file: 'src/types/payment.ts', relevance: '76%', reason: 'Type definition mismatch' },
];

export function TraceScene() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 2</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Cloud Agent Activated via MCP</h2>
        </div>
        <p className="text-text-secondary mb-16 max-w-xl">
          No copy-pasting stack traces. The Sentry MCP streams the error payload to a Cursor Cloud Agent, which uses semantic indexing to map the full dependency graph around the error.
        </p>

        <McpFlowDiagram
          sourceIcon={AlertCircle}
          sourceName="Sentry"
          sourceColor="#e1567c"
          payloadLines={PAYLOAD_LINES}
          eventBadge={{ label: 'level', value: 'error' }}
          semanticResults={SEMANTIC_RESULTS}
          semanticTopColor="#f87171"
        />
      </div>
    </section>
  );
}
