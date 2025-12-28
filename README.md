# Georgia Tech Online Program Cost Estimator

This repository is a monorepo with:

- `apps/web`: The OMSCS tuition + fee calculator (Vite + React).
- `apps/api`: A Vercel serverless API that proxies Umami adoption counts.

## Quick Start
```bash
npm install
npm run dev
```

## Workspaces
- Run web-specific commands: `npm --workspace apps/web run <script>`
- Run API-specific commands: `npm --workspace apps/api run <script>`

## Analytics + Adoption Counter
- The GitHub Pages frontend (`https://omscs.fyi`) calls the Vercel serverless API for Umami data.
- The Vercel API (`apps/api`) holds the `UMAMI_API_KEY` secret and proxies the Umami Cloud endpoint with edge caching.

### Vercel Environment Variables
Set `UMAMI_API_KEY` in the Vercel project for `apps/api` to authorize requests to Umami Cloud.

## Documentation
- Deployment details live in `docs/README.md`.
