import {
  MAX_CREDITS_PER_TERM,
  MAX_TERMS,
  degreeCreditsByProgram,
  onlineLearningFeeRule,
  perCreditRateByProgram,
  type ProgramKey
} from '../data/rates';

export type Mode = 'per-term' | 'full-degree';

export type ScenarioInput = {
  id: string;
  label: string;
  programKey: ProgramKey;
  credits: number;
  creditsPerTerm: number;
  terms: number;
  useAutoTerms: boolean;
  termsPerYear: 2 | 3;
};

export type PerTermResult = {
  tuition: number;
  onlineLearningFee: number;
  total: number;
};

export type FullDegreeResult = {
  totalTuition: number;
  feePerTerm: number;
  totalFees: number;
  totalCost: number;
  averagePerTerm: number;
  numberOfTerms: number;
  timeToGraduateYears: number;
  timeToGraduateMonths: number;
};

export type ScenarioValidation = {
  creditsError?: string;
  creditsPerTermError?: string;
  termsError?: string;
  programError?: string;
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);

export const formatTermDuration = (years: number, months: number): string => {
  if (years <= 0 && months <= 0) {
    return '—';
  }
  const yearLabel = years === 1 ? 'year' : 'years';
  const monthLabel = months === 1 ? 'month' : 'months';
  if (years > 0 && months > 0) {
    return `${years} ${yearLabel} ${months} ${monthLabel}`;
  }
  if (years > 0) {
    return `${years} ${yearLabel}`;
  }
  return `${months} ${monthLabel}`;
};

export const getOnlineLearningFee = (credits: number): number => {
  if (!Number.isFinite(credits) || credits <= 0) {
    return 0;
  }
  return credits < onlineLearningFeeRule.thresholdCredits
    ? onlineLearningFeeRule.belowThresholdFee
    : onlineLearningFeeRule.atOrAboveThresholdFee;
};

export const calculatePerTerm = (programKey: ProgramKey, credits: number): PerTermResult => {
  if (!Number.isFinite(credits) || credits <= 0) {
    return { tuition: 0, onlineLearningFee: 0, total: 0 };
  }
  const tuition = Math.round(perCreditRateByProgram[programKey] * credits * 100) / 100;
  const onlineLearningFee = getOnlineLearningFee(credits);
  const total = Math.round((tuition + onlineLearningFee) * 100) / 100;
  return { tuition, onlineLearningFee, total };
};

export const calculateFullDegree = (
  programKey: ProgramKey,
  totalCredits: number,
  creditsPerTerm: number,
  termsInput: number,
  useAutoTerms: boolean,
  termsPerYear: number
): FullDegreeResult => {
  if (!Number.isFinite(totalCredits) || totalCredits <= 0) {
    return {
      totalTuition: 0,
      feePerTerm: 0,
      totalFees: 0,
      totalCost: 0,
      averagePerTerm: 0,
      numberOfTerms: 0,
      timeToGraduateYears: 0,
      timeToGraduateMonths: 0
    };
  }
  const normalizedCreditsPerTerm = Number.isFinite(creditsPerTerm) ? creditsPerTerm : 0;
  const numberOfTerms = useAutoTerms
    ? normalizedCreditsPerTerm > 0
      ? Math.ceil(totalCredits / normalizedCreditsPerTerm)
      : 0
    : Math.max(0, termsInput);
  const feePerTerm = getOnlineLearningFee(normalizedCreditsPerTerm);
  const totalTuition = Math.round(perCreditRateByProgram[programKey] * totalCredits * 100) / 100;
  const totalFees = Math.round(feePerTerm * numberOfTerms * 100) / 100;
  const totalCost = Math.round((totalTuition + totalFees) * 100) / 100;
  const averagePerTerm =
    numberOfTerms > 0 ? Math.round((totalCost / numberOfTerms) * 100) / 100 : 0;
  const rawMonths =
    numberOfTerms > 0 && termsPerYear > 0 ? Math.round((numberOfTerms / termsPerYear) * 12) : 0;
  const timeToGraduateYears = Math.floor(rawMonths / 12);
  const timeToGraduateMonths = rawMonths % 12;

  return {
    totalTuition,
    feePerTerm,
    totalFees,
    totalCost,
    averagePerTerm,
    numberOfTerms,
    timeToGraduateYears,
    timeToGraduateMonths
  };
};

export const validateScenario = (scenario: ScenarioInput, mode: Mode): ScenarioValidation => {
  const errors: ScenarioValidation = {};
  if (!perCreditRateByProgram[scenario.programKey]) {
    errors.programError = 'Select a valid program.';
  }
  if (mode === 'per-term') {
    if (!Number.isFinite(scenario.credits)) {
      errors.creditsError = 'Enter a numeric credit value.';
    } else if (scenario.credits < 1) {
      errors.creditsError = 'Credits must be at least 1.';
    } else if (scenario.credits > MAX_CREDITS_PER_TERM) {
      errors.creditsError = `Credits cannot exceed ${MAX_CREDITS_PER_TERM}.`;
    }
  } else {
    if (!Number.isFinite(scenario.creditsPerTerm)) {
      errors.creditsPerTermError = 'Enter a numeric credit value.';
    } else if (scenario.creditsPerTerm < 1) {
      errors.creditsPerTermError = 'Credits per term must be at least 1.';
    } else if (scenario.creditsPerTerm > MAX_CREDITS_PER_TERM) {
      errors.creditsPerTermError = `Credits per term cannot exceed ${MAX_CREDITS_PER_TERM}.`;
    }
    if (!scenario.useAutoTerms) {
      if (!Number.isFinite(scenario.terms)) {
        errors.termsError = 'Enter a numeric term count.';
      } else if (scenario.terms < 1) {
        errors.termsError = 'Terms must be at least 1.';
      } else if (scenario.terms > MAX_TERMS) {
        errors.termsError = `Terms cannot exceed ${MAX_TERMS}.`;
      }
    }
  }
  return errors;
};

export const getProgramCredits = (programKey: ProgramKey): number =>
  degreeCreditsByProgram[programKey];
