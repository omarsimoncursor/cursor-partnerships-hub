'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Calendar,
  Clock,
  Filter,
  KeyRound,
  Lock,
  Mail,
  MailX,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type {
  OutreachConnectionStatus,
  OutreachContactRow,
  OutreachPriorityTier,
  OutreachSeniorityTier,
} from '@/lib/outreach-store/types';
import type { OutreachContactResponse } from '@/lib/outreach-store/presentation';
import { OutreachContactCard } from '../components/contact-card';

const TOKEN_STORAGE_KEY = 'cursor.prospect-builder.api-token';
const STALE_DAYS = 7;

type DateRange = '24h' | '7d' | '30d' | '90d' | 'all';

const DATE_RANGE_DAYS: Record<DateRange, number | null> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
};

export function DashboardClient({
  contacts: initialContacts,
  latestRunId,
}: {
  contacts: OutreachContactResponse[];
  latestRunId: string | null;
}) {
  const [apiToken, setApiToken] = useState('');
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [contacts, setContacts] = useState<OutreachContactResponse[]>(initialContacts);

  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState<OutreachSeniorityTier | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<OutreachPriorityTier | ''>('');
  const [statusFilter, setStatusFilter] = useState<OutreachConnectionStatus | ''>('');
  const [signalTypeFilter, setSignalTypeFilter] = useState('');
  const [hasPriorCustomerOnly, setHasPriorCustomerOnly] = useState(false);
  const [powerUserOnly, setPowerUserOnly] = useState(false);
  const [hasWorkEmailOnly, setHasWorkEmailOnly] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
      setApiToken(saved);
    } catch {
      // no-op
    } finally {
      setTokenLoaded(true);
    }
  }, []);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const mergeContact = (next: OutreachContactRow) => {
    setContacts((prev) => prev.map((c) => (c.id === next.id ? { ...c, ...next } : c)));
  };

  const accounts = useMemo(() => {
    const set = new Set<string>();
    for (const c of contacts) set.add(c.account_display_name);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [contacts]);

  const allSignalTypes = useMemo(() => {
    const set = new Set<string>();
    for (const c of contacts) for (const t of c.signal_types ?? []) set.add(t);
    return Array.from(set).sort();
  }, [contacts]);

  const filtered = useMemo(() => {
    const days = DATE_RANGE_DAYS[dateRange];
    const cutoff = days != null ? Date.now() - days * 86_400_000 : null;
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (cutoff != null) {
        const t = Date.parse(c.signal_latest_at);
        if (Number.isFinite(t) && t < cutoff) return false;
      }
      if (accountFilter && c.account_display_name !== accountFilter) return false;
      if (seniorityFilter && c.seniority_tier_value !== seniorityFilter) return false;
      if (priorityFilter && c.priority_tier_value !== priorityFilter) return false;
      if (statusFilter && c.connection_status_value !== statusFilter) return false;
      if (signalTypeFilter && !(c.signal_types ?? []).includes(signalTypeFilter)) return false;
      if (hasPriorCustomerOnly && (c.previously_at_cursor_customers ?? []).length === 0) return false;
      if (powerUserOnly && !c.is_power_user) return false;
      if (hasWorkEmailOnly && !c.work_email) return false;

      // Top-card overlay filters (mutually exclusive within a card click).
      if (activeCard === 'hot' && c.priority_tier_value !== 'hot') return false;
      if (activeCard === 'power_users') {
        if (!c.is_power_user || c.last_sfdc_activity_at != null) return false;
      }
      if (activeCard === 'alumni' && (c.previously_at_cursor_customers ?? []).length === 0) return false;
      if (activeCard === 'stale_sent') {
        if (c.connection_status_value !== 'sent' || c.connection_accepted_at != null) return false;
        const sentAt = c.connection_sent_at ? Date.parse(c.connection_sent_at) : null;
        if (sentAt == null || Number.isFinite(sentAt) && Date.now() - sentAt < STALE_DAYS * 86_400_000) return false;
      }
      if (activeCard === 'wave') {
        if ((c.account_signal_count_l7d ?? 0) < 3) return false;
      }

      if (!q) return true;
      const hay = [
        c.full_name,
        c.title,
        c.account_display_name,
        c.account_name,
        c.work_email ?? '',
        c.linkedin_url ?? '',
        c.priority_rationale ?? '',
        ...(c.signal_types ?? []),
      ]
        .join('\u0001')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [
    contacts,
    dateRange,
    search,
    accountFilter,
    seniorityFilter,
    priorityFilter,
    statusFilter,
    signalTypeFilter,
    hasPriorCustomerOnly,
    powerUserOnly,
    hasWorkEmailOnly,
    activeCard,
  ]);

  // Top-card counts. Computed off the FULL contact list (not the
  // current filter) so the rep can see "20 hot today" and click in
  // even when their filter has them looking at last-week.
  const counts = useMemo(() => {
    let hot = 0;
    let powerNoEngagement = 0;
    let alumni = 0;
    let staleSent = 0;
    const accountSignalDensity = new Map<string, number>();
    const cutoffStale = Date.now() - STALE_DAYS * 86_400_000;
    for (const c of contacts) {
      if (c.priority_tier_value === 'hot') hot += 1;
      if (c.is_power_user && c.last_sfdc_activity_at == null) powerNoEngagement += 1;
      if ((c.previously_at_cursor_customers ?? []).length > 0) alumni += 1;
      if (
        c.connection_status_value === 'sent' &&
        c.connection_accepted_at == null &&
        c.connection_sent_at != null &&
        Date.parse(c.connection_sent_at) < cutoffStale
      ) {
        staleSent += 1;
      }
      const cur = accountSignalDensity.get(c.account_display_name) ?? 0;
      accountSignalDensity.set(
        c.account_display_name,
        Math.max(cur, c.account_signal_count_l7d ?? 0),
      );
    }
    const wave = Array.from(accountSignalDensity.values()).filter((n) => n >= 3).length;
    return { hot, powerNoEngagement, alumni, staleSent, wave };
  }, [contacts]);

  if (!tokenLoaded) return <div className="text-sm text-text-tertiary">Loading…</div>;
  if (!apiToken) return <TokenPrompt onSubmit={setApiToken} />;

  const clearFilters = () => {
    setDateRange('7d');
    setSearch('');
    setAccountFilter('');
    setSeniorityFilter('');
    setPriorityFilter('');
    setStatusFilter('');
    setSignalTypeFilter('');
    setHasPriorCustomerOnly(false);
    setPowerUserOnly(false);
    setHasWorkEmailOnly(false);
    setActiveCard(null);
  };

  return (
    <div>
      {/* 5 top cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <TopCard
          tone="red"
          icon={<Sparkles className="w-3.5 h-3.5" />}
          label="Hot today"
          value={counts.hot}
          active={activeCard === 'hot'}
          onClick={() => setActiveCard((cur) => (cur === 'hot' ? null : 'hot'))}
        />
        <TopCard
          tone="blue"
          icon={<Zap className="w-3.5 h-3.5" />}
          label="Power users, no SFDC activity"
          value={counts.powerNoEngagement}
          active={activeCard === 'power_users'}
          onClick={() => setActiveCard((cur) => (cur === 'power_users' ? null : 'power_users'))}
        />
        <TopCard
          tone="amber"
          icon={<Users className="w-3.5 h-3.5" />}
          label="Cursor-customer alumni"
          value={counts.alumni}
          active={activeCard === 'alumni'}
          onClick={() => setActiveCard((cur) => (cur === 'alumni' ? null : 'alumni'))}
        />
        <TopCard
          tone="amber"
          icon={<Clock className="w-3.5 h-3.5" />}
          label={`Stale sent (>${STALE_DAYS}d)`}
          value={counts.staleSent}
          active={activeCard === 'stale_sent'}
          onClick={() => setActiveCard((cur) => (cur === 'stale_sent' ? null : 'stale_sent'))}
        />
        <TopCard
          tone="blue"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          label="Accounts at 3+ L7d signals"
          value={counts.wave}
          active={activeCard === 'wave'}
          onClick={() => setActiveCard((cur) => (cur === 'wave' ? null : 'wave'))}
        />
      </div>

      {/* Filters row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[260px] flex items-center gap-2 px-3 py-2 rounded-md bg-dark-surface border border-dark-border">
          <Search className="w-4 h-4 text-text-tertiary shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, title, company, email, signal…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-0.5 text-text-tertiary hover:text-text-primary">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Selector
          icon={<Calendar className="w-3.5 h-3.5" />}
          value={dateRange}
          onChange={(v) => setDateRange(v as DateRange)}
          options={[
            ['24h', 'Last 24h'],
            ['7d', 'Last 7d'],
            ['30d', 'Last 30d'],
            ['90d', 'Last 90d'],
            ['all', 'All time'],
          ]}
        />

        <Selector
          icon={<Briefcase className="w-3.5 h-3.5" />}
          value={accountFilter}
          onChange={setAccountFilter}
          placeholder="All accounts"
          options={[
            ['', 'All accounts'],
            ...accounts.map((a) => [a, a] as [string, string]),
          ]}
        />

        <Selector
          value={seniorityFilter}
          onChange={(v) => setSeniorityFilter(v as OutreachSeniorityTier | '')}
          options={[
            ['', 'Any seniority'],
            ['Executive', 'Executive'],
            ['Leader', 'Leader'],
            ['Manager', 'Manager'],
          ]}
        />

        <Selector
          value={priorityFilter}
          onChange={(v) => setPriorityFilter(v as OutreachPriorityTier | '')}
          options={[
            ['', 'Any priority'],
            ['hot', 'Hot'],
            ['warm', 'Warm'],
            ['nurture', 'Nurture'],
          ]}
        />

        <Selector
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as OutreachConnectionStatus | '')}
          options={[
            ['', 'Any status'],
            ['pending', 'Pending'],
            ['sent', 'Sent'],
            ['accepted', 'Accepted'],
            ['replied', 'Replied'],
            ['closed_no_reply', 'Closed (no reply)'],
            ['disqualified', 'Disqualified'],
          ]}
        />

        <Selector
          value={signalTypeFilter}
          onChange={setSignalTypeFilter}
          options={[
            ['', 'Any signal'],
            ...allSignalTypes.map((t) => [t, t] as [string, string]),
          ]}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <ToggleChip
          on={hasPriorCustomerOnly}
          onChange={setHasPriorCustomerOnly}
          icon={<Users className="w-3 h-3" />}
          label="Cursor alumni only"
        />
        <ToggleChip
          on={powerUserOnly}
          onChange={setPowerUserOnly}
          icon={<Zap className="w-3 h-3" />}
          label="Power users only"
        />
        <ToggleChip
          on={hasWorkEmailOnly}
          onChange={setHasWorkEmailOnly}
          icon={<Mail className="w-3 h-3" />}
          label="Has work email"
        />
        {(activeCard != null ||
          dateRange !== '7d' ||
          accountFilter !== '' ||
          seniorityFilter !== '' ||
          priorityFilter !== '' ||
          statusFilter !== '' ||
          signalTypeFilter !== '' ||
          search !== '' ||
          hasPriorCustomerOnly ||
          powerUserOnly ||
          hasWorkEmailOnly) && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] text-text-secondary border border-dark-border hover:bg-dark-surface-hover transition-colors"
          >
            <Filter className="w-3 h-3" />
            Clear filters
          </button>
        )}
        <span className="ml-auto text-[11px] text-text-tertiary font-mono">
          {filtered.length} of {contacts.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-dark-border p-10 text-center text-sm text-text-secondary">
          No contacts match the current filters.
          {latestRunId != null && contacts.length === 0 && (
            <span className="block mt-2 text-text-tertiary text-xs">
              The intent agent hasn&apos;t pushed any contacts yet.
            </span>
          )}
          {latestRunId == null && contacts.length === 0 && (
            <span className="block mt-2 text-text-tertiary text-xs inline-flex items-center gap-1">
              <MailX className="w-3 h-3" />
              No outreach runs ingested yet. Have ChatGTM POST to /api/outreach/runs first.
            </span>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <OutreachContactCard
              key={c.id}
              contact={c}
              apiToken={apiToken}
              onUpdated={mergeContact}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TopCard({
  tone,
  icon,
  label,
  value,
  active,
  onClick,
}: {
  tone: 'red' | 'blue' | 'amber';
  icon: React.ReactNode;
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  const toneClass =
    tone === 'red'
      ? 'text-accent-red'
      : tone === 'blue'
      ? 'text-accent-blue'
      : 'text-accent-amber';
  const activeBorder =
    tone === 'red'
      ? 'border-accent-red/60 bg-accent-red/10'
      : tone === 'blue'
      ? 'border-accent-blue/60 bg-accent-blue/10'
      : 'border-accent-amber/60 bg-accent-amber/10';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border p-3 text-left transition-colors ${
        active ? activeBorder : 'border-dark-border bg-dark-surface hover:border-dark-border-hover'
      }`}
    >
      <p className={`text-[10px] uppercase tracking-wider font-mono inline-flex items-center gap-1.5 ${toneClass}`}>
        {icon}
        {label}
      </p>
      <p className="text-2xl font-semibold text-text-primary tabular-nums mt-1">{value}</p>
    </button>
  );
}

function Selector({
  icon,
  value,
  onChange,
  options,
  placeholder,
}: {
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
  placeholder?: string;
}) {
  void placeholder;
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-2 rounded-md bg-dark-surface border border-dark-border focus-within:border-accent-blue transition-colors">
      {icon && <span className="text-text-tertiary">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm text-text-primary outline-none cursor-pointer pr-1"
      >
        {options.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleChip({
  on,
  onChange,
  icon,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <label
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium cursor-pointer transition-colors ${
        on
          ? 'bg-accent-blue/15 border-accent-blue/40 text-accent-blue'
          : 'border-dark-border text-text-secondary hover:bg-dark-surface-hover'
      }`}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {icon}
      {label}
    </label>
  );
}

function TokenPrompt({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, trimmed);
    } catch {
      // no-op
    }
    onSubmit(trimmed);
  };
  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-dark-border bg-dark-surface p-6 max-w-xl"
    >
      <p className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary mb-2 inline-flex items-center gap-1.5">
        <Lock className="w-3 h-3" />
        ChatGTM API token
      </p>
      <h2 className="text-lg font-semibold text-text-primary mb-2">
        Paste your CHATGTM_API_TOKEN.
      </h2>
      <p className="text-[12px] text-text-secondary mb-4 leading-relaxed">
        The same token used across /admin. Stored in localStorage on this device only.
      </p>
      <div className="flex items-stretch gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          spellCheck={false}
          className="flex-1 px-3 py-2 rounded-md bg-dark-bg border border-dark-border focus:border-accent-blue text-sm text-text-primary outline-none font-mono"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-accent-blue text-dark-bg disabled:opacity-50"
        >
          <KeyRound className="w-3.5 h-3.5" />
          Save
        </button>
      </div>
    </form>
  );
}
