# Georgia Tech Online Program Cost Calculator

A production-ready web app for estimating tuition and online learning fees for Georgia Tech online graduate programs. It supports scenario comparisons, sharable URLs, and a clean UI that follows Georgia Tech's official brand colors.

## Why React + TypeScript + Vite
- **React + TypeScript** provide type-safe UI development with reusable components and predictable state management.
- **Vite** delivers fast local development and an optimized production build without extra complexity.

## Rates Included (Source of Truth)
The calculator uses official Georgia Tech sources for the following rates:
- **OMSA tuition per credit** from the OMSA tuition page.
- **OMSCS tuition per credit** from the OMSCS tuition page.
- **OMSCSEC tuition per credit** from the cybersecurity tuition page.
- **Online Learning Fee** applied once per term when credits are above zero, as listed by the Georgia Tech Bursar fee schedule.

See `src/data/rates.ts` for the centralized rate table and source URLs.

## Georgia Tech Brand Colors
The UI uses Georgia Tech's official brand palette (source: https://brand.gatech.edu/visual-identity/colors) and accessible variants:
- Tech Gold: `#B3A369`
- Navy Blue: `#003057`
- White: `#FFFFFF`
- Tech Medium Gold: `#A4925A`
- Tech Dark Gold: `#857437`

These are defined as Tailwind design tokens in `tailwind.config.cjs`, with supporting styles in `src/index.css`.

## Updating Rates for Future Terms
1. Open `src/data/rates.ts`.
2. Update the `tuitionPerCredit` values for OMSA, OMSCS, and OMSCSEC.
3. Update `ONLINE_LEARNING_FEE_BY_TERM` if the fee schedule changes or varies by term.
4. Adjust tests in `src/lib/calc.test.ts` if totals need updated expectations.

## Changing the Color Palette
1. Update the color tokens in `tailwind.config.cjs`.
2. Update any hard-coded color references in `src/index.css` if necessary.
3. Ensure contrast remains accessible for text and buttons.

## Development
```bash
npm install
npm run dev
```

## Tests
```bash
npm run test
```
