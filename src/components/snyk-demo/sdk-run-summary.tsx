'use client';

import { ExternalLink, RotateCcw, ShieldAlert, Server, Cpu, Activity } from 'lucide-react';
import type { VulnerabilityExposureError } from './customer-profile-card';
import { DEMO_AGENT } from '@/lib/cursor-sdk/types';
import { VulnFlowGraph } from './vuln-flow-graph';

/**
 * Left split-screen panel for the running phase. Replaces v1's `VulnSummary`.
 * Re-uses the Datadog right-sidebar KV/Tags/Related conventions, repointed
 * at SDK telemetry: agent identity, model, MCP servers, settingSources.
 *
 * Embeds `VulnFlowGraph` so the data flow (the actual security context) lives
 * directly above the SDK metadata, not buried in a modal.
 */

interface SDKRunSummaryProps {
  error: Error;
  onReset: () => void;
  onViewSnyk?: () => void;
}

function asVulnError(error: Error): VulnerabilityExposureError | null {
  if (error.name === 'VulnerabilityExposureError') {
    return error as VulnerabilityExposureError;
  }
  return null;
}

export function SDKRunSummary({ error, onReset, onViewSnyk }: SDKRunSummaryProps) {
  const vuln = asVulnError(error);
  const cveId = vuln?.cveId ?? 'SNYK-JS-CUSTOMER-PROFILE-001';
  const cwe = vuln?.cwe ?? 'CWE-943';
  const cvss = vuln?.cvss ?? 9.8;
  const leaked = vuln?.leakedRows ?? 12;

  return (
    <div className="w-full h-full flex flex-col rounded-xl border border-[#4C44CB]/30 bg-dark-surface overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#4C44CB]/30 bg-[#4C44CB]/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#E11D48]/15 border border-[#E11D48]/30 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FB7185]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#FB7185] leading-none mb-0.5">
              Stage 3 — pre-merge security gate
            </p>
            <p className="text-[11px] text-text-tertiary font-mono truncate">
              snyk × cursor-sdk · PR #214 · merge blocked
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {/* Severity tile */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Severity" value="Critical" color="text-[#FB7185]" />
          <Stat label="CVSS" value={cvss.toFixed(1)} color="text-[#FB7185]" />
          <Stat label="Leaked" value={String(leaked)} color="text-[#FB7185]" />
        </div>

        {/* Vuln flow graph (compact) */}
        <VulnFlowGraph compact />

        {/* SDK identity card */}
        <div className="rounded-md border bg-dark-bg overflow-hidden" style={{ borderColor: '#23264F' }}>
          <div
            className="px-3 py-2 border-b text-[10.5px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
            style={{ background: '#13142F', borderColor: '#23264F', color: '#9F98FF' }}
          >
            <Cpu className="w-3 h-3" />
            cursor-sdk · live run
          </div>
          <dl className="p-3 space-y-1.5 text-[11px]">
            <KV k="agent.agentId" v={DEMO_AGENT.agentId} mono />
            <KV k="run.id" v={DEMO_AGENT.runId} mono />
            <KV k="model" v={DEMO_AGENT.model} mono highlight />
            <KV k="repos[0].url" v={shortRepo(DEMO_AGENT.cloudRepoUrl)} mono />
            <KV k="repos[0].prUrl" v={shortPr(DEMO_AGENT.cloudPrUrl)} mono />
            <KV k="branchName" v={DEMO_AGENT.branchName} mono />
          </dl>
        </div>

        {/* MCP servers */}
        <div className="rounded-md border bg-dark-bg overflow-hidden" style={{ borderColor: '#23264F' }}>
          <div
            className="px-3 py-2 border-b text-[10.5px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
            style={{ background: '#13142F', borderColor: '#23264F', color: '#9F98FF' }}
          >
            <Server className="w-3 h-3" />
            mcpServers
          </div>
          <div className="p-3 space-y-1.5 text-[11px]">
            <McpRow name="snyk" url="https://mcp.snyk.io/v1" tone="indigo" />
            <McpRow name="github" url="builtin · cursor agents" tone="neutral" />
            <McpRow name="jira" url="https://mcp.atlassian.com/v1" tone="blue" />
          </div>
        </div>

        {/* Findings */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Findings on this PR
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg space-y-1.5 border" style={{ borderColor: '#23264F' }}>
            <FindingRow
              label="Snyk Code · NoSQL injection"
              detail={`${cveId} · ${cwe}`}
              tone="red"
            />
            <FindingRow
              label="Snyk Open Source · Prototype pollution"
              detail="mongoose@5.13.7 → 5.13.20"
              tone="amber"
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewSnyk}
          className="w-full py-2 px-3 rounded-lg bg-[#4C44CB] text-white font-medium text-sm
                     hover:bg-[#5C54E0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View in Snyk
        </button>

        <button
          onClick={onReset}
          className="w-full py-2 px-3 rounded-lg border border-dark-border text-text-secondary
                     font-medium text-sm hover:bg-dark-surface-hover hover:text-text-primary
                     transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset demo
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-2 rounded-md bg-dark-bg border" style={{ borderColor: '#23264F' }}>
      <p className="text-[9.5px] text-text-tertiary uppercase mb-0.5">{label}</p>
      <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

function KV({ k, v, mono, highlight }: { k: string; v: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="shrink-0 w-24 truncate" style={{ color: '#7C7CA0' }}>
        {k}
      </dt>
      <dd
        className={`truncate ${mono ? 'font-mono' : ''}`}
        style={{
          color: highlight ? '#9F98FF' : '#FFFFFF',
          fontWeight: highlight ? 600 : 400,
        }}
      >
        {v}
      </dd>
    </div>
  );
}

function McpRow({ name, url, tone }: { name: string; url: string; tone: 'indigo' | 'neutral' | 'blue' }) {
  const dot = tone === 'indigo' ? '#9F98FF' : tone === 'blue' ? '#4C9AFF' : '#7C7CA0';
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
      <span className="font-mono text-white shrink-0">{name}</span>
      <span className="font-mono truncate flex-1" style={{ color: '#9FA0BC' }}>
        {url}
      </span>
      <Activity className="w-3 h-3 shrink-0" style={{ color: '#4ADE80' }} />
    </div>
  );
}

function FindingRow({ label, detail, tone }: { label: string; detail: string; tone: 'red' | 'amber' }) {
  const dot = tone === 'red' ? 'bg-[#FB7185]' : 'bg-[#FBBF24]';
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <div className="min-w-0">
        <p className="text-text-primary truncate">{label}</p>
        <p className="text-text-tertiary font-mono truncate">{detail}</p>
      </div>
    </div>
  );
}

function shortRepo(url: string): string {
  return url.replace(/^https:\/\/github\.com\//, '');
}

function shortPr(url: string): string {
  return url.replace(/^https:\/\/github\.com\//, '');
}
