import { afterEach, describe, expect, it, vi } from 'vitest';
import { createUpstashStore } from './upstashStore';

const URL = 'https://example.upstash.io';
const TOKEN = 'secret-token';

type Call = { url: string; init: RequestInit };

const stubFetch = (responses: Array<{ status?: number; body: unknown }>) => {
  const calls: Call[] = [];
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const next = responses.shift() ?? { body: {} };
    return new Response(JSON.stringify(next.body), {
      status: next.status ?? 200,
      headers: { 'content-type': 'application/json' }
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createUpstashStore', () => {
  it('incr sends a pipeline of INCR commands with bearer auth', async () => {
    const calls = stubFetch([{ body: [{ result: 1 }, { result: 7 }] }]);
    const store = createUpstashStore(URL, TOKEN);

    await store.incr(['plans:2026-09-09', 'plans:total']);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`${URL}/pipeline`);
    expect(calls[0].init.method).toBe('POST');
    expect(new Headers(calls[0].init.headers).get('authorization')).toBe(`Bearer ${TOKEN}`);
    expect(JSON.parse(String(calls[0].init.body))).toEqual([
      ['INCR', 'plans:2026-09-09'],
      ['INCR', 'plans:total']
    ]);
  });

  it('mget sends one MGET and converts string results to numbers', async () => {
    const calls = stubFetch([{ body: { result: ['3', null, '10'] } }]);
    const store = createUpstashStore(URL, TOKEN);

    const values = await store.mget(['a', 'b', 'c']);

    expect(values).toEqual([3, null, 10]);
    expect(calls[0].url).toBe(URL);
    expect(JSON.parse(String(calls[0].init.body))).toEqual(['MGET', 'a', 'b', 'c']);
  });

  it('throws on a non-2xx response', async () => {
    stubFetch([{ status: 401, body: { error: 'Unauthorized' } }]);
    const store = createUpstashStore(URL, TOKEN);

    await expect(store.mget(['a'])).rejects.toThrow(/401/);
  });

  it('strips a trailing slash from the base url', async () => {
    const calls = stubFetch([{ body: { result: [] } }]);
    const store = createUpstashStore(`${URL}/`, TOKEN);

    await store.mget([]);

    expect(calls[0].url).toBe(URL);
  });
});
