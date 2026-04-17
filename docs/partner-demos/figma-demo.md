# Figma Live Design-Drift & Fix Demo — Build Brief

> **Purpose of this document:** This is a self-contained prompt/spec for a new Cursor agent to build an interactive live-fix demo at `/partnerships/figma/demo`, patterned on the existing Sentry demo at `/partnerships/sentry/demo`. Read it end-to-end before writing any code.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes Figma + Cursor orchestration end-to-end:

1. A user lands on `/partnerships/figma/demo` and clicks a button to run a **design QA pass** on a mock product page.
2. Real code renders a product card that visibly drifts from its Figma spec (wrong accent color, wrong radius, off spacing). The check takes ~3s and pivots to a full-screen **"Design Drift Detected"** takeover — a visual diff, not a crash.
3. Figma MCP (mocked) detects the drift and fires a webhook.
4. A scripted agent console plays on the right half of the screen: Figma MCP → Opus (analyze variables + tokens) → GitHub MCP (regression hunt) → Composer (token substitution) → Codex (pixel/WCAG review) → shell (build + visual regression) → PR opened → Jira ticket updated.
5. When the run completes, the user can click through four pixel-perfect artifact modals: **Figma file/inspect view** (pixel-realistic Figma canvas with drift annotations), **Triage report**, **Jira ticket**, and **GitHub PR** (inside a MacBook frame).
6. Reset button returns the demo to its drifted state. `scripts/reset-figma-demo.sh` re-seeds the drift after a real PR merges.

**The demo must behave identically every time it runs.** All agent work is scripted playback. Only the underlying drift and reset are real.

---

## 1. Why this is being built

The existing `/partnerships/figma` page is a scroll-driven narrative (telephone scene → MCP bridge → Design Mode → orchestration → value prop). It's beautiful but **passive** — prospects can't *feel* the design → code loop close. The Sentry demo (`/partnerships/sentry/demo`) solved this for error-handling; we need the same reflex for design-to-code fidelity.

Figma's story is fundamentally different from Sentry's and Datadog's:

- Sentry = **runtime crash**, fix via null-guards + type widening.
- Datadog = **performance regression**, fix via parallelism/caching.
- Figma = **visual fidelity drift**, fix via design-token substitution + component-instance correction.

This demo must feel on-brand for Figma (purple gradient, canvas language, "variables & tokens", "components & instances") — not a Sentry reskin.

---

## 2. Required reading (in this repo, in order)

Before you write any code, study the Sentry demo. That's the pattern you're replicating.

**Page + state machine:**

- `src/app/partnerships/sentry/demo/page.tsx` — state machine (`idle` → `error` → `running` → `complete`), three conditional regions, artifact modal dispatch.

**Components:**

- `src/components/sentry-demo/checkout-card.tsx` — the trigger UI.
- `src/components/sentry-demo/demo-error-boundary.tsx` — error interception.
- `src/components/sentry-demo/full-error-page.tsx` — full-screen takeover with "Watch the fix" CTA.
- `src/components/sentry-demo/error-fallback.tsx` — compact summary for split-screen.
- `src/components/sentry-demo/agent-console.tsx` — **single most important file**. Study the scripted playback, channel styles, `TIME_SCALE`, `Step` type, `onComplete` callback.
- `src/components/sentry-demo/artifact-cards.tsx`
- `src/components/sentry-demo/artifacts/triage-report.tsx` (react-markdown + remark-gfm)
- `src/components/sentry-demo/artifacts/jira-ticket.tsx`
- `src/components/sentry-demo/artifacts/macbook-frame.tsx`
- `src/components/sentry-demo/artifacts/github-pr-preview.tsx`
- `src/components/sentry-demo/artifacts/pr-modal.tsx`
- `src/components/sentry-demo/artifacts/sentry-issue.tsx` + `sentry-modal.tsx` — pixel-perfect external tool UI.
- `src/components/sentry-demo/cost-comparison.tsx`, `guardrails-panel.tsx`

**Trigger code:** `src/lib/demo/order-processor.ts`, `src/lib/demo/format-payment.ts`.

**Webhook + reset:**

- `src/app/api/sentry-webhook/route.ts` — signature verification, Cursor Background Agent trigger, `buildAgentPrompt`.
- `scripts/reset-sentry-demo.sh`.

