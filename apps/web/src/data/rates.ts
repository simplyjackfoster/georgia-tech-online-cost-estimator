export type ProgramKey = 'omsa' | 'omscs' | 'omscsec';
export type TermSeason = 'Spring' | 'Summer' | 'Fall';

export type StartTermOption = {
  key: string;
  season: TermSeason;
  year: number;
  label: string;
};

export const PROGRAM_LABELS: Record<ProgramKey, string> = {
  omsa: 'MS in Analytics (OMSA)',
  omscs: 'MS in Computer Science (OMSCS)',
  omscsec: 'MS in Cybersecurity (OMSCSEC)'
};

export type Residency = 'in-state' | 'out-of-state' | 'out-of-country';

// Most OMS students are not Georgia residents, so out-of-state is the default.
export const DEFAULT_RESIDENCY: Residency = 'out-of-state';

export const RESIDENCY_OPTIONS: Array<{ key: Residency; label: string }> = [
  { key: 'in-state', label: 'In-state' },
  { key: 'out-of-state', label: 'Out-of-state' },
  { key: 'out-of-country', label: 'Out-of-country' }
];

// Fall 2026 per-credit rates. Starting Fall 2026 the Bursar lists separate
// out-of-state / out-of-country rates for OMS programs; students who
// matriculated before Fall 2025 keep the in-state rate.
export const perCreditRateByResidency: Record<ProgramKey, Record<Residency, number>> = {
  omsa: { 'in-state': 330, 'out-of-state': 343, 'out-of-country': 360 },
  omscs: { 'in-state': 227, 'out-of-state': 236, 'out-of-country': 248 },
  omscsec: { 'in-state': 373, 'out-of-state': 387, 'out-of-country': 406 }
};

export const getPerCreditRate = (
  programKey: ProgramKey,
  residency: Residency = DEFAULT_RESIDENCY
): number => perCreditRateByResidency[programKey][residency];

export const isResidency = (value: unknown): value is Residency =>
  RESIDENCY_OPTIONS.some((option) => option.key === value);

// In-state rates, kept for callers that don't take a residency.
export const perCreditRateByProgram: Record<ProgramKey, number> = {
  omsa: perCreditRateByResidency.omsa['in-state'],
  omscs: perCreditRateByResidency.omscs['in-state'],
  omscsec: perCreditRateByResidency.omscsec['in-state']
};

export const degreeCreditsByProgram: Record<ProgramKey, number> = {
  omsa: 36,
  omscs: 30,
  omscsec: 30
};

export const onlineLearningFeeRule = {
  thresholdCredits: 4,
  belowThresholdFee: 212,
  atOrAboveThresholdFee: 531
};

export const MAX_CREDITS_PER_TERM = 21;
export const MAX_TERMS = 30;
export const TERMS_PER_YEAR_OPTIONS = [2, 3] as const;

export const PROGRAMS = (['omscs', 'omsa', 'omscsec'] as ProgramKey[]).map((key) => ({
  key,
  label: PROGRAM_LABELS[key],
  perCreditRate: perCreditRateByProgram[key],
  degreeCredits: degreeCreditsByProgram[key]
}));

export const START_TERMS: StartTermOption[] = [
  { key: 'spring-2024', season: 'Spring', year: 2024, label: 'Spring 2024' },
  { key: 'summer-2024', season: 'Summer', year: 2024, label: 'Summer 2024' },
  { key: 'fall-2024', season: 'Fall', year: 2024, label: 'Fall 2024' },
  { key: 'spring-2025', season: 'Spring', year: 2025, label: 'Spring 2025' },
  { key: 'summer-2025', season: 'Summer', year: 2025, label: 'Summer 2025' },
  { key: 'fall-2025', season: 'Fall', year: 2025, label: 'Fall 2025' },
  { key: 'spring-2026', season: 'Spring', year: 2026, label: 'Spring 2026' },
  { key: 'summer-2026', season: 'Summer', year: 2026, label: 'Summer 2026' },
  { key: 'fall-2026', season: 'Fall', year: 2026, label: 'Fall 2026' }
];
