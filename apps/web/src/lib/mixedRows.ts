export type MixedLoadRow = {
  id: string;
  terms: number;
  creditsPerTerm: number;
};

export const MAX_CREDITS_PER_TERM = 9;

export const DEFAULT_MIXED_ROWS: MixedLoadRow[] = [
  { id: 'row-1', terms: 2, creditsPerTerm: 3 },
  { id: 'row-2', terms: 2, creditsPerTerm: 6 },
  { id: 'row-3', terms: 1, creditsPerTerm: 3 },
  { id: 'row-4', terms: 2, creditsPerTerm: 6 },
  { id: 'row-5', terms: 1, creditsPerTerm: 3 }
];

export const clampCredits = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(MAX_CREDITS_PER_TERM, Math.round(value)));
};

/** Run-length rows → one credit value per term. */
export const expandMixedRows = (rows: MixedLoadRow[]): number[] =>
  rows.flatMap((row) => Array.from({ length: row.terms }, () => row.creditsPerTerm));

/** One credit value per term → run-length rows (adjacent equal loads merge). */
export const compressTermCredits = (credits: number[]): MixedLoadRow[] => {
  const rows: MixedLoadRow[] = [];
  for (const raw of credits) {
    const value = clampCredits(raw);
    const last = rows[rows.length - 1];
    if (last && last.creditsPerTerm === value) {
      last.terms += 1;
    } else {
      rows.push({ id: `row-${rows.length + 1}`, terms: 1, creditsPerTerm: value });
    }
  }
  return rows;
};

export const setTermCredits = (rows: MixedLoadRow[], index: number, value: number): MixedLoadRow[] => {
  const credits = expandMixedRows(rows);
  credits[index] = clampCredits(value);
  return compressTermCredits(credits);
};

/** Appends a term that repeats the last term's load (or 3 credits if empty). */
export const addTerm = (rows: MixedLoadRow[]): MixedLoadRow[] => {
  const credits = expandMixedRows(rows);
  const last = credits[credits.length - 1];
  return compressTermCredits([...credits, clampCredits(last) || 3]);
};

export const removeLastTerm = (rows: MixedLoadRow[]): MixedLoadRow[] =>
  compressTermCredits(expandMixedRows(rows).slice(0, -1));

export const parseMixedRows = (mixedParam: string | null): MixedLoadRow[] => {
  if (!mixedParam) {
    return [];
  }
  return mixedParam
    .split(',')
    .map((segment, index): MixedLoadRow | null => {
      const [termsRaw, creditsRaw] = segment.split('x');
      const terms = Number(termsRaw);
      const creditsPerTerm = Number(creditsRaw);
      if (!Number.isFinite(terms) || !Number.isFinite(creditsPerTerm)) {
        return null;
      }
      return {
        id: `row-${index + 1}`,
        terms: Math.max(0, terms),
        creditsPerTerm: Math.max(0, creditsPerTerm)
      };
    })
    .filter((row): row is MixedLoadRow => row !== null);
};

export const serializeMixedRows = (rows: MixedLoadRow[]): string =>
  rows.map((row) => `${row.terms}x${row.creditsPerTerm}`).join(',');
