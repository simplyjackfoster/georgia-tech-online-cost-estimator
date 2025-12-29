# Analytics Audit (Umami)

## Repository scan targets
- `umami`, `window.umami`, `track(`, `plan_generated`, `x-umami-api-key`, `api.umami.is`, `cloud.umami.is`

## Current implementation

### Tracking snippet location
- `apps/web/index.html` loads `https://cloud.umami.is/script.js` with `data-website-id="ef415650-dc26-4445-a007-651d425fc764"`.

### Event firing location
- `apps/web/src/hooks/usePlanState.ts` fires `window.umami?.track('plan_generated')` after `handleApplyDraft` updates state and the plan is deemed valid.

### Server-side Umami API usage
- `apps/api/api/metrics/plans-generated.ts` fetches Umami events to count `plan_generated` and returns `{ count, days, updatedAt }`.

### Environment variables
- Docs reference `UMAMI_API_KEY`, `UMAMI_WEBSITE_ID`, and optional `UMAMI_API_ENDPOINT` for the Vercel API (`docs/README.md`).

## Issues found
- None. The serverless API uses `https://api.umami.is/v1`, includes the `x-umami-api-key` header, paginates, filters on `eventType === 2`, and reads website configuration from env.
