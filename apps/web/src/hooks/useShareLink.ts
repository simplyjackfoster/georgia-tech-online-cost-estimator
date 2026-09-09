import { useCallback, useEffect, useRef, useState } from 'react';
import { buildShareUrl, type PlanSelection } from '../lib/plan';

export type ShareStatus = 'idle' | 'copied' | 'error';

const RESET_DELAY_MS = 2000;

/** Copies a share link for the given selection and reports transient status. */
export const useShareLink = (selection: PlanSelection) => {
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  const resetTimer = useRef<number | null>(null);

  const scheduleReset = useCallback(() => {
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => setShareStatus('idle'), RESET_DELAY_MS);
  }, []);

  useEffect(
    () => () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
      }
    },
    []
  );

  const share = useCallback(async () => {
    const url = buildShareUrl(selection);
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
    } catch (error) {
      console.error('Clipboard unavailable', error);
      setShareStatus('error');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    scheduleReset();
  }, [scheduleReset, selection]);

  return { shareStatus, share };
};
