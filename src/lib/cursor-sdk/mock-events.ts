import type { MockEvent, SDKMessage } from './types';

/**
 * Deterministic ~28-event SDKMessage stream that drives the agent console
 * and the SDK tool-call flame graph in the Snyk demo.
 *
 * The events mirror the shape `agent.send(...).stream()` would yield against
 * a real cloud agent. Channels (snyk-mcp, github-mcp, etc.) are encoded in
 * the tool-call `name` as `mcp:<server>/<tool>` so the UI can color rows by
 * the colon-separated namespace.
 *
 * Real-time playback ~21s; displayed (scaled) timestamps ~2 minutes.
 */

function evt<T extends SDKMessage>(
  delayMs: number,
  event: T,
  scaledDurationMs?: number,
): MockEvent<T> {
  return { delayMs, event, scaledDurationMs };
}

function tool(
  call_id: string,
  name: string,
  status: 'started' | 'completed',
  args?: Record<string, unknown>,
  result?: unknown,
): MockEvent {
  return evt(0, {
    type: 'tool_call',
    call_id,
    name,
    status,
    ...(args ? { args } : {}),
    ...(result !== undefined ? { result } : {}),
  });
}

export const MOCK_RUN_EVENTS: MockEvent[] = [
  // ---- Run lifecycle: status CREATING -> RUNNING ----
  evt(150, { type: 'status', status: 'CREATING' }),
  evt(250, { type: 'system', text: 'cloud agent provisioned · vm cold-start 412ms · @cursor/february v1.0.7' }),
  evt(180, { type: 'status', status: 'RUNNING' }),
  evt(220, { type: 'task', text: 'Stage 3 — pre-merge security gate · PR #214' }),

  // ---- Snyk intake: 4 tool calls (started + completed pairs collapsed) ----
  evt(380, {
    type: 'thinking',
    text: 'Pulling the Snyk findings on this PR before reading any code.',
  }),
  { delayMs: 320, scaledDurationMs: 1180,
    event: { type: 'tool_call', call_id: 'tc-001', name: 'mcp:snyk-code/get_issue', status: 'completed',
      args: { project: 'cursor-for-enterprise', issueId: 'SNYK-JS-CUSTOMER-PROFILE-001' },
      result: { severity: 'critical', cvss: 9.8, cwe: ['CWE-943'], exploitMaturity: 'functional' },
    },
  },
  { delayMs: 280, scaledDurationMs: 1090,
    event: { type: 'tool_call', call_id: 'tc-002', name: 'mcp:snyk-code/get_data_flow', status: 'completed',
      args: { issueId: 'SNYK-JS-CUSTOMER-PROFILE-001' },
      result: { hops: 5, source: 'request.query.username', sink: 'CUSTOMERS.filter(matchesSelector)' },
    },
  },
  { delayMs: 250, scaledDurationMs: 980,
    event: { type: 'tool_call', call_id: 'tc-003', name: 'mcp:snyk-open-source/get_companion_findings', status: 'completed',
      args: { project: 'cursor-for-enterprise', filePath: 'src/lib/demo/customer-profile.ts' },
      result: { issues: ['SNYK-JS-MONGOOSE-2961688'], fixedIn: '5.13.20' },
    },
  },
  { delayMs: 240, scaledDurationMs: 920,
    event: { type: 'tool_call', call_id: 'tc-004', name: 'mcp:snyk-code/get_fix_advisory', status: 'completed',
      args: { issueId: 'SNYK-JS-CUSTOMER-PROFILE-001' },
      result: { strategy: 'parameterize-selector + allowlist', complexity: 'low' },
    },
  },

  // ---- Jira: open security ticket via MCP ----
  evt(220, { type: 'thinking', text: 'Opening the security incident before patching, so the timeline is captured.' }),
  { delayMs: 320, scaledDurationMs: 1240,
    event: { type: 'tool_call', call_id: 'tc-005', name: 'mcp:jira/create_issue', status: 'completed',
      args: { project: 'CUR', type: 'Security', priority: 'P1', summary: 'NoSQL injection in customer profile lookup' },
      result: { key: 'CUR-7841', status: 'In Progress' },
    },
  },

  // ---- Regression hunt via GitHub MCP ----
  { delayMs: 320, scaledDurationMs: 1180,
    event: { type: 'tool_call', call_id: 'tc-006', name: 'mcp:github/list_commits', status: 'completed',
      args: { path: 'src/lib/demo/customer-profile.ts', since: '14d' },
      result: { commits: 8, regressionCandidate: '5e9d3c2' },
    },
  },
  evt(320, { type: 'assistant', message: { content: [{ type: 'text', text: 'Regression introduced in 5e9d3c2 — "feat: add internal customer lookup" (11 days ago). Tainted query.username flows into the selector via string interpolation.' }] } }),

  // ---- Read affected code (shell) ----
  { delayMs: 220, scaledDurationMs: 660,
    event: { type: 'tool_call', call_id: 'tc-007', name: 'read_file', status: 'completed',
      args: { path: 'src/lib/demo/customer-profile.ts' },
      result: { lines: 26 },
    },
  },
  { delayMs: 200, scaledDurationMs: 580,
    event: { type: 'tool_call', call_id: 'tc-008', name: 'read_file', status: 'completed',
      args: { path: 'src/lib/demo/customer-store.ts' },
      result: { lines: 162 },
    },
  },

  // ---- Patch (write_file + edit) ----
  evt(280, { type: 'thinking', text: 'Minimal correct fix: parameterize the selector and add a typed ValidationError + allowlist.' }),
  { delayMs: 320, scaledDurationMs: 1480,
    event: { type: 'tool_call', call_id: 'tc-009', name: 'edit', status: 'completed',
      args: { path: 'src/lib/demo/customer-profile.ts', edits: '+18 −7' },
      result: { applied: true },
    },
  },
  { delayMs: 240, scaledDurationMs: 720,
    event: { type: 'tool_call', call_id: 'tc-010', name: 'edit', status: 'completed',
      args: { path: 'package.json', edits: 'mongoose 5.13.7 → 5.13.20' },
      result: { applied: true },
    },
  },
  { delayMs: 240, scaledDurationMs: 720,
    event: { type: 'tool_call', call_id: 'tc-011', name: 'write_file', status: 'completed',
      args: { path: 'src/lib/demo/customer-profile.test.ts', kind: 'regression test' },
      result: { applied: true },
    },
  },

  // ---- Static verify ----
  { delayMs: 320, scaledDurationMs: 980,
    event: { type: 'tool_call', call_id: 'tc-012', name: 'shell', status: 'completed',
      args: { command: 'npx tsc --noEmit' },
      result: { exitCode: 0, stdout: '✓ no type errors' },
    },
  },
  { delayMs: 280, scaledDurationMs: 880,
    event: { type: 'tool_call', call_id: 'tc-013', name: 'shell', status: 'completed',
      args: { command: 'npm run lint' },
      result: { exitCode: 0, stdout: '✓ 0 problems · eslint-plugin-security clean' },
    },
  },

  // ---- Live verify (vitest + reproducer + snyk test) ----
  { delayMs: 320, scaledDurationMs: 1180,
    event: { type: 'tool_call', call_id: 'tc-014', name: 'shell', status: 'completed',
      args: { command: 'npx vitest run customer-profile' },
      result: { exitCode: 0, stdout: '✓ 11 passed (1 new)' },
    },
  },
  { delayMs: 320, scaledDurationMs: 1280,
    event: { type: 'tool_call', call_id: 'tc-015', name: 'shell', status: 'completed',
      args: { command: 'node scripts/reproduce-snyk-injection.mjs' },
      result: { before: { leakedRows: 12 }, after: { leakedRows: 0, threw: 'ValidationError' } },
    },
  },
  { delayMs: 320, scaledDurationMs: 1380,
    event: { type: 'tool_call', call_id: 'tc-016', name: 'shell', status: 'completed',
      args: { command: 'snyk test --severity-threshold=medium' },
      result: { critical: 0, high: 0, medium: 0, low: 2 },
    },
  },

  evt(220, { type: 'assistant', message: { content: [{ type: 'text', text: 'Exploit replay went from 12 leaked rows to 0. Snyk re-test is clean at the medium threshold.' }] } }),

  // ---- PR open via GitHub MCP ----
  { delayMs: 240, scaledDurationMs: 880,
    event: { type: 'tool_call', call_id: 'tc-017', name: 'mcp:github/create_branch', status: 'completed',
      args: { name: 'security/patch-customer-profile-injection', base: 'main' },
      result: { sha: 'a1b2c3d' },
    },
  },
  { delayMs: 280, scaledDurationMs: 920,
    event: { type: 'tool_call', call_id: 'tc-018', name: 'mcp:github/commit_and_push', status: 'completed',
      args: { branch: 'security/patch-customer-profile-injection', files: 3 },
      result: { commit: 'b8c9d0e', delta: '+34 −7' },
    },
  },
  { delayMs: 320, scaledDurationMs: 1180,
    event: { type: 'tool_call', call_id: 'tc-019', name: 'mcp:github/open_pull_request', status: 'completed',
      args: { repo: 'cursor-demos/cursor-for-enterprise', number: 214 },
      result: { url: 'https://github.com/cursor-demos/cursor-for-enterprise/pull/214' },
    },
  },

  // ---- Jira transition ----
  { delayMs: 240, scaledDurationMs: 720,
    event: { type: 'tool_call', call_id: 'tc-020', name: 'mcp:jira/transition_issue', status: 'completed',
      args: { key: 'CUR-7841', to: 'In Review' },
      result: { ok: true },
    },
  },

  // ---- Final status ----
  evt(220, { type: 'task', text: 'Pre-merge gate clear. Awaiting human review on PR #214.' }),
  evt(180, { type: 'status', status: 'FINISHED' }),
];

/** Real wall-time playback. */
export const REAL_RUNTIME_MS = MOCK_RUN_EVENTS.reduce((n, e) => n + e.delayMs, 0);

/** Scale factor used to project real wall-time onto displayed agent-time. */
export const TIME_SCALE = 6.4;
