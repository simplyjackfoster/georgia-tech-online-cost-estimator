import {
  CURRENT_RATES,
  DEFAULT_RESIDENCY,
  START_TERMS,
  isProgramKey,
  isResidency,
  type ProgramKey,
  type RateTable,
  type Residency,
  type StartTermOption,
  type TermSeason
} from '../data/rates';
import { calculateFullDegree, calculateTermCost, roundCents, type FullDegreeResult } from './calc';
import {
  DEFAULT_MIXED_ROWS,
  parseMixedRows,
  serializeMixedRows,
  type MixedLoadRow
} from './mixedRows';

export const PACE_OPTIONS = [3, 6, 9] as const;
export type PaceOption = (typeof PACE_OPTIONS)[number];
export const isPaceOption = (value: unknown): value is PaceOption =>
  PACE_OPTIONS.includes(value as PaceOption);

export type PaceMode = 'constant' | 'mixed';
export const isPaceMode = (value: unknown): value is PaceMode =>
  value === 'constant' || value === 'mixed';

export const TERM_SEQUENCE: TermSeason[] = ['Spring', 'Summer', 'Fall'];
export const TERMS_PER_YEAR = TERM_SEQUENCE.length;
export const DEFAULT_START_TERM_KEY = 'spring-2026';

/** Everything the user chooses. Serializes to/from the share URL. */
export type PlanSelection = {
  programKey: ProgramKey;
  startTermKey: string;
  residency: Residency;
  pace: PaceOption;
  paceMode: PaceMode;
  mixedRows: MixedLoadRow[];
};

export const DEFAULT_SELECTION: PlanSelection = {
  programKey: 'omscs',
  startTermKey: DEFAULT_START_TERM_KEY,
  residency: DEFAULT_RESIDENCY,
  pace: 6,
  paceMode: 'constant',
  mixedRows: DEFAULT_MIXED_ROWS
};

export type ScheduledTerm = {
  termLabel: string;
  credits: number;
  tuition: number;
  fee: number;
  total: number;
};

/** The resolved plan shown in the summary, for either pace mode. */
export type PlanResult = {
  numberOfTerms: number;
  totalFees: number;
  totalTuition: number;
  totalCost: number;
  averagePerTerm: number;
  finishTerm: StartTermOption;
  feePayments: number;
  plannedCredits: number;
  creditsCovered: number;
  schedule: ScheduledTerm[];
};

export type PaceRow = {
  creditsPerTerm: PaceOption;
  finishTerm: StartTermOption;
  fullDegree: FullDegreeResult;
};

export const resolveStartTerm = (startTermKey: string): StartTermOption =>
  START_TERMS.find((term) => term.key === startTermKey) ??
  START_TERMS.find((term) => term.key === DEFAULT_START_TERM_KEY) ??
  START_TERMS[0];

export const buildTermLabel = (startTerm: StartTermOption, offset: number): string => {
  const targetIndex = TERM_SEQUENCE.indexOf(startTerm.season) + offset;
  const season = TERM_SEQUENCE[((targetIndex % TERMS_PER_YEAR) + TERMS_PER_YEAR) % TERMS_PER_YEAR];
  return `${season} ${startTerm.year + Math.floor(targetIndex / TERMS_PER_YEAR)}`;
};

export const getFinishTerm = (startTerm: StartTermOption, numberOfTerms: number): StartTermOption => {
  if (numberOfTerms <= 1) {
    return startTerm;
  }
  const finishIndex = TERM_SEQUENCE.indexOf(startTerm.season) + (numberOfTerms - 1);
  const season = TERM_SEQUENCE[finishIndex % TERMS_PER_YEAR];
  const year = startTerm.year + Math.floor(finishIndex / TERMS_PER_YEAR);
  return { key: `${season.toLowerCase()}-${year}`, season, year, label: `${season} ${year}` };
};

export const parseSelection = (search: string): PlanSelection => {
  const params = new URLSearchParams(search);
  const program = params.get('program');
  const start = params.get('start');
  const residency = params.get('residency');
  const pace = Number(params.get('pace'));
  const mode = params.get('mode');
  const mixedRows = parseMixedRows(params.get('mixed'));

  return {
    programKey: isProgramKey(program) ? program : DEFAULT_SELECTION.programKey,
    startTermKey: START_TERMS.some((term) => term.key === start)
      ? (start as string)
      : DEFAULT_SELECTION.startTermKey,
    residency: isResidency(residency) ? residency : DEFAULT_SELECTION.residency,
    pace: isPaceOption(pace) ? pace : DEFAULT_SELECTION.pace,
    paceMode: isPaceMode(mode) ? mode : DEFAULT_SELECTION.paceMode,
    mixedRows: mixedRows.length > 0 ? mixedRows : DEFAULT_SELECTION.mixedRows
  };
};

