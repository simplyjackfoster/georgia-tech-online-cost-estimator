import { useEffect, useMemo, useState } from 'react';

const CACHE_TTL_MS = 2 * 60 * 1000;
const DEFAULT_DAYS = 30;

type PlansGeneratedResponse = {
  count?: unknown;
  days?: unknown;
  updatedAt?: unknown;
};

type CacheEntry = {
  count: number | null;
  status: 'success' | 'error';
  days: number;
  timestamp: number;
};

let cachedResult: CacheEntry | null = null;
let cachedPromise: Promise<CacheEntry> | null = null;

const normalizeCount = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return Math.max(0, Math.floor(value));
};

const fetchWithRetry = async (url: string, days: number): Promise<CacheEntry> => {
  const fetchOnce = async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch plans generated count');
    }
    const data = (await response.json()) as PlansGeneratedResponse;
    const count = normalizeCount(data?.count);
    if (count === null) {
      throw new Error('Invalid plans generated count');
    }
    const responseDays = normalizeCount(data?.days) ?? days;
    return {
      count,
      status: 'success' as const,
      days: responseDays,
      timestamp: Date.now()
    };
  };

  try {
    return await fetchOnce();
  } catch (error) {
    try {
      return await fetchOnce();
    } catch (retryError) {
      return {
        count: null,
        status: 'error',
        days,
        timestamp: Date.now()
      };
    }
  }
};

const isCacheFresh = (entry: CacheEntry | null, days: number) => {
  if (!entry) {
    return false;
  }
  if (entry.days !== days) {
    return false;
  }
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
};

export const usePlansGeneratedCount = (days: number = DEFAULT_DAYS) => {
  const metricsUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
    return apiBaseUrl
      ? `${apiBaseUrl}/api/metrics/plans-generated?days=${days}`
      : '';
  }, [days]);
  const initialCache = isCacheFresh(cachedResult, days) ? cachedResult : null;
  const [count, setCount] = useState<number | null>(initialCache?.count ?? null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    initialCache?.status ?? 'loading'
  );

  useEffect(() => {
    if (!metricsUrl || typeof fetch !== 'function') {
      return;
    }

    if (isCacheFresh(cachedResult, days)) {
      setCount(cachedResult?.count ?? null);
      setStatus(cachedResult?.status ?? 'loading');
      return;
    }

    let isActive = true;

    const loadCount = async () => {
      setStatus('loading');
      const promise = cachedPromise ?? fetchWithRetry(metricsUrl, days);
      if (!cachedPromise) {
        cachedPromise = promise;
      }

      try {
        const result = await promise;
        if (!isActive) {
          return;
        }
        cachedResult = result;
        setCount(result.count);
        setStatus(result.status);
      } finally {
        cachedPromise = null;
      }
    };

    loadCount();

    return () => {
      isActive = false;
    };
  }, [metricsUrl, days]);

  return { count, status, days };
};
