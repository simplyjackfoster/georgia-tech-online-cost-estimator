# Georgia Tech Online Program Cost Estimator

This repository is a monorepo with:

- `apps/web`: The OMSCS tuition + fee calculator (Vite + React).
- `apps/api`: A Vercel serverless API that counts generated plans (Upstash Redis).

## Quick Start
```bash
npm install
npm run dev
```

## Workspaces
- Run web-specific commands: `npm --workspace apps/web run <script>`
- Run API-specific commands: `npm --workspace apps/api run <script>`
- Run every workspace's tests once: `npm run test:run`; end-to-end: `npm run test:e2e`
- CI (`.github/workflows/ci.yml`) runs typecheck, unit, and e2e tests on every push and PR.

## Analytics + Usage Metrics
- Umami (`cloud.umami.is/script.js` in `apps/web/index.html`) records page views and the `plan_generated` event for the hosted dashboard. Nothing reads Umami back — its API is Pro-only.
- The "plans generated" count on the site comes from the Vercel API: the frontend POSTs to `/api/metrics/plans-generated` when a plan is generated and GETs `?days=30` for the trust card. Daily counts are kept forever, so longer windows (`?days=365`, `?days=all`, `&series=1`) are available for analysis.

### Vercel Environment Variables
Add the Upstash Redis integration (Vercel Marketplace, free tier) to the `apps/api` project. It injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`, which is all the API needs.

## Documentation
- Deployment details live in `docs/README.md`.
- Analytics wiring lives in `docs/ANALYTICS_AUDIT.md`.
