export const DEMO_PACK_VERSION = 1 as const;

export type DemoPackPayloadV1 = {
  v: typeof DEMO_PACK_VERSION;
  /** e.g. cigna.com */
  domain: string;
  /** Optional display name override; otherwise derived from domain */
  displayName?: string;
  /** Optional hex brand color for accents (e.g. #0066B2) */
  primaryHex?: string;
  /** Selected vendor keys from the catalog */
  vendorIds: string[];
  /** Ordered SDK / agent tool steps for the interactive workflow preview */
  workflowToolIds: string[];
  /** ROI calculator inputs (sliders sync with these) */
  roi: {
    engineers: number;
    /** 0–100: share of queries routed to a frontier-class model */
    frontierQueryPct: number;
    /** Total tokens per engineer per month (all queries) */
    tokensPerEngineerPerMonth: number;
    /** USD per 1M input+output tokens, illustrative */
    opusUsdPerMillionTokens: number;
    composerUsdPerMillionTokens: number;
  };
};

export type DemoPackPayload = DemoPackPayloadV1;
