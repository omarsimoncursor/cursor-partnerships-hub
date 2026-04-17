'use client';

import { CharacterAvatar, type CharacterId } from '../character-avatar';
import { CheckCircle2, GitPullRequestArrow, Sparkles } from 'lucide-react';

interface TimelineRow {
  status: string;
  by: CharacterId;
  when: string;
  note?: string;
  state: 'todo' | 'in-progress' | 'in-review' | 'changes' | 'approved' | 'merging';
}

const TIMELINE: TimelineRow[] = [
  { state: 'todo', status: 'To Do', by: 'maya', when: 'T+0m', note: 'Created from modernization epic CUR-5201' },
  { state: 'in-progress', status: 'In Progress', by: 'cursor', when: 'T+14m', note: 'Opus triage · plan drafted' },
  { state: 'in-review', status: 'Plan Review', by: 'maya', when: 'T+34m', note: '3 comments on rounding, FX window, CTE scope' },
  { state: 'changes', status: 'Changes Requested', by: 'maya', when: 'T+38m', note: "Banker's rounding + FX retry + transient" },
  { state: 'in-progress', status: 'In Progress (patch)', by: 'cursor', when: 'T+2h 51m', note: '3 commits · re-ran row-equivalence harness' },
  { state: 'in-review', status: 'PR Review', by: 'jordan', when: 'T+3h 12m', note: 'dbt not_null test failed · XOF FX deprecation' },
  { state: 'in-progress', status: 'In Progress (iteration 2)', by: 'cursor', when: 'T+3h 24m', note: 'deprecated_currencies seed + exception audit' },
  { state: 'approved', status: 'Approved', by: 'jordan', when: 'T+3h 47m', note: 'Queued for Friday change window' },
];

const COMMENTS: Array<{ by: CharacterId; at: string; body: React.ReactNode }> = [
  {
    by: 'maya',
    at: 'Today · 2:04 PM',
    body: (
      <p>
        Spun up this task from the modernization epic. Cursor is going to take first pass on the
        daily revenue rollup. I&apos;ll review the plan before any code lands.
      </p>
    ),
  },
  {
    by: 'cursor',
    at: 'Today · 2:34 PM',
    body: (
      <p>
        Plan posted in the PR description and on <span className="font-mono text-[#7DD3F5]">#data-platform</span>.
        Covers idiom mapping (QUALIFY, MULTISET VOLATILE, COLLECT STATS), target shape
        (staging + fct + 14 tests), verification strategy (Cortex COMPLETE + 1% row-equiv harness).
        Ready for human review.
      </p>
    ),
  },
  {
    by: 'maya',
    at: 'Today · 3:12 PM',
    body: (
      <p>
        Three things on the plan. Use banker&apos;s rounding not half-up (finance reconciles against
        BTEQ monthly). The FX-rate macro needs a retry window — in prod we see rate arrivals up to
        6 hours late. And that CTE with <span className="font-mono">ON COMMIT</span> semantics is
        confusing — if you need cross-step state use a transient.
      </p>
    ),
  },
  {
    by: 'jordan',
    at: 'Today · 4:46 PM',
    body: (
      <p>
        Caught a not-null failure on <span className="font-mono">currency_code</span> — looks like
        the BTEQ silently dropped XOF rows because the FX rate was deprecated in 2023. Don&apos;t
        paper over it with COALESCE; surface those 4 rows for finance and add XOF to a seed so it&apos;s
        documented.
      </p>
    ),
  },
  {
    by: 'cursor',
    at: 'Today · 5:24 PM',
    body: (
      <p>
        <span className="font-mono text-[#7DD3F5]">seeds/deprecated_currencies.csv</span> + audit
        table <span className="font-mono text-[#7DD3F5]">exceptions/deprecated_fx.sql</span> added.
        14 / 14 tests pass. Cortex re-verified: no drift.
      </p>
    ),
  },
  {
    by: 'jordan',
    at: 'Today · 5:47 PM',
    body: (
      <p>
        Approved. Merging Friday 05:00 PT. Cursor, please open a backfill subtask so finance can
        hand-review those 4 exception rows before we retire the BTEQ.
      </p>
    ),
  },
];

