const DEFAULT_DAYS = 30;
const MAX_DAYS = 3650;
const KEY_PREFIX = 'plans:';
const TOTAL_KEY = `${KEY_PREFIX}total`;
const DAY_MS = 24 * 60 * 60 * 1000;

export type CounterStore = {
  incr: (keys: string[]) => Promise<void>;
  mget: (keys: string[]) => Promise<Array<number | null>>;
};

export type DaysWindow = number | 'all';

export type PlanCount = {
  count: number;
  series?: Array<{ date: string; count: number }>;
};

const isoDate = (date: Date): string => date.toISOString().slice(0, 10);

export const dayKey = (date: Date): string => `${KEY_PREFIX}${isoDate(date)}`;

export const recordPlan = async (store: CounterStore, now: Date): Promise<void> => {
  await store.incr([dayKey(now), TOTAL_KEY]);
};

export const countPlans = async (
  store: CounterStore,
  days: DaysWindow,
  now: Date
): Promise<PlanCount> => {
  if (days === 'all') {
    const [total] = await store.mget([TOTAL_KEY]);
    return { count: total ?? 0 };
  }

  const dates: Date[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    dates.push(new Date(now.getTime() - offset * DAY_MS));
  }
  const values = await store.mget(dates.map(dayKey));
  const series = dates.map((date, index) => ({
    date: isoDate(date),
    count: values[index] ?? 0
  }));
  const count = series.reduce((sum, entry) => sum + entry.count, 0);
  return { count, series };
};

export const parseDays = (raw: string | undefined): DaysWindow => {
  if (!raw) {
    return DEFAULT_DAYS;
  }
  if (raw.toLowerCase() === 'all') {
    return 'all';
  }
  const parsed = Math.floor(Number(raw));
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_DAYS;
  }
  return Math.min(parsed, MAX_DAYS);
};
