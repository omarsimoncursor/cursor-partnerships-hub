'use client';

import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ProspectPage } from '@/components/prospect/prospect-page';
import {
  decodeConfig,
  deriveAccountName,
  normalizeDomain,
  type ProspectConfig,
} from '@/lib/prospect/config';

export default function Page() {
  const params = useParams<{ domain: string }>();
  const search = useSearchParams();
  const c = search?.get('c');

  const config: ProspectConfig = useMemo(() => {
    const decoded = decodeConfig(c ?? null);
    const slugDomain = decodeURIComponent(Array.isArray(params.domain) ? params.domain[0] : (params.domain || ''));
    const domain = decoded.domain || normalizeDomain(slugDomain);
    return {
      ...decoded,
      domain,
      account: decoded.account || deriveAccountName(domain),
    };
  }, [c, params.domain]);

  return <ProspectPage config={config} />;
}
