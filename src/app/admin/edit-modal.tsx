'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { VENDORS } from '@/lib/prospect/vendors';

export type EditableProspect = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  level_raw: string | null;
  level_normalized: string;
  linkedin_url: string | null;
  company_name: string;
  company_domain: string;
  company_accent: string | null;
  vendor_ids: string[];
  unmatched_technologies: string[];
  show_roi_calculator: boolean;
  metadata?: Record<string, unknown>;
};

type Props = {
  prospect: EditableProspect;
  apiToken: string;
  onClose: () => void;
  onSaved: () => void;
};

const LEVEL_OPTIONS = ['Team Lead', 'Manager', 'Director', 'VP', 'SVP', 'Executive', 'C-Level'];

export function EditProspectModal({ prospect, apiToken, onClose, onSaved }: Props) {
  const [name, setName] = useState(prospect.name);
  const [email, setEmail] = useState(prospect.email || '');
  const [levelRaw, setLevelRaw] = useState(prospect.level_raw || '');
  const [linkedinUrl, setLinkedinUrl] = useState(prospect.linkedin_url || '');
  const [companyName, setCompanyName] = useState(prospect.company_name);
  const [companyDomain, setCompanyDomain] = useState(prospect.company_domain);
  const [companyAccent, setCompanyAccent] = useState(prospect.company_accent || '#60a5fa');
  const [vendorIds, setVendorIds] = useState<string[]>(prospect.vendor_ids || []);
  const [unmatched, setUnmatched] = useState<string>((prospect.unmatched_technologies || []).join(', '));
  const [showRoi, setShowRoi] = useState(prospect.show_roi_calculator);
  const [tagline, setTagline] = useState(
    typeof prospect.metadata?.tagline === 'string' ? (prospect.metadata.tagline as string) : '',
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/chatgtm/prospects/${prospect.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          level: levelRaw.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          company_name: companyName.trim(),
          company_domain: companyDomain.trim().toLowerCase(),
          company_accent: companyAccent.trim() || null,
          vendor_ids: vendorIds,
          unmatched_technologies: unmatched
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          show_roi_calculator: showRoi,
          tagline: tagline.trim(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.detail || `Save failed (${res.status})`);
        return;
      }
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVendor = (id: string) => {
    setVendorIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const moveVendor = (id: string, dir: -1 | 1) => {
    setVendorIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const swap = idx + dir;
      if (swap < 0 || swap >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl rounded-2xl border border-dark-border bg-dark-bg shadow-2xl"
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary">
              Edit prospect
            </p>
            <h2 className="text-base font-semibold text-text-primary">
              {prospect.name} <span className="text-text-tertiary">— {prospect.company_name}</span>
            </h2>
            <p className="text-[11px] text-text-tertiary font-mono mt-0.5">/p/{prospect.slug}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-tertiary hover:text-text-primary"
            aria-label="Close edit modal"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <Section title="Identity">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
              </Field>
              <Field label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Level" hint="Free-form. Re-normalized server-side.">
                <input
                  list="level-options"
                  value={levelRaw}
                  onChange={(e) => setLevelRaw(e.target.value)}
                  placeholder="Director of Delivery"
                  className={inputClass}
                />
                <datalist id="level-options">
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </Field>
              <Field label="LinkedIn URL">
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  spellCheck={false}
                  className={inputClass + ' font-mono'}
                />
              </Field>
            </div>
          </Section>

          <Section title="Company">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company name">
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={inputClass} />
              </Field>
              <Field label="Domain">
                <input
                  value={companyDomain}
                  onChange={(e) => setCompanyDomain(e.target.value)}
                  spellCheck={false}
                  className={inputClass + ' font-mono'}
                />
              </Field>
              <Field label="Accent (hex)" hint="Drives the demo's brand color.">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={companyAccent}
                    onChange={(e) => setCompanyAccent(e.target.value)}
                    className="w-10 h-10 rounded-md cursor-pointer border border-dark-border"
                    aria-label="Company accent color"
                  />
                  <input
                    value={companyAccent}
                    onChange={(e) => setCompanyAccent(e.target.value)}
                    spellCheck={false}
                    className={inputClass + ' font-mono flex-1'}
                  />
                </div>
              </Field>
              <Field label="Custom tagline (optional)" hint="Replaces the default hero tagline on the demo.">
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
              </Field>
            </div>
          </Section>

          <Section
            title="Components"
            hint={`Which vendor demo cards render on /p/${prospect.slug}, in display order. Use the arrows to reorder.`}
          >
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 border border-dark-border rounded-md p-2 bg-dark-surface">
              {VENDORS.map((v) => {
                const idx = vendorIds.indexOf(v.id);
                const selected = idx !== -1;
                return (
                  <div
                    key={v.id}
                    className="flex items-center rounded-md border transition-colors"
                    style={{
                      borderColor: selected ? `${v.brand}55` : 'rgba(237,236,236,0.08)',
                      background: selected ? `${v.brand}10` : 'transparent',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleVendor(v.id)}
                      className="flex-1 flex items-center gap-2.5 px-3 py-2 text-left"
                    >
                      <span
                        className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: `${v.brand}25`, color: v.brand }}
                      >
                        {v.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary truncate">{v.name}</p>
                        <p className="text-[11px] text-text-tertiary truncate">{v.category}</p>
                      </div>
                      {selected && (
                        <span className="ml-auto text-[10px] font-mono text-text-tertiary tabular-nums">
                          #{idx + 1}
                        </span>
                      )}
                    </button>
                    {selected && (
                      <div className="flex border-l border-dark-border">
                        <button
                          type="button"
                          onClick={() => moveVendor(v.id, -1)}
                          disabled={idx === 0}
                          className="px-2 text-[10px] text-text-tertiary hover:text-text-primary disabled:opacity-20"
                          aria-label={`Move ${v.name} up`}
                        >
                          {'\u25B2'}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveVendor(v.id, 1)}
                          disabled={idx === vendorIds.length - 1}
                          className="px-2 text-[10px] text-text-tertiary hover:text-text-primary disabled:opacity-20 border-l border-dark-border"
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
          </Section>

          <Section title="SDK fallback cards" hint="Comma-separated. Each renders as an SDK automation card under the vendors.">
            <input value={unmatched} onChange={(e) => setUnmatched(e.target.value)} className={inputClass + ' font-mono'} />
          </Section>

          <Section title="ROI calculator">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input type="checkbox" checked={showRoi} onChange={(e) => setShowRoi(e.target.checked)} />
              Show the Token ROI section on this prospect&apos;s demo
              <span className="text-[11px] text-text-tertiary">
                (defaults to on for Director / VP / Executive / C-Level)
              </span>
            </label>
          </Section>

          {error && (
            <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-xs text-accent-red">
              {error}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 px-6 py-4 border-t border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm text-text-secondary border border-dark-border hover:border-dark-border-hover hover:bg-dark-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-accent-blue text-dark-bg disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving\u2026' : 'Save changes'}
          </button>
        </footer>
      </form>
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
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-text-secondary mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-text-tertiary mt-1">{hint}</span>}
    </label>
  );
}
