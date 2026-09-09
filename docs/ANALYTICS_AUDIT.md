# Analytics Audit

## Repository scan targets
- `umami`, `window.umami`, `track(`, `plan_generated`, `plans-generated`, `KV_REST_API`

## Current implementation

### Umami (dashboard only)
- `apps/web/index.html` loads `https://cloud.umami.is/script.js` with the site's `data-website-id`.
- `apps/web/src/lib/metrics.ts` → `reportPlanGenerated()` fires `window.umami?.track('plan_generated')`.
- Umami is used purely for the hosted dashboard (countries, devices, referrers). Nothing reads Umami data back: Umami Cloud gates its API behind the Pro plan.

### Plan counter (usage metric shown on the site)
- Same `reportPlanGenerated()` also POSTs to `${VITE_API_BASE_URL}/api/metrics/plans-generated` (fire-and-forget, `keepalive`).
- `apps/api/api/metrics/plans-generated.ts` stores counts in Upstash Redis via its REST API (`apps/api/lib/upstashStore.ts`, no npm dependency):
  - `plans:YYYY-MM-DD` (UTC) — one integer per day, kept forever
  - `plans:total` — lifetime count
- `GET ?days=N` (default 30, max 3650) returns `{ count, days, updatedAt }`; `?days=all` returns the lifetime total; `&series=1` adds `[{ date, count }]` per day for long-term analysis.
- `apps/web/src/hooks/usePlansGeneratedCount.ts` fetches `days=30` for the trust card.

### Environment variables
- Vercel (injected by the Upstash Marketplace integration): `KV_REST_API_URL`, `KV_REST_API_TOKEN` (`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` also accepted).
- GitHub Pages build: `VITE_API_BASE_URL`.

## Known limitations
- The POST endpoint is unauthenticated; the count is a vanity metric and can be inflated by anyone with `curl`.
- History before 2026-09 lived in a Umami account that is no longer accessible; the counter starts from zero.
