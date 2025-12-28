import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  { id: 'row-1', terms: 2, creditsPerTerm: 3 },
  { id: 'row-2', terms: 2, creditsPerTerm: 6 },
  { id: 'row-3', terms: 1, creditsPerTerm: 3 },
  { id: 'row-4', terms: 2, creditsPerTerm: 6 },
  { id: 'row-5', terms: 1, creditsPerTerm: 3 }
];

export const usePlanState = () => {
  const [programKey, setProgramKey] = useState<ProgramKey>('omscs');
  const [startTermKey, setStartTermKey] = useState<string>(DEFAULT_START_TERM_KEY);
  const [draftProgramKey, setDraftProgramKey] = useState<ProgramKey>('omscs');
  const [draftStartTermKey, setDraftStartTermKey] = useState<string>(DEFAULT_START_TERM_KEY);
  const [selectedPace, setSelectedPace] = useState<number>(6);
  const [draftSelectedPace, setDraftSelectedPace] = useState<number>(6);
  const [paceMode, setPaceMode] = useState<'constant' | 'mixed'>('constant');
  const [draftPaceMode, setDraftPaceMode] = useState<'constant' | 'mixed'>('constant');
  const [mixedRows, setMixedRows] = useState(DEFAULT_MIXED_ROWS);
  const [draftMixedRows, setDraftMixedRows] = useState(DEFAULT_MIXED_ROWS);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const shareResetTimer = useRef<number | null>(null);
  const shouldTrackPlanGenerated = useRef(false);
  const isPaceOption = (value: number): value is (typeof PACE_OPTIONS)[number] =>
    PACE_OPTIONS.includes(value as (typeof PACE_OPTIONS)[number]);

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
    if (isPaceOption(paceParam)) {
      setSelectedPace(paceParam);
      setDraftSelectedPace(paceParam);
    }
    if (modeParam === 'mixed' || modeParam === 'constant') {
      setPaceMode(modeParam);
      setDraftPaceMode(modeParam);
    }
    const parsedRows = parseMixedRows(mixedParam);
    if (parsedRows.length > 0) {
      setMixedRows(parsedRows);
      setDraftMixedRows(parsedRows);
    }
  }, []);

  useEffect(() => {
    setDraftProgramKey(programKey);
    setDraftStartTermKey(startTermKey);
    setDraftSelectedPace(selectedPace);
    setDraftPaceMode(paceMode);
    setDraftMixedRows(mixedRows);
  }, [programKey, startTermKey, selectedPace, paceMode, mixedRows]);

  const startTerm = useMemo(() => resolveStartTerm(startTermKey), [startTermKey]);
  const draftStartTerm = useMemo(
    () => resolveStartTerm(draftStartTermKey),
    [draftStartTermKey]
  );

  const paceRows = useMemo(() => {
    return PACE_OPTIONS.map((creditsPerTerm) => {
      const fullDegree = calculateFullDegree(
        draftProgramKey,
        degreeCreditsByProgram[draftProgramKey],
        creditsPerTerm,
        0,
        true,
        3
      );
      const finishTerm = getFinishTerm(draftStartTerm, fullDegree.numberOfTerms);
      return {
        creditsPerTerm,
        finishTerm,
        fullDegree
      };
    });
  }, [draftProgramKey, draftStartTerm]);

  const appliedPaceRows = useMemo(() => {
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

  const selectedRow =
    appliedPaceRows.find((row) => row.creditsPerTerm === selectedPace) ??
    appliedPaceRows[0];
  const selectedProgram = PROGRAMS.find((program) => program.key === programKey);
  const mixedPlan = useMemo(
    () =>
      calculateMixedPlan(programKey, degreeCreditsByProgram[programKey], startTerm, mixedRows),
    [programKey, startTerm, mixedRows]
  );
  const draftMixedPlan = useMemo(
    () =>
      calculateMixedPlan(
        draftProgramKey,
        degreeCreditsByProgram[draftProgramKey],
        draftStartTerm,
        draftMixedRows
      ),
    [draftProgramKey, draftStartTerm, draftMixedRows]
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
  const isDraftMixedIncomplete =
    draftMixedPlan.creditsCovered < degreeCreditsByProgram[draftProgramKey];

  const handleApplyDraft = useCallback(() => {
    shouldTrackPlanGenerated.current = true;
    setProgramKey(draftProgramKey);
    setStartTermKey(draftStartTermKey);
    setSelectedPace(draftSelectedPace);
    setPaceMode(draftPaceMode);
    setMixedRows(draftMixedRows);
  }, [
    draftMixedRows,
    draftPaceMode,
    draftProgramKey,
    draftSelectedPace,
    draftStartTermKey
  ]);

  useEffect(() => {
    if (!shouldTrackPlanGenerated.current) {
      return;
    }

    const isPlanValid = paceMode !== 'mixed' || !isMixedIncomplete;
    if (!isPlanValid) {
      shouldTrackPlanGenerated.current = false;
      return;
    }

    shouldTrackPlanGenerated.current = false;
    window.umami?.track('plan_generated');
  }, [activePlan, isMixedIncomplete, paceMode]);

  const scheduleShareReset = useCallback(() => {
    if (shareResetTimer.current) {
      window.clearTimeout(shareResetTimer.current);
    }
    shareResetTimer.current = window.setTimeout(() => {
      setShareStatus('idle');
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (shareResetTimer.current) {
        window.clearTimeout(shareResetTimer.current);
      }
    };
  }, []);

  const handleShare = useCallback(async () => {
    const url = buildShareUrl(programKey, startTermKey, selectedPace, paceMode, mixedRows);
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
      scheduleShareReset();
    } catch (error) {
      console.error('Clipboard unavailable', error);
      setShareStatus('error');
      scheduleShareReset();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [
    mixedRows,
    paceMode,
    programKey,
    scheduleShareReset,
    selectedPace,
    startTermKey
  ]);

  return {
    activePlan,
    draftMixedPlan,
    draftMixedRows,
    draftPaceMode,
    draftProgramKey,
    draftSelectedPace,
    draftStartTermKey,
    handleApplyDraft,
    handleShare,
    isDraftMixedIncomplete,
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
    setDraftMixedRows,
    setDraftPaceMode,
    setDraftProgramKey,
    setDraftSelectedPace,
    setDraftStartTermKey,
    setMixedRows,
    setPaceMode,
    setProgramKey,
    setSelectedPace,
    setStartTermKey
  };
};
