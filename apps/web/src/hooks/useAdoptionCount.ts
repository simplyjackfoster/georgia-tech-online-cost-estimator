import { useEffect, useMemo, useState } from 'react';

let cachedCount: number | null | undefined;
let cachedPromise: Promise<number | null> | null = null;

const normalizeCount = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return Math.max(0, Math.floor(value));
};

const fetchWithRetry = async (url: string): Promise<number | null> => {
  const fetchOnce = async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch adoption count');
    }
    const data = (await response.json()) as { count?: unknown };
    return normalizeCount(data?.count);
  };

  try {
    return await fetchOnce();
  } catch (error) {
    try {
      return await fetchOnce();
    } catch (retryError) {
      return null;
    }
  }
};

export const useAdoptionCount = () => {
  const adoptionUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
    return apiBaseUrl ? `${apiBaseUrl}/api/adoption` : '';
  }, []);
  const [count, setCount] = useState<number | null>(cachedCount ?? null);

  useEffect(() => {
    if (!adoptionUrl || typeof fetch !== 'function') {
      return;
    }

    if (cachedCount !== undefined) {
      setCount(cachedCount ?? null);
      return;
    }

    let isActive = true;

    const loadCount = async () => {
      const promise = cachedPromise ?? fetchWithRetry(adoptionUrl);
      if (!cachedPromise) {
        cachedPromise = promise;
      }

      try {
        const result = await promise;
        if (!isActive) {
          return;
        }
        cachedCount = result;
        setCount(result);
      } finally {
        cachedPromise = null;
      }
    };

    loadCount();

    return () => {
      isActive = false;
    };
  }, [adoptionUrl]);

  return count;
};
