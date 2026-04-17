export type Wave = 0 | 1 | 2 | 3 | 4;
export type Domain =
  | 'orders'
  | 'catalog'
  | 'billing'
  | 'identity'
  | 'fulfillment'
  | 'pricing'
  | 'search'
  | 'notifications'
  | 'analytics'
  | 'platform';

export interface BoundedContext {
  id: string;
  name: string;
  loc: number;
  externalCallers: number;
  owner: string;
  tier: 0 | 1 | 2 | 3;
  wave: Wave;
  domain: Domain;
  boundaryViolations?: number;
}

/**
 * 38 bounded contexts. OrdersService is wave 0 (completed in the journey).
 * Waves: 0 = done, 1 = next (4), 2 = then (9), 3 = long tail (14), 4 = stragglers (11).
 * Used by Act 2 (dependency map) and Act 7 (portfolio graph).
 */
export const BOUNDED_CONTEXTS: BoundedContext[] = [
  // Wave 0 — the demo context
  { id: 'orders',        name: 'OrdersService',       loc: 180_000, externalCallers: 4, owner: 'platform',     tier: 0, wave: 0, domain: 'orders',        boundaryViolations: 2 },

  // Wave 1 — 4 contexts (next, orange)
  { id: 'inventory',     name: 'InventoryService',    loc: 92_000,  externalCallers: 6, owner: 'fulfillment',  tier: 0, wave: 1, domain: 'fulfillment', boundaryViolations: 1 },
  { id: 'catalog',       name: 'CatalogService',      loc: 140_000, externalCallers: 8, owner: 'catalog',      tier: 0, wave: 1, domain: 'catalog' },
  { id: 'pricing',       name: 'PricingService',      loc: 76_000,  externalCallers: 5, owner: 'pricing',      tier: 0, wave: 1, domain: 'pricing',     boundaryViolations: 1 },
  { id: 'billing',       name: 'BillingService',      loc: 165_000, externalCallers: 3, owner: 'billing',      tier: 0, wave: 1, domain: 'billing',     boundaryViolations: 2 },

  // Wave 2 — 9 contexts (blue)
  { id: 'checkout',      name: 'CheckoutService',     loc: 110_000, externalCallers: 4, owner: 'orders',       tier: 1, wave: 2, domain: 'orders' },
  { id: 'cart',          name: 'CartService',         loc: 58_000,  externalCallers: 2, owner: 'orders',       tier: 1, wave: 2, domain: 'orders' },
  { id: 'payments',      name: 'PaymentsGateway',     loc: 88_000,  externalCallers: 3, owner: 'billing',      tier: 1, wave: 2, domain: 'billing',     boundaryViolations: 1 },
  { id: 'taxcalc',       name: 'TaxCalculator',       loc: 34_000,  externalCallers: 5, owner: 'billing',      tier: 1, wave: 2, domain: 'billing' },
  { id: 'warehouse',     name: 'WarehouseService',    loc: 95_000,  externalCallers: 2, owner: 'fulfillment',  tier: 1, wave: 2, domain: 'fulfillment' },
  { id: 'shipping',      name: 'ShippingService',     loc: 72_000,  externalCallers: 3, owner: 'fulfillment',  tier: 1, wave: 2, domain: 'fulfillment' },
  { id: 'promotions',    name: 'PromotionsService',   loc: 44_000,  externalCallers: 2, owner: 'pricing',      tier: 1, wave: 2, domain: 'pricing' },
  { id: 'customer',      name: 'CustomerService',     loc: 130_000, externalCallers: 9, owner: 'identity',     tier: 1, wave: 2, domain: 'identity' },
  { id: 'address',       name: 'AddressService',      loc: 22_000,  externalCallers: 7, owner: 'identity',     tier: 1, wave: 2, domain: 'identity' },

  // Wave 3 — 14 contexts (purple, long tail)
  { id: 'reviews',       name: 'ReviewsService',      loc: 66_000,  externalCallers: 1, owner: 'catalog',      tier: 2, wave: 3, domain: 'catalog' },
  { id: 'recommend',     name: 'RecommendationsSvc',  loc: 120_000, externalCallers: 2, owner: 'analytics',    tier: 2, wave: 3, domain: 'analytics' },
  { id: 'search',        name: 'SearchIndex',         loc: 98_000,  externalCallers: 3, owner: 'search',       tier: 2, wave: 3, domain: 'search' },
  { id: 'merch',         name: 'MerchandisingSvc',    loc: 50_000,  externalCallers: 2, owner: 'catalog',      tier: 2, wave: 3, domain: 'catalog' },
  { id: 'wishlist',      name: 'WishlistService',     loc: 28_000,  externalCallers: 1, owner: 'orders',       tier: 3, wave: 3, domain: 'orders' },
  { id: 'returns',       name: 'ReturnsService',      loc: 68_000,  externalCallers: 2, owner: 'orders',       tier: 2, wave: 3, domain: 'orders' },
  { id: 'loyalty',       name: 'LoyaltyService',      loc: 54_000,  externalCallers: 1, owner: 'pricing',      tier: 2, wave: 3, domain: 'pricing' },
  { id: 'giftcards',     name: 'GiftCardService',     loc: 40_000,  externalCallers: 1, owner: 'billing',      tier: 2, wave: 3, domain: 'billing' },
  { id: 'subscriptions', name: 'SubscriptionsSvc',    loc: 82_000,  externalCallers: 2, owner: 'billing',      tier: 2, wave: 3, domain: 'billing' },
  { id: 'notifications', name: 'NotificationsSvc',    loc: 46_000,  externalCallers: 4, owner: 'notifications',tier: 2, wave: 3, domain: 'notifications' },
  { id: 'email',         name: 'EmailDispatcher',     loc: 30_000,  externalCallers: 6, owner: 'notifications',tier: 2, wave: 3, domain: 'notifications' },
  { id: 'sms',           name: 'SmsDispatcher',       loc: 18_000,  externalCallers: 4, owner: 'notifications',tier: 3, wave: 3, domain: 'notifications' },
  { id: 'webhooks',      name: 'WebhookDispatcher',   loc: 36_000,  externalCallers: 2, owner: 'platform',     tier: 2, wave: 3, domain: 'platform' },
  { id: 'session',       name: 'SessionService',      loc: 52_000,  externalCallers: 8, owner: 'identity',     tier: 1, wave: 3, domain: 'identity',    boundaryViolations: 1 },

  // Wave 4 — 11 contexts (gray, stragglers)
  { id: 'auth',          name: 'LegacyAuthGateway',   loc: 78_000,  externalCallers: 11, owner: 'identity',    tier: 1, wave: 4, domain: 'identity' },
  { id: 'audit',         name: 'AuditLogService',     loc: 62_000,  externalCallers: 3, owner: 'platform',     tier: 2, wave: 4, domain: 'platform' },
  { id: 'reporting',     name: 'ReportingBatch',      loc: 104_000, externalCallers: 1, owner: 'analytics',    tier: 3, wave: 4, domain: 'analytics' },
  { id: 'etl',           name: 'NightlyEtlJobs',      loc: 150_000, externalCallers: 0, owner: 'analytics',    tier: 3, wave: 4, domain: 'analytics' },
  { id: 'fraud',         name: 'FraudDetection',      loc: 88_000,  externalCallers: 2, owner: 'billing',      tier: 1, wave: 4, domain: 'billing' },
  { id: 'compliance',    name: 'ComplianceScanner',   loc: 42_000,  externalCallers: 1, owner: 'platform',     tier: 2, wave: 4, domain: 'platform' },
  { id: 'inventorysync', name: 'InventorySyncJobs',   loc: 56_000,  externalCallers: 0, owner: 'fulfillment',  tier: 3, wave: 4, domain: 'fulfillment' },
  { id: 'catalogsync',   name: 'CatalogSyncJobs',     loc: 48_000,  externalCallers: 0, owner: 'catalog',      tier: 3, wave: 4, domain: 'catalog' },
  { id: 'partners',      name: 'PartnersApi',         loc: 74_000,  externalCallers: 2, owner: 'platform',     tier: 2, wave: 4, domain: 'platform' },
  { id: 'bulkops',       name: 'BulkOrderImporter',   loc: 26_000,  externalCallers: 0, owner: 'orders',       tier: 3, wave: 4, domain: 'orders' },
  { id: 'archive',       name: 'OrderArchiver',       loc: 20_000,  externalCallers: 0, owner: 'orders',       tier: 3, wave: 4, domain: 'orders' },
];

export const DOMAIN_COLORS: Record<Domain, string> = {
  orders:        '#FF9900',
  catalog:       '#60A5FA',
  billing:       '#F59E0B',
  identity:      '#A78BFA',
  fulfillment:   '#34D399',
  pricing:       '#F472B6',
  search:        '#22D3EE',
  notifications: '#FBBF24',
  analytics:     '#818CF8',
  platform:      '#94A3B8',
};

export const WAVE_COLORS: Record<Wave, string> = {
  0: '#16A34A', // done
  1: '#FF9900',
  2: '#2563EB',
  3: '#8B5CF6',
  4: '#6B7280',
};

// Five cross-context boundary-violation edges for Act 2 map
export const BOUNDARY_VIOLATIONS: Array<[string, string]> = [
  ['orders', 'billing'],
  ['orders', 'inventory'],
  ['billing', 'payments'],
  ['session', 'auth'],
  ['pricing', 'promotions'],
];
