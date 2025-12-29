# Georgia Tech Online Program Cost Calculator

A single-page web app for estimating tuition and online learning fees for Georgia Tech online graduate programs. The calculator supports scenario comparisons, per-term vs full-degree planning, and shareable URLs.

![OMS degree planning calculator screenshot](public/screenshot.svg)

**Rates set from provided Spring 2026 PDF and explicit values in this prompt.**

## Why React + TypeScript + Vite
- **React + TypeScript** provide type-safe UI development with reusable components and predictable state management.
- **Vite** delivers fast local development and a lean, offline-friendly production bundle.

## What’s Included
- Per-term calculator with updated Spring 2026 tuition and online learning fee rules.
- Full degree mode with credit requirements, auto-term calculation, time-to-graduate estimates, and fee assumptions.
- Scenario comparison (up to three), with duplicate/reset actions and shareable state encoded in the URL.
- Data source card that prints the exact config values used for every calculation.

## What’s Excluded
- No other mandatory campus fees are added.
- Optional fees are not included in totals unless explicitly added (none are enabled by default).

## Updating Rates for Future Terms
1. Open `src/data/rates.ts`.
2. Update `perCreditRateByProgram` values.
3. Update `degreeCreditsByProgram` values if program requirements change.
4. Update `onlineLearningFeeRule` with the new thresholds/fees.
5. Update or add test expectations in `src/lib/calc.test.ts`.

## How Full Degree Fee Estimation Works
- Tuition is calculated as `required_credits * per_credit_rate`.
- The online learning fee is estimated using the credits-per-term threshold:
  - credits per term `< 4` → `$176` per term
  - credits per term `≥ 4` → `$440` per term
- Total fees are `fee_per_term * number_of_terms` (auto or manually entered).
- The estimate assumes the same credits-per-term every term.

## Known Limitations
- Mixing different credit loads across terms can change total fees compared to the estimate.
- The calculator does not include optional or program-specific fees beyond the online learning fee rule.

## Development
Run these commands from the repo root to use the workspace scripts:

```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
npm run preview
```

## Tests
```bash
npm run test
```

## Deployment
See `docs/README.md` for deployment steps.
