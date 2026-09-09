import type { CounterStore } from './planCounter.js';

type UpstashResult = { result?: unknown; error?: string };

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Minimal Upstash Redis REST client (https://upstash.com/docs/redis/features/restapi).
// Uses fetch directly so the serverless function has no runtime dependencies.
export const createUpstashStore = (baseUrl: string, token: string): CounterStore => {
  const url = baseUrl.replace(/\/$/, '');

  const send = async <T>(path: string, body: unknown): Promise<T> => {
    const response = await fetch(`${url}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Upstash request failed: ${response.status} ${text.slice(0, 200)}`);
    }
    return (await response.json()) as T;
  };

  return {
    incr: async (keys) => {
      if (keys.length === 0) {
        return;
      }
      await send<UpstashResult[]>('/pipeline', keys.map((key) => ['INCR', key]));
    },
    mget: async (keys) => {
      const payload = await send<UpstashResult>('', ['MGET', ...keys]);
      const result = Array.isArray(payload.result) ? payload.result : [];
      return keys.map((_, index) => toNumber(result[index]));
    }
  };
};

export const createUpstashStoreFromEnv = (): CounterStore | null => {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  return createUpstashStore(url, token);
};
