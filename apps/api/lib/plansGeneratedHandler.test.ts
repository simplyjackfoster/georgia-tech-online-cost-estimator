import { describe, expect, it } from 'vitest';
import { createHandler } from '../api/metrics/plans-generated.js';
import type { CounterStore } from './planCounter.js';

const NOW = new Date('2026-09-09T12:00:00Z');

const createMemoryStore = (initial: Record<string, number> = {}) => {
  const values = new Map<string, number>(Object.entries(initial));
  const store: CounterStore = {
    incr: async (keys) => {
      for (const key of keys) {
        values.set(key, (values.get(key) ?? 0) + 1);
      }
    },
    mget: async (keys) => keys.map((key) => values.get(key) ?? null)
  };
  return { store, values };
};

const createResponse = () => {
  const headers: Record<string, string> = {};
  const state: { status?: number; body?: unknown } = {};
  const response = {
    setHeader: (key: string, value: string) => {
      headers[key] = value;
    },
    status: (code: number) => {
      state.status = code;
      return {
        json: (payload: unknown) => {
          state.body = payload;
        },
        end: () => undefined
      };
    },
    end: () => undefined
  };
  return { response, headers, state };
};

const run = async (
  method: string,
  query: Record<string, string> = {},
  store: CounterStore | null = createMemoryStore().store
) => {
  const handler = createHandler({ getStore: () => store, now: () => NOW });
  const { response, headers, state } = createResponse();
  await handler({ method, headers: {}, query }, response);
  return { headers, state };
};

describe('plans-generated handler', () => {
  it('POST records a plan and returns 204', async () => {
    const { store, values } = createMemoryStore();

    const { state } = await run('POST', {}, store);

    expect(state.status).toBe(204);
    expect(values.get('plans:2026-09-09')).toBe(1);
    expect(values.get('plans:total')).toBe(1);
  });

  it('GET returns the rolling count in the shape the frontend expects', async () => {
    const { store } = createMemoryStore({ 'plans:2026-09-09': 2, 'plans:2026-09-08': 3 });

    const { state, headers } = await run('GET', { days: '30' }, store);

    expect(state.status).toBe(200);
    expect(state.body).toMatchObject({ count: 5, days: 30 });
    expect((state.body as { updatedAt: string }).updatedAt).toBe(NOW.toISOString());
    expect((state.body as { series?: unknown }).series).toBeUndefined();
    expect(headers['Cache-Control']).toContain('s-maxage');
  });

  it('GET includes a daily series when series=1', async () => {
    const { store } = createMemoryStore({ 'plans:2026-09-09': 2 });

    const { state } = await run('GET', { days: '2', series: '1' }, store);

    expect((state.body as { series: unknown }).series).toEqual([
      { date: '2026-09-08', count: 0 },
      { date: '2026-09-09', count: 2 }
    ]);
  });

  it('GET days=all returns the lifetime total', async () => {
    const { store } = createMemoryStore({ 'plans:total': 99 });

    const { state } = await run('GET', { days: 'all' }, store);

    expect(state.body).toMatchObject({ count: 99, days: 'all' });
  });

  it('OPTIONS returns 204 with CORS headers', async () => {
    const { state, headers } = await run('OPTIONS');

    expect(state.status).toBe(204);
    expect(headers['Access-Control-Allow-Origin']).toBe('https://omscs.fyi');
    expect(headers['Access-Control-Allow-Methods']).toContain('POST');
  });

  it('rejects other methods with 405', async () => {
    const { state } = await run('DELETE');

    expect(state.status).toBe(405);
  });

  it('returns 500 when the store is not configured', async () => {
    const { state } = await run('GET', {}, null);

    expect(state.status).toBe(500);
    expect(state.body).toMatchObject({ error: expect.stringMatching(/not configured/i) });
  });
});
