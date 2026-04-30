'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Copy, Eye, Globe2, Sparkles } from 'lucide-react';
import { VENDORS, type Vendor } from '@/lib/prospect/vendors';
import {
  buildShareUrl,
  deriveAccountName,
  encodeConfig,
  normalizeDomain,
  type ProspectConfig,
} from '@/lib/prospect/config';
import { AccountLogo } from '@/components/prospect/account-logo';

const ACCENT_PRESETS = [
  { name: 'Cigna Blue', value: '#0072CE' },
  { name: 'Vanguard Crimson', value: '#9B262F' },
  { name: 'Pfizer Blue', value: '#0093D0' },
  { name: 'Visa Indigo', value: '#1A1F71' },
  { name: 'Salesforce Cloud', value: '#00A1E0' },
  { name: 'Snowflake Cyan', value: '#29B5E8' },
  { name: 'Stripe Indigo', value: '#635BFF' },
  { name: 'Cursor Amber', value: '#fbbf24' },
];

export default function ProspectBuilderPage() {
  const [domain, setDomain] = useState('cigna.com');
  const [account, setAccount] = useState('Cigna');
  const [accent, setAccent] = useState('#0072CE');
  const [tagline, setTagline] = useState('');
  const [rep, setRep] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([
    'figma',
    'datadog',
    'snyk',
    'snowflake',
    'aws',
    'github',
  ]);
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Auto-derive account name from the domain when the account input
  // hasn't been touched (or matches the previous derivation).
  const lastDerivedRef = useRef(deriveAccountName(domain));
  useEffect(() => {
    const derived = deriveAccountName(domain);
    setAccount(prev => (prev === lastDerivedRef.current || !prev ? derived : prev));
    lastDerivedRef.current = derived;
  }, [domain]);

  const config: ProspectConfig = useMemo(
    () => ({
      account: account || deriveAccountName(domain),
      domain,
      accent,
      vendors: selectedVendors,
      tagline,
      rep,
    }),
    [account, domain, accent, selectedVendors, tagline, rep]
  );

  const slug = useMemo(() => encodeURIComponent(normalizeDomain(domain) || 'demo'), [domain]);
  const encoded = useMemo(() => encodeConfig(config), [config]);
  const previewHref = `/prospect/${slug}?c=${encoded}`;
  const shareUrl = origin ? buildShareUrl(config, origin) : previewHref;

  const toggleVendor = (id: string) => {
    setSelectedVendors(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const moveVendor = (id: string, dir: -1 | 1) => {
    setSelectedVendors(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // no-op; some browsers block clipboard without focus
    }
  };

  const grouped: Record<string, Vendor[]> = {};
  for (const v of VENDORS) {
    if (!grouped[v.category]) grouped[v.category] = [];
    grouped[v.category].push(v);
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Branded Account Demo Builder</span>
        </div>
      </nav>

      <main className="pt-24 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/30 text-[11px] font-mono uppercase tracking-wider text-accent-amber mb-4">
              <Sparkles className="w-3 h-3" />
              Internal tool, share only with prospects
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Build a branded co-sell demo for any prospect.
            </h1>
            <p className="text-base text-text-secondary">
              Enter the account&apos;s domain and pick the tools they already use.
              The generated link renders an interactive demo branded for that
              account, with one playable workflow per integration, an SDK
              workflow composer, and an ROI calculator scoped to their team
              size.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8">
            {/* Form */}
            <div className="space-y-8">
              <section className="glass-card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary mb-4">
                  1. Account
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Domain" hint="What we use for the URL slug + auto-pulled logo.">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus-within:border-accent-blue transition-colors">
                      <Globe2 className="w-4 h-4 text-text-tertiary" />
                      <input
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        placeholder="cigna.com"
                        spellCheck={false}
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                      />
                    </div>
                  </Field>
                  <Field label="Display name" hint="How the account is referred to in copy.">
                    <input
                      value={account}
                      onChange={e => setAccount(e.target.value)}
                      placeholder="Cigna"
                      className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors"
                    />
                  </Field>
                  <Field label="Tagline (optional)" hint="One-liner shown under the hero.">
                    <input
                      value={tagline}
                      onChange={e => setTagline(e.target.value)}
                      placeholder="A demo prepared for the Cigna platform engineering team."
                      className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors"
                    />
                  </Field>
                  <Field label="Sales rep (optional)" hint="Shown as the prepared-by attribution.">
                    <input
                      value={rep}
                      onChange={e => setRep(e.target.value)}
                      placeholder="Omar Simon"
                      className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors"
                    />
                  </Field>
                </div>
              </section>

              <section className="glass-card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary mb-4">
                  2. Brand accent
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg border border-dark-border"
                    style={{ background: accent }}
                  />
                  <input
                    type="color"
                    value={accent}
                    onChange={e => setAccent(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-dark-border"
                    aria-label="Brand accent color picker"
                  />
                  <input
                    value={accent}
                    onChange={e => setAccent(e.target.value)}
                    spellCheck={false}
                    className="flex-1 px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none font-mono transition-colors"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_PRESETS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setAccent(p.value)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-dark-surface border border-dark-border hover:border-dark-border-hover transition-colors text-xs text-text-secondary hover:text-text-primary"
                    >
                      <span className="w-3 h-3 rounded-full" style={{ background: p.value }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </section>

              <section className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
                    3. Their stack
                  </h2>
                  <span className="text-xs text-text-tertiary font-mono">
                    {selectedVendors.length} selected
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mb-4">
                  Pick every tool they already use that has a Cursor MCP
                  integration or is Cursor SDK automatable. Drag is replaced by
                  the up/down controls inside each card; the order here is the
                  order of demos on their page.
                </p>
                <div className="space-y-6">
                  {Object.entries(grouped).map(([category, vendors]) => (
                    <div key={category}>
                      <p className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary/60 mb-2">
                        {category}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {vendors.map(v => {
                          const order = selectedVendors.indexOf(v.id);
                          const selected = order !== -1;
                          return (
                            <div
                              key={v.id}
                              className="flex items-stretch rounded-lg border transition-colors"
                              style={{
                                borderColor: selected ? `${v.brand}55` : 'rgba(237,236,236,0.08)',
                                background: selected ? `${v.brand}10` : 'transparent',
                              }}
                            >
                              <button
                                onClick={() => toggleVendor(v.id)}
                                className="flex-1 flex items-center gap-3 px-3 py-2.5 text-left"
                              >
                                <div
                                  className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
                                  style={{ background: `${v.brand}25`, color: v.brand }}
                                >
                                  {v.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-text-primary truncate">{v.name}</p>
                                  <p className="text-[11px] text-text-tertiary truncate">{v.modeNote}</p>
                                </div>
                                {selected && (
                                  <Check className="w-4 h-4 ml-auto shrink-0" style={{ color: v.brand }} />
                                )}
                              </button>
                              {selected && (
                                <div className="flex flex-col border-l border-dark-border">
                                  <button
                                    onClick={() => moveVendor(v.id, -1)}
                                    disabled={order === 0}
                                    className="px-2 text-[10px] text-text-tertiary hover:text-text-primary disabled:opacity-20"
                                    aria-label={`Move ${v.name} up`}
                                  >
                                    {'\u25B2'}
                                  </button>
                                  <button
                                    onClick={() => moveVendor(v.id, 1)}
                                    disabled={order === selectedVendors.length - 1}
                                    className="px-2 text-[10px] text-text-tertiary hover:text-text-primary disabled:opacity-20 border-t border-dark-border"
                                    aria-label={`Move ${v.name} down`}
                                  >
                                    {'\u25BC'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Live preview + share */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: `${accent}55`, background: `${accent}0c` }}
              >
                <div className="p-6 border-b border-dark-border" style={{ background: `${accent}14` }}>
                  <p className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: accent }}>
                    Live preview
                  </p>
                  <div className="flex items-center gap-3">
                    <AccountLogo domain={domain} account={account || 'A'} accent={accent} size={48} />
                    <div>
                      <p className="text-base font-semibold text-text-primary">
                        Cursor for {account || 'this account'}
                      </p>
                      <p className="text-[11px] text-text-tertiary font-mono">{normalizeDomain(domain) || 'domain.tld'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <p className="text-xs text-text-tertiary uppercase tracking-wider font-mono">Demos that will render</p>
                  {selectedVendors.length === 0 && (
                    <p className="text-sm text-text-secondary">Select a vendor to render its branded demo.</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVendors.map(id => {
                      const v = VENDORS.find(vv => vv.id === id);
                      if (!v) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]"
                          style={{ background: `${v.brand}1f`, color: v.brand }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ background: v.brand }} />
                          {v.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <p className="text-xs uppercase tracking-wider font-mono text-text-tertiary mb-3">Share link</p>
                <div className="rounded-lg bg-dark-surface border border-dark-border p-3 mb-3">
                  <p className="text-[11px] font-mono text-text-secondary break-all leading-relaxed">
                    {shareUrl || 'Building link...'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-dark-surface hover:bg-dark-surface-hover border border-dark-border text-sm text-text-primary transition-colors flex-1"
                  >
                    {copied ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy share link'}
                  </button>
                  <Link
                    href={previewHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
                    style={{
                      background: accent,
                      color: '#101010',
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Open demo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="text-xs text-text-tertiary leading-relaxed">
                Links are stateless and shareable. The entire configuration is
                encoded into the URL, so you can pass the link in Slack or
                email and it will render the same demo for the prospect.
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-secondary mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-text-tertiary mt-1">{hint}</span>}
    </label>
  );
}
