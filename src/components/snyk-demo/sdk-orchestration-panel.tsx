'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Flame,
  List as ListIcon,
  MessageSquare,
  MoreHorizontal,
  Search,
  Star,
  Terminal,
} from 'lucide-react';
import { MOCK_RUN_EVENTS, TIME_SCALE } from '@/lib/cursor-sdk/mock-events';
import {
  DEMO_AGENT,
  type RunStatus,
  type SDKMessage,
  type SDKToolUseMessage,
} from '@/lib/cursor-sdk/types';

/**
 * Datadog-trace-chrome wrapper around the SDK live run.
 *
 * Visual heritage from `src/components/datadog-demo/artifacts/datadog-trace.tsx`:
 *   - TopNav with logo + org selector + search bar
 *   - SubNav breadcrumbs
 *   - StatusBar with 5 cells
 *   - TabBar with tabbed views
 *   - Bottom timeline summary strip
 *
 * Drives the v2 demo. The component owns the playback timer; visible events,
 * tool-call history, and the FINISHED transition are all derived from the
 * cumulative scaled timeline.
 */

interface SDKOrchestrationPanelProps {
  onComplete?: () => void;
  /** When set, overrides the locally-computed status. */
  forcedStatus?: RunStatus;
}

type Tab = 'stream' | 'tool_calls' | 'conversation' | 'artifacts';

interface VisibleEvent {
  event: SDKMessage;
  /** Displayed (scaled) elapsed time at the moment this event fired, in ms. */
  elapsedMs: number;
  /** Synthetic agent-time duration for tool calls (already scaled). */
  scaledDurationMs?: number;
  /** Cumulative offset from the first tool call, scaled. */
  toolStartMs?: number;
}

export function SDKOrchestrationPanel({ onComplete, forcedStatus }: SDKOrchestrationPanelProps) {
  const [visible, setVisible] = useState<VisibleEvent[]>([]);
  const [tab, setTab] = useState<Tab>('stream');
  const [status, setStatus] = useState<RunStatus>('CREATING');
  const [tokens, setTokens] = useState(0);
  const startRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    startRef.current = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    let scaledToolCursor = 0;

    MOCK_RUN_EVENTS.forEach((mock, idx) => {
      cumulative += mock.delayMs;
      const t = setTimeout(() => {
        const elapsedMs = (performance.now() - startRef.current) * TIME_SCALE;
        const ev = mock.event;

        if (ev.type === 'status') {
          setStatus(ev.status);
        }
        if (ev.type === 'assistant') {
          // Roughly 4 chars per token for the visible counter.
          const text = ev.message.content.map(b => b.text).join('');
          setTokens(t => t + Math.max(8, Math.round(text.length / 4)));
        }
        if (ev.type === 'thinking') {
          setTokens(t => t + Math.max(6, Math.round(ev.text.length / 4)));
        }

        let toolStartMs: number | undefined;
        if (ev.type === 'tool_call' && mock.scaledDurationMs) {
          toolStartMs = scaledToolCursor;
          scaledToolCursor += mock.scaledDurationMs;
        }

        setVisible(prev => [
          ...prev,
          {
            event: ev,
            elapsedMs,
            scaledDurationMs: mock.scaledDurationMs,
            toolStartMs,
          },
        ]);

        if (idx === MOCK_RUN_EVENTS.length - 1 && !completedRef.current) {
          completedRef.current = true;
          const done = setTimeout(() => onComplete?.(), 350);
          timers.push(done);
        }
      }, cumulative);
      timers.push(t);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  const effectiveStatus = forcedStatus ?? status;
  const elapsedLabel =
    visible.length > 0
      ? formatElapsed(visible[visible.length - 1].elapsedMs)
      : '+00.000s';

  const toolCallCount = visible.filter(v => v.event.type === 'tool_call').length;

  return (
    <div
      className="w-full h-full flex flex-col rounded-md border overflow-hidden"
      style={{ background: '#0E0F2C', borderColor: '#23264F', color: '#E5E5F5' }}
    >
      <TopNav />
      <SubNav />
      <StatusBar
        status={effectiveStatus}
        toolCalls={toolCallCount}
        tokens={tokens}
        elapsed={elapsedLabel}
        model={DEMO_AGENT.model}
      />
      <TabBar tab={tab} onTab={setTab} counts={{ stream: visible.length, tool_calls: toolCallCount }} />

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'stream' && <StreamView visible={visible} status={effectiveStatus} />}
        {tab === 'tool_calls' && <ToolCallView visible={visible} />}
        {tab === 'conversation' && <ConversationView visible={visible} />}
        {tab === 'artifacts' && <ArtifactsView visible={visible} status={effectiveStatus} />}
      </div>

      <BottomBar status={effectiveStatus} toolCalls={toolCallCount} tokens={tokens} />
    </div>
  );
}

// ---------------- Top nav ----------------

function TopNav() {
  return (
    <header
      className="h-10 flex items-center gap-3 px-3 border-b shrink-0"
      style={{ background: '#0A0B23', borderColor: '#23264F' }}
    >
      <div className="flex items-center gap-2 px-1.5">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#4C44CB' }}>
          <Bot className="w-3 h-3 text-white" />
        </div>
        <span className="text-[12.5px] font-semibold text-white">cursor-sdk</span>
        <ChevronDown className="w-3 h-3" style={{ color: '#7C7CA0' }} />
      </div>

      <div className="h-4 w-px" style={{ background: '#23264F' }} />

      <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: '#1A1C40', color: '#9F98FF' }}>
        @cursor/february v1.0.7
      </span>

      <div className="flex-1 max-w-2xl">
        <div
          className="flex items-center gap-2 px-2.5 h-6 rounded"
          style={{ background: '#13142F', border: '1px solid #23264F' }}
        >
          <Search className="w-3 h-3" style={{ color: '#7C7CA0' }} />
          <span className="text-[11px] font-mono truncate" style={{ color: '#7C7CA0' }}>
            agentId:{DEMO_AGENT.agentId.slice(0, 12)}… · stage:pre-merge
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <NavIcon icon={<Star className="w-3.5 h-3.5" />} />
        <NavIcon icon={<MoreHorizontal className="w-3.5 h-3.5" />} />
      </div>
    </header>
  );
}

