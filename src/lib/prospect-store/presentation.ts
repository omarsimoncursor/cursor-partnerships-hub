// Category-aware demo presentation profiles.
//
// ChatGTM tags every prospect with a `category` (one of: Engineering,
// Product, IT, Delivery, Studio Leadership, Design). We use that to
// re-skin the personalized demo so an Engineering Director sees the
// integration matrix front-and-center while a Studio Leadership VP
// gets the SDK composer + ROI thesis. Same data, different framing.
//
// The personalization is intentionally lightweight — same sections,
// same components, just different copy + ordering. Anything heavier
// (entirely separate page templates, separate routes) ends up
// duplicating the demo and falling out of sync over time.

export type Category =
  | 'engineering'
  | 'product'
  | 'it'
  | 'delivery'
  | 'studio_leadership'
  | 'design'
  | 'unknown';

const CATEGORY_ALIASES: Array<[RegExp, Category]> = [
  [/^engineering$/i, 'engineering'],
  [/^eng$/i, 'engineering'],
  [/^platform$/i, 'engineering'],
  [/^product$/i, 'product'],
  [/^pm$/i, 'product'],
  [/^it$/i, 'it'],
  [/^information technology$/i, 'it'],
  [/^security$/i, 'it'],
  [/^infosec$/i, 'it'],
  [/^delivery$/i, 'delivery'],
  [/^services$/i, 'delivery'],
  [/^pmo$/i, 'delivery'],
  [/^studio[\s_-]?leadership$/i, 'studio_leadership'],
  [/^leadership$/i, 'studio_leadership'],
  [/^executive$/i, 'studio_leadership'],
  [/^design$/i, 'design'],
  [/^ux$/i, 'design'],
  [/^ui$/i, 'design'],
];

export function normalizeCategory(input: string | null | undefined): Category {
  if (!input) return 'unknown';
  const trimmed = String(input).trim();
  if (!trimmed) return 'unknown';
  for (const [re, cat] of CATEGORY_ALIASES) {
    if (re.test(trimmed)) return cat;
  }
  return 'unknown';
}

export function categoryDisplayName(c: Category): string {
  switch (c) {
    case 'engineering': return 'Engineering';
    case 'product': return 'Product';
    case 'it': return 'IT';
    case 'delivery': return 'Delivery';
    case 'studio_leadership': return 'Studio Leadership';
    case 'design': return 'Design';
    case 'unknown': return 'Unknown';
  }
}

// What the demo page renders, scoped by category.
export type PresentationProfile = {
  category: Category;
  // Hero overrides — substitute {{ACCOUNT}} with the prospect's company name at render time.
  heroHeadlineTemplate?: string;
  heroTaglineTemplate?: string;
  // Section descriptions
  stackMatrixDescription?: string;
  vendorDemoDescription?: string;
  composerDescription?: string;
  // Vendor IDs to surface first in the integration matrix and demo cards.
  // Vendors not in this list still render, just after the priorities.
  vendorPriority: string[];
  // Default SDK composer preset to auto-load on first render.
  defaultComposerPreset?: string;
  // Whether to lead with the SDK composer instead of the per-vendor demos
  // (true for Studio Leadership / unknown leadership flows).
  leadWithComposer: boolean;
  // ROI section label override (defaults to "Token ROI").
  roiEyebrow?: string;
  // Final next-step CTA override.
  nextStepHeadlineTemplate?: string;
  nextStepBodyTemplate?: string;
};