export const buildShareQuery = (selection: PlanSelection): string => {
  const params = new URLSearchParams({
    program: selection.programKey,
    start: selection.startTermKey,
    pace: String(selection.pace),
    mode: selection.paceMode,
    residency: selection.residency
  });
  if (selection.paceMode === 'mixed') {
    params.set('mixed', serializeMixedRows(selection.mixedRows));
  }
  return params.toString();
};

export const buildShareUrl = (selection: PlanSelection): string =>
  `${window.location.origin}${window.location.pathname}?${buildShareQuery(selection)}`;

export const buildPaceRows = (
  { programKey, residency, startTermKey }: Pick<PlanSelection, 'programKey' | 'residency' | 'startTermKey'>,
  rates: RateTable = CURRENT_RATES
): PaceRow[] => {
  const startTerm = resolveStartTerm(startTermKey);
  return PACE_OPTIONS.map((creditsPerTerm) => {
    const fullDegree = calculateFullDegree({ programKey, creditsPerTerm, residency }, rates);
    return { creditsPerTerm, finishTerm: getFinishTerm(startTerm, fullDegree.numberOfTerms), fullDegree };
  });
};

export const calculateMixedPlan = (
  { programKey, residency, startTermKey, mixedRows }: Omit<PlanSelection, 'pace' | 'paceMode'>,
  rates: RateTable = CURRENT_RATES
): PlanResult => {
  const totalCredits = rates.degreeCredits[programKey];
  const startTerm = resolveStartTerm(startTermKey);
  const plannedCredits = mixedRows.reduce(
    (sum, row) => sum + Math.max(0, row.terms) * Math.max(0, row.creditsPerTerm),
    0
  );
  let creditsRemaining = totalCredits;
  let totalFees = 0;
  let totalTuition = 0;
  const schedule: ScheduledTerm[] = [];

  for (const row of mixedRows) {
    for (let termIndex = 0; termIndex < row.terms && creditsRemaining > 0; termIndex += 1) {
      const credits = Math.min(Math.max(0, row.creditsPerTerm), creditsRemaining);
      const cost = calculateTermCost(programKey, credits, residency, rates);
      totalTuition = roundCents(totalTuition + cost.tuition);
      totalFees = roundCents(totalFees + cost.fee);
      schedule.push({ termLabel: buildTermLabel(startTerm, schedule.length), credits, ...cost });
      creditsRemaining -= credits;
    }
  }

  const numberOfTerms = schedule.length;
  const totalCost = roundCents(totalTuition + totalFees);
  return {
    numberOfTerms,
    totalFees,
    totalTuition,
    totalCost,
    averagePerTerm: numberOfTerms > 0 ? roundCents(totalCost / numberOfTerms) : 0,
    finishTerm: getFinishTerm(startTerm, Math.max(numberOfTerms, 1)),
    feePayments: numberOfTerms,
    plannedCredits,
    creditsCovered: totalCredits - Math.max(creditsRemaining, 0),
    schedule
  };
};

const constantPlan = (row: PaceRow, totalCredits: number): PlanResult => ({
  numberOfTerms: row.fullDegree.numberOfTerms,
  totalFees: row.fullDegree.totalFees,
  totalTuition: row.fullDegree.totalTuition,
  totalCost: row.fullDegree.totalCost,
  averagePerTerm: row.fullDegree.averagePerTerm,
  finishTerm: row.finishTerm,
  feePayments: row.fullDegree.numberOfTerms,
  plannedCredits: totalCredits,
  creditsCovered: totalCredits,
  schedule: []
});

export type ResolvedPlan = {
  plan: PlanResult;
  /** True when a mixed schedule doesn't cover the degree's credits. */
  isMixedIncomplete: boolean;
};

/** Turns a selection into the plan the summary displays. */
export const resolvePlan = (selection: PlanSelection, rates: RateTable = CURRENT_RATES): ResolvedPlan => {
  const totalCredits = rates.degreeCredits[selection.programKey];
  if (selection.paceMode === 'mixed') {
    const plan = calculateMixedPlan(selection, rates);
    return { plan, isMixedIncomplete: plan.creditsCovered < totalCredits };
  }
  const rows = buildPaceRows(selection, rates);
  const row = rows.find((candidate) => candidate.creditsPerTerm === selection.pace) ?? rows[0];
  return { plan: constantPlan(row, totalCredits), isMixedIncomplete: false };
};
