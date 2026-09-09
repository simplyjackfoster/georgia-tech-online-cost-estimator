# Georgia Tech Online Program Cost Calculator

A single-page web app for estimating tuition and online learning fees for Georgia Tech online graduate programs (OMSCS, OMSA, OMSCSEC). Pick a program, residency, start term, and pace; the planner shows total cost, terms needed, finish term, and a per-term timeline for custom schedules, with a shareable URL.

![OMS degree planning calculator screenshot](public/screenshot.svg)

**Rates set from the Office of the Bursar Fall 2026 tuition totals PDF.**

## Architecture
- `src/data/rates.ts` — the Bursar term sheet as a `RateTable` (per-credit rates by program × residency, online learning fee rule, degree credits). Swap `CURRENT_RATES` to change terms.
- `src/lib/calc.ts` — pure money math (`calculateTermCost`, `calculateFullDegree`); every function accepts an optional `RateTable`.
- `src/lib/plan.ts` — `PlanSelection` (what the user chose), URL parse/serialize, pace rows, mixed-schedule math, and `resolvePlan` which turns a selection into the displayed `PlanResult`.
- `src/lib/mixedRows.ts` — run-length encoding helpers for the custom-schedule editor.
- `src/hooks/usePlanState.ts` — draft vs. applied selection; `useShareLink.ts` — clipboard + status; `usePlansGeneratedCount.ts` — the usage counter.
- `src/components/` — presentational only. `ChoiceGroup` renders native-radio pills/tiles; `Accordion` collapses only on mobile via `useMediaQuery`.

## What’s Included
- Program, residency (in-state / out-of-state / out-of-country, defaults to out-of-state), and start-term selection with Fall 2026 rates. Students admitted before Fall 2025 pay the in-state rate.
- Constant pace (3/6/9 credits per term) or a custom per-term schedule with a calendar timeline.
- Shareable state encoded in the URL (`?program=&residency=&start=&pace=&mode=&mixed=`).
- Official-rates card with all residency columns and a link to the source PDF.

## What’s Excluded
- No other mandatory campus fees are added.
- Optional or program-specific fees are not included.

## Updating Rates for Future Terms
1. Add a new `RateTable` in `src/data/rates.ts` (copy `FALL_2026_RATES`, update `label`, `sourceUrl`, and the numbers).
2. Point `CURRENT_RATES` at it.
3. Update the expected values in `src/lib/calc.test.ts`, `src/lib/plan.test.ts`, `src/App.test.tsx`, and `e2e/degree-planner.spec.ts`, then refresh the snapshot with `npx vitest run -u`.

## How Full Degree Fee Estimation Works
- Tuition is `required_credits × per_credit_rate` for the chosen program and residency.
- The online learning fee is charged per term by credit load: `< 4` credits → `$212`, `≥ 4` credits → `$531`.
- Constant pace: `terms = ceil(required_credits / credits_per_term)`, fees = `fee_per_term × terms`.
- Custom schedule: each term is costed at its own load until the degree's credits are covered; a schedule that doesn't cover the degree is flagged.

## Development
Run these commands from the repo root:

```bash
npm install
npm run dev
```

## Tests
```bash
npm run test:run   # vitest, web + api workspaces
npm run test:e2e   # playwright (needs `npx --workspace apps/web playwright install chromium` once)
```

## Production Build
```bash
npm run build
npm run preview
```

## Deployment
See `docs/README.md`.
