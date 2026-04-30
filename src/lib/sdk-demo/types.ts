export type ToolId =
  | 'gitguardian'
  | 'wiz'
  | 'snyk'
  | 'crowdstrike'
  | 'okta'
  | 'splunk'
  | 'zscaler'
  | 'vanta';

export type McpId =
  | 'aws-mcp'
  | 'stripe-mcp'
  | 'vault-mcp'
  | 'github-mcp'
  | 'slack-mcp'
  | 'jira-mcp'
  | 'splunk-mcp'
  | 'okta-mcp'
  | 'zscaler-mcp'
  | 'crowdstrike-mcp'
  | 'wiz-mcp'
  | 'snyk-mcp'
  | 'gitguardian-mcp';

export type ActionPhase = 'containment' | 'remediation' | 'audit';

export type ActionId =
  | 'rotate-aws-key'
  | 'roll-stripe-key'
  | 'publish-to-vault'
  | 'revoke-okta-sessions'
  | 'quarantine-host'
  | 'block-egress'
  | 'narrow-iam-policy'
  | 'enable-bucket-block'
  | 'open-cleanup-pr'
  | 'open-history-purge-pr-draft'
  | 'bump-dependency'
  | 'file-jira'
  | 'post-to-slack'
  | 'emit-splunk-audit-event';

export interface Tool {
  id: ToolId;
  name: string;
  color: string;
  blurb: string;
  letter: string;
  category: 'secrets' | 'cspm' | 'sast' | 'edr' | 'identity' | 'siem' | 'network' | 'grc';
  plainEnglish: string;
}

export interface ToolEvent {
  id: string;
  toolId: ToolId;
  name: string;
  severity: 'P0' | 'P1' | 'P2' | 'INFO';
  description: string;
  payloadType: string;
  plainEnglish: string;
}

export interface Action {
  id: ActionId;
  label: string;
  phase: ActionPhase;
  blurb: string;
  mcpsRequired: McpId[];
  promptFragment: string;
  plainEnglish: string;
}

export interface Mcp {
  id: McpId;
  name: string;
  color: string;
  pkg: string;
  envVar: string;
  category: 'cloud' | 'secrets' | 'devtools' | 'comms' | 'security' | 'identity' | 'network';
}

export interface Workflow {
  toolId: ToolId | null;
  eventId: string | null;
  actionIds: ActionId[];
  mcpIds: McpId[];
}

export type ScriptId =
  | 'gitguardian-secret'
  | 'wiz-public-bucket'
  | 'okta-anomaly'
  | 'snyk-vuln'
  | 'crowdstrike-detection';

export type RuntimeChannel =
  | 'sdk'
  | 'gitguardian'
  | 'wiz'
  | 'snyk'
  | 'okta'
  | 'crowdstrike'
  | 'splunk'
  | 'zscaler'
  | 'aws'
  | 'stripe'
  | 'vault'
  | 'github'
  | 'jira'
  | 'slack'
  | 'opus'
  | 'composer'
  | 'codex'
  | 'shell'
  | 'codegen'
  | 'done';

export interface RuntimeStep {
  channel: RuntimeChannel;
  label: string;
  detail?: string;
  delayMs: number;
  sdkEvent?: SdkEvent;
  plainEnglish?: string;
  phase?: RuntimePhase;
}

export type RuntimePhase =
  | 'identified'
  | 'context'
  | 'containment'
  | 'remediation'
  | 'audit'
  | 'resolved';

export type SdkEventType =
  | 'agent.create'
  | 'agent.send'
  | 'status.change'
  | 'tool.call'
  | 'tool.result'
  | 'step.complete'
  | 'assistant'
  | 'agent.wait';

export interface SdkEvent {
  type: SdkEventType;
  payload: string;
}
