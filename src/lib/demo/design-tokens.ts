/**
 * Canonical design tokens for the Marketing/Shop/ProductCard@2.3 component.
 * Source of truth — mirrored from the Figma variable collection
 * `design-system/tokens@v2.3`. Do NOT edit these to "fix" the demo;
 * the drift lives in `src/components/figma-demo/product-card-drifted.tsx`.
 *
 * Variable paths (Figma) are noted on each line to make the
 * "token-only substitution" fix obvious in the agent's diff.
 */
export const tokens = {
  color: {
    brandAccent: '#A259FF',                 // Figma: color/brand/accent
    surface: '#111116',                     // Figma: color/surface/base
    textPrimary: '#FFFFFF',                 // Figma: color/text/primary
    textSecondary: 'rgba(255,255,255,0.64)', // Figma: color/text/secondary
    priceBadge: '#14B892',                  // Figma: color/badge/success
    border: 'rgba(255,255,255,0.08)',       // Figma: color/border/subtle
  },
  radius: {
    card: 16,                               // Figma: radius/md
    button: 12,                             // Figma: radius/sm
  },
  space: {
    cardPadding: 24,                        // Figma: space/6
    gapMd: 12,                              // Figma: space/3
    gapLg: 16,                              // Figma: space/4
  },
  font: {
    titleSize: 18,                          // Figma: font/title/size
    titleWeight: 600,                       // Figma: font/title/weight
    priceSize: 24,                          // Figma: font/price/size
    priceWeight: 600,                       // Figma: font/price/weight
  },
} as const;

export type Tokens = typeof tokens;
