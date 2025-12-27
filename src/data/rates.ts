export type ProgramKey = 'omsa' | 'omscs' | 'omscsec';

export const PROGRAM_LABELS: Record<ProgramKey, string> = {
  omsa: 'MS in Analytics (OMSA)',
  omscs: 'MS in Computer Science (OMSCS)',
  omscsec: 'MS in Cybersecurity (OMSCSEC)'
};

export const perCreditRateByProgram: Record<ProgramKey, number> = {
  omsa: 327,
  omscs: 225,
  omscsec: 369
};

export const degreeCreditsByProgram: Record<ProgramKey, number> = {
  omsa: 36,
  omscs: 30,
  omscsec: 30
};

export const onlineLearningFeeRule = {
  thresholdCredits: 4,
  belowThresholdFee: 176,
  atOrAboveThresholdFee: 440
};

export const MAX_CREDITS_PER_TERM = 21;
export const MAX_TERMS = 30;
export const TERMS_PER_YEAR_OPTIONS = [2, 3] as const;

export const PROGRAMS = Object.entries(PROGRAM_LABELS).map(([key, label]) => ({
  key: key as ProgramKey,
  label,
  perCreditRate: perCreditRateByProgram[key as ProgramKey],
  degreeCredits: degreeCreditsByProgram[key as ProgramKey]
}));
