# Deployment Guide

## apps/web (GitHub Pages)
1. Install dependencies from the repo root:
   ```bash
   npm install
   ```
2. Build the web app:
   ```bash
   npm run build
   ```
3. Configure GitHub Pages to deploy the `apps/web/dist` folder (typically via a GitHub Actions workflow).
4. Set the following build-time environment variables for the GitHub Pages build:
   - `VITE_GITHUB_PAGES=true`
   - `VITE_GITHUB_PAGES_BASE=/georgia-tech-online-cost-estimator/` (adjust if the repo name changes)
   - `VITE_API_BASE_URL=https://<your-vercel-project>.vercel.app` (points the web app at the API)
   - `VITE_SOURCE_URL=https://github.com/<owner>/<repo>` (optional, for the trust card CTA)

## apps/api (Vercel)
1. Create a new Vercel project linked to this repo.
2. Set the project root directory to `apps/api`.
3. In the Vercel dashboard, add the **Upstash Redis** integration from the Marketplace (free tier) and connect it to the project. It injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. Deploy; the endpoint is available at `/api/metrics/plans-generated`.

### Endpoint reference
- `POST /api/metrics/plans-generated` — increments today's counter and the lifetime total. Returns `204`.
- `GET /api/metrics/plans-generated?days=30` — `{ count, days, updatedAt }` for the last N days (max 3650).
- `GET ...?days=all` — lifetime total.
- `GET ...?days=365&series=1` — adds `series: [{ date, count }]`, one entry per UTC day, oldest first.

### Data model (Upstash Redis)
- `plans:YYYY-MM-DD` — integer per UTC day, never expires.
- `plans:total` — lifetime integer.

## Local verification
- Run the API tests: `npm --workspace apps/api run test:run`.
- Against production:
  ```bash
  curl -X POST "https://<your-vercel-project>.vercel.app/api/metrics/plans-generated" -i
  curl "https://<your-vercel-project>.vercel.app/api/metrics/plans-generated?days=30"
  ```
- Responses should include `{ count, days, updatedAt }`.
