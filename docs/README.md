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
   - `GITHUB_PAGES=true`
   - `GITHUB_PAGES_BASE=/georgia-tech-online-cost-estimator/` (adjust if the repo name changes)
   - `VITE_API_BASE_URL=https://<your-vercel-project>.vercel.app` (points the web app at the API)
   - `VITE_SOURCE_URL=https://github.com/<owner>/<repo>` (optional, for the trust card CTA)

## apps/api (Vercel)
1. Create a new Vercel project linked to this repo.
2. Set the project root directory to `apps/api`.
3. Add the environment variable `UMAMI_API_KEY` in the Vercel dashboard.
4. Deploy; the API endpoint will be available at `/api/adoption`.
