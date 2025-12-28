const DEFAULT_WEBSITE_ID = 'ef415650-dc26-4445-a007-651d425fc764';
const UMAMI_BASE_URL = 'https://api.umami.is/v1';
const CORS_ORIGIN = 'https://omscs.fyi';
const EVENT_NAME = 'plan_generated';
const PAGE_SIZE = 200;
const MAX_PAGES = 100;

type UmamiEvent = {
  createdAt?: number;
  eventName?: string;
  eventType?: number;
  sessionId?: string;
};

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

const getWebsiteId = (): string => process.env.UMAMI_WEBSITE_ID ?? DEFAULT_WEBSITE_ID;

const extractEvents = (payload: unknown): UmamiEvent[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter((item): item is UmamiEvent => typeof item === 'object' && item !== null);
};

const fetchEventsPage = async (
  apiKey: string,
  websiteId: string,
  page: number,
  startAt: number,
  endAt: number
): Promise<UmamiEvent[]> => {
  const params = new URLSearchParams({
    startAt: String(startAt),
    endAt: String(endAt),
    page: String(page),
    pageSize: String(PAGE_SIZE)
  });
  const url = `${UMAMI_BASE_URL}/websites/${websiteId}/events?${params.toString()}`;
  const umamiResponse = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-umami-api-key': apiKey
    }
  });

  if (!umamiResponse.ok) {
    throw new Error('Failed to fetch adoption count');
  }

  const data = (await umamiResponse.json()) as unknown;
  return extractEvents(data);
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
    const websiteId = getWebsiteId();
    const endAt = Date.now();
    const startAt = 0;
    let page = 1;
    let total = 0;
    while (page <= MAX_PAGES) {
      const events = await fetchEventsPage(apiKey, websiteId, page, startAt, endAt);
      if (events.length === 0) {
        break;
      }
      total += events.filter(
        (event) => event.eventType === 2 && event.eventName === EVENT_NAME
      ).length;
      if (events.length < PAGE_SIZE) {
        break;
      }
      page += 1;
    }
    const count = Number.isFinite(total) ? total : extractCount({ count: total });
    response.status(200).json({ count });
  } catch (error) {
    response.status(500).json({ error: 'Unexpected error fetching adoption count' });
  }
}
