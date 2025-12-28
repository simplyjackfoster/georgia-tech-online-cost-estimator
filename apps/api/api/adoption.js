const WEBSITE_ID = 'ef415650-dc26-4445-a007-651d425fc764';
const UMAMI_BASE_URL = 'https://cloud.umami.is/api';

const getCorsOrigin = (origin) => {
  if (!origin) {
    return null;
  }
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('github.io')) {
      return url.origin;
    }
  } catch (error) {
    return null;
  }
  return null;
};

const extractCount = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 0;
  }
  const data = Array.isArray(payload.data) ? payload.data : [];
  const first = data[0];
  if (first && typeof first === 'object') {
    const total = Number(first.total ?? first.count);
    if (Number.isFinite(total)) {
      return total;
    }
  }
  if (typeof payload.count === 'number') {
    return payload.count;
  }
  return 0;
};

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const corsOrigin = getCorsOrigin(request.headers.origin);
  if (corsOrigin) {
    response.setHeader('Access-Control-Allow-Origin', corsOrigin);
  }

  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const apiKey = process.env.UMAMI_API_KEY;
  if (!apiKey) {
    response.status(500).json({ error: 'Missing UMAMI_API_KEY' });
    return;
  }

  try {
    const url = `${UMAMI_BASE_URL}/websites/${WEBSITE_ID}/events?eventName=plan_generated`;
    const umamiResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!umamiResponse.ok) {
      response.status(umamiResponse.status).json({ error: 'Failed to fetch adoption count' });
      return;
    }

    const data = await umamiResponse.json();
    const count = extractCount(data);
    response.status(200).json({ count });
  } catch (error) {
    response.status(500).json({ error: 'Unexpected error fetching adoption count' });
  }
}
