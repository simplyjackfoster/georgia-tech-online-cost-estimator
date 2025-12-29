const DEFAULT_DAYS = 30;
const MAX_DAYS = 365;
const PAGE_SIZE = 200;
const MAX_PAGES = 200;

const CORS_ORIGIN = 'https://omscs.fyi';
const EVENT_NAME = 'plan_generated';
const EVENT_TYPE_CUSTOM = 2;

type UmamiEvent = {
  createdAt?: number;
  eventName?: string;
  eventType?: number;
  sessionId?: string;
};

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type ApiResponse = {
  status: (code: number) => { json: (payload: unknown) => void; end: () => void };
  setHeader: (key: string, value: string) => void;
  end: () => void;
};

const setCorsHeaders = (response: ApiResponse) => {
  response.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const parseDays = (request: ApiRequest): number => {
  const queryDays = request.query?.days;
  const raw = Array.isArray(queryDays) ? queryDays[0] : queryDays;

  if (raw && Number.isFinite(Number(raw))) {
    const parsed = Math.floor(Number(raw));
    if (parsed >= 1) {
      return Math.min(parsed, MAX_DAYS);
    }
  }

  if (request.url) {
    try {
      const url = new URL(request.url, 'http://localhost');
      const param = url.searchParams.get('days');
      if (param && Number.isFinite(Number(param))) {
        const parsed = Math.floor(Number(param));
        if (parsed >= 1) {
          return Math.min(parsed, MAX_DAYS);
        }
      }
    } catch (error) {
      return DEFAULT_DAYS;
    }
  }

  return DEFAULT_DAYS;
};

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
  apiEndpoint: string,
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
  const url = `${apiEndpoint.replace(/\/$/, '')}/websites/${websiteId}/events?${params.toString()}`;
  const umamiResponse = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-umami-api-key': apiKey
    }
  });

  if (!umamiResponse.ok) {
    throw new Error('Failed to fetch Umami events');
  }

  const data = (await umamiResponse.json()) as unknown;
  return extractEvents(data);
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
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
  const websiteId = process.env.UMAMI_WEBSITE_ID;
  const apiEndpoint = process.env.UMAMI_API_ENDPOINT ?? 'https://api.umami.is/v1';

  if (!apiKey || !websiteId) {
    response.status(500).json({ error: 'Missing Umami configuration' });
    return;
  }

  const days = parseDays(request);
  const endAt = Date.now();
  const startAt = endAt - days * 24 * 60 * 60 * 1000;

  try {
    let page = 1;
    let total = 0;

    while (page <= MAX_PAGES) {
      const events = await fetchEventsPage(apiKey, apiEndpoint, websiteId, page, startAt, endAt);
      if (events.length === 0) {
        break;
      }

      total += events.filter(
        (event) => event.eventType === EVENT_TYPE_CUSTOM && event.eventName === EVENT_NAME
      ).length;

      if (events.length < PAGE_SIZE) {
        break;
      }
      page += 1;
    }

    response.status(200).json({
      count: total,
      days,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    response.status(500).json({ error: 'Unexpected error fetching plan metrics' });
  }
}
