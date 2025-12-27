export type ProgramKey = 'omsa' | 'omscs' | 'omscsec';

export type TermKey = 'fall' | 'spring' | 'summer';

export const TERMS: Record<TermKey, { label: string }> = {
  fall: { label: 'Fall' },
  spring: { label: 'Spring' },
  summer: { label: 'Summer' }
};

/**
 * Tuition rates sourced from official Georgia Tech program tuition pages.
 * OMSA: https://pe.gatech.edu/degrees/online-master-science-analytics/tuition
 * OMSCS: https://omscs.gatech.edu/program-info/tuition
 * OMSCSEC: https://pe.gatech.edu/degrees/cybersecurity/online/tuition
 */
export const PROGRAMS: Record<
  ProgramKey,
  { name: string; tuitionPerCredit: number; sourceUrl: string }
> = {
  omsa: {
    name: 'MS in Analytics (OMSA)',
    tuitionPerCredit: 275,
    sourceUrl: 'https://pe.gatech.edu/degrees/online-master-science-analytics/tuition'
  },
  omscs: {
    name: 'MS in Computer Science (OMSCS)',
    tuitionPerCredit: 180,
    sourceUrl: 'https://omscs.gatech.edu/program-info/tuition'
  },
  omscsec: {
    name: 'MS in Cybersecurity (OMSCSEC)',
    tuitionPerCredit: 485,
    sourceUrl: 'https://pe.gatech.edu/degrees/cybersecurity/online/tuition'
  }
};

/**
 * Online Learning Fee rules sourced from the Georgia Tech Bursar fee schedule.
 * https://www.bursar.gatech.edu/tuition-fees
 */
export const ONLINE_LEARNING_FEE_BY_TERM: Record<
  TermKey,
  { fee: number; sourceUrl: string }
> = {
  fall: {
    fee: 301,
    sourceUrl: 'https://www.bursar.gatech.edu/tuition-fees'
  },
  spring: {
    fee: 301,
    sourceUrl: 'https://www.bursar.gatech.edu/tuition-fees'
  },
  summer: {
    fee: 301,
    sourceUrl: 'https://www.bursar.gatech.edu/tuition-fees'
  }
};

export const MAX_CREDITS = 18;
