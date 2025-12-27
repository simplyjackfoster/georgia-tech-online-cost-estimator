import { MAX_CREDITS, ONLINE_LEARNING_FEE_BY_TERM, PROGRAMS, TermKey } from '../data/rates';

export type ScenarioInput = {
  id: string;
  programKey: keyof typeof PROGRAMS;
  credits: number;
  term: TermKey;
};

export type ScenarioOutput = {
  tuition: number;
  onlineLearningFee: number;
  total: number;
};

export type ScenarioValidation = {
  creditsError?: string;
  programError?: string;
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);

export const validateScenario = (scenario: ScenarioInput): ScenarioValidation => {
  const errors: ScenarioValidation = {};
  if (!PROGRAMS[scenario.programKey]) {
    errors.programError = 'Select a valid program.';
  }
  if (!Number.isFinite(scenario.credits)) {
    errors.creditsError = 'Enter a numeric credit value.';
  } else if (scenario.credits <= 0) {
    errors.creditsError = 'Credits must be at least 1.';
  } else if (scenario.credits > MAX_CREDITS) {
    errors.creditsError = `Credits cannot exceed ${MAX_CREDITS}.`;
  }
  return errors;
};

export const calculateScenario = (scenario: ScenarioInput): ScenarioOutput => {
  const program = PROGRAMS[scenario.programKey];
  const tuition = Math.round(program.tuitionPerCredit * scenario.credits * 100) / 100;
  const onlineLearningFee = scenario.credits > 0 ? ONLINE_LEARNING_FEE_BY_TERM[scenario.term].fee : 0;
  const total = Math.round((tuition + onlineLearningFee) * 100) / 100;
  return { tuition, onlineLearningFee, total };
};
