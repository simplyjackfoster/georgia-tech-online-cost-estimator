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
3. Add the environment variables `UMAMI_API_KEY`, `UMAMI_WEBSITE_ID`, and (optionally) `UMAMI_API_ENDPOINT` in the Vercel dashboard.
4. Deploy; the API endpoint will be available at `/api/metrics/plans-generated`.

### Why server-side analytics
- The Umami Cloud API key must remain secret; client-side requests would expose it.
- The serverless API handles authentication, pagination, and filtering so the browser only receives aggregate counts.

## Umami Cloud verification
- See `docs/UMAMI_CLOUD.md` for the API base URL, auth header, and verification steps.

## Local verification
- Start the API locally (ex: `npm --workspace apps/api run dev`) with the Umami env vars set.
- Verify the endpoint responds with a count:
  ```bash
  curl \"http://localhost:3000/api/metrics/plans-generated?days=30\"\n  ```
- Responses should include `{ count, days, updatedAt }`.
