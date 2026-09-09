import { describe, expect, it } from 'vitest';
import { calculateFullDegree, calculatePerTerm, validateScenario } from './calc';
import { getPerCreditRate } from '../data/rates';

describe('calculatePerTerm', () => {
  it('defaults to out-of-state tuition', () => {
    expect(calculatePerTerm('omscs', 3).tuition).toBe(708);
  });

  it('calculates OMSCS 3 credits correctly', () => {
    const result = calculatePerTerm('omscs', 3, 'in-state');

    expect(result.tuition).toBe(681);
    expect(result.onlineLearningFee).toBe(212);
    expect(result.total).toBe(893);
  });

  it('calculates OMSCS 6 credits correctly', () => {
    const result = calculatePerTerm('omscs', 6, 'in-state');

    expect(result.tuition).toBe(1362);
    expect(result.onlineLearningFee).toBe(531);
    expect(result.total).toBe(1893);
  });

  it('calculates OMSA 6 credits correctly', () => {
    const result = calculatePerTerm('omsa', 6, 'in-state');

    expect(result.tuition).toBe(1980);
    expect(result.onlineLearningFee).toBe(531);
    expect(result.total).toBe(2511);
  });

  it('calculates OMSCSEC 3 credits correctly', () => {
    const result = calculatePerTerm('omscsec', 3, 'in-state');

    expect(result.tuition).toBe(1119);
    expect(result.onlineLearningFee).toBe(212);
    expect(result.total).toBe(1331);
  });

  it('handles edge credit values', () => {
    expect(calculatePerTerm('omscs', 1).onlineLearningFee).toBe(212);
    expect(calculatePerTerm('omscs', 3).onlineLearningFee).toBe(212);
    expect(calculatePerTerm('omscs', 4).onlineLearningFee).toBe(531);
    expect(calculatePerTerm('omscs', 21, 'in-state').tuition).toBe(4767);
  });

  it('returns zero totals for invalid inputs', () => {
    expect(calculatePerTerm('omsa', 0).total).toBe(0);
    expect(calculatePerTerm('omsa', Number.NaN).total).toBe(0);
  });

  it('uses the residency rate when provided', () => {
    expect(calculatePerTerm('omscs', 3, 'in-state').tuition).toBe(681);
    expect(calculatePerTerm('omscs', 3, 'out-of-state').tuition).toBe(708);
    expect(calculatePerTerm('omscs', 3, 'out-of-country').tuition).toBe(744);
    expect(calculatePerTerm('omsa', 3, 'out-of-state').tuition).toBe(1029);
    expect(calculatePerTerm('omscsec', 3, 'out-of-country').tuition).toBe(1218);
  });
});

describe('getPerCreditRate', () => {
  it('returns the Fall 2026 rate for each program and residency', () => {
    expect(getPerCreditRate('omscs', 'in-state')).toBe(227);
    expect(getPerCreditRate('omscs', 'out-of-state')).toBe(236);
    expect(getPerCreditRate('omscs', 'out-of-country')).toBe(248);
    expect(getPerCreditRate('omsa', 'in-state')).toBe(330);
    expect(getPerCreditRate('omsa', 'out-of-state')).toBe(343);
    expect(getPerCreditRate('omsa', 'out-of-country')).toBe(360);
    expect(getPerCreditRate('omscsec', 'in-state')).toBe(373);
    expect(getPerCreditRate('omscsec', 'out-of-state')).toBe(387);
    expect(getPerCreditRate('omscsec', 'out-of-country')).toBe(406);
  });
});

describe('calculateFullDegree', () => {
  it('calculates full degree totals with auto terms', () => {
    const result = calculateFullDegree('omscs', 30, 6, 0, true, 3, 'in-state');

    expect(result.numberOfTerms).toBe(5);
    expect(result.totalTuition).toBe(6810);
    expect(result.feePerTerm).toBe(531);
    expect(result.totalFees).toBe(2655);
    expect(result.totalCost).toBe(9465);
  });

  it('calculates full degree totals with manual terms', () => {
    const result = calculateFullDegree('omsa', 36, 3, 12, false, 2, 'in-state');

    expect(result.numberOfTerms).toBe(12);
    expect(result.totalTuition).toBe(11880);
    expect(result.feePerTerm).toBe(212);
    expect(result.totalFees).toBe(2544);
    expect(result.totalCost).toBe(14424);
  });

  it('applies residency to the full degree tuition', () => {
    const result = calculateFullDegree('omscs', 30, 6, 0, true, 3, 'out-of-state');

    expect(result.totalTuition).toBe(7080);
    expect(result.totalFees).toBe(2655);
    expect(result.totalCost).toBe(9735);
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
