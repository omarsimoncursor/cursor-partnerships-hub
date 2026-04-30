import { DEMO_PACK_VERSION, type DemoPackPayload, type DemoPackPayloadV1 } from './types';

function utf8ToBase64Url(json: string): string {
  if (typeof window !== 'undefined') {
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    bytes.forEach(b => {
      bin += String.fromCharCode(b);
    });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return Buffer.from(json, 'utf8').toString('base64url');
}

function base64UrlToUtf8(token: string): string {
  let b64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  if (typeof window !== 'undefined') {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(b64, 'base64').toString('utf8');
}

export function encodeDemoPack(payload: DemoPackPayload): string {
  return utf8ToBase64Url(JSON.stringify(payload));
}

export function decodeDemoPack(token: string): DemoPackPayload | null {
  try {
    const raw = base64UrlToUtf8(token);
    const data = JSON.parse(raw) as DemoPackPayloadV1;
    if (data.v !== DEMO_PACK_VERSION) return null;
    if (typeof data.domain !== 'string' || !data.domain.trim()) return null;
    if (!Array.isArray(data.vendorIds)) return null;
    if (!Array.isArray(data.workflowToolIds)) return null;
    if (!data.roi || typeof data.roi !== 'object') return null;
    return normalizePayload(data);
  } catch {
    return null;
  }
}

export function defaultDemoPackPayload(partial?: Partial<DemoPackPayloadV1>): DemoPackPayloadV1 {
  return normalizePayload({
    v: DEMO_PACK_VERSION,
    domain: partial?.domain ?? 'example.com',
    displayName: partial?.displayName,
    primaryHex: partial?.primaryHex,
    vendorIds: partial?.vendorIds ?? ['datadog', 'figma', 'sentry'],
    workflowToolIds: partial?.workflowToolIds ?? ['read_file', 'mcp_datadog', 'edit_file', 'run_terminal_cmd'],
    roi: {
      engineers: partial?.roi?.engineers ?? 120,
      frontierQueryPct: partial?.roi?.frontierQueryPct ?? 8,
      tokensPerEngineerPerMonth: partial?.roi?.tokensPerEngineerPerMonth ?? 4_000_000,
      opusUsdPerMillionTokens: partial?.roi?.opusUsdPerMillionTokens ?? 15,
      composerUsdPerMillionTokens: partial?.roi?.composerUsdPerMillionTokens ?? 2,
    },
  });
}

function normalizePayload(p: DemoPackPayloadV1): DemoPackPayloadV1 {
  return {
    v: DEMO_PACK_VERSION,
    domain: p.domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0] ?? 'example.com',
    displayName: p.displayName?.trim() || undefined,
    primaryHex: sanitizeHex(p.primaryHex),
    vendorIds: [...new Set(p.vendorIds.filter(Boolean))],
    workflowToolIds: [...new Set(p.workflowToolIds.filter(Boolean))],
    roi: {
      engineers: clamp(Math.round(p.roi.engineers), 1, 50_000),
      frontierQueryPct: clamp(p.roi.frontierQueryPct, 0.5, 100),
      tokensPerEngineerPerMonth: clamp(Math.round(p.roi.tokensPerEngineerPerMonth), 10_000, 500_000_000),
      opusUsdPerMillionTokens: clamp(p.roi.opusUsdPerMillionTokens, 0.01, 500),
      composerUsdPerMillionTokens: clamp(p.roi.composerUsdPerMillionTokens, 0.01, 500),
    },
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function sanitizeHex(hex: string | undefined): string | undefined {
  if (!hex || typeof hex !== 'string') return undefined;
  const h = hex.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(h)) return h;
  if (/^[0-9A-Fa-f]{6}$/.test(h)) return `#${h}`;
  return undefined;
}
