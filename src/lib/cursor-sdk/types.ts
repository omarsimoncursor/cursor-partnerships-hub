/**
 * Locally-mirrored subset of the Cursor SDK's public message types.
 *
 * The real types ship in `@cursor/february/agent` (v1.0.7, private alpha).
 * Mirroring the shape here lets the demo render against the SDK's contract
 * without taking a hard dependency on a private package.
 *
 * Keep this in sync with the SDKMessage union from
 * https://registry.npmjs.org/@cursor/february.
 */

export type RunStatus =
  | 'CREATING'
  | 'RUNNING'
  | 'FINISHED'
  | 'ERROR'
  | 'CANCELLED';

export type ToolCallStatus = 'started' | 'completed' | 'failed';

export interface SDKTextBlock {
  type: 'text';
  text: string;
}

export interface SDKUserMessageEvent {
  type: 'user';
  message: { content: SDKTextBlock[] };
}

export interface SDKAssistantMessage {
  type: 'assistant';
  message: { content: SDKTextBlock[] };
}

export interface SDKThinkingMessage {
  type: 'thinking';
  text: string;
}

export interface SDKToolUseMessage {
  type: 'tool_call';
  call_id: string;
  /** Tool name. For MCP tools, formatted as `mcp:<server>/<tool>`. */
  name: string;
  status: ToolCallStatus;
  args?: Record<string, unknown>;
  result?: unknown;
  truncated?: boolean;
}

export interface SDKStatusMessage {
  type: 'status';
  status: RunStatus;
}

export interface SDKTaskMessage {
  type: 'task';
  text: string;
}

export interface SDKSystemMessage {
  type: 'system';
  text?: string;
}

export type SDKMessage =
  | SDKUserMessageEvent
  | SDKAssistantMessage
  | SDKThinkingMessage
  | SDKToolUseMessage
  | SDKStatusMessage
  | SDKTaskMessage
  | SDKSystemMessage;

/**
 * Demo-only adornments attached to a mock event so the UI can derive
 * deterministic timestamps and tool-call durations.
 */
export interface MockEvent<T extends SDKMessage = SDKMessage> {
  /** Real wall-time delay before this event fires, in ms. */
  delayMs: number;
  /** Synthetic agent-time duration, scaled up by TIME_SCALE for display. */
  scaledDurationMs?: number;
  event: T;
}

export interface AgentIdentity {
  agentId: string;
  runId: string;
  model: string;
  cloudRepoUrl: string;
  cloudPrUrl: string;
  startingRef: string;
  branchName: string;
}

export const DEMO_AGENT: AgentIdentity = {
  agentId: 'bc-7c09a4d2-1f48-4c1e-9c3f-0a5e4b8d3210',
  runId: 'run-9a4d3f17-6e2b-4d09-a5e1-c08f4b7d2f55',
  model: 'composer-2',
  cloudRepoUrl: 'https://github.com/cursor-demos/cursor-for-enterprise',
  cloudPrUrl: 'https://github.com/cursor-demos/cursor-for-enterprise/pull/214',
  startingRef: 'main',
  branchName: 'security/patch-customer-profile-injection',
};
