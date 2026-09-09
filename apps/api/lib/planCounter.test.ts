import { describe, expect, it } from 'vitest';
import { countPlans, dayKey, parseDays, recordPlan, type CounterStore } from './planCounter';

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

describe('dayKey', () => {
  it('formats a UTC date as plans:YYYY-MM-DD', () => {
    expect(dayKey(new Date('2026-09-09T23:59:59Z'))).toBe('plans:2026-09-09');
  });

  it('uses the UTC day, not local time', () => {
    expect(dayKey(new Date('2026-03-01T00:30:00Z'))).toBe('plans:2026-03-01');
  });
});

describe('recordPlan', () => {
  it('increments today and the lifetime total', async () => {
    const { store, values } = createMemoryStore({ 'plans:total': 5 });

    await recordPlan(store, new Date('2026-09-09T12:00:00Z'));

    expect(values.get('plans:2026-09-09')).toBe(1);
    expect(values.get('plans:total')).toBe(6);
  });
});

describe('countPlans', () => {
  it('sums the last N days including today', async () => {
    const { store } = createMemoryStore({
      'plans:2026-09-09': 3,
      'plans:2026-09-08': 2,
      'plans:2026-09-07': 10
    });

    const result = await countPlans(store, 2, new Date('2026-09-09T12:00:00Z'));

    expect(result.count).toBe(5);
  });

  it('returns a per-day series oldest first with zeros for missing days', async () => {
    const { store } = createMemoryStore({ 'plans:2026-09-09': 3 });

    const result = await countPlans(store, 3, new Date('2026-09-09T12:00:00Z'));

    expect(result.series).toEqual([
      { date: '2026-09-07', count: 0 },
      { date: '2026-09-08', count: 0 },
      { date: '2026-09-09', count: 3 }
    ]);
  });

  it('returns the lifetime total for "all"', async () => {
    const { store } = createMemoryStore({ 'plans:total': 42, 'plans:2026-09-09': 3 });

    const result = await countPlans(store, 'all', new Date('2026-09-09T12:00:00Z'));

    expect(result.count).toBe(42);
    expect(result.series).toBeUndefined();
  });
});

describe('parseDays', () => {
  it('defaults to 30', () => {
    expect(parseDays(undefined)).toBe(30);
    expect(parseDays('')).toBe(30);
    expect(parseDays('abc')).toBe(30);
    expect(parseDays('0')).toBe(30);
  });

  it('parses integers and caps at 3650', () => {
    expect(parseDays('7')).toBe(7);
    expect(parseDays('7.9')).toBe(7);
    expect(parseDays('99999')).toBe(3650);
  });

  it('accepts "all"', () => {
    expect(parseDays('all')).toBe('all');
    expect(parseDays('ALL')).toBe('all');
  });
});