function NavIcon({ icon }: { icon: ReactNode }) {
  return (
    <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#1A1C40]" style={{ color: '#7C7CA0' }}>
      {icon}
    </button>
  );
}

function SubNav() {
  return (
    <div
      className="h-8 flex items-center px-3 text-[11px] border-b shrink-0"
      style={{ background: '#0E0F2C', borderColor: '#23264F' }}
    >
      <Crumb label="Agents" />
      <ChevronRight className="w-3 h-3" style={{ color: '#5A5A78' }} />
      <Crumb label={DEMO_AGENT.agentId.slice(0, 14) + '…'} mono />
      <ChevronRight className="w-3 h-3" style={{ color: '#5A5A78' }} />
      <Crumb label="runs" />
      <ChevronRight className="w-3 h-3" style={{ color: '#5A5A78' }} />
      <span className="px-1.5 font-mono" style={{ color: '#9F98FF' }}>
        {DEMO_AGENT.runId.slice(0, 14)}…
      </span>
    </div>
  );
}

function Crumb({ label, mono }: { label: string; mono?: boolean }) {
  return (
    <button
      className={`px-1.5 py-0.5 rounded hover:bg-[#1A1C40] ${mono ? 'font-mono text-[10.5px]' : ''}`}
      style={{ color: '#C9C9E5' }}
    >
      {label}
    </button>
  );
}

// ---------------- Status bar ----------------

function StatusBar({
  status,
  toolCalls,
  tokens,
  elapsed,
  model,
}: {
  status: RunStatus;
  toolCalls: number;
  tokens: number;
  elapsed: string;
  model: string;
}) {
  return (
    <div
      className="grid grid-cols-5 border-b shrink-0"
      style={{ background: '#0E0F2C', borderColor: '#23264F' }}
    >
      <Cell label="Status" value={<StatusPill status={status} />} />
      <Cell label="Tool calls" value={<span className="font-mono">{toolCalls}</span>} />
      <Cell label="Tokens" value={<span className="font-mono">{tokens.toLocaleString()}</span>} />
      <Cell label="Elapsed" value={<span className="font-mono">{elapsed}</span>} />
      <Cell label="Model" value={<span className="font-mono" style={{ color: '#9F98FF' }}>{model}</span>} last />
    </div>
  );
}

