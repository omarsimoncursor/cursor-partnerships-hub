import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Footer } from '@/components/layout/footer';
import { ProspectPackClient } from '@/components/demo-pack/prospect-pack-client';
import { decodeDemoPack } from '@/lib/demo-pack/encode';
import { prospectDisplayName } from '@/lib/demo-pack/display-name';

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const payload = decodeDemoPack(token);
  const name = payload
    ? prospectDisplayName(payload.domain, payload.displayName)
    : 'Prospect Demo Pack';
  return {
    title: `${name} — Cursor demo pack`,
    description: `Branded MCP and SDK workflows curated for ${name}.`,
  };
}

export default async function ProspectPackPage({ params }: Props) {
  const { token } = await params;
  const payload = decodeDemoPack(token);
  if (!payload) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <ProspectPackClient initialPayload={payload} />
      <Footer />
    </div>
  );
}