const PROFILES: Record<Category, PresentationProfile> = {
  engineering: {
    category: 'engineering',
    heroHeadlineTemplate: "What Cursor unlocks across {{ACCOUNT}}'s engineering stack.",
    heroTaglineTemplate:
      "Every workflow below targets the tools {{ACCOUNT}}'s engineering team actually runs on. Each vendor demo plays the agent steps end-to-end so reviewers see the diff, not the storyboard.",
    stackMatrixDescription:
      "Cursor integrates with the dev-platform tools {{ACCOUNT}} engineering already runs on.",
    vendorDemoDescription:
      "Each demo plays the Cursor agent steps end-to-end against {{ACCOUNT}}'s actual stack.",
    composerDescription:
      "String the same dev-platform tools together into a runnable Cursor agent. The SDK ships scheduled, on-demand, or webhook-triggered.",
    vendorPriority: ['datadog', 'sentry', 'github', 'gitlab', 'snyk', 'snowflake', 'databricks', 'aws', 'mongodb', 'jira', 'slack'],
    defaultComposerPreset: 'Datadog SLO breach to merged PR',
    leadWithComposer: false,
    nextStepHeadlineTemplate: 'Pilot one workflow on a {{ACCOUNT}} repo this quarter.',
    nextStepBodyTemplate:
      'Cursor stands up the integration with the {{ACCOUNT}} engineering team, the agent runs against a sandbox, and the team sees end-to-end value before any commitment.',
  },
  product: {
    category: 'product',
    heroHeadlineTemplate: "From {{ACCOUNT}}'s product specs to shipped code, in one workflow.",
    heroTaglineTemplate:
      "Cursor wires Figma, Jira, and GitHub together so {{ACCOUNT}}'s product org sees acceptance criteria turn into a PR without a game of telephone.",
    stackMatrixDescription:
      "The product-delivery tools Cursor ties together for {{ACCOUNT}}.",
    vendorDemoDescription:
      "Each workflow ends in a PR cross-linked to the original Jira ticket and Figma frame, so PMs and designers stay in their tools.",
    composerDescription:
      "Compose the Figma -> Jira -> GitHub workflow as a runnable Cursor agent. {{ACCOUNT}}'s PMs file tickets, the agent ships the diff.",
    vendorPriority: ['figma', 'jira', 'github', 'slack', 'sentry', 'datadog', 'snowflake'],
    defaultComposerPreset: 'Figma design to PR',
    leadWithComposer: false,
    nextStepHeadlineTemplate: 'Run the Figma -> PR loop on one {{ACCOUNT}} feature this sprint.',
    nextStepBodyTemplate:
      "Pick one in-flight feature, hand the Figma frame + Jira ticket to Cursor, and review the resulting PR alongside {{ACCOUNT}}'s normal review process.",
  },
  it: {
    category: 'it',
    heroHeadlineTemplate: "Cursor automates {{ACCOUNT}}'s identity, security, and policy work.",
    heroTaglineTemplate:
      "Joiners / movers / leavers, drift correction, CVE patching — all turn into reviewable PRs instead of console clicks for {{ACCOUNT}} IT.",
    stackMatrixDescription:
      "The identity, security, and network tools Cursor automates for {{ACCOUNT}}.",
    vendorDemoDescription:
      "Each demo replaces a console-click workflow with a reviewable PR, complete with audit trail.",
    composerDescription:
      "Compose the nightly IT job that catches CVEs, drift, and access changes across {{ACCOUNT}}'s estate.",
    vendorPriority: ['snyk', 'okta', 'zscaler', 'github', 'slack', 'jira', 'aws', 'datadog'],
    defaultComposerPreset: 'Snyk nightly CVE sweep',
    leadWithComposer: false,
    roiEyebrow: 'IT throughput ROI',
    nextStepHeadlineTemplate: "Run a one-week drift-and-CVE sweep against a {{ACCOUNT}} sandbox.",
    nextStepBodyTemplate:
      "Cursor stands up the integrations with the {{ACCOUNT}} IT team, runs the nightly job for a week, and shows the PRs the team would have had to file by hand.",
  },
  delivery: {
    category: 'delivery',
    heroHeadlineTemplate: "Cursor keeps {{ACCOUNT}}'s delivery work in flow.",
    heroTaglineTemplate:
      "Reviews, status updates, on-call work — Cursor keeps Jira, Slack, and GitHub in sync so {{ACCOUNT}}'s delivery teams ship faster without status meetings.",
    stackMatrixDescription:
      "The delivery + collaboration tools Cursor automates around for {{ACCOUNT}}.",
    vendorDemoDescription:
      "Each demo collapses a multi-tool delivery loop into a single agent run, with status flowing back to the right Jira ticket and Slack thread.",
    composerDescription:
      "Compose the operational loop {{ACCOUNT}}'s delivery team runs every day — incidents, reviews, releases — into a Cursor agent.",
    vendorPriority: ['jira', 'slack', 'github', 'datadog', 'sentry', 'snyk', 'snowflake', 'figma'],
    defaultComposerPreset: 'Datadog SLO breach to merged PR',
    leadWithComposer: false,
    roiEyebrow: 'Delivery throughput ROI',
    nextStepHeadlineTemplate: 'Pilot the incident-to-merged-PR loop on one {{ACCOUNT}} engagement.',
    nextStepBodyTemplate:
      "Cursor wires up Datadog + Jira + GitHub for one {{ACCOUNT}} engagement, runs against the team's actual incidents, and shows the wall-clock cycle time before / after.",
  },
  studio_leadership: {
    category: 'studio_leadership',
    heroHeadlineTemplate: "What Cursor multiplies across {{ACCOUNT}}'s studios.",
    heroTaglineTemplate:
      "Cursor isn't another developer tool — it's the platform layer that lets {{ACCOUNT}}'s studios run more agentic work per engineer. Same headcount, more in-flight projects.",
    stackMatrixDescription:
      "The platform surface Cursor touches across {{ACCOUNT}}'s studios. Every tool below becomes an automatable workflow.",
    vendorDemoDescription:
      "These are the agent runs that compound across studios — each one collapses a multi-day human handoff into a single PR.",
    composerDescription:
      "Compose the workflows {{ACCOUNT}}'s studios will run in production. The SDK turns the canvas into a scheduled Cursor agent: one preset, run across every studio engagement.",
    vendorPriority: ['github', 'datadog', 'snowflake', 'databricks', 'figma', 'jira', 'slack', 'sentry', 'aws'],
    defaultComposerPreset: 'Datadog SLO breach to merged PR',
    leadWithComposer: true,
    roiEyebrow: 'Studio-wide ROI',
    nextStepHeadlineTemplate: 'Pilot Cursor on one {{ACCOUNT}} studio engagement this quarter.',
    nextStepBodyTemplate:
      "Pick one strategic engagement, run the Cursor SDK against {{ACCOUNT}}'s actual stack, and measure the swing in projects-per-engineer before rolling it out across studios.",
  },
  design: {
    category: 'design',
    heroHeadlineTemplate: "From {{ACCOUNT}}'s Figma files to shipped components.",
    heroTaglineTemplate:
      "Cursor reads {{ACCOUNT}}'s design files via Figma's MCP, emits typed components matching the design tokens, and opens a PR for review. Designers stay in Figma, engineers stay in PRs.",
    stackMatrixDescription:
      "The design-handoff tools Cursor wires together for {{ACCOUNT}}.",
    vendorDemoDescription:
      "The agent reads frames, resolves design tokens, generates components, runs visual diffs, and opens a PR — all without leaving the prospect's stack.",
    composerDescription:
      "Compose the Figma -> tokens -> components -> PR workflow as a runnable Cursor agent for {{ACCOUNT}}'s design system team.",
    vendorPriority: ['figma', 'github', 'jira', 'slack', 'sentry', 'datadog'],
    defaultComposerPreset: 'Figma design to PR',
    leadWithComposer: false,
    nextStepHeadlineTemplate: "Run Cursor against one {{ACCOUNT}} design-system component this sprint.",
    nextStepBodyTemplate:
      "Pick a single component in {{ACCOUNT}}'s design system, hand the Figma frame to Cursor, and compare the generated PR against what the front-end team would have shipped by hand.",
  },
  unknown: {
    category: 'unknown',
    // Heroes left unset so the default copy in ProspectPage is used.
    vendorPriority: [],
    leadWithComposer: false,
  },
};

export function getPresentationProfile(category: Category): PresentationProfile {
  return PROFILES[category] || PROFILES.unknown;
}

// Re-rank an account's vendor list so category-relevant vendors come first.
// Vendors not in the priority list are kept in their existing relative order.
export function applyVendorPriority(
  vendorIds: string[],
  priority: string[],
): string[] {
  if (priority.length === 0 || vendorIds.length <= 1) return vendorIds.slice();
  const have = new Set(vendorIds);
  const head: string[] = [];
  for (const id of priority) {
    if (have.has(id) && !head.includes(id)) head.push(id);
  }
  const tail = vendorIds.filter((id) => !head.includes(id));
  return [...head, ...tail];
}

export function applyTemplate(template: string, account: string): string {
  return template.replaceAll('{{ACCOUNT}}', account);
}
