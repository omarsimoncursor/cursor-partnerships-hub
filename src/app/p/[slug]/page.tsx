import { cookies, headers } from 'next/headers';
import { after } from 'next/server';
import { notFound } from 'next/navigation';
import { ProspectPage } from '@/components/prospect/prospect-page';
import {
  gateCookieName,
  getProspectBySlug,
  isDatabaseConfigured,
  isValidSlug,
  recordView,
  runBuild,
  verifyGateCookie,
} from '@/lib/prospect-store';
import { levelDisplayName } from '@/lib/prospect-store/levels';
import { resolvedAccent, type ProspectConfig } from '@/lib/prospect/config';
import { UnlockGate } from '@/components/prospect/unlock-gate';
import { BuildingState } from '@/components/prospect/building-state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<Record<string, string | string[]>> };

export default async function PersonalizedProspectPage({ params, searchParams }: Props) {
  if (!isDatabaseConfigured()) {
    return <DatabaseNotConfigured />;
  }

  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  const prospect = await getProspectBySlug(slug);
  if (!prospect) notFound();

  const search = (await searchParams) || {};
  const bypassBuild = search.bypass === '1';

  // Audit trail: log this view (locked or unlocked) so the rep can see
  // whether the prospect actually opened the page.
  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const ua = hdrs.get('user-agent');

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(gateCookieName(slug))?.value;
  const unlocked = verifyGateCookie(slug, cookieValue);

  // Fire-and-forget the view record via after() so the page render isn't
  // bottlenecked by an extra round trip on the hot path.
  after(async () => {
    await recordView(prospect.id, ip, ua, unlocked).catch((err) => {
      console.error('[p/[slug]] recordView failed:', err);
    });
  });

  if (!unlocked) {
    return (
      <UnlockGate
        slug={slug}
        prospectName={prospect.name}
        company={prospect.company_name}
        domain={prospect.company_domain}
        accent={prospect.company_accent || '#60a5fa'}
      />
    );
  }

  // Lazy-build path. ChatGTM gets the URL + password back synchronously,
  // and a background build is scheduled on the create call. If that
  // background build hasn't completed yet (or the function was killed
  // before it ran), we kick the builder here on the prospect's first
  // unlocked view and show the building UI in the meantime.
  if (!bypassBuild && prospect.build_status !== 'ready') {
    const proto = hdrs.get('x-forwarded-proto') || 'https';
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
    const origin = host ? `${proto}://${host}` : '';
    if (origin) {
      after(async () => {
        await runBuild(prospect.id, origin).catch((err) => {
          console.error('[p/[slug]] background build failed:', err);
        });
      });
    }
    return (
      <BuildingState
        slug={slug}
        prospectName={prospect.name}
        company={prospect.company_name}
        domain={prospect.company_domain}
        accent={prospect.company_accent || '#60a5fa'}
        initialStatus={
          prospect.build_status === 'building' || prospect.build_status === 'failed'
            ? prospect.build_status
            : 'queued'
        }
      />
    );
  }

  // The prospect-builder catalog drives the demo content. The vendor
  // ids stored on the prospect row come from technologies normalized
  // at create time; the URL-encoded ProspectConfig path is bypassed.
  const config: ProspectConfig = {
    account: prospect.company_name,
    domain: prospect.company_domain,
    accent: prospect.company_accent || undefined,
    vendors: prospect.vendor_ids,
    tagline:
      `An interactive Cursor demo prepared for ${prospect.name} at ${prospect.company_name}. Every workflow below targets ${prospect.company_name}'s actual stack.`,
    rep: '',
  };

  // Sanity-check accent fallback so resolvedAccent never returns ''.
  if (!config.accent) config.accent = resolvedAccent({ ...config });

  return (
    <ProspectPage
      config={config}
      prospectName={prospect.name}
      prospectLevelLabel={
        prospect.level_normalized === 'unknown' ? undefined : levelDisplayName(prospect.level_normalized)
      }
      showRoiCalculator={prospect.show_roi_calculator}
      unmatchedTechnologies={prospect.unmatched_technologies}
    />
  );
}

function DatabaseNotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-2xl border border-dark-border bg-dark-surface p-8">
        <p className="text-[11px] uppercase tracking-wider font-mono text-accent-amber mb-2">Setup pending</p>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Personalized demos are not configured yet.</h1>
        <p className="text-sm text-text-secondary">
          Set <code className="font-mono text-accent-amber">DATABASE_URL</code> in the deployment environment and run
          <code className="font-mono text-accent-amber"> POST /api/db/init</code> to create the schema and seed the
          companies. ChatGTM will then be able to create prospects.
        </p>
      </div>
    </div>
  );
}
