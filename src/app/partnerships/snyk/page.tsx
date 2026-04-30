'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  ShieldAlert,
  Code as CodeIcon,
  Package,
  Box,
  Cloud,
  GitCommit,
  ShieldCheck,
  Moon,
  Activity,
  Server,
  Users,
} from 'lucide-react';
import { ShiftLeftStages, SHIFT_LEFT_STAGES } from '@/components/snyk-demo/shift-left-stages';

const SNYK_PRODUCTS = [
  {
    icon: CodeIcon,
    name: 'Snyk Code',
    detail: 'SAST findings stream into the agent the moment a critical lands.',
  },
  {
    icon: Package,
    name: 'Snyk Open Source',
    detail: 'Dependency CVEs trigger upgrade PRs that respect the lockfile.',
  },
  {
    icon: Box,
    name: 'Snyk Container',
    detail: 'Base-image bumps and Dockerfile rewrites that keep the build green.',
  },
  {
    icon: Cloud,
    name: 'Snyk IaC',
    detail: 'Misconfig fixes against the same Terraform the developer wrote.',
  },
] as const;

export default function SnykPartnership() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/partnerships" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Partnerships
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Partnership</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#4C44CB]/20 border border-[#4C44CB]/30 flex items-center justify-center text-lg font-bold text-[#9F98FF]">
              S
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            Snyk catches it.<br />Cursor ships the fix.
          </h1>
          <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
            A pre-merge security gate calls a Cursor agent the moment a critical Snyk finding lands.
            The agent patches the code, re-runs the exploit, and opens a pull request for a human to
            review &mdash; all before the developer&apos;s next coffee.
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/partnerships/snyk/demo"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                         bg-[#4C44CB] text-white font-medium text-sm
                         hover:bg-[#5C54E0] transition-all duration-200
                         shadow-[0_0_32px_rgba(76,68,203,0.35)] hover:shadow-[0_0_48px_rgba(76,68,203,0.5)]"
            >
              <PlayCircle className="w-4 h-4" />
              Run the live demo
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#stages"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-dark-border text-text-secondary font-medium text-sm hover:bg-dark-surface-hover hover:text-text-primary transition-colors"
            >
              See where it runs
            </a>
          </div>
        </div>
      </section>

      {/* Five-stage spine */}
      <section id="stages" className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] mb-2" style={{ color: '#9F98FF' }}>
              Where the agent runs
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Five places. One agent.
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              The same Cursor agent embeds in every stage of the pipeline, from the developer&apos;s
              editor through the production safety net. The interactive demo is stage 3 — the
              pre-merge security gate.
            </p>
          </div>

          {/* Visual strip */}
          <div className="mb-10 max-w-5xl mx-auto">
            <ShiftLeftStages active="pr-gate" covered={['ide', 'commit']} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {SHIFT_LEFT_STAGES.map((stage, i) => (
              <StageCard
                key={stage.id}
                stage={stage}
                idx={i + 1}
                emphasized={stage.id === 'pr-gate'}
              />
            ))}
          </div>

          <p className="text-xs text-text-tertiary text-center mt-6 max-w-2xl mx-auto">
            Stage 3 is the live, interactive surface in this demo. Stage 5 is the production
            safety net the existing webhook route was built for. Stages 1, 2, and 4 use the
            same SDK against the same MCP servers.
          </p>
        </div>
      </section>

      {/* Pre-merge gate code */}
      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] mb-2" style={{ color: '#9F98FF' }}>
              Stage 3 · pre-merge security gate
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              ~30 lines of TypeScript. Snyk catches it. The SDK ships it.
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              CI calls{' '}
              <code className="font-mono text-[#9F98FF]">Agent.create({'{ cloud: { repos: [{ url, prUrl }] } }'})</code>{' '}
              with the Snyk MCP wired in. The run streams back as{' '}
              <code className="font-mono text-[#9F98FF]">SDKMessage</code> events. The gate stays red until the
              exploit replay reports zero leaked rows.
            </p>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ background: '#0A0B23', borderColor: '#23264F' }}>
            <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ background: '#13142F', borderColor: '#23264F' }}>
              <div className="flex items-center gap-2">
                <CodeIcon className="w-3.5 h-3.5" style={{ color: '#9F98FF' }} />
                <span className="text-[12px] font-mono" style={{ color: '#C9C9E5' }}>
                  ci/security-gate.ts
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#1A1C40', color: '#9F98FF' }}>
                  @cursor/february v1.0.7
                </span>
              </div>
            </div>
            <pre
              className="p-5 overflow-x-auto text-[12.5px] font-mono leading-relaxed whitespace-pre"
              style={{ color: '#C9C9E5' }}
            >
{`import { Agent } from "@cursor/february/agent";
import { buildSecurityGatePrompt } from "./prompts";

const agent = Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: "composer-2" },
  cloud: {
    repos: [{
      url: "https://github.com/cursor-demos/cursor-for-enterprise",
      prUrl: process.env.GITHUB_PR_URL!,
    }],
  },
  mcpServers: {
    snyk: { type: "http", url: "https://mcp.snyk.io/v1" },
    jira: { type: "http", url: "https://mcp.atlassian.com/v1" },
  },
});

const run = await agent.send(buildSecurityGatePrompt({
  issueId: "SNYK-JS-CUSTOMER-PROFILE-001",
  cwe: "CWE-943",
  cvss: 9.8,
}));

for await (const event of run.stream()) {
  switch (event.type) {
    case "tool_call":  recordToolSpan(event); break;
    case "status":     updateGateStatus(event.status); break;
    case "assistant":  forwardToCIComment(event.message); break;
  }
}

const result = await run.wait();
process.exit(result.status === "FINISHED" ? 0 : 1);`}
            </pre>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/partnerships/snyk/demo"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: '#9F98FF' }}
            >
              Watch this code run live, end-to-end
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Snyk product surface */}
      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] mb-2" style={{ color: '#9F98FF' }}>
              Coverage
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              One SDK across every Snyk product.
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              SAST, SCA, container, IaC. Same SDK call, different MCPs, identical guardrails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {SNYK_PRODUCTS.map(p => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className="rounded-xl border border-dark-border bg-dark-surface p-5 flex flex-col gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#4C44CB]/15 border border-[#4C44CB]/30 flex items-center justify-center text-[#9F98FF]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{p.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Co-sell value */}
      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] mb-2" style={{ color: '#9F98FF' }}>
              Why this co-sell works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Snyk wins. The customer wins. AppSec wins.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <ValueCard
              title="Snyk wins"
              detail="Every finding becomes a closed PR, not a backlog item. The platform is sticky precisely because it's now actionable, not advisory."
            />
            <ValueCard
              title="The customer wins"
              detail="MTTR on critical Snyk findings drops from days to minutes. The security backlog shrinks to zero at the medium threshold."
            />
            <ValueCard
              title="AppSec wins"
              detail="No more triage rotations on tainted-input bugs. AppSec reviews PRs instead of debugging them, and ships their week's roadmap."
            />
          </div>

          <div className="text-center mt-10">
            <Link
              href="/partnerships/snyk/demo"
              className="inline-flex items-center gap-2 text-sm hover:underline"
              style={{ color: '#9F98FF' }}
            >
              See it run live
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-dark-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-text-tertiary mb-6">
            This page demonstrates the type of co-branded content that could be produced for each partnership motion.
          </p>
          <div className="flex items-center justify-center gap-8">
            <Link
              href="/partnerships"
              className="inline-flex items-center gap-2 text-sm text-accent-blue hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Partnerships
            </Link>
            <Link
              href="/partnerships/snyk/demo"
              className="inline-flex items-center gap-2 text-sm text-text-primary hover:text-[#9F98FF] transition-colors font-medium"
            >
              Run the live demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StageCard({
  stage,
  idx,
  emphasized,
}: {
  stage: typeof SHIFT_LEFT_STAGES[number];
  idx: number;
  emphasized: boolean;
}) {
  const Icon = stage.icon;
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3"
      style={{
        background: emphasized ? 'rgba(76,68,203,0.06)' : 'rgb(var(--dark-surface))',
        borderColor: emphasized ? 'rgba(76,68,203,0.4)' : 'rgb(var(--dark-border))',
        boxShadow: emphasized ? '0 0 32px rgba(76,68,203,0.15)' : 'none',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center"
          style={{
            background: emphasized ? '#4C44CB' : '#1A1C40',
            color: emphasized ? '#FFFFFF' : '#9F98FF',
          }}
        >
          {idx}
        </span>
        <Icon className="w-4 h-4" style={{ color: '#9F98FF' }} />
        <p className="text-sm font-semibold text-text-primary truncate">{stage.full}</p>
      </div>
      <code
        className="text-[10.5px] font-mono p-2 rounded leading-relaxed break-words"
        style={{ background: '#0A0B23', color: '#C9C9E5', border: '1px solid #23264F' }}
      >
        {stage.sdk}
      </code>
      <p className="text-[11px] text-text-secondary leading-relaxed">{describe(stage.id)}</p>
    </div>
  );
}

function describe(id: string): string {
  switch (id) {
    case 'ide':
      return 'Snyk MCP loads via local.settingSources. CWE findings become Cursor suggestions as the developer types.';
    case 'commit':
      return 'A pre-commit hook runs the same SDK call. The dev cannot commit a tainted-input flow — the agent rewrites it first.';
    case 'pr-gate':
      return 'CI calls Agent.create({ cloud: { repos: [{ url, prUrl }] } }). Merge stays blocked until the exploit replay is clean.';
    case 'nightly':
      return 'A scheduled job calls Agent.resume(agentId).send(...) so the morning PR carries last night\'s context.';
    case 'prod':
      return 'When something slips past stages 1–4, the Snyk webhook triggers POST /v1/agents and the same gate prompt opens a PR.';
    default:
      return '';
  }
}

function ValueCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-5">
      <p className="text-sm font-semibold text-[#9F98FF] mb-2">{title}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}
