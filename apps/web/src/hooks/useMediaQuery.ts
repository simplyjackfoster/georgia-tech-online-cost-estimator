import { useEffect, useState } from 'react';

const matches = (query: string): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false;

/** Tracks a CSS media query; false in environments without matchMedia (tests). */
export const useMediaQuery = (query: string): boolean => {
  const [isMatch, setIsMatch] = useState(() => matches(query));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setIsMatch(event.matches);
    setIsMatch(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return isMatch;
};

/** Tailwind's `sm` breakpoint. */
export const useIsDesktop = () => useMediaQuery('(min-width: 640px)');
