'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';
import { COMPANY_SEEDS } from '@/lib/prospect-store/company-seeds';
import { VENDORS } from '@/lib/prospect/vendors';

type Props = {
  apiToken: string;
  onClose: () => void;
  onCreated: () => void;
};

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
  filtered_technologies?: string[];
  build_status: string;
  company: { name: string; domain: string; accent: string | null };
};

const LEVEL_OPTIONS = ['Team Lead', 'Manager', 'Director', 'VP', 'SVP', 'Executive', 'C-Level'];

// Catalog-vendor quick-add list. Selecting these appends their canonical
// names to the technologies CSV input. The API normalizes anyway, so a
// rep can also free-type "AWS Lambda" / "Snowflake Cortex" / etc.
const QUICK_TECHS = [
  'AWS',
  'Datadog',
  'GitHub',
  'Snowflake',
  'Slack',
  'Jira',
  'Sentry',
  'Snyk',
  'Databricks',
  'MongoDB',
  'Okta',
  'Figma',
  'GitLab',
  'Zscaler',
];

export function CreateProspectModal({ apiToken, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [companyAccent, setCompanyAccent] = useState('');
  const [technologies, setTechnologies] = useState<string>('');
  const [mcpRelevant, setMcpRelevant] = useState(true);
  const [tagline, setTagline] = useState('');
  const [notionPageId, setNotionPageId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResponse | null>(null);
  const [copiedField, setCopiedField] = useState<'url' | 'password' | null>(null);

  // Auto-derive a sensible company_domain when the rep types the
  // company name and hasn't manually touched the domain field. Falls
  // back to "<slug>.com" for off-catalog companies.
  useEffect(() => {
    if (!companyName) return;
    if (companyDomain && companyDomain !== lastAutoDomain) return; // user touched it
    const seed = COMPANY_SEEDS.find(
      (c) => c.name.toLowerCase() === companyName.trim().toLowerCase(),
    );
    const derived = seed?.domain
      || `${companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`;
    setCompanyDomain(derived);
    setLastAutoDomain(derived);
    if (seed?.accent && !companyAccent) {
      setCompanyAccent(seed.accent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName]);

  const [lastAutoDomain, setLastAutoDomain] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addTech = (t: string) => {
    const list = technologies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    list.push(t);
    setTechnologies(list.join(', '));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const techList = technologies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch('/api/chatgtm/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          company: companyName.trim(),
          email: email.trim() || null,
          level: level.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          company_domain: companyDomain.trim().toLowerCase() || null,
          company_accent: companyAccent.trim() || null,
          technologies: techList,
          mcp_relevant: mcpRelevant,
          notion_page_id: notionPageId.trim() || null,
          metadata: tagline.trim() ? { tagline: tagline.trim() } : {},
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.detail || `Create failed (${res.status}).`);
        return;
      }
      const created: CreateResponse = await res.json();
      setResult(created);
      onCreated();
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

  const resetForAnother = () => {
    setResult(null);
    setName('');
    setEmail('');
    setLevel('');
    setLinkedinUrl('');
    // Keep company info so a rep can quickly add multiple prospects
    // from the same company without re-typing — the most common batch
    // creation pattern.
    setTechnologies('');
    setMcpRelevant(true);
    setTagline('');
    setNotionPageId('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-dark-border bg-dark-bg shadow-2xl">
        <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary inline-flex items-center gap-1.5">
              <UserPlus className="w-3 h-3" />
              New prospect
            </p>
            <h2 className="text-base font-semibold text-text-primary mt-0.5">
              {result ? `Demo ready for ${result.company.name}` : 'Generate a personalized demo'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-tertiary hover:text-text-primary"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {result ? (
          <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
            <div
              className="rounded-md border px-3 py-2.5 flex items-start gap-2 text-xs"
              style={{
                borderColor: '#4ade8055',
                background: '#4ade801a',
                color: '#4ade80',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                Personalized demo created for {name || 'this prospect'}. Paste the URL + password into the LinkedIn or
                email outreach.
              </div>
            </div>

            <CopyRow label="Demo URL" value={result.url} onCopy={() => copy('url', result.url)} copied={copiedField === 'url'} />
            <CopyRow
              label="Password"
              value={result.password}
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
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-accent-blue text-dark-bg transition-all"
              >
                Open the demo
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={resetForAnother}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs text-text-secondary border border-dark-border hover:border-dark-border-hover hover:bg-dark-surface transition-colors"
              >
                Create another for {result.company.name}
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs text-text-tertiary hover:text-text-primary"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
            <Section title="Prospect">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name" required>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@unisys.com"
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Level"
                  hint={
                    /director|vp|svp|executive|c[\s\-_]?level|chief/i.test(level)
                      ? 'Leadership level — ROI calculator will be shown.'
                      : level
                        ? 'IC / manager — ROI calculator hidden.'
                        : 'Free-form. Re-normalized server-side.'
                  }
                >
                  <input
                    list="create-level-options"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="VP of Engineering"
                    className={inputClass}
                  />
                  <datalist id="create-level-options">
                    {LEVEL_OPTIONS.map((l) => (
                      <option key={l} value={l} />
                    ))}
                  </datalist>
                </Field>
                <Field label="LinkedIn URL">
                  <input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/janesmith"
                    spellCheck={false}
                    className={inputClass + ' font-mono'}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Company">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Company" required>
                  <input
                    list="create-company-options"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Unisys"
                    required
                    className={inputClass}
                  />
                  <datalist id="create-company-options">
                    {COMPANY_SEEDS.map((c) => (
                      <option key={c.domain} value={c.name} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Domain" hint="Auto-filled from seed when known.">
                  <input
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                    placeholder="unisys.com"
                    spellCheck={false}
                    className={inputClass + ' font-mono'}
                  />
                </Field>
                <Field label="Accent (hex)" hint="Auto-filled from seed when known.">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={companyAccent || '#60a5fa'}
                      onChange={(e) => setCompanyAccent(e.target.value)}
                      className="w-10 h-10 rounded-md cursor-pointer border border-dark-border"
                      aria-label="Company accent color"
                    />
                    <input
                      value={companyAccent}
                      onChange={(e) => setCompanyAccent(e.target.value)}
                      placeholder="#FFB81C"
                      spellCheck={false}
                      className={inputClass + ' font-mono flex-1'}
                    />
                  </div>
                </Field>
                <Field label="Custom tagline (optional)" hint="Overrides the default hero copy.">
                  <input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="A walkthrough for Maria's Delivery team."
                    className={inputClass}
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="Tools used"
              hint="Drives which vendor automations render on the demo. Free-form, comma-separated. Items not in our catalog become SDK fallback cards."
            >
              <input
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="AWS, Datadog, GitHub, Snowflake, Terraform"
                className={inputClass + ' font-mono'}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_TECHS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addTech(t)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-dark-border text-[11px] text-text-tertiary hover:text-text-primary hover:border-dark-border-hover"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    {t}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Flags">
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mcpRelevant}
                    onChange={(e) => setMcpRelevant(e.target.checked)}
                  />
                  MCP relevant (tools in their stack have a Cursor MCP integration)
                </label>
              </div>
              <div className="mt-3">
                <Field label="Notion page ID (optional)">
                  <input
                    value={notionPageId}
                    onChange={(e) => setNotionPageId(e.target.value)}
                    placeholder="abc123def456"
                    spellCheck={false}
                    className={inputClass + ' font-mono'}
                  />
                </Field>
              </div>
            </Section>

            {error && (
              <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-xs text-accent-red">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-dark-border -mx-6 px-6 -mb-5 pb-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-sm text-text-secondary border border-dark-border hover:border-dark-border-hover hover:bg-dark-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim() || !companyName.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-accent-blue text-dark-bg disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {submitting ? 'Generating\u2026' : 'Generate personalized demo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors';

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-2">{title}</h3>
      {hint && <p className="text-[11px] text-text-tertiary mb-2 leading-snug">{hint}</p>}
      {children}
    </section>
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
      <span className="block text-xs text-text-secondary mb-1.5">
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
  onCopy,
  copied,
  mono,
}: {
  label: string;
  value: string;
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
          style={copied ? { color: '#4ade80', borderColor: '#4ade8055' } : undefined}
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
