import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SELECTION,
  buildPaceRows,
  buildShareQuery,
  buildTermLabel,
  calculateMixedPlan,
  getFinishTerm,
  parseSelection,
  resolvePlan,
  resolveStartTerm,
  type PlanSelection
} from './plan';

const fall2026 = resolveStartTerm('fall-2026');

const selection = (overrides: Partial<PlanSelection> = {}): PlanSelection => ({
  ...DEFAULT_SELECTION,
  ...overrides
});

describe('term arithmetic', () => {
  it('advances Spring → Summer → Fall across years', () => {
    expect(buildTermLabel(fall2026, 0)).toBe('Fall 2026');
    expect(buildTermLabel(fall2026, 1)).toBe('Spring 2027');
    expect(buildTermLabel(fall2026, 3)).toBe('Fall 2027');
  });

  it('finish term is the start term for a one-term plan', () => {
    expect(getFinishTerm(fall2026, 1)).toEqual(fall2026);
    expect(getFinishTerm(fall2026, 5).label).toBe('Spring 2028');
  });

  it('falls back to the default start term for unknown keys', () => {
    expect(resolveStartTerm('nope').key).toBe('spring-2026');
  });
});

describe('parseSelection / buildShareQuery', () => {
  it('returns defaults for an empty query', () => {
    expect(parseSelection('')).toEqual(DEFAULT_SELECTION);
  });

  it('round-trips every field through the share query', () => {
    const original = selection({
      programKey: 'omsa',
      startTermKey: 'fall-2026',
      residency: 'in-state',
      pace: 3,
      paceMode: 'mixed',
      mixedRows: [
        { id: 'row-1', terms: 2, creditsPerTerm: 3 },
        { id: 'row-2', terms: 4, creditsPerTerm: 6 }
      ]
    });

    expect(parseSelection(`?${buildShareQuery(original)}`)).toEqual(original);
  });

  it('ignores invalid values and keeps defaults', () => {
    const parsed = parseSelection('?program=law&pace=5&mode=weird&residency=moon&start=fall-1999');

    expect(parsed).toEqual(DEFAULT_SELECTION);
  });

  it('omits mixed rows from constant-mode links', () => {
    expect(buildShareQuery(selection({ paceMode: 'constant' }))).not.toContain('mixed=');
  });

  it('old links without residency resolve to the default', () => {
    expect(parseSelection('?program=omscs&pace=6').residency).toBe('out-of-state');
  });
});

describe('buildPaceRows', () => {
  it('produces one row per pace option with finish terms', () => {
    const rows = buildPaceRows({ programKey: 'omscs', residency: 'in-state', startTermKey: 'fall-2026' });

    expect(rows.map((row) => row.creditsPerTerm)).toEqual([3, 6, 9]);
    expect(rows[0].fullDegree.numberOfTerms).toBe(10);
    expect(rows[0].finishTerm.label).toBe('Fall 2029');
    expect(rows[1].fullDegree.totalCost).toBe(9465);
  });
});

describe('calculateMixedPlan', () => {
  const rows = [
    { id: 'row-1', terms: 2, creditsPerTerm: 3 },
    { id: 'row-2', terms: 4, creditsPerTerm: 6 }
  ];

  it('defaults to out-of-state tuition', () => {
    const result = calculateMixedPlan({ programKey: 'omscs', residency: 'out-of-state', startTermKey: 'fall-2026', mixedRows: rows });

    expect(result.totalTuition).toBe(7080);
    expect(result.numberOfTerms).toBe(6);
  });

  it('applies the residency rate to every scheduled term', () => {
    const result = calculateMixedPlan({ programKey: 'omscs', residency: 'out-of-country', startTermKey: 'fall-2026', mixedRows: rows });

    expect(result.schedule[0].tuition).toBe(744);
    expect(result.schedule[2].tuition).toBe(1488);
  });

  it('stops scheduling once the degree credits are covered', () => {
    const result = calculateMixedPlan({
      programKey: 'omscs',
      residency: 'in-state',
      startTermKey: 'fall-2026',
      mixedRows: [{ id: 'row-1', terms: 20, creditsPerTerm: 9 }]
    });

    expect(result.numberOfTerms).toBe(4);
    expect(result.schedule[3].credits).toBe(3);
    expect(result.creditsCovered).toBe(30);
    expect(result.finishTerm.label).toBe('Fall 2027');
  });

  it('reports uncovered credits when the schedule is short', () => {
    const result = calculateMixedPlan({
      programKey: 'omscs',
      residency: 'in-state',
      startTermKey: 'fall-2026',
      mixedRows: [{ id: 'row-1', terms: 2, creditsPerTerm: 3 }]
    });

    expect(result.creditsCovered).toBe(6);
    expect(result.plannedCredits).toBe(6);
  });
});

describe('resolvePlan', () => {
  it('uses the selected pace in constant mode', () => {
    const { plan, isMixedIncomplete } = resolvePlan(selection({ pace: 3, residency: 'in-state' }));

    expect(plan.numberOfTerms).toBe(10);
    expect(plan.totalCost).toBe(8930);
    expect(plan.schedule).toEqual([]);
    expect(isMixedIncomplete).toBe(false);
  });

  it('flags incomplete mixed schedules', () => {
    const { plan, isMixedIncomplete } = resolvePlan(
      selection({ paceMode: 'mixed', mixedRows: [{ id: 'row-1', terms: 1, creditsPerTerm: 3 }] })
    );

    expect(plan.numberOfTerms).toBe(1);
    expect(isMixedIncomplete).toBe(true);
  });
});
