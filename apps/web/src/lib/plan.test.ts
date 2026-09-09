import { describe, expect, it } from 'vitest';
import { buildShareUrl, calculateMixedPlan, resolveStartTerm } from './plan';

describe('calculateMixedPlan', () => {
  const startTerm = resolveStartTerm('fall-2026');
  const rows = [
    { id: 'row-1', terms: 2, creditsPerTerm: 3 },
    { id: 'row-2', terms: 4, creditsPerTerm: 6 }
  ];

  it('defaults to out-of-state tuition', () => {
    const result = calculateMixedPlan('omscs', 30, startTerm, rows);

    expect(result.totalTuition).toBe(7080);
    expect(result.numberOfTerms).toBe(6);
  });

  it('uses in-state tuition when requested', () => {
    expect(calculateMixedPlan('omscs', 30, startTerm, rows, 'in-state').totalTuition).toBe(6810);
  });

  it('applies the residency rate to every scheduled term', () => {
    const result = calculateMixedPlan('omscs', 30, startTerm, rows, 'out-of-country');

    expect(result.totalTuition).toBe(7440);
    expect(result.schedule[0].tuition).toBe(744);
    expect(result.schedule[2].tuition).toBe(1488);
  });
});

describe('buildShareUrl', () => {
  it('includes residency in the share link', () => {
    const url = new URL(buildShareUrl('omscs', 'fall-2026', 6, 'constant', [], 'out-of-state'));

    expect(url.searchParams.get('residency')).toBe('out-of-state');
    expect(url.searchParams.get('program')).toBe('omscs');
  });
});
