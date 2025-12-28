import { START_TERMS, perCreditRateByProgram, type ProgramKey, type StartTermOption, type TermSeason } from '../data/rates';
import { getOnlineLearningFee } from './calc';

export const PACE_OPTIONS = [3, 6, 9] as const;
export const TERM_SEQUENCE: TermSeason[] = ['Spring', 'Summer', 'Fall'];
export const DEFAULT_START_TERM_KEY = 'spring-2026';

export type MixedLoadRow = {
  id: string;
  terms: number;
  creditsPerTerm: number;
};

export type MixedPlanResult = {
  numberOfTerms: number;
  totalFees: number;
  totalTuition: number;
  totalCost: number;
  averagePerTerm: number;
  finishTerm: StartTermOption;
  feePayments: number;
  plannedCredits: number;
  creditsCovered: number;
  schedule: Array<{
    termLabel: string;
    credits: number;
    tuition: number;
    fee: number;
    total: number;
  }>;
};

export const getFinishTerm = (startTerm: StartTermOption, numberOfTerms: number): StartTermOption => {
  if (numberOfTerms <= 1) {
    return startTerm;
  }
  const startIndex = TERM_SEQUENCE.indexOf(startTerm.season);
  const finishIndex = startIndex + (numberOfTerms - 1);
  const yearOffset = Math.floor(finishIndex / TERM_SEQUENCE.length);
  const season = TERM_SEQUENCE[finishIndex % TERM_SEQUENCE.length];
  const year = startTerm.year + yearOffset;
  return {
    key: `${season.toLowerCase()}-${year}`,
    season,
    year,
    label: `${season} ${year}`
  };
};

export const buildTermLabel = (startTerm: StartTermOption, offset: number): string => {
  const startIndex = TERM_SEQUENCE.indexOf(startTerm.season);
  const targetIndex = startIndex + offset;
  const yearOffset = Math.floor(targetIndex / TERM_SEQUENCE.length);
  const season = TERM_SEQUENCE[((targetIndex % TERM_SEQUENCE.length) + TERM_SEQUENCE.length) % TERM_SEQUENCE.length];
  const year = startTerm.year + yearOffset;
  return `${season} ${year}`;
};

export const buildShareUrl = (
  programKey: ProgramKey,
  startTermKey: string,
  pace: number,
  mode: 'constant' | 'mixed',
  mixedRows: MixedLoadRow[]
): string => {
  const params = new URLSearchParams();
  params.set('program', programKey);
  params.set('start', startTermKey);
  params.set('pace', String(pace));
  params.set('mode', mode);
  if (mode === 'mixed') {
    const serialized = mixedRows
      .map((row) => `${row.terms}x${row.creditsPerTerm}`)
      .join(',');
    params.set('mixed', serialized);
  }
  const query = params.toString();
  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
};

export const calculateMixedPlan = (
  programKey: ProgramKey,
  totalCredits: number,
  startTerm: StartTermOption,
  rows: MixedLoadRow[]
): MixedPlanResult => {
  const sanitizedRows = rows.map((row) => ({
    ...row,
    terms: Number.isFinite(row.terms) ? Math.max(0, row.terms) : 0,
    creditsPerTerm: Number.isFinite(row.creditsPerTerm) ? Math.max(0, row.creditsPerTerm) : 0
  }));
  const plannedCredits = sanitizedRows.reduce(
    (sum, row) => sum + row.terms * row.creditsPerTerm,
    0
  );
  let creditsRemaining = totalCredits;
  let totalFees = 0;
  let totalTuition = 0;
  let numberOfTerms = 0;
  const schedule: MixedPlanResult['schedule'] = [];

  for (const row of sanitizedRows) {
    for (let termIndex = 0; termIndex < row.terms; termIndex += 1) {
      if (creditsRemaining <= 0) {
        break;
      }
      numberOfTerms += 1;
      const creditsThisTerm = Math.min(row.creditsPerTerm, creditsRemaining);
      const fee = getOnlineLearningFee(creditsThisTerm);
      const tuition =
        Math.round(perCreditRateByProgram[programKey] * creditsThisTerm * 100) / 100;
      const total = Math.round((tuition + fee) * 100) / 100;
      totalTuition = Math.round((totalTuition + tuition) * 100) / 100;
      totalFees = Math.round((totalFees + fee) * 100) / 100;
      schedule.push({
        termLabel: buildTermLabel(startTerm, numberOfTerms - 1),
        credits: creditsThisTerm,
        tuition,
        fee,
        total
      });
      creditsRemaining -= creditsThisTerm;
    }
    if (creditsRemaining <= 0) {
      break;
    }
  }

  const creditsCovered = totalCredits - Math.max(creditsRemaining, 0);
  const totalCost = Math.round((totalTuition + totalFees) * 100) / 100;
  const averagePerTerm =
    numberOfTerms > 0 ? Math.round((totalCost / numberOfTerms) * 100) / 100 : 0;
  const finishTerm = getFinishTerm(startTerm, Math.max(numberOfTerms, 1));

  return {
    numberOfTerms,
    totalFees,
    totalTuition,
    totalCost,
    averagePerTerm,
    finishTerm,
    feePayments: numberOfTerms,
    plannedCredits,
    creditsCovered,
    schedule
  };
};

export const parseMixedRows = (mixedParam: string | null): MixedLoadRow[] => {
  if (!mixedParam) {
    return [];
  }
  const parsedRows = mixedParam
    .split(',')
    .map((segment, index) => {
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
      } as MixedLoadRow;
    })
    .filter((row): row is MixedLoadRow => Boolean(row));
  return parsedRows;
};

export const resolveStartTerm = (startTermKey: string): StartTermOption => {
  return (
    START_TERMS.find((term) => term.key === startTermKey) ??
    START_TERMS.find((term) => term.key === DEFAULT_START_TERM_KEY) ??
    START_TERMS[0]
  );
};
