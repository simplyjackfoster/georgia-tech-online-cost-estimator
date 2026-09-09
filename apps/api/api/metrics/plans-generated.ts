import { countPlans, parseDays, recordPlan, type CounterStore } from '../../lib/planCounter.js';
import { createUpstashStoreFromEnv } from '../../lib/upstashStore.js';

const CORS_ORIGIN = 'https://omscs.fyi';

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

type HandlerDeps = {
  getStore: () => CounterStore | null;
  now: () => Date;
};

const setCorsHeaders = (response: ApiResponse) => {
  response.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const queryParam = (request: ApiRequest, key: string): string | undefined => {
  const value = request.query?.[key];
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw !== undefined) {
    return raw;
  }
  if (request.url) {
    try {
      return new URL(request.url, 'http://localhost').searchParams.get(key) ?? undefined;
    } catch (error) {
      return undefined;
    }
  }
  return undefined;
};

export const createHandler =
  ({ getStore, now }: HandlerDeps) =>
  async (request: ApiRequest, response: ApiResponse) => {
    setCorsHeaders(response);

    if (request.method === 'OPTIONS') {
      response.status(204).end();
      return;
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const store = getStore();
    if (!store) {
      response.status(500).json({ error: 'Plan counter store not configured' });
      return;
    }

    try {
      if (request.method === 'POST') {
        await recordPlan(store, now());
        response.status(204).end();
        return;
      }

      response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      const days = parseDays(queryParam(request, 'days'));
      const includeSeries = queryParam(request, 'series') === '1';
      const { count, series } = await countPlans(store, days, now());

      response.status(200).json({
        count,
        days,
        updatedAt: now().toISOString(),
        ...(includeSeries && series ? { series } : {})
      });
    } catch (error) {
      console.error('plans-generated failed', error);
      response.status(500).json({ error: 'Unexpected error fetching plan metrics' });
    }
  };

export default createHandler({ getStore: createUpstashStoreFromEnv, now: () => new Date() });
