# Analytics Audit (Umami)

## Repository scan targets
- `umami`, `window.umami`, `track(`, `plan_generated`, `x-umami-api-key`, `api.umami.is`, `cloud.umami.is`

## Current implementation

### Tracking snippet location
- `apps/web/index.html` loads `https://cloud.umami.is/script.js` with `data-website-id="ef415650-dc26-4445-a007-651d425fc764"`.

### Event firing location
- `apps/web/src/hooks/usePlanState.ts` fires `window.umami?.track('plan_generated')` after `handleApplyDraft` updates state and the plan is deemed valid.

### Server-side Umami API usage
- `apps/api/api/adoption.ts` fetches Umami events to count `plan_generated` and returns `{ count }`.

### Environment variables
- Docs reference `UMAMI_API_KEY` for the Vercel API (`docs/README.md`).
- No mention of `UMAMI_WEBSITE_ID` (website ID is hard-coded in the API handler).

## Issues found
- **Incorrect API base URL**: `apps/api/api/adoption.ts` uses `https://cloud.umami.is/api` instead of `https://api.umami.is/v1`.
- **Incorrect auth header**: uses `Authorization: Bearer ...` instead of `x-umami-api-key`.
- **Mixed events returned**: `/events` responses include pageviews and custom events, but no `eventType` filtering.
- **No time window or pagination handling**: missing `startAt`, `endAt`, and pagination, which can lead to partial or inconsistent counts.
- **Hard-coded website ID**: server-side ID is fixed in code instead of being configurable via env.
