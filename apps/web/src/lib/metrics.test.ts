import { afterEach, describe, expect, it, vi } from 'vitest';
import { reportPlanGenerated } from './metrics';

afterEach(() => {
  vi.unstubAllGlobals();
  delete window.umami;
});

describe('reportPlanGenerated', () => {
  it('tracks the Umami event when the script is present', () => {
    const track = vi.fn();
    window.umami = { track };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })));

    reportPlanGenerated('https://api.example.com/');

    expect(track).toHaveBeenCalledWith('plan_generated');
  });

  it('POSTs a keepalive ping to the plans-generated endpoint', () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    reportPlanGenerated('https://api.example.com/');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/metrics/plans-generated',
      expect.objectContaining({ method: 'POST', keepalive: true })
    );
  });

  it('skips the ping when no API base URL is configured', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    reportPlanGenerated('');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('swallows ping failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      })
    );

    expect(() => reportPlanGenerated('https://api.example.com')).not.toThrow();
    await Promise.resolve();
  });
});