function Cell({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div
      className={`px-3 py-2 ${last ? '' : 'border-r'}`}
      style={{ borderColor: '#23264F' }}
    >
      <p className="text-[9.5px] uppercase tracking-wider mb-0.5" style={{ color: '#7C7CA0' }}>
        {label}
      </p>
      <div className="text-[12px] text-white">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: RunStatus }) {
  const cfg = STATUS_STYLES[status];
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === 'RUNNING' || status === 'CREATING' ? 'animate-pulse' : ''}`}
        style={{ background: cfg.dot }}
      />
      <span className="font-medium" style={{ color: cfg.color }}>
        {status}
      </span>
    </span>
  );
}

const STATUS_STYLES: Record<RunStatus, { dot: string; color: string }> = {
  CREATING: { dot: '#FBBF24', color: '#FBBF24' },
  RUNNING: { dot: '#9F98FF', color: '#9F98FF' },
  FINISHED: { dot: '#4ADE80', color: '#4ADE80' },
  ERROR: { dot: '#FB7185', color: '#FB7185' },
  CANCELLED: { dot: '#7C7CA0', color: '#7C7CA0' },
};

// ---------------- Tabs ----------------

function TabBar({
  tab,
  onTab,
  counts,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  counts: { stream: number; tool_calls: number };
}) {
  const tabs: Array<{ id: Tab; label: string; icon: ReactNode; count?: number }> = [
    { id: 'stream', label: 'Stream', icon: <ListIcon className="w-3 h-3" />, count: counts.stream },
    { id: 'tool_calls', label: 'Tool calls', icon: <Flame className="w-3 h-3" />, count: counts.tool_calls },
    { id: 'conversation', label: 'Conversation', icon: <MessageSquare className="w-3 h-3" /> },
    { id: 'artifacts', label: 'Artifacts', icon: <Terminal className="w-3 h-3" /> },
  ];

  return (
    <div
      className="flex items-center px-3 gap-0 border-b text-[11.5px] shrink-0"
      style={{ background: '#0E0F2C', borderColor: '#23264F' }}
    >
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border-b-2 whitespace-nowrap"
            style={{
              borderColor: active ? '#9F98FF' : 'transparent',
              color: active ? '#FFFFFF' : '#9FA0BC',
              fontWeight: active ? 500 : 400,
            }}
          >
            {t.icon}
            {t.label}
            {typeof t.count === 'number' && (
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono" style={{ background: '#1A1C40', color: '#7C7CA0' }}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}

      <div className="ml-auto flex items-center gap-1.5 py-1.5">
        <button
          className="h-5 px-1.5 rounded text-[10px] flex items-center gap-1 border"
          style={{ background: '#13142F', borderColor: '#23264F', color: '#C9C9E5' }}
        >
          <Eye className="w-2.5 h-2.5" />
          run.stream()
        </button>
      </div>
    </div>
  );
}

// ---------------- Stream view ----------------

function StreamView({ visible, status }: { visible: VisibleEvent[]; status: RunStatus }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visible.length]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-3 font-mono text-[11.5px] space-y-1" style={{ background: '#0A0B23' }}>
      {visible.length === 0 && (
        <p className="italic px-1 py-2" style={{ color: '#7C7CA0' }}>
          run.stream() · waiting for first SDKMessage…
        </p>
      )}
      {visible.map((v, i) => (
        <StreamRow key={i} v={v} />
      ))}
      {(status === 'RUNNING' || status === 'CREATING') && (
        <div className="flex items-center gap-1.5 px-1 py-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#9F98FF' }} />
          <span style={{ color: '#7C7CA0' }}>streaming…</span>
        </div>
      )}
    </div>
  );
}

function StreamRow({ v }: { v: VisibleEvent }) {
  const { event, elapsedMs } = v;

  const channelStyle = getChannelStyle(event);
  const summary = summarizeEvent(event);

  return (
    <div className="flex gap-2.5 items-start leading-relaxed" style={{ animation: 'sdkFadeIn 0.18s ease-out' }}>
      <span className="shrink-0 w-[78px] text-right" style={{ color: '#5A5A78' }}>
        {formatElapsed(elapsedMs)}
      </span>
      <span
        className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border whitespace-nowrap"
        style={{
          background: channelStyle.bg,
          borderColor: channelStyle.border,
          color: channelStyle.color,
        }}
      >
        {channelStyle.label}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5">
          <Check className="w-3 h-3 mt-[3px] shrink-0" style={{ color: '#4ADE80' }} />
          <span className="break-words text-white">{summary.label}</span>
        </div>
        {summary.detail && (
          <div className="ml-4 mt-0.5 break-words" style={{ color: '#9FA0BC' }}>
            {summary.detail}
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes sdkFadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

interface ChannelStyle { label: string; color: string; bg: string; border: string }

function getChannelStyle(event: SDKMessage): ChannelStyle {
  if (event.type === 'tool_call') {
    const ns = event.name.includes(':') ? event.name.split(':')[1].split('/')[0] : event.name.split('/')[0];
    if (event.name.startsWith('mcp:snyk')) return mk('mcp:snyk', '#9F98FF', '#4C44CB');
    if (event.name.startsWith('mcp:github')) return mk('mcp:github', '#E5E5F5', '#7C7CA0');
    if (event.name.startsWith('mcp:jira')) return mk('mcp:jira', '#4C9AFF', '#0052CC');
    if (event.name === 'shell') return mk('shell', '#4ADE80', '#22C55E');
    if (event.name === 'edit' || event.name === 'write_file') return mk(event.name, '#A78BFA', '#7C3AED');
    if (event.name === 'read_file') return mk('read_file', '#A78BFA', '#7C3AED');
    return mk(ns, '#C9C9E5', '#23264F');
  }
  if (event.type === 'status') return mk('status', '#FBBF24', '#92400E');
  if (event.type === 'thinking') return mk('thinking', '#D97757', '#9A4F37');
  if (event.type === 'assistant') return mk('assistant', '#4C9AFF', '#1E40AF');
  if (event.type === 'task') return mk('task', '#9F98FF', '#4C44CB');
  if (event.type === 'system') return mk('system', '#7C7CA0', '#3A3A55');
  return mk('event', '#C9C9E5', '#23264F');
}

function mk(label: string, color: string, base: string): ChannelStyle {
  return {
    label,
    color,
    bg: hexAlpha(base, 0.12),
    border: hexAlpha(base, 0.4),
  };
}

function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function summarizeEvent(event: SDKMessage): { label: string; detail?: string } {
  if (event.type === 'tool_call') {
    const args = event.args ? compactJson(event.args) : undefined;
    const result = event.result ? compactJson(event.result) : undefined;
    return {
      label: event.name,
      detail: [args && `args: ${args}`, result && `result: ${result}`].filter(Boolean).join('  ·  '),
    };
  }
  if (event.type === 'status') return { label: `status → ${event.status}` };
  if (event.type === 'thinking') return { label: 'thinking', detail: event.text };
  if (event.type === 'assistant') {
    const text = event.message.content.map(b => b.text).join('');
    return { label: 'assistant.text', detail: text };
  }
  if (event.type === 'task') return { label: 'task', detail: event.text };
  if (event.type === 'system') return { label: 'system', detail: event.text };
  if (event.type === 'user') return { label: 'user', detail: event.message.content.map(b => b.text).join('') };
  return { label: 'event' };
}

function compactJson(value: unknown): string {
  try {
    const s = JSON.stringify(value);
    if (s.length > 120) return s.slice(0, 117) + '…';
    return s;
  } catch {
    return String(value);
  }
}

// ---------------- Tool-call flame graph ----------------

function ToolCallView({ visible }: { visible: VisibleEvent[] }) {
  const calls = visible.filter(v => v.event.type === 'tool_call') as Array<VisibleEvent & { event: SDKToolUseMessage }>;
  const totalMs = useMemo(() => {
    if (calls.length === 0) return 1;
    const last = calls[calls.length - 1];
    return Math.max(1, (last.toolStartMs ?? 0) + (last.scaledDurationMs ?? 600));
  }, [calls]);

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#0A0B23' }}>
      <ToolCallRuler totalMs={totalMs} />
      {calls.length === 0 && (
        <p className="italic px-3 py-2 text-[11.5px]" style={{ color: '#7C7CA0' }}>
          Tool-call timeline is empty until the first SDKToolUseMessage arrives.
        </p>
      )}
      {calls.map((c, i) => (
        <ToolFlameRow key={c.event.call_id} call={c.event} startMs={c.toolStartMs ?? 0} durationMs={c.scaledDurationMs ?? 600} totalMs={totalMs} indexLabel={i + 1} />
      ))}
      <div style={{ height: 24 }} />
    </div>
  );
}

function ToolCallRuler({ totalMs }: { totalMs: number }) {
  const ticks = 6;
  return (
    <div
      className="relative h-7 border-b text-[10px] font-mono select-none"
      style={{ background: '#13142F', borderColor: '#23264F', color: '#7C7CA0' }}
    >
      <div className="absolute inset-y-0 right-0" style={{ left: 280 }}>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const pct = (i / ticks) * 100;
          const ms = Math.round((totalMs / ticks) * i);
          return (
            <div key={i} className="absolute top-0 bottom-0" style={{ left: `${pct}%` }}>
              <div className="w-px h-full" style={{ background: '#23264F' }} />
              <span className="absolute top-1.5 -translate-x-1/2 px-1" style={{ left: 0 }}>
                {ms === 0 ? '0' : ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToolFlameRow({
  call,
  startMs,
  durationMs,
  totalMs,
  indexLabel,
}: {
  call: SDKToolUseMessage;
  startMs: number;
  durationMs: number;
  totalMs: number;
  indexLabel: number;
}) {
  const labelColW = 280;
  const leftPct = (startMs / totalMs) * 100;
  const widthPct = Math.max(2, (durationMs / totalMs) * 100);

  const color = toolColor(call.name);
  const namespace = call.name.includes(':') ? call.name.split(':')[1].split('/')[0] : call.name.split('/')[0];

  return (
    <div className="relative flex items-stretch border-b" style={{ height: 24, borderColor: '#1A1C40' }}>
      <div
        className="shrink-0 flex items-center gap-2 pr-2 border-r overflow-hidden"
        style={{ width: labelColW, paddingLeft: 10, background: '#0E0F2C', borderColor: '#23264F' }}
      >
        <span className="text-[9.5px] font-mono shrink-0" style={{ color: '#5A5A78', width: 16 }}>
          {String(indexLabel).padStart(2, '0')}
        </span>
        <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="truncate text-[11px] text-white">{call.name}</span>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0" style={{ background: '#0A0B23' }} />
        <div
          className="absolute top-1 bottom-1 rounded-[2px] flex items-center px-1.5 text-[10px] font-mono whitespace-nowrap overflow-hidden"
          style={{
            left: `${leftPct}%`,
            width: `calc(${widthPct}% - 0px)`,
            background: `${color}33`,
            border: `1px solid ${color}`,
            color: '#FFFFFF',
          }}
          title={`${call.name} · ${Math.round(durationMs)}ms`}
        >
          <span className="truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            {namespace}
          </span>
          <span className="ml-auto opacity-90 pl-2 shrink-0">{Math.round(durationMs)}ms</span>
        </div>
      </div>
    </div>
  );
}

function toolColor(name: string): string {
  if (name.startsWith('mcp:snyk')) return '#4C44CB';
  if (name.startsWith('mcp:github')) return '#7C7CA0';
  if (name.startsWith('mcp:jira')) return '#4C9AFF';
  if (name === 'shell') return '#22C55E';
  if (name === 'edit' || name === 'write_file' || name === 'read_file') return '#7C3AED';
  return '#9F98FF';
}

// ---------------- Conversation view ----------------

function ConversationView({ visible }: { visible: VisibleEvent[] }) {
  const turns = visible.filter(v => v.event.type === 'assistant' || v.event.type === 'thinking' || v.event.type === 'task');
  return (
    <div className="h-full overflow-y-auto p-4 space-y-3 text-[12px]" style={{ background: '#0A0B23' }}>
      {turns.length === 0 && (
        <p className="italic" style={{ color: '#7C7CA0' }}>
          run.conversation() will populate as the assistant emits text.
        </p>
      )}
      {turns.map((t, i) => {
        const speaker =
          t.event.type === 'thinking' ? 'thinking' : t.event.type === 'task' ? 'task' : 'assistant';
        const text =
          t.event.type === 'assistant'
            ? t.event.message.content.map(b => b.text).join('')
            : t.event.type === 'thinking'
              ? t.event.text
              : t.event.type === 'task'
                ? t.event.text
                : '';
        const accent =
          speaker === 'thinking' ? '#D97757' : speaker === 'task' ? '#9F98FF' : '#4C9AFF';
        return (
          <div key={i} className="rounded-md border p-2.5" style={{ background: '#0E0F2C', borderColor: '#23264F' }}>
            <div className="flex items-center gap-2 mb-1 text-[10.5px] font-mono uppercase tracking-wider" style={{ color: accent }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
              {speaker}
            </div>
            <p className="text-white leading-relaxed">{text}</p>
          </div>
        );
      })}
    </div>
  );
}

// ---------------- Artifacts view ----------------

function ArtifactsView({ visible, status }: { visible: VisibleEvent[]; status: RunStatus }) {
  const finished = status === 'FINISHED';
  const hasPRCall = visible.some(v => v.event.type === 'tool_call' && v.event.name === 'mcp:github/open_pull_request');

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2 text-[12px]" style={{ background: '#0A0B23' }}>
      <p className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: '#7C7CA0' }}>
        agent.listArtifacts()
      </p>
      <ArtifactRow path="artifacts/triage/snyk-customer-profile.md" sizeBytes={4837} ready={hasPRCall} />
      <ArtifactRow path="artifacts/exploit-replay/before-after.json" sizeBytes={612} ready={hasPRCall} />
      <ArtifactRow path="artifacts/snyk/snyk-test-summary.json" sizeBytes={918} ready={hasPRCall} />
      <ArtifactRow path="artifacts/pr/214.diff" sizeBytes={2044} ready={hasPRCall} />
      {!finished && !hasPRCall && (
        <p className="italic mt-3" style={{ color: '#7C7CA0' }}>
          Artifacts will appear as the run produces them. PR diff lands at the PR-open tool call.
        </p>
      )}
    </div>
  );
}

function ArtifactRow({ path, sizeBytes, ready }: { path: string; sizeBytes: number; ready: boolean }) {
  return (
    <div
      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded border"
      style={{
        background: ready ? '#0E0F2C' : '#0A0B23',
        borderColor: ready ? '#23264F' : '#1A1C40',
      }}
    >
      <Activity className="w-3 h-3" style={{ color: ready ? '#9F98FF' : '#3A3A55' }} />
      <span className="font-mono text-[11px] truncate flex-1" style={{ color: ready ? '#C9C9E5' : '#5A5A78' }}>
        {path}
      </span>
      <span className="font-mono text-[10px]" style={{ color: '#7C7CA0' }}>
        {formatBytes(sizeBytes)}
      </span>
      <span className="text-[10px] font-mono" style={{ color: ready ? '#4ADE80' : '#5A5A78' }}>
        {ready ? 'ready' : 'pending'}
      </span>
    </div>
  );
}

// ---------------- Bottom bar ----------------

function BottomBar({ status, toolCalls, tokens }: { status: RunStatus; toolCalls: number; tokens: number }) {
  return (
    <div
      className="px-3 py-1.5 text-[10.5px] font-mono flex items-center gap-4 border-t shrink-0"
      style={{ background: '#0A0B23', borderColor: '#23264F', color: '#7C7CA0' }}
    >
      <span>
        SDK · <span className="text-white">@cursor/february v1.0.7</span>
      </span>
      <span>
        run · <span className="text-white">{toolCalls} tool calls</span> · <span className="text-white">{tokens.toLocaleString()} tok</span>
      </span>
      <span className="ml-auto">
        wait → <span style={{ color: STATUS_STYLES[status].color }}>{status}</span>
      </span>
    </div>
  );
}

// ---------------- helpers ----------------

function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000;
  const totalMs = Math.floor(ms);
  const mins = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds) % 60;
  const millis = totalMs % 1000;
  if (mins > 0) {
    return `+${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }
  return `+${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}s`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}
