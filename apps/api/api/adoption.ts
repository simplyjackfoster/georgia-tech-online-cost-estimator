const WEBSITE_ID = 'ef415650-dc26-4445-a007-651d425fc764';
const UMAMI_BASE_URL = 'https://cloud.umami.is/api';
const CORS_ORIGIN = 'https://omscs.fyi';

const setCorsHeaders = (response: { setHeader: (key: string, value: string) => void }) => {
  response.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const extractCount = (payload: unknown): number => {
  if (!payload || typeof payload !== 'object') {
    return 0;
  }
  const data = Array.isArray((payload as { data?: unknown }).data)
    ? (payload as { data: unknown[] }).data
    : [];
  const first = data[0];
  if (first && typeof first === 'object') {
    const total = Number((first as { total?: number; count?: number }).total ?? (first as { count?: number }).count);
    if (Number.isFinite(total)) {
      return total;
    }
  }
  if (typeof (payload as { count?: number }).count === 'number') {
    return (payload as { count: number }).count;
  }
  return 0;
};

export default async function handler(
  request: { method?: string; headers: Record<string, string | string[] | undefined> },
  response: {
    status: (code: number) => { json: (payload: unknown) => void };
    setHeader: (key: string, value: string) => void;
    end: () => void;
  }
) {
  setCorsHeaders(response);

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
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

    const data = (await umamiResponse.json()) as unknown;
    const count = extractCount(data);
    response.status(200).json({ count });
  } catch (error) {
    response.status(500).json({ error: 'Unexpected error fetching adoption count' });
  }
}
