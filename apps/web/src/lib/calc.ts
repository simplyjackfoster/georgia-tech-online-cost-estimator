import {
  CURRENT_RATES,
  DEFAULT_RESIDENCY,
  getPerCreditRate,
  type ProgramKey,
  type RateTable,
  type Residency
} from '../data/rates';

export const roundCents = (value: number): number => Math.round(value * 100) / 100;

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);

export type TermCost = {
  tuition: number;
  fee: number;
  total: number;
};

export type FullDegreeInput = {
  programKey: ProgramKey;
  creditsPerTerm: number;
  residency?: Residency;
  /** Defaults to the program's degree requirement. */
  totalCredits?: number;
};

export type FullDegreeResult = {
  totalTuition: number;
  feePerTerm: number;
  totalFees: number;
  totalCost: number;
  averagePerTerm: number;
  numberOfTerms: number;
};

const EMPTY_TERM: TermCost = { tuition: 0, fee: 0, total: 0 };

const EMPTY_DEGREE: FullDegreeResult = {
  totalTuition: 0,
  feePerTerm: 0,
  totalFees: 0,
  totalCost: 0,
  averagePerTerm: 0,
  numberOfTerms: 0
};

export const getOnlineLearningFee = (credits: number, rates: RateTable = CURRENT_RATES): number => {
  if (!Number.isFinite(credits) || credits <= 0) {
    return 0;
  }
  const rule = rates.onlineLearningFee;
  return credits < rule.thresholdCredits ? rule.belowThresholdFee : rule.atOrAboveThresholdFee;
};

/** Tuition + online learning fee for one term at the given credit load. */
export const calculateTermCost = (
  programKey: ProgramKey,
  credits: number,
  residency: Residency = DEFAULT_RESIDENCY,
  rates: RateTable = CURRENT_RATES
): TermCost => {
  if (!Number.isFinite(credits) || credits <= 0) {
    return EMPTY_TERM;
  }
  const tuition = roundCents(getPerCreditRate(programKey, residency, rates) * credits);
  const fee = getOnlineLearningFee(credits, rates);
  return { tuition, fee, total: roundCents(tuition + fee) };
};

/** Whole-degree totals when every term carries the same credit load. */
export const calculateFullDegree = (
  { programKey, creditsPerTerm, residency = DEFAULT_RESIDENCY, totalCredits }: FullDegreeInput,
  rates: RateTable = CURRENT_RATES
): FullDegreeResult => {
  const credits = totalCredits ?? rates.degreeCredits[programKey];
  if (!Number.isFinite(credits) || credits <= 0 || !Number.isFinite(creditsPerTerm) || creditsPerTerm <= 0) {
    return EMPTY_DEGREE;
  }
  const numberOfTerms = Math.ceil(credits / creditsPerTerm);
  const feePerTerm = getOnlineLearningFee(creditsPerTerm, rates);
  const totalTuition = roundCents(getPerCreditRate(programKey, residency, rates) * credits);
  const totalFees = roundCents(feePerTerm * numberOfTerms);
  const totalCost = roundCents(totalTuition + totalFees);
  return {
    totalTuition,
    feePerTerm,
    totalFees,
    totalCost,
    averagePerTerm: roundCents(totalCost / numberOfTerms),
    numberOfTerms
  };
};
