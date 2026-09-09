import { describe, expect, it } from 'vitest';
import {
  addTerm,
  clampCredits,
  compressTermCredits,
  expandMixedRows,
  parseMixedRows,
  removeLastTerm,
  serializeMixedRows,
  setTermCredits
} from './mixedRows';

describe('clampCredits', () => {
  it('rounds and clamps to 0–9', () => {
    expect(clampCredits(3.6)).toBe(4);
    expect(clampCredits(-2)).toBe(0);
    expect(clampCredits(12)).toBe(9);
    expect(clampCredits(Number.NaN)).toBe(0);
  });
});

describe('expand / compress', () => {
  it('expands run-length rows into per-term credits', () => {
    expect(expandMixedRows([{ id: 'row-1', terms: 2, creditsPerTerm: 3 }, { id: 'row-2', terms: 1, creditsPerTerm: 6 }])).toEqual([3, 3, 6]);
  });

  it('compresses adjacent equal loads and renumbers ids', () => {
    expect(compressTermCredits([3, 3, 6, 6, 3])).toEqual([
      { id: 'row-1', terms: 2, creditsPerTerm: 3 },
      { id: 'row-2', terms: 2, creditsPerTerm: 6 },
      { id: 'row-3', terms: 1, creditsPerTerm: 3 }
    ]);
    expect(compressTermCredits([])).toEqual([]);
  });
});

describe('editing helpers', () => {
  const rows = [{ id: 'row-1', terms: 2, creditsPerTerm: 3 }];

  it('setTermCredits changes one term and re-compresses', () => {
    expect(setTermCredits(rows, 1, 6)).toEqual([
      { id: 'row-1', terms: 1, creditsPerTerm: 3 },
      { id: 'row-2', terms: 1, creditsPerTerm: 6 }
    ]);
  });

  it('addTerm repeats the last load', () => {
    expect(expandMixedRows(addTerm(rows))).toEqual([3, 3, 3]);
    expect(expandMixedRows(addTerm([]))).toEqual([3]);
  });

  it('removeLastTerm drops one term', () => {
    expect(expandMixedRows(removeLastTerm(rows))).toEqual([3]);
  });
});

describe('parse / serialize', () => {
  it('round-trips the share format', () => {
    const rows = [
      { id: 'row-1', terms: 2, creditsPerTerm: 3 },
      { id: 'row-2', terms: 4, creditsPerTerm: 6 }
    ];
    expect(serializeMixedRows(rows)).toBe('2x3,4x6');
    expect(parseMixedRows('2x3,4x6')).toEqual(rows);
  });

  it('skips malformed segments', () => {
    expect(parseMixedRows('2x3,junk,1x9')).toEqual([
      { id: 'row-1', terms: 2, creditsPerTerm: 3 },
      { id: 'row-3', terms: 1, creditsPerTerm: 9 }
    ]);
    expect(parseMixedRows(null)).toEqual([]);
  });
});
