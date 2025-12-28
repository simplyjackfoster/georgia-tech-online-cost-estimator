import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PROGRAMS,
  START_TERMS,
  degreeCreditsByProgram,
  perCreditRateByProgram,
  type ProgramKey
} from '../data/rates';
import { calculateFullDegree } from '../lib/calc';
import {
  DEFAULT_START_TERM_KEY,
  PACE_OPTIONS,
  buildShareUrl,
  calculateMixedPlan,
  getFinishTerm,
  parseMixedRows,
  resolveStartTerm
} from '../lib/plan';

const DEFAULT_MIXED_ROWS = [
  { id: 'row-1', terms: 4, creditsPerTerm: 3 },
  { id: 'row-2', terms: 4, creditsPerTerm: 6 },
  { id: 'row-3', terms: 2, creditsPerTerm: 3 }
];

export const usePlanState = () => {
  const [programKey, setProgramKey] = useState<ProgramKey>('omscs');
  const [startTermKey, setStartTermKey] = useState<string>(DEFAULT_START_TERM_KEY);
  const [draftProgramKey, setDraftProgramKey] = useState<ProgramKey>('omscs');
  const [draftStartTermKey, setDraftStartTermKey] = useState<string>(DEFAULT_START_TERM_KEY);
  const [selectedPace, setSelectedPace] = useState<number>(6);
  const [paceMode, setPaceMode] = useState<'constant' | 'mixed'>('constant');
  const [mixedRows, setMixedRows] = useState(DEFAULT_MIXED_ROWS);
  const [shareStatus, setShareStatus] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const programParam = params.get('program');
    const startParam = params.get('start');
    const paceParam = Number(params.get('pace'));
    const modeParam = params.get('mode');
    const mixedParam = params.get('mixed');

    const resolvedProgramKey =
      programParam && programParam in perCreditRateByProgram
        ? (programParam as ProgramKey)
        : 'omscs';
    const resolvedStartTermKey =
      startParam && START_TERMS.some((term) => term.key === startParam)
        ? startParam
        : DEFAULT_START_TERM_KEY;

    setProgramKey(resolvedProgramKey);
    setStartTermKey(resolvedStartTermKey);
    setDraftProgramKey(resolvedProgramKey);
    setDraftStartTermKey(resolvedStartTermKey);
    if (PACE_OPTIONS.includes(paceParam)) {
      setSelectedPace(paceParam);
    }
    if (modeParam === 'mixed' || modeParam === 'constant') {
      setPaceMode(modeParam);
    }
    const parsedRows = parseMixedRows(mixedParam);
    if (parsedRows.length > 0) {
      setMixedRows(parsedRows);
    }
  }, []);

  useEffect(() => {
    setDraftProgramKey(programKey);
    setDraftStartTermKey(startTermKey);
  }, [programKey, startTermKey]);

  const startTerm = useMemo(() => resolveStartTerm(startTermKey), [startTermKey]);

  const paceRows = useMemo(() => {
    return PACE_OPTIONS.map((creditsPerTerm) => {
      const fullDegree = calculateFullDegree(
        programKey,
        degreeCreditsByProgram[programKey],
        creditsPerTerm,
        0,
        true,
        3
      );
      const finishTerm = getFinishTerm(startTerm, fullDegree.numberOfTerms);
      return {
        creditsPerTerm,
        finishTerm,
        fullDegree
      };
    });
  }, [programKey, startTerm]);

  const selectedRow = paceRows.find((row) => row.creditsPerTerm === selectedPace) ?? paceRows[0];
  const selectedProgram = PROGRAMS.find((program) => program.key === programKey);
  const mixedPlan = useMemo(
    () =>
      calculateMixedPlan(programKey, degreeCreditsByProgram[programKey], startTerm, mixedRows),
    [programKey, startTerm, mixedRows]
  );
  const activePlan =
    paceMode === 'mixed'
      ? mixedPlan
      : {
          numberOfTerms: selectedRow.fullDegree.numberOfTerms,
          totalFees: selectedRow.fullDegree.totalFees,
          totalTuition: selectedRow.fullDegree.totalTuition,
          totalCost: selectedRow.fullDegree.totalCost,
          averagePerTerm: selectedRow.fullDegree.averagePerTerm,
          finishTerm: selectedRow.finishTerm,
          feePayments: selectedRow.fullDegree.numberOfTerms,
          plannedCredits: degreeCreditsByProgram[programKey],
          creditsCovered: degreeCreditsByProgram[programKey],
          schedule: []
        };
  const isMixedIncomplete = mixedPlan.creditsCovered < degreeCreditsByProgram[programKey];

  const handleShare = useCallback(async () => {
    const url = buildShareUrl(programKey, startTermKey, selectedPace, paceMode, mixedRows);
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('Link copied to clipboard.');
    } catch (error) {
      console.error('Clipboard unavailable', error);
      setShareStatus('Copy failed. Link opened in a new tab.');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [mixedRows, paceMode, programKey, selectedPace, startTermKey]);

  return {
    activePlan,
    draftProgramKey,
    draftStartTermKey,
    handleShare,
    isMixedIncomplete,
    mixedPlan,
    mixedRows,
    paceMode,
    paceRows,
    programKey,
    selectedPace,
    selectedProgram,
    shareStatus,
    startTermKey,
    setDraftProgramKey,
    setDraftStartTermKey,
    setMixedRows,
    setPaceMode,
    setProgramKey,
    setSelectedPace,
    setStartTermKey
  };
};
