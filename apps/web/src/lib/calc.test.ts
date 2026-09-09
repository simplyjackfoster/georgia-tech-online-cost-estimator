import { describe, expect, it } from 'vitest';
import { calculateFullDegree, calculateTermCost, getOnlineLearningFee, roundCents } from './calc';
import { FALL_2026_RATES, getPerCreditRate, type RateTable } from '../data/rates';

const TEST_RATES: RateTable = {
  ...FALL_2026_RATES,
  label: 'Test',
  perCredit: {
    ...FALL_2026_RATES.perCredit,
    omscs: { 'in-state': 100, 'out-of-state': 200, 'out-of-country': 300 }
  },
  onlineLearningFee: { thresholdCredits: 4, belowThresholdFee: 10, atOrAboveThresholdFee: 50 }
};

describe('roundCents', () => {
  it('rounds to two decimals', () => {
    expect(roundCents(1.005)).toBe(1);
    expect(roundCents(2.345)).toBe(2.35);
    expect(roundCents(10)).toBe(10);
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

  it('defaults to out-of-state', () => {
    expect(getPerCreditRate('omscs')).toBe(236);
  });

  it('reads from an injected rate table', () => {
    expect(getPerCreditRate('omscs', 'in-state', TEST_RATES)).toBe(100);
  });
});

describe('getOnlineLearningFee', () => {
  it('charges the lower fee below the credit threshold', () => {
    expect(getOnlineLearningFee(1)).toBe(212);
    expect(getOnlineLearningFee(3)).toBe(212);
    expect(getOnlineLearningFee(4)).toBe(531);
    expect(getOnlineLearningFee(9)).toBe(531);
  });

  it('returns zero for no credits', () => {
    expect(getOnlineLearningFee(0)).toBe(0);
    expect(getOnlineLearningFee(Number.NaN)).toBe(0);
  });
});

describe('calculateTermCost', () => {
  it('sums tuition and fee for a term', () => {
    expect(calculateTermCost('omscs', 3, 'in-state')).toEqual({ tuition: 681, fee: 212, total: 893 });
    expect(calculateTermCost('omsa', 6, 'in-state')).toEqual({ tuition: 1980, fee: 531, total: 2511 });
  });

  it('defaults to out-of-state', () => {
    expect(calculateTermCost('omscs', 3).tuition).toBe(708);
  });

  it('returns zero totals for invalid inputs', () => {
    expect(calculateTermCost('omsa', 0).total).toBe(0);
    expect(calculateTermCost('omsa', Number.NaN).total).toBe(0);
  });

  it('uses an injected rate table', () => {
    expect(calculateTermCost('omscs', 3, 'out-of-country', TEST_RATES)).toEqual({
      tuition: 900,
      fee: 10,
      total: 910
    });
  });
});

describe('calculateFullDegree', () => {
  it('uses the program degree credits by default', () => {
    const result = calculateFullDegree({ programKey: 'omscs', creditsPerTerm: 6, residency: 'in-state' });

    expect(result.numberOfTerms).toBe(5);
    expect(result.totalTuition).toBe(6810);
    expect(result.feePerTerm).toBe(531);
    expect(result.totalFees).toBe(2655);
    expect(result.totalCost).toBe(9465);
    expect(result.averagePerTerm).toBe(1893);
  });

  it('rounds partial terms up', () => {
    const result = calculateFullDegree({ programKey: 'omsa', creditsPerTerm: 9, residency: 'in-state' });

    expect(result.numberOfTerms).toBe(4);
    expect(result.totalTuition).toBe(11880);
  });

  it('defaults to out-of-state tuition', () => {
    const result = calculateFullDegree({ programKey: 'omscs', creditsPerTerm: 6 });

    expect(result.totalTuition).toBe(7080);
    expect(result.totalCost).toBe(9735);
  });

  it('accepts an explicit credit total', () => {
    expect(
      calculateFullDegree({ programKey: 'omscs', creditsPerTerm: 3, residency: 'in-state', totalCredits: 6 })
        .numberOfTerms
    ).toBe(2);
  });

  it('returns empty totals for invalid inputs', () => {
    expect(calculateFullDegree({ programKey: 'omsa', creditsPerTerm: 0 }).numberOfTerms).toBe(0);
    expect(calculateFullDegree({ programKey: 'omsa', creditsPerTerm: 3, totalCredits: 0 }).totalCost).toBe(0);
  });

  it('uses an injected rate table', () => {
    const result = calculateFullDegree(
      { programKey: 'omscs', creditsPerTerm: 6, residency: 'out-of-state' },
      TEST_RATES
    );

    expect(result.totalTuition).toBe(6000);
    expect(result.totalFees).toBe(250);
  });
});
