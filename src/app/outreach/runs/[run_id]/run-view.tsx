'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, KeyRound, Lock, MailX } from 'lucide-react';
import type { OutreachContactRow } from '@/lib/outreach-store/types';
import type { OutreachContactResponse } from '@/lib/outreach-store/presentation';
import { OutreachContactCard } from '../../components/contact-card';

const TOKEN_STORAGE_KEY = 'cursor.prospect-builder.api-token';

export function RunView({
  contacts: initialContacts,
  accountsWithActivity,
  accountsWithNoSignals,
}: {
  contacts: OutreachContactResponse[];
  accountsWithActivity: string[];
  accountsWithNoSignals: string[];
}) {
  // Same token store as the admin tabs — Omar pastes
  // CHATGTM_API_TOKEN once and it's reused across /admin and
  // /outreach for every PATCH / promote call.
  const [apiToken, setApiToken] = useState<string>('');
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [contacts, setContacts] = useState<OutreachContactResponse[]>(initialContacts);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
      setApiToken(saved);
    } catch {
      // no-op (private mode)
    } finally {
      setTokenLoaded(true);
    }
  }, []);

  // Sync local state with prop in case the run is re-fetched (e.g.
  // navigation back). This is a controlled-component fallback —
  // mutations from card actions go through `mergeContact` below.
  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const mergeContact = (next: OutreachContactRow) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === next.id ? { ...c, ...next } : c)),
    );
  };

  // Group by account_display_name (subsidiaries roll up to parent).
  const grouped = useMemo(() => {
    const map = new Map<string, OutreachContactResponse[]>();
    for (const c of contacts) {
      const key = c.account_display_name;
      const list = map.get(key);
      if (list) list.push(c);
      else map.set(key, [c]);
    }
    return Array.from(map.entries()).sort((a, b) => {
      // Sort by hot-count, then total-count.
      const hotA = a[1].filter((c) => c.priority_tier_value === 'hot').length;
      const hotB = b[1].filter((c) => c.priority_tier_value === 'hot').length;
      if (hotA !== hotB) return hotB - hotA;
      return b[1].length - a[1].length;
    });
  }, [contacts]);

  if (!tokenLoaded) {
    return <div className="text-sm text-text-tertiary">Loading…</div>;
  }
  if (!apiToken) {
    return <TokenPrompt onSubmit={setApiToken} />;
  }

  return (
    <div>
      {/* Quick-glance accounts strip: which had activity in the run, which didn't. */}
      {(accountsWithActivity.length > 0 || accountsWithNoSignals.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-dark-border bg-dark-surface p-3">
            <p className="text-[10px] uppercase tracking-wider font-mono text-accent-blue mb-1">
              Accounts with activity ({accountsWithActivity.length})
            </p>
            {accountsWithActivity.length === 0 ? (
              <p className="text-[11px] text-text-tertiary italic">none</p>
            ) : (
              <p className="text-[12px] text-text-primary">
                {accountsWithActivity.join(', ')}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-dark-border bg-dark-surface p-3">
            <p className="text-[10px] uppercase tracking-wider font-mono text-text-tertiary mb-1 inline-flex items-center gap-1">
              <MailX className="w-3 h-3" />
              No signals this run ({accountsWithNoSignals.length})
            </p>
            {accountsWithNoSignals.length === 0 ? (
              <p className="text-[11px] text-text-tertiary italic">none</p>
            ) : (
              <p className="text-[12px] text-text-secondary">
                {accountsWithNoSignals.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed border-dark-border p-10 text-center text-sm text-text-secondary">
          No contacts in this run.
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([displayName, list]) => (
            <AccountGroup
              key={displayName}
              displayName={displayName}
              contacts={list}
              apiToken={apiToken}
              onUpdated={mergeContact}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AccountGroup({
  displayName,
  contacts,
  apiToken,
  onUpdated,
}: {
  displayName: string;
  contacts: OutreachContactResponse[];
  apiToken: string;
  onUpdated: (next: OutreachContactRow) => void;
}) {
  const [open, setOpen] = useState(true);
  const hot = contacts.filter((c) => c.priority_tier_value === 'hot').length;
  const subs = Array.from(
    new Set(
      contacts
        .filter((c) => c.is_subsidiary && c.account_name !== displayName)
        .map((c) => c.account_name),
    ),
  );
  return (
    <section className="rounded-xl border border-dark-border bg-dark-bg/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-dark-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? (
            <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
          )}
          <h2 className="text-base font-semibold text-text-primary truncate">{displayName}</h2>
          <span className="text-[11px] text-text-tertiary font-mono">
            {contacts.length} contact{contacts.length === 1 ? '' : 's'}
            {hot > 0 && (
              <span className="text-accent-red"> · {hot} hot</span>
            )}
          </span>
          {subs.length > 0 && (
            <span className="text-[10px] text-text-tertiary truncate">
              ({subs.length} subsidiar{subs.length === 1 ? 'y' : 'ies'}: {subs.slice(0, 3).join(', ')}
              {subs.length > 3 ? ', …' : ''})
            </span>
          )}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {contacts.map((c) => (
            <OutreachContactCard
              key={c.id}
              contact={c}
              apiToken={apiToken}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}
    </section>
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
        The same token used across /admin. Stored in localStorage on this device only;
        every PATCH / promote call from this dashboard sends it as a Bearer header.
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
