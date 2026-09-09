import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SELECTION } from '../lib/plan';
import { useShareLink } from './useShareLink';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useShareLink', () => {
  it('copies the share URL and reports copied, then resets', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const { result } = renderHook(() => useShareLink({ ...DEFAULT_SELECTION, residency: 'in-state' }));
    await act(async () => {
      await result.current.share();
    });

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('residency=in-state'));
    expect(result.current.shareStatus).toBe('copied');

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.shareStatus).toBe('idle');
  });

  it('falls back to opening the link when the clipboard is unavailable', async () => {
    const open = vi.fn();
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn(async () => { throw new Error('denied'); }) } });
    vi.stubGlobal('open', open);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const { result } = renderHook(() => useShareLink(DEFAULT_SELECTION));
    await act(async () => {
      await result.current.share();
    });

    expect(result.current.shareStatus).toBe('error');
    expect(open).toHaveBeenCalledWith(expect.stringContaining('program=omscs'), '_blank', 'noopener,noreferrer');
  });
});