**Existing Figma partner page you are extending (not replacing):**

- `src/app/partnerships/figma/page.tsx`
- `src/components/figma-partner/*.tsx` — especially `telephone-scene.tsx` (drift visualization), `mcp-bridge-scene.tsx` (token extraction visuals), `design-mode-scene.tsx` (annotation pins), `orchestration-scene.tsx`, `figma-value-scene.tsx`, `iphone-frame.tsx`.
- `src/components/shared/{macbook-frame,flow-pipe,mcp-flow-diagram}.tsx`.

Note: `src/components/figma/*.tsx` also exists in the repo but is *not* imported by `partnerships/figma/page.tsx`. Leave those files alone unless a pattern there (e.g. token extraction visuals) is directly useful and you pull it into the demo folder explicitly.

---

## 3. What the Sentry demo does (pattern summary)

See the Datadog brief for full details; short version:


| Phase      | What renders                                                      |
| ---------- | ----------------------------------------------------------------- |
| `idle`     | Hero + CTA pill + trigger card + supporting cards below the fold. |
| `error`    | Full-screen takeover with "Watch the fix" + "Reset".              |
| `running`  | Split screen: left summary, right scripted agent console.         |
| `complete` | Same split screen + `ArtifactCards` strip.                        |


Artifact modals are overlays openable from `ErrorFallback` or `ArtifactCards`, closable, self-contained, all wrapped in a `MacbookFrame`.

Agent console `SCRIPT` is a `Step[]` with `channel`, `label`, `detail`, `delayMs`. Real time ~19s, scaled to ~2min displayed via `TIME_SCALE = 6.9`.

**Replicate this pattern exactly. Only change vocabulary and visuals.**

---

## 4. The Figma demo — concept & story

### The trigger scenario

**Surface UI:** A "Product catalog" mini-app on the demo page. The hero card is something like:

> **Design QA: Product card v2.3**
> Compare the shipped component against Figma spec `Marketing/Shop/ProductCard@2.3`.
> `[ Run design QA ]`

Below the button, render a visible product card component (image, title, price, accent tag, CTA button). The card **looks wrong on purpose** — prospect doesn't know yet, but after the QA run, the drift becomes screamingly obvious.

**When clicked:**

1. A ~3s scripted "QA sweep" animates over the card: pixel-grid overlay, corner-measurement crosshairs, numbered diff pins landing on four visibly wrong elements.
2. Then pivot to a full-screen **Design Drift Detected** takeover showing:
  - Big "⚠ Design drift detected" heading.
  - Figma purple accent (gradient `#A259FF → #6C3CE0`).
  - Side-by-side: Figma frame (target) vs rendered component (shipped). Four numbered drift callouts.
  - Subtext in Figma vocabulary: "4 violations against `design-system/tokens@v2.3` — drift exceeds ±2px / ΔE > 4 threshold."
  - Two buttons: **"Watch Cursor fix this"** (→ running phase) and **"Reset"**.

### The underlying drift (real code, reset-able)

Create a real, rendered component that drifts from a canonical spec. Commit both the **drifted** values (in a component) and the **canonical** values (as design tokens) to the codebase.

`**src/lib/demo/design-tokens.ts`** (canonical, source of truth):

```ts
export const tokens = {
  color: {
    brandAccent: '#A259FF',      // Figma variable: color/brand/accent
    surface: '#111116',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.64)',
    priceTag: '#14B892',          // Figma variable: color/badge/success
  },
  radius: {
    card: 16,                     // Figma: radius/md
    button: 12,                   // Figma: radius/sm
  },
  space: {
    cardPadding: 24,              // Figma: space/6
    gapLg: 16,                    // Figma: space/4
  },
  font: {
    titleWeight: 600,
    titleSize: 18,
  },
} as const;
```

`**src/components/figma-demo/product-card-drifted.tsx**` (has the bugs — hardcoded values drifted from tokens):