export function JiraTicket() {
  return (
    <div className="w-full h-full bg-white text-[#172B4D] overflow-y-auto">
      <TopBar />
      <div className="grid grid-cols-[minmax(0,1fr)_320px]">
        <MainBody />
        <Sidebar />
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="h-11 flex items-center gap-3 px-4 bg-[#F4F5F7] border-b border-[#DFE1E6]">
      <div className="w-6 h-6 rounded bg-[#0052CC] flex items-center justify-center text-white font-bold text-[12px]">
        J
      </div>
      <p className="text-[12px] text-[#42526E]">
        <span className="font-semibold text-[#172B4D]">acme-analytics</span> / projects /{' '}
        <span className="font-semibold text-[#172B4D]">Cursor Modernization</span> /{' '}
        <span className="font-mono text-[#0052CC]">CUR-5202</span>
      </p>
      <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold uppercase tracking-wider text-[#36B37E] bg-[#E3FCEF] border border-[#ABF5D1]">
        <CheckCircle2 className="w-3 h-3" />
        Approved
      </span>
    </header>
  );
}

function MainBody() {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2 text-[11px] text-[#42526E] font-mono mb-2">
        <span>Modernization Task</span>
        <span>·</span>
        <span className="text-[#DE350B]">P1</span>
        <span>·</span>
        <span>Epic</span>
        <span className="text-[#0052CC]">CUR-5201 · ELT Modernization</span>
      </div>

      <h1 className="text-[22px] font-semibold text-[#172B4D] mb-4 leading-tight">
        Modernize daily_revenue_rollup.bteq → Snowflake + dbt (1 / 911)
      </h1>

      <div className="rounded border border-[#DFE1E6] bg-[#F4F5F7] px-4 py-3 mb-5">
        <p className="text-[12px] text-[#42526E] uppercase tracking-wider font-semibold mb-2">
          Description
        </p>
        <p className="text-[13px] text-[#172B4D] leading-relaxed">
          Modernize <span className="font-mono">daily_revenue_rollup.bteq</span> (214 LOC, Teradata
          17) plus companion <span className="font-mono">usp_enrich_customers_360</span> (156 LOC,
          SQL Server 2019) and Informatica mapping <span className="font-mono">wf_customers_360.xml</span>{' '}
          into a Snowflake-native dbt DAG. Row-equivalence Δ=0 and Cortex semantic diff =
          &ldquo;no drift&rdquo; required before merge. Verify 14 dbt tests pass.
        </p>
      </div>

      <div className="mb-5">
        <p className="text-[12px] text-[#42526E] uppercase tracking-wider font-semibold mb-3">
          Workflow timeline · <span className="normal-case font-normal">wall-clock</span>
        </p>
        <ol className="relative border-l border-[#DFE1E6] ml-2 space-y-3">
          {TIMELINE.map((row, i) => (
            <li key={i} className="pl-5 relative">
              <TimelineMarker state={row.state} />
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded text-[10.5px] font-semibold uppercase tracking-wider"
                  style={timelineStyle(row.state)}
                >
                  {row.status}
                </span>
                <span className="text-[11.5px] text-[#42526E] font-mono">{row.when}</span>
                <span className="flex items-center gap-1 text-[11.5px] text-[#172B4D]">
                  by <CharacterAvatar character={row.by} size="xs" /> <AuthorName id={row.by} />
                </span>
              </div>
              {row.note && (
                <p className="text-[12px] text-[#42526E] mt-0.5 leading-relaxed">{row.note}</p>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <p className="text-[12px] text-[#42526E] uppercase tracking-wider font-semibold mb-3">
          Activity · comments
        </p>
        <div className="space-y-3">
          {COMMENTS.map((c, i) => (
            <div
              key={i}
              className="rounded-lg border border-[#DFE1E6] bg-white px-4 py-3 flex gap-3 shadow-[0_1px_0_#DFE1E6]"
            >
              <CharacterAvatar character={c.by} size="sm" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[12.5px] font-semibold text-[#172B4D]">
                    <AuthorName id={c.by} />
                  </p>
                  <p className="text-[10.5px] text-[#6B778C] font-mono">{c.at}</p>
                </div>
                <div className="text-[12.5px] text-[#172B4D] leading-relaxed">{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthorName({ id }: { id: CharacterId }) {
  const names: Record<CharacterId, string> = {
    maya: 'Maya Alfaro',
    jordan: 'Jordan Park',
    samira: 'Samira Chen',
    cursor: 'Cursor',
    cfo: 'Dana Whitaker',
    gsi: 'Apex GSI',
  };
  return <span className="text-[#172B4D]">{names[id]}</span>;
}

function TimelineMarker({ state }: { state: TimelineRow['state'] }) {
  const color = timelineStyle(state).color;
  const bg = timelineStyle(state).background;
  return (
    <span
      className="absolute left-[-6px] top-1 w-3 h-3 rounded-full border-2"
      style={{ borderColor: color, background: bg }}
    />
  );
}

function timelineStyle(state: TimelineRow['state']): { color: string; background: string } {
  switch (state) {
    case 'todo': return { color: '#6B778C', background: '#F4F5F7' };
    case 'in-progress': return { color: '#0052CC', background: '#DEEBFF' };
    case 'in-review': return { color: '#6554C0', background: '#EAE6FF' };
    case 'changes': return { color: '#FF8B00', background: '#FFF0B3' };
    case 'approved': return { color: '#36B37E', background: '#E3FCEF' };
    case 'merging': return { color: '#00A3BF', background: '#E6FCFF' };
  }
}

function Sidebar() {
  return (
    <aside className="border-l border-[#DFE1E6] bg-[#F4F5F7] px-4 py-5 text-[12px]">
      <SidebarSection label="Assignees">
        <div className="flex items-center gap-2 mb-1">
          <CharacterAvatar character="cursor" size="xs" /> Cursor
          <span className="ml-auto px-1.5 py-0.5 rounded text-[9.5px] font-semibold uppercase text-[#0052CC] bg-[#DEEBFF]">
            executing
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <CharacterAvatar character="maya" size="xs" /> Maya Alfaro
          <span className="ml-auto px-1.5 py-0.5 rounded text-[9.5px] font-semibold uppercase text-[#6554C0] bg-[#EAE6FF]">
            plan reviewer
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CharacterAvatar character="jordan" size="xs" /> Jordan Park
          <span className="ml-auto px-1.5 py-0.5 rounded text-[9.5px] font-semibold uppercase text-[#36B37E] bg-[#E3FCEF]">
            code reviewer
          </span>
        </div>
      </SidebarSection>

      <SidebarSection label="Wall-clock">
        <KVRow k="Agent compute" v="2h 16m" mono />
        <KVRow k="Human review" v="1h 47m" mono />
        <KVRow k="Total" v="4h 03m" mono strong />
      </SidebarSection>

      <SidebarSection label="Iteration cycles">
        <KVRow k="Plan reviews" v="1" mono />
        <KVRow k="Code reviews" v="1" mono />
        <KVRow k="dbt retries" v="1 (XOF)" mono />
      </SidebarSection>

      <SidebarSection label="Linked">
        <LinkedItem icon={<GitPullRequestArrow className="w-3 h-3 text-[#0052CC]" />} label="PR #318" />
        <LinkedItem icon={<Sparkles className="w-3 h-3 text-[#29B5E8]" />} label="Cortex review · 0 drift" />
        <LinkedItem icon={<CheckCircle2 className="w-3 h-3 text-[#36B37E]" />} label="dbt run · 12.8s" />
      </SidebarSection>

      <SidebarSection label="Epic progress">
        <KVRow k="Modernized" v="1 / 911" mono />
        <KVRow k="ETA" v="15 months" mono />
        <KVRow k="GSI baseline" v="4 years" mono />
      </SidebarSection>

      <SidebarSection label="Components">
        <div className="flex flex-wrap gap-1">
          {['Data/Analytics', 'Snowflake', 'dbt', 'Cortex AI', 'Teradata'].map((c) => (
            <span
              key={c}
              className="px-1.5 py-0.5 rounded bg-white border border-[#DFE1E6] text-[10.5px] text-[#42526E]"
            >
              {c}
            </span>
          ))}
        </div>
      </SidebarSection>
    </aside>
  );
}

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B778C] mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function KVRow({ k, v, mono, strong }: { k: string; v: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 mb-0.5">
      <span className="text-[#6B778C] w-[90px] shrink-0">{k}</span>
      <span className={`${mono ? 'font-mono' : ''} ${strong ? 'text-[#172B4D] font-semibold' : 'text-[#172B4D]'}`}>
        {v}
      </span>
    </div>
  );
}

function LinkedItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-[11.5px] text-[#0052CC] hover:underline cursor-pointer">{label}</span>
    </div>
  );
}
