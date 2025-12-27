import { describe, expect, it } from 'vitest';
import { calculateScenario, validateScenario } from './calc';

describe('calculateScenario', () => {
  it('calculates tuition and fees for a valid scenario', () => {
    const result = calculateScenario({
      id: 'a',
      programKey: 'omscs',
      credits: 6,
      term: 'fall'
    });

    expect(result.tuition).toBe(1080);
    expect(result.onlineLearningFee).toBeGreaterThan(0);
    expect(result.total).toBe(result.tuition + result.onlineLearningFee);
  });

  it('returns zero online learning fee when credits are zero', () => {
    const result = calculateScenario({
      id: 'b',
      programKey: 'omsa',
      credits: 0,
      term: 'summer'
    });

    expect(result.onlineLearningFee).toBe(0);
  });
});

describe('validateScenario', () => {
  it('rejects missing program or invalid credits', () => {
    const errors = validateScenario({
      id: 'c',
      programKey: 'omscs',
      credits: 0,
      term: 'spring'
    });

    expect(errors.creditsError).toBeDefined();
  });

  it('accepts normal credit loads', () => {
    const errors = validateScenario({
      id: 'd',
      programKey: 'omsa',
      credits: 3,
      term: 'fall'
    });

    expect(errors).toEqual({});
  });
});