```tsx
// NOTE: hardcoded values here drift from tokens in design-tokens.ts on purpose.
// The reset script restores these drifted values after a PR merge.
export function ProductCardDrifted() {
  return (
    <div
      style={{
        background: '#111116',
        borderRadius: 12,              // drift: should be tokens.radius.card (16)
        padding: 20,                   // drift: should be tokens.space.cardPadding (24)
      }}
    >
      <h3 style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 700 }}>
        {/* drift: fontSize (17 vs 18), fontWeight (700 vs 600) */}
        Featherweight Runner
      </h3>
      <span style={{ color: '#12A67F', /* drift: ΔE ~6 vs #14B892 */ }}>
        $128
      </span>
      <button
        style={{
          background: '#9A4FFF',       // drift: brand/accent is #A259FF
          borderRadius: 10,            // drift: button radius is 12
          padding: '10px 16px',
        }}
      >
        Add to cart
      </button>
    </div>
  );
}
```

The **four drift points** become the four numbered diff pins in the QA sweep and the four bullets in the triage report.

**The fix** (what the agent "produces"): Replace all hardcoded CSS values with `tokens.`* references. One file, ~10–15 lines changed. Typechecks, renders identically to the Figma spec.

### The orchestration (scripted console playback)

Channels your `SCRIPT` needs:


| Channel      | Label               | Hex accent | Role                                                 |
| ------------ | ------------------- | ---------- | ---------------------------------------------------- |
| `figma`      | `figma-mcp`         | `#A259FF`  | Fetch file, frames, variables, components, styles    |
| `designmode` | `cursor · design`   | `#B591FF`  | *Optional* — Cursor Design Mode step                 |
| `github`     | `github-mcp`        | (white)    | Commit history, branch, PR                           |
| `jira`       | `jira-mcp`          | `#4C9AFF`  | Incident/task ticket                                 |
| `shell`      | `shell`             | green      | Build, visual regression, typecheck                  |
| `opus`       | `opus · triage`     | `#D97757`  | Reasoning over Figma variables + token usage         |
| `composer`   | `composer · edit`   | blue       | Token substitution edits                             |
| `codex`      | `codex · review`    | `#10a37f`  | Pixel diff + WCAG check                              |
| `visual`     | `visual-regression` | amber      | Percy/Chromatic-style snapshot comparison (scripted) |
| `codegen`    | `codegen`           | blue       | Triage report generation                             |
| `done`       | `complete`          | green      | Terminal step                                        |


**Target script arc (~25–30 steps, ~19s real, scaled via `TIME_SCALE` to ~2 min displayed):**

1. **Intake (figma):** Fetch file → fetch component `ProductCard@2.3` → fetch variable collection `design-system/tokens@v2.3` → diff variables vs code usage.
2. **Drift report (figma):** "4 violations: radius/card −4px, space/6 −4px, font.weight +100, color.brand ΔE 6.2, color.badge ΔE 5.8". (Cite the exact variable paths.)
3. **Jira ticket (jira):** `CUR-4409` created. Type: "Design QA". Priority: P2. Component: UI/Storefront.
4. **Opus triage (opus):** Model selected for long-context reasoning over Figma variables + React component tree. Pulls commit history via github-mcp. Identifies drift-introducing commit: `3ef91a2 — "revert: product card restyle"` 3 days ago.
5. **Triage report (codegen):** Written to `docs/triage/2026-04-16-design-drift-product-card.md`.
6. **Composer edit (composer):** Reads `product-card-drifted.tsx` + `design-tokens.ts`. Rewrites hardcoded values as `tokens.radius.card`, `tokens.space.cardPadding`, `tokens.color.brandAccent`, etc.
7. **Codex review (codex):**
  - "No type or behavior change."
  - "Lint ✓."
  - "WCAG contrast ratio post-fix: 4.63:1 (was 4.17:1) — AA ✓."
8. **Shell static verify:** `npx tsc --noEmit` ✓, `npm run lint` ✓.
9. **Visual regression (visual + shell):** Run a scripted "visual diff" — comparing before/after snapshots. Result: `4 pixel violations → 0. Mean ΔE: 5.4 → 0.2. Match: 100%.` (Script the output; do not actually require an installed visual regression tool.)
10. **PR (github):** Branch `fix/product-card-token-drift`. Commit → push → PR #163 opened. Title: `fix(ui): restore token references on ProductCard v2.3 (100% Figma match)`.
11. **Jira update:** `CUR-4409 → In Review`.
12. **Done.**

### The four artifact modals

