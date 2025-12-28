import { describe, expect, it } from 'vitest';
import { calculateFullDegree, calculatePerTerm, validateScenario } from './calc';

describe('calculatePerTerm', () => {
  it('calculates OMSCS 3 credits correctly', () => {
    const result = calculatePerTerm('omscs', 3);

    expect(result.tuition).toBe(675);
    expect(result.onlineLearningFee).toBe(176);
    expect(result.total).toBe(851);
  });

  it('calculates OMSCS 6 credits correctly', () => {
    const result = calculatePerTerm('omscs', 6);

    expect(result.tuition).toBe(1350);
    expect(result.onlineLearningFee).toBe(440);
    expect(result.total).toBe(1790);
  });

  it('calculates OMSA 6 credits correctly', () => {
    const result = calculatePerTerm('omsa', 6);

    expect(result.tuition).toBe(1962);
    expect(result.onlineLearningFee).toBe(440);
    expect(result.total).toBe(2402);
  });

  it('calculates OMSCSEC 3 credits correctly', () => {
    const result = calculatePerTerm('omscsec', 3);

    expect(result.tuition).toBe(1107);
    expect(result.onlineLearningFee).toBe(176);
    expect(result.total).toBe(1283);
  });

  it('handles edge credit values', () => {
    expect(calculatePerTerm('omscs', 1).onlineLearningFee).toBe(176);
    expect(calculatePerTerm('omscs', 3).onlineLearningFee).toBe(176);
    expect(calculatePerTerm('omscs', 4).onlineLearningFee).toBe(440);
    expect(calculatePerTerm('omscs', 21).tuition).toBe(4725);
  });

  it('returns zero totals for invalid inputs', () => {
    expect(calculatePerTerm('omsa', 0).total).toBe(0);
    expect(calculatePerTerm('omsa', Number.NaN).total).toBe(0);
  });
});

describe('calculateFullDegree', () => {
  it('calculates full degree totals with auto terms', () => {
    const result = calculateFullDegree('omscs', 30, 6, 0, true, 3);

    expect(result.numberOfTerms).toBe(5);
    expect(result.totalTuition).toBe(6750);
    expect(result.feePerTerm).toBe(440);
    expect(result.totalFees).toBe(2200);
    expect(result.totalCost).toBe(8950);
  });

  it('calculates full degree totals with manual terms', () => {
    const result = calculateFullDegree('omsa', 36, 3, 12, false, 2);

    expect(result.numberOfTerms).toBe(12);
    expect(result.totalTuition).toBe(11772);
    expect(result.feePerTerm).toBe(176);
    expect(result.totalFees).toBe(2112);
    expect(result.totalCost).toBe(13884);
  });

  it('handles invalid inputs in full degree mode', () => {
    const result = calculateFullDegree('omsa', 36, 0, 0, true, 3);

    expect(result.numberOfTerms).toBe(0);
    expect(result.totalFees).toBe(0);
  });
});

describe('validateScenario', () => {
  it('rejects invalid per-term credits', () => {
    const errors = validateScenario(
      {
        id: 'a',
        label: 'Fall',
        programKey: 'omscs',
        credits: 0,
        creditsPerTerm: 3,
        terms: 5,
        useAutoTerms: true,
        termsPerYear: 3
      },
      'per-term'
    );

    expect(errors.creditsError).toBeDefined();
  });

  it('accepts normal per-term credits', () => {
    const errors = validateScenario(
      {
        id: 'b',
        label: 'Fall',
        programKey: 'omsa',
        credits: 3,
        creditsPerTerm: 6,
        terms: 6,
        useAutoTerms: false,
        termsPerYear: 3
      },
      'per-term'
    );

    expect(errors).toEqual({});
  });

  it('validates full-degree terms when auto is off', () => {
    const errors = validateScenario(
      {
        id: 'c',
        label: 'Plan A',
        programKey: 'omscsec',
        credits: 3,
        creditsPerTerm: 3,
        terms: 0,
        useAutoTerms: false,
        termsPerYear: 2
      },
      'full-degree'
    );

    expect(errors.termsError).toBeDefined();
  });
});
