# Umami Cloud

## API basics
- Base URL: `https://api.umami.is/v1`
- Auth header: `x-umami-api-key: $UMAMI_API_KEY`
- Custom events filter: `eventType === 2`

## Environment variables
- `UMAMI_API_KEY` (server-side only; never expose to the browser)
- `UMAMI_WEBSITE_ID` (website UUID from Umami Cloud)

## Verify locally
Run the verification script from the repo root:

```bash
UMAMI_API_KEY=... UMAMI_WEBSITE_ID=... pnpm umami:verify --event plan_generated --minutes 120
```

Output includes total events, unique sessions (deduped by `sessionId`), and the last five events with metadata.

## Common failure modes
- **Wrong base URL**: `https://cloud.umami.is/api` will not work for Cloud API calls.
- **Wrong auth header**: `Authorization: Bearer ...` is rejected; use `x-umami-api-key`.
- **Missing event filtering**: `/events` mixes pageviews and custom events; filter with `eventType === 2` and the correct `eventName`.
- **Client-side key leaks**: keep `UMAMI_API_KEY` on the server/CLI only.
