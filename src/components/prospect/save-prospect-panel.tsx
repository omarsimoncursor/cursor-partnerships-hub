'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
  Save,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';

const TOKEN_STORAGE_KEY = 'cursor.prospect-builder.api-token';

type CreateResponse = {
  ok: true;
  id: string;
  slug: string;
  url: string;
  password: string;
  level: string;
  show_roi_calculator: boolean;
  vendor_ids: string[];
  unmatched_technologies: string[];
};

type Props = {
  account: string;
  domain: string;
  accent: string;
  technologies: string[];
};

export function SaveProspectPanel({ account, domain, accent, technologies }: Props) {
  const [open, setOpen] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('VP');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResponse | null>(null);
  const [copiedField, setCopiedField] = useState<'url' | 'password' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY) || '';
    setApiToken(stored);
    setTokenLoaded(true);
  }, []);

  useEffect(() => {
    if (!tokenLoaded || typeof window === 'undefined') return;
    if (apiToken) window.localStorage.setItem(TOKEN_STORAGE_KEY, apiToken);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, [apiToken, tokenLoaded]);

  const showRoiPreview = useMemo(() => /director|vp|svp|executive|c[\s\-_]?level|chief/i.test(level), [level]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !apiToken.trim()) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/chatgtm/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken.trim()}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          company: account,
          email: email.trim() || null,
          level,
          linkedin_url: linkedinUrl.trim() || null,
          company_domain: domain,
          company_accent: accent,
          technologies,
          mcp_relevant: true,
          metadata: { source: 'prospect-builder-ui' },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError('That API token was rejected. Check CHATGTM_API_TOKEN.');
        } else if (res.status === 503) {
          setError(body?.detail || 'Database is not configured on this deployment.');
        } else {
          setError(body?.detail || `Create failed (${res.status}).`);
        }
        return;
      }
      const created: CreateResponse = await res.json();
      setResult(created);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async (kind: 'url' | 'password', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(kind);
      setTimeout(() => setCopiedField(null), 1600);
    } catch {
      // ignore clipboard restrictions
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border transition-colors hover:bg-dark-surface"
        style={{ borderColor: `${accent}55`, color: accent }}
      >
        <UserPlus className="w-4 h-4" />
        Save to database and create a personalized demo
      </button>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider font-mono text-text-tertiary mb-1">
            Save personalized demo
          </p>
          <p className="text-sm text-text-secondary">
            Stores the prospect in Postgres and generates a password-gated demo URL you can paste into the LinkedIn /
            Gmail draft.
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 text-text-tertiary hover:text-text-primary"
          aria-label="Close save panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!result && (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Prospect name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="jane@unisys.com"
                className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors"
              />
            </Field>
            <Field label="Level" hint={showRoiPreview ? 'Leadership level — ROI calculator will be shown.' : 'IC / manager — ROI calculator hidden.'}>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary outline-none transition-colors"
              >
                <option value="Team Lead">Team Lead</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
                <option value="VP">VP</option>
                <option value="SVP">SVP</option>
                <option value="Executive">Executive</option>
                <option value="C-Level">C-Level</option>
              </select>
            </Field>
          </div>
          <Field label="LinkedIn URL">
            <input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/janesmith"
              spellCheck={false}
              className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors font-mono"
            />
          </Field>
          <Field
            label="API token"
            hint="Use the value of CHATGTM_API_TOKEN. Cached in localStorage for this browser only."
            required
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus-within:border-accent-blue transition-colors">
              <KeyRound className="w-4 h-4 text-text-tertiary" />
              <input
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="cgtm_..."
                spellCheck={false}
                required
                type="password"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none font-mono"
              />
            </div>
          </Field>

          {error && (
            <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-xs text-accent-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !name.trim() || !apiToken.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold disabled:opacity-50 transition-all"
            style={{ background: accent, color: '#0a0a0a' }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {submitting ? 'Creating\u2026' : 'Create personalized demo'}
          </button>
        </form>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-md border px-3 py-2.5 flex items-start gap-2 text-xs" style={{ borderColor: '#4ade8055', background: '#4ade801a', color: '#4ade80' }}>
            <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <div>
              Personalized demo created for {name || 'prospect'}. Paste the URL + password into the Gmail and LinkedIn
              drafts.
            </div>
          </div>

          <CopyRow label="Demo URL" value={result.url} accent={accent} onCopy={() => copy('url', result.url)} copied={copiedField === 'url'} />
          <CopyRow
            label="Password"
            value={result.password}
            accent={accent}
            onCopy={() => copy('password', result.password)}
            copied={copiedField === 'password'}
            mono
          />

          <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-text-tertiary">
            <KeyValue label="Level" value={result.level} />
            <KeyValue label="ROI calculator" value={result.show_roi_calculator ? 'Shown' : 'Hidden'} />
            <KeyValue label="Vendors matched" value={String(result.vendor_ids.length)} />
            <KeyValue label="Unmatched (SDK fallback)" value={String(result.unmatched_technologies.length)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={result.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all"
              style={{ background: accent, color: '#0a0a0a' }}
            >
              Open the demo
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => {
                setResult(null);
                setName('');
                setEmail('');
                setLinkedinUrl('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs text-text-secondary border border-dark-border hover:border-dark-border-hover hover:bg-dark-surface transition-colors"
            >
              Create another
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-secondary mb-1.5">
        {label}
        {required && <span className="ml-1 text-accent-red">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-text-tertiary mt-1">{hint}</span>}
    </label>
  );
}

function CopyRow({
  label,
  value,
  accent,
  onCopy,
  copied,
  mono,
}: {
  label: string;
  value: string;
  accent: string;
  onCopy: () => void;
  copied: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary mb-1.5">{label}</p>
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-dark-surface border border-dark-border">
        <span className={`flex-1 text-sm text-text-primary truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-text-tertiary hover:text-text-primary border border-dark-border hover:border-dark-border-hover transition-colors"
          style={copied ? { color: accent, borderColor: `${accent}55` } : undefined}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-dark-border bg-dark-surface px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-wider font-mono text-text-tertiary">{label}</p>
      <p className="text-xs text-text-primary tabular-nums">{value}</p>
    </div>
  );
}
