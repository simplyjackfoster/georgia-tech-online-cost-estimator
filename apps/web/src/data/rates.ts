export type ProgramKey = 'omsa' | 'omscs' | 'omscsec';
export type TermSeason = 'Spring' | 'Summer' | 'Fall';
export type Residency = 'in-state' | 'out-of-state' | 'out-of-country';

export type StartTermOption = {
  key: string;
  season: TermSeason;
  year: number;
  label: string;
};

export type OnlineLearningFeeRule = {
  thresholdCredits: number;
  belowThresholdFee: number;
  atOrAboveThresholdFee: number;
};

/** Everything the calculators need for one Bursar term sheet. */
export type RateTable = {
  label: string;
  sourceUrl: string;
  perCredit: Record<ProgramKey, Record<Residency, number>>;
  onlineLearningFee: OnlineLearningFeeRule;
  degreeCredits: Record<ProgramKey, number>;
};

// Fall 2026 is the first term the Bursar lists separate out-of-state /
// out-of-country rates for OMS programs; students who matriculated before
// Fall 2025 keep the in-state rate.
export const FALL_2026_RATES: RateTable = {
  label: 'Fall 2026',
  sourceUrl: 'https://bursar.gatech.edu/student/tuition/fa26/fa26_totals.pdf',
  perCredit: {
    omsa: { 'in-state': 330, 'out-of-state': 343, 'out-of-country': 360 },
    omscs: { 'in-state': 227, 'out-of-state': 236, 'out-of-country': 248 },
    omscsec: { 'in-state': 373, 'out-of-state': 387, 'out-of-country': 406 }
  },
  onlineLearningFee: {
    thresholdCredits: 4,
    belowThresholdFee: 212,
    atOrAboveThresholdFee: 531
  },
  degreeCredits: {
    omsa: 36,
    omscs: 30,
    omscsec: 30
  }
};

export const CURRENT_RATES: RateTable = FALL_2026_RATES;

export const PROGRAM_KEYS: readonly ProgramKey[] = ['omscs', 'omsa', 'omscsec'];

export const PROGRAM_LABELS: Record<ProgramKey, string> = {
  omsa: 'MS in Analytics (OMSA)',
  omscs: 'MS in Computer Science (OMSCS)',
  omscsec: 'MS in Cybersecurity (OMSCSEC)'
};

export const PROGRAMS = PROGRAM_KEYS.map((key) => ({ key, label: PROGRAM_LABELS[key] }));

export const isProgramKey = (value: unknown): value is ProgramKey =>
  PROGRAM_KEYS.includes(value as ProgramKey);

// Most OMS students are not Georgia residents, so out-of-state is the default.
export const DEFAULT_RESIDENCY: Residency = 'out-of-state';

export const RESIDENCY_OPTIONS: Array<{ key: Residency; label: string }> = [
  { key: 'in-state', label: 'In-state' },
  { key: 'out-of-state', label: 'Out-of-state' },
  { key: 'out-of-country', label: 'Out-of-country' }
];

export const isResidency = (value: unknown): value is Residency =>
  RESIDENCY_OPTIONS.some((option) => option.key === value);

export const getPerCreditRate = (
  programKey: ProgramKey,
  residency: Residency = DEFAULT_RESIDENCY,
  rates: RateTable = CURRENT_RATES
): number => rates.perCredit[programKey][residency];

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