All four render in a MacBook frame (`src/components/shared/macbook-frame.tsx` if promoted from sentry-demo, else the Sentry one — keep Sentry's path intact if you copy).

1. **Figma file modal** (equivalent of `SentryModal`) — **pixel-perfect Figma canvas view**. Must include:
  - Figma top bar: purple gradient logomark, file name `Marketing/Shop/ProductCard@2.3`, collaborators' avatars, "Share" button.
  - **Left panel:** Layers tree (Frame → AutoLayout → Image / Title / Price / Badge / CTA).
  - **Center canvas:** The "Figma" version of the product card (canonical design — this is what it's *supposed* to look like). Display the four drift-annotation pins numbered 1-4 hovering over the affected elements.
  - **Right inspect panel:** Design tokens / variables for the selected element. Show color swatch `brandAccent #A259FF` with the variable name. Show radius `16px · radius/md`. Show padding `24px · space/6`. Show the **"Used in 14 components"** line.
  - Below the canvas: a small "Comments" rail with one comment "Pixel mismatch reported by Cursor Agent · 4 annotations linked".
  - Figma-canvas-feel: grey-tan canvas backdrop (`#E5E5E5` or similar), proper "selection" styling (blue 1px border on the card), smart guides implied.
  - **Critically:** make the Figma UI feel like Figma, not like a generic design tool. Reuse logo SVG, typography hierarchy, chrome patterns.
2. **Triage report modal** — same pattern as Sentry (`react-markdown` + `remark-gfm`), Figma content:
  ```md
   # Triage — Design drift on ProductCard v2.3

   **Status:** Fix proposed · PR #163 · CUR-4409

   ## Violations (4)
   | # | Element | Property | Figma spec | Shipped | Delta |
   | --- | --- | --- | --- | --- | --- |
   | 1 | Card | `radius/md` | 16px | 12px | −4px |
   | 2 | Card | `space/6` (padding) | 24px | 20px | −4px |
   | 3 | Title | `font.weight` / `font.size` | 600 / 18px | 700 / 17px | +100 / −1px |
   | 4 | CTA | `color/brand/accent` | #A259FF | #9A4FFF | ΔE 6.2 |

   ## Root cause
   Commit `3ef91a2` ("revert: product card restyle", 3 days ago) re-introduced hardcoded CSS that was previously migrated to design tokens.

   ## Fix
   - Replace 7 hardcoded literals with `tokens.`* references
   - No type changes
   - Post-fix pixel match: 100%

   ## Verification
   - Typecheck: ✓
   - Lint: ✓
   - Contrast (WCAG AA): 4.63:1 ✓
   - Visual regression: 0 violations (was 4)
  ```
3. **Jira ticket modal** — pixel-perfect Jira, ticket `CUR-4409`, Design QA type, P2, linked to PR and Figma file URL. Status timeline `To Do → In Progress → In Review`. Components: `UI/Storefront`.
4. **GitHub PR modal** — wrapped in MacBook. PR #163. Body includes: before/after screenshots (can render inline React components for both states), pixel-diff table from the triage report, CI checks green (typecheck, lint, visual regression). Files changed: 1 (`product-card-drifted.tsx` — or renamed to `product-card.tsx` post-fix). Reviewer banner: "Verified by Cursor agent · 100% Figma match".

### Branding

- **Primary accent:** Figma purple gradient `#A259FF → #6C3CE0`. Use for hero glyph, the big drift header, and the "Watch Cursor fix this" CTA.
- **Canvas / chrome greys:** Borrow Figma's actual UI palette for the Figma modal specifically — tan/grey canvas `#E5E5E5`-ish, near-white panels, subtle 1px borders.
- **Drift annotation color:** Amber/orange `#F5A623` for callouts and pins (contrasts with Figma purple, reads as "attention needed", avoids overloading red).
- **Success:** Green `#4ADE80` for post-fix checks and Jira "In Review".
- **Typography:** Match existing Figma partner page — sans serif prose, mono for payloads and variable names.
- **Avoid:** Don't copy Sentry's `#362D59` purple or Datadog's `#632CA6`. Don't let your visuals blur with those demos.

---

## 5. Files to create

Mirror Sentry structure. Keep Sentry files untouched.

```
src/app/partnerships/figma/demo/page.tsx                              NEW
src/app/api/figma-webhook/route.ts                                    NEW

src/components/figma-demo/product-card-drifted.tsx                    NEW  (the trigger UI / drifted component)
src/components/figma-demo/design-qa-card.tsx                          NEW  (wrapper w/ "Run design QA" button)
src/components/figma-demo/demo-drift-boundary.tsx                     NEW  (intercepts the drift-detection signal)
src/components/figma-demo/full-drift-page.tsx                         NEW  (FullErrorPage equivalent, Figma-purple)
src/components/figma-demo/drift-summary.tsx                           NEW  (ErrorFallback equivalent, split-screen left)
src/components/figma-demo/agent-console.tsx                           NEW  (Figma channels + script)
src/components/figma-demo/artifact-cards.tsx                          NEW
src/components/figma-demo/velocity-comparison.tsx                     NEW  (CostComparison equivalent — e.g. PR cycle time, design-QA-cycle time)
src/components/figma-demo/guardrails-panel.tsx                        NEW  (Figma-flavored — "WCAG auto-check", "Token-only substitution", "No semantic changes")
src/components/figma-demo/artifacts/figma-file.tsx                    NEW  (pixel-perfect Figma canvas)
src/components/figma-demo/artifacts/figma-modal.tsx                   NEW  (wraps FigmaFile in MacBook)
src/components/figma-demo/artifacts/triage-report.tsx                 NEW  (Figma content)
src/components/figma-demo/artifacts/jira-ticket.tsx                   NEW  (CUR-4409)
src/components/figma-demo/artifacts/github-pr-preview.tsx             NEW  (design-drift PR)
src/components/figma-demo/artifacts/pr-modal.tsx                      NEW

src/lib/demo/design-tokens.ts                                         NEW  (canonical tokens)

scripts/reset-figma-demo.sh                                           NEW  (re-seeds drift values in product-card-drifted.tsx)
```

**Also:**

- Update existing `src/app/partnerships/figma/page.tsx` to add a prominent CTA linking to `/partnerships/figma/demo`. Mirror how the Sentry partnership page links to its demo.
- Consider promoting `src/components/sentry-demo/artifacts/macbook-frame.tsx` into `src/components/shared/macbook-frame.tsx` and importing from both demos. If you do, preserve Sentry's existing imports.
- You may extract a `src/components/shared/agent-console-base.tsx` if you see large duplication with Sentry's, but only if it doesn't compromise channel/step customization. If in doubt, fork and move on.

---

## 6. Implementation order (recommended)

1. **Scaffold the route** — `src/app/partnerships/figma/demo/page.tsx` with four-phase state machine, cloned from the Sentry page as skeleton.
2. **Ship the trigger + drift first** — `product-card-drifted.tsx`, `design-tokens.ts`, `design-qa-card.tsx`. Verify the card renders visibly off.
3. **Build the QA-sweep animation** — ~3s animated overlay with pixel grid and numbered pins landing on drift points. GSAP or CSS keyframes.
4. **Wire the boundary + full-screen takeover** — side-by-side Figma vs shipped render + drift callouts.
5. **Build the agent console** — fork Sentry's, add Figma channels, write the 25–30-step SCRIPT.
6. **Build artifact modals in this order:** PR → Jira → Triage report → Figma file (the Figma modal is the hardest; save for last).
7. **Side content** — velocity comparison, guardrails panel, CTA pill. Guardrails for Figma should emphasize: token-only substitutions, WCAG auto-check, no semantic changes, human-approved PR.
8. **Webhook route** — Figma signature verification (Figma webhook signing scheme), background agent trigger, `buildAgentPrompt` with the 8-step Figma-specific sequence.
9. **Reset script + docs** — `scripts/reset-figma-demo.sh` restoring drifted literals. Update `docs/partner-demos/README.md` if present.
10. **Typecheck + manual walkthrough** — click through all phases, open all modals, reset, repeat. Confirm visually identical between runs.

---

## 7. Design requirements (non-negotiable)

- **Repeatability:** Same click, same visible result, every time. No real network calls in the scripted console. No `Math.random()` in playback.
- **Visible drift before the fix:** The rendered `ProductCardDrifted` must look subtly but unmistakably off — so when the QA sweep lands pins, the prospect says "oh yeah, that IS wrong". Don't make drift invisible-to-the-eye.
- **Pixel-perfect Figma modal:** This is the signature artifact. If this looks cheap, the demo falls flat. Spend time making the Figma canvas, layers panel, inspect panel, and purple gradient logomark feel indistinguishable from the real app.
- **On-brand language:** "Variables", "tokens", "components", "instances", "auto-layout", "frames", "constraints", "design-system/[tokens@v2.3](mailto:tokens@v2.3)". Avoid Sentry vocabulary ("event", "stack", "breadcrumb") and Datadog vocabulary ("span", "flame graph", "SLO") on this demo.
- **Self-contained artifacts:** No external links out to figma.com, github.com, etc. All modals.
- **Single-page, no auth, no API keys client-side.**
- **Safety-by-default:** The webhook `buildAgentPrompt` must enforce: token-only substitutions (no semantic changes), WCAG contrast auto-check before PR, visual regression must pass, PR must cite the Figma variable paths.

---

## 8. Webhook prompt (`buildAgentPrompt`) — what the real agent must do

Fork the shape of `src/app/api/sentry-webhook/route.ts` exactly. Replace Sentry vocabulary with Figma. Required steps in order:

1. **Figma MCP intake.** Fetch the file, the target component/instance, and the current variable collection. Diff declared variables against actual code usage.
2. **Enumerate violations.** Produce a structured list: element, property, expected (Figma), actual (code), delta. Cite the exact variable path (e.g. `color/brand/accent`, `radius/md`, `space/6`).
3. **Regression hunt (GitHub MCP).** List commits touching the affected component/tokens in the last 14 days. Identify the likely drift-introducing commit.
4. **Read affected code (shell).** Read the drifted component and the design tokens module. Form a written hypothesis before patching.
5. **Patch (shell + edit).** **Token-only substitution.** Replace hardcoded literals with `tokens.`* references. Do NOT rewrite layout, do NOT change semantics, do NOT touch unrelated styling. Minimal diff.
6. **Static verify.** `npx tsc --noEmit`, `npm run lint`. Iterate until clean.
7. **Visual + accessibility verify.** Run the project's visual regression suite (Chromatic/Percy/Playwright-snapshot) if present. Run a WCAG contrast check on any color that changed. Every touched element must still meet WCAG AA. If either fails, iterate on step 5.
8. **Open PR (GitHub MCP).** Branch `fix/<slug>`. PR body must include: the violations table, before/after screenshots, the regression commit SHA, WCAG result, visual regression result, the triage report path, and a risk assessment ("blast radius: 1 file, N lines").
9. **Jira update (Jira MCP).** Move ticket to `In Review`, link the PR and the Figma file URL.

Be explicit: the agent **must** hit every step and cite evidence in the PR body. Determinism across real runs is the goal.

---

## 9. Acceptance criteria

Demo is ready to ship when:

- `/partnerships/figma/demo` loads with hero + CTA pill + design-QA card showing a visibly drifted product card.
- Clicking **Run design QA** triggers a ~3s QA sweep animation with 4 numbered pins, then pivots to the full-screen drift page.
- Clicking **Watch Cursor fix this** starts the scripted console which plays ~25 channel-coded steps.
- Console completion transitions to `complete` and reveals four artifact cards.
- Each modal opens, renders pixel-perfect, and closes cleanly.
- The Figma file modal looks indistinguishable from actual Figma chrome (layers, inspect, canvas, comments).
- **Reset** returns the demo to clean `idle`.
- Two consecutive runs produce visually identical output.
- `npx tsc --noEmit` passes.
- No external links leak out of any modal.
- `scripts/reset-figma-demo.sh` restores drifted values after a real PR merge.
- Existing `/partnerships/figma` scroll page is untouched except for a new CTA link to `/demo`.

---

## 10. Anti-patterns / things to avoid

- ❌ **Don't** reuse Sentry `#362D59` or Datadog `#632CA6`. Keep Figma's purple-gradient identity distinct.
- ❌ **Don't** make the agent console non-deterministic.
- ❌ **Don't** dramatize a "crash" — this is a **visual fidelity** story. Use diff/drift/violation language, not error/exception/stack.
- ❌ **Don't** cheapen the Figma modal with a loose sketch. If you can't make the Figma canvas look real, delay shipping rather than ship a visually weak artifact — this modal is the hero of the demo.
- ❌ **Don't** let the agent "rewrite" layout or semantics in the narrative. The whole point is it's a minimal, safe token-substitution. Keep the story tight.
- ❌ **Don't** delete or modify `src/components/sentry-demo/`**. Fork by copy.
- ❌ **Don't** hardcode API keys or DSNs anywhere in client code.
- ❌ **Don't** break the existing scroll-driven Figma partnership page. Add a CTA, not a rewrite.

---

## 11. Quick reference — Sentry-demo files → Figma-demo files


| Sentry                                | Figma                                                  |
| ------------------------------------- | ------------------------------------------------------ |
| `checkout-card.tsx`                   | `design-qa-card.tsx` (+ `product-card-drifted.tsx`)    |
| `demo-error-boundary.tsx`             | `demo-drift-boundary.tsx`                              |
| `full-error-page.tsx`                 | `full-drift-page.tsx`                                  |
| `error-fallback.tsx`                  | `drift-summary.tsx`                                    |
| `agent-console.tsx`                   | `agent-console.tsx` (Figma channels + script)          |
| `artifact-cards.tsx`                  | `artifact-cards.tsx`                                   |
| `artifacts/sentry-issue.tsx`          | `artifacts/figma-file.tsx`                             |
| `artifacts/sentry-modal.tsx`          | `artifacts/figma-modal.tsx`                            |
| `artifacts/triage-report.tsx`         | `artifacts/triage-report.tsx` (Figma content)          |
| `artifacts/jira-ticket.tsx`           | `artifacts/jira-ticket.tsx` (CUR-4409)                 |
| `artifacts/github-pr-preview.tsx`     | `artifacts/github-pr-preview.tsx` (drift PR)           |
| `artifacts/pr-modal.tsx`              | `artifacts/pr-modal.tsx`                               |
| `artifacts/macbook-frame.tsx`         | Same file OR promoted to `shared/macbook-frame.tsx`    |
| `cost-comparison.tsx`                 | `velocity-comparison.tsx`                              |
| `src/lib/demo/order-processor.ts` +   | `src/components/figma-demo/product-card-drifted.tsx` + |
| `src/lib/demo/format-payment.ts`      | `src/lib/demo/design-tokens.ts`                        |
| `src/app/api/sentry-webhook/route.ts` | `src/app/api/figma-webhook/route.ts`                   |
| `scripts/reset-sentry-demo.sh`        | `scripts/reset-figma-demo.sh`                          |


---

## 12. Figma-specific wrinkles

- **Figma webhook is not identical to Sentry's.** Figma sends `FILE_UPDATE`, `FILE_COMMENT`, and `LIBRARY_PUBLISH` events, not "issues". For signature verification, Figma uses a `passcode` you set when registering the webhook and echoes it in the `passcode` field. Verify against `process.env.FIGMA_WEBHOOK_PASSCODE`. Model the `POST` route to accept the Figma payload shape, extract the file_key + event_type, and only fire the Cursor agent on relevant events.
- **Figma MCP is real.** The repo already has `plugin-figma-figma` available (see `mcp_server_catalog`). The **real** agent (invoked via webhook) should use the actual Figma MCP tools to read variables, components, and frames. The **scripted playback** in `agent-console.tsx` just names "figma-mcp" — it doesn't actually call anything.
- **Design Mode** is a Cursor feature mentioned elsewhere in the partner page. Optionally include a `designmode` channel step where Cursor's Design Mode renders pins on a live preview (mirror `design-mode-scene.tsx` in the partner page for visual consistency). This differentiates the Figma demo from every other partner demo.
- **Contrast math:** If you include WCAG contrast checks in the triage report or Codex step, cite actual ratios computed from the drifted vs fixed colors (e.g. `#12A67F` on `#111116` ≈ 4.17:1; `#14B892` on `#111116` ≈ 4.63:1). Use any standard contrast formula. Prospects who actually care will squint.

---

## 13. Ship it

Build the demo. Typecheck clean. Manually click through all four phases and all four modals twice in a row. Commit on a new branch `partner-demos-figma`. Open a draft PR against `main` titled **"feat: Figma live design-drift + fix demo"**. Include screenshots: (1) drifted product card on idle, (2) full-screen drift page with side-by-side + 4 callouts, (3) running split-screen mid-agent-console, (4) completed state with four artifact cards, (5) the Figma file modal in all its pixel-perfect glory.