import React, { useEffect, useMemo, useState } from 'react';
import {
  PROGRAMS,
  START_TERMS,
  degreeCreditsByProgram,
  onlineLearningFeeRule,
  perCreditRateByProgram,
  type ProgramKey,
  type StartTermOption,
  type TermSeason
} from './data/rates';
import { calculateFullDegree, formatCurrency, getOnlineLearningFee } from './lib/calc';

const PACE_OPTIONS = [3, 6, 9];
const TERM_SEQUENCE: TermSeason[] = ['Spring', 'Summer', 'Fall'];

const getFinishTerm = (startTerm: StartTermOption, numberOfTerms: number): StartTermOption => {
  if (numberOfTerms <= 1) {
    return startTerm;
  }
  const startIndex = TERM_SEQUENCE.indexOf(startTerm.season);
  const finishIndex = startIndex + (numberOfTerms - 1);
  const yearOffset = Math.floor(finishIndex / TERM_SEQUENCE.length);
  const season = TERM_SEQUENCE[finishIndex % TERM_SEQUENCE.length];
  const year = startTerm.year + yearOffset;
  return {
    key: `${season.toLowerCase()}-${year}`,
    season,
    year,
    label: `${season} ${year}`
  };
};

type MixedLoadRow = {
  id: string;
  terms: number;
  creditsPerTerm: number;
};

type MixedPlanResult = {
  numberOfTerms: number;
  totalFees: number;
  totalTuition: number;
  totalCost: number;
  averagePerTerm: number;
  finishTerm: StartTermOption;
  feePayments: number;
  plannedCredits: number;
  creditsCovered: number;
  schedule: Array<{
    termLabel: string;
    credits: number;
    fee: number;
  }>;
};

type AppliedPlan = {
  programKey: ProgramKey;
  startTermKey: string;
  selectedPace: number;
  paceMode: 'constant' | 'mixed';
  mixedRows: MixedLoadRow[];
};

const DEFAULT_MIXED_ROWS: MixedLoadRow[] = [
  { id: 'row-1', terms: 4, creditsPerTerm: 3 },
  { id: 'row-2', terms: 4, creditsPerTerm: 6 },
  { id: 'row-3', terms: 2, creditsPerTerm: 3 }
];

const buildShareUrl = (
  programKey: ProgramKey,
  startTermKey: string,
  pace: number,
  mode: 'constant' | 'mixed',
  mixedRows: MixedLoadRow[]
): string => {
  const params = new URLSearchParams();
  params.set('program', programKey);
  params.set('start', startTermKey);
  params.set('pace', String(pace));
  params.set('mode', mode);
  if (mode === 'mixed') {
    const serialized = mixedRows
      .map((row) => `${row.terms}x${row.creditsPerTerm}`)
      .join(',');
    params.set('mixed', serialized);
  }
  const query = params.toString();
  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
};

const buildTermLabel = (startTerm: StartTermOption, offset: number): string => {
  const startIndex = TERM_SEQUENCE.indexOf(startTerm.season);
  const targetIndex = startIndex + offset;
  const yearOffset = Math.floor(targetIndex / TERM_SEQUENCE.length);
  const season = TERM_SEQUENCE[((targetIndex % TERM_SEQUENCE.length) + TERM_SEQUENCE.length) % TERM_SEQUENCE.length];
  const year = startTerm.year + yearOffset;
  return `${season} ${year}`;
};

const calculateMixedPlan = (
  programKey: ProgramKey,
  totalCredits: number,
  startTerm: StartTermOption,
  rows: MixedLoadRow[]
): MixedPlanResult => {
  const sanitizedRows = rows.map((row) => ({
    ...row,
    terms: Number.isFinite(row.terms) ? Math.max(0, row.terms) : 0,
    creditsPerTerm: Number.isFinite(row.creditsPerTerm) ? Math.max(0, row.creditsPerTerm) : 0
  }));
  const totalTuition = Math.round(perCreditRateByProgram[programKey] * totalCredits * 100) / 100;
  const plannedCredits = sanitizedRows.reduce(
    (sum, row) => sum + row.terms * row.creditsPerTerm,
    0
  );
  let creditsRemaining = totalCredits;
  let totalFees = 0;
  let numberOfTerms = 0;
  const schedule: MixedPlanResult['schedule'] = [];

  for (const row of sanitizedRows) {
    for (let termIndex = 0; termIndex < row.terms; termIndex += 1) {
      if (creditsRemaining <= 0) {
        break;
      }
      numberOfTerms += 1;
      const creditsThisTerm = Math.min(row.creditsPerTerm, creditsRemaining);
      const fee = getOnlineLearningFee(creditsThisTerm);
      totalFees = Math.round((totalFees + fee) * 100) / 100;
      schedule.push({
        termLabel: buildTermLabel(startTerm, numberOfTerms - 1),
        credits: creditsThisTerm,
        fee
      });
      creditsRemaining -= creditsThisTerm;
    }
    if (creditsRemaining <= 0) {
      break;
    }
  }

  const creditsCovered = totalCredits - Math.max(creditsRemaining, 0);
  const totalCost = Math.round((totalTuition + totalFees) * 100) / 100;
  const averagePerTerm =
    numberOfTerms > 0 ? Math.round((totalCost / numberOfTerms) * 100) / 100 : 0;
  const finishTerm = getFinishTerm(startTerm, Math.max(numberOfTerms, 1));

  return {
    numberOfTerms,
    totalFees,
    totalTuition,
    totalCost,
    averagePerTerm,
    finishTerm,
    feePayments: numberOfTerms,
    plannedCredits,
    creditsCovered,
    schedule
  };
};

const App: React.FC = () => {
  const [programKey, setProgramKey] = useState<ProgramKey>('omscs');
  const [startTermKey, setStartTermKey] = useState<string>(START_TERMS[0]?.key ?? 'spring-2026');
  const [selectedPace, setSelectedPace] = useState<number>(6);
  const [paceMode, setPaceMode] = useState<'constant' | 'mixed'>('constant');
  const [mixedRows, setMixedRows] = useState<MixedLoadRow[]>(DEFAULT_MIXED_ROWS);
  const [appliedPlan, setAppliedPlan] = useState<AppliedPlan>({
    programKey: 'omscs',
    startTermKey: START_TERMS[0]?.key ?? 'spring-2026',
    selectedPace: 6,
    paceMode: 'constant',
    mixedRows: DEFAULT_MIXED_ROWS
  });
  const [shareStatus, setShareStatus] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const programParam = params.get('program');
    const startParam = params.get('start');
    const paceParam = Number(params.get('pace'));
    const modeParam = params.get('mode');
    const mixedParam = params.get('mixed');

    let nextProgramKey: ProgramKey = 'omscs';
    let nextStartTermKey = START_TERMS[0]?.key ?? 'spring-2026';
    let nextSelectedPace = 6;
    let nextPaceMode: 'constant' | 'mixed' = 'constant';
    let nextMixedRows = DEFAULT_MIXED_ROWS;

    if (programParam && programParam in perCreditRateByProgram) {
      nextProgramKey = programParam as ProgramKey;
    }
    if (startParam && START_TERMS.some((term) => term.key === startParam)) {
      nextStartTermKey = startParam;
    }
    if (PACE_OPTIONS.includes(paceParam)) {
      nextSelectedPace = paceParam;
    }
    if (modeParam === 'mixed' || modeParam === 'constant') {
      nextPaceMode = modeParam;
    }
    if (mixedParam) {
      const parsedRows = mixedParam
        .split(',')
        .map((segment, index) => {
          const [termsRaw, creditsRaw] = segment.split('x');
          const terms = Number(termsRaw);
          const creditsPerTerm = Number(creditsRaw);
          if (!Number.isFinite(terms) || !Number.isFinite(creditsPerTerm)) {
            return null;
          }
          return {
            id: `row-${index + 1}`,
            terms: Math.max(0, terms),
            creditsPerTerm: Math.max(0, creditsPerTerm)
          } as MixedLoadRow;
        })
        .filter((row): row is MixedLoadRow => Boolean(row));
      if (parsedRows.length > 0) {
        nextMixedRows = parsedRows;
      }
    }

    setProgramKey(nextProgramKey);
    setStartTermKey(nextStartTermKey);
    setSelectedPace(nextSelectedPace);
    setPaceMode(nextPaceMode);
    setMixedRows(nextMixedRows);
    setAppliedPlan({
      programKey: nextProgramKey,
      startTermKey: nextStartTermKey,
      selectedPace: nextSelectedPace,
      paceMode: nextPaceMode,
      mixedRows: nextMixedRows
    });
  }, []);

  const startTerm = useMemo(() => {
    return START_TERMS.find((term) => term.key === startTermKey) ?? START_TERMS[0];
  }, [startTermKey]);

  const appliedStartTerm = useMemo(() => {
    return (
      START_TERMS.find((term) => term.key === appliedPlan.startTermKey) ?? START_TERMS[0]
    );
  }, [appliedPlan.startTermKey]);

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
  const selectedProgram = PROGRAMS.find((program) => program.key === appliedPlan.programKey);
  const mixedPlanDraft = useMemo(
    () =>
      calculateMixedPlan(programKey, degreeCreditsByProgram[programKey], startTerm, mixedRows),
    [programKey, startTerm, mixedRows]
  );
  const appliedConstantPlan = useMemo(() => {
    const fullDegree = calculateFullDegree(
      appliedPlan.programKey,
      degreeCreditsByProgram[appliedPlan.programKey],
      appliedPlan.selectedPace,
      0,
      true,
      3
    );
    const finishTerm = getFinishTerm(appliedStartTerm, fullDegree.numberOfTerms);
    return {
      fullDegree,
      finishTerm
    };
  }, [
    appliedPlan.programKey,
    appliedPlan.selectedPace,
    appliedStartTerm,
    degreeCreditsByProgram
  ]);
  const mixedPlan = useMemo(
    () =>
      calculateMixedPlan(
        appliedPlan.programKey,
        degreeCreditsByProgram[appliedPlan.programKey],
        appliedStartTerm,
        appliedPlan.mixedRows
      ),
    [appliedPlan.programKey, appliedPlan.mixedRows, appliedStartTerm]
  );
  const activePlan =
    appliedPlan.paceMode === 'mixed'
      ? mixedPlan
      : {
          numberOfTerms: appliedConstantPlan.fullDegree.numberOfTerms,
          totalFees: appliedConstantPlan.fullDegree.totalFees,
          totalTuition: appliedConstantPlan.fullDegree.totalTuition,
          totalCost: appliedConstantPlan.fullDegree.totalCost,
          averagePerTerm: appliedConstantPlan.fullDegree.averagePerTerm,
          finishTerm: appliedConstantPlan.finishTerm,
          feePayments: appliedConstantPlan.fullDegree.numberOfTerms,
          plannedCredits: degreeCreditsByProgram[appliedPlan.programKey],
          creditsCovered: degreeCreditsByProgram[appliedPlan.programKey],
          schedule: []
        };
  const isMixedIncomplete =
    mixedPlanDraft.creditsCovered < degreeCreditsByProgram[programKey];
  const isPlanDirty = useMemo(() => {
    const mixedRowsChanged =
      mixedRows.length !== appliedPlan.mixedRows.length ||
      mixedRows.some((row, index) => {
        const appliedRow = appliedPlan.mixedRows[index];
        if (!appliedRow) {
          return true;
        }
        return row.terms !== appliedRow.terms || row.creditsPerTerm !== appliedRow.creditsPerTerm;
      });
    return (
      programKey !== appliedPlan.programKey ||
      startTermKey !== appliedPlan.startTermKey ||
      selectedPace !== appliedPlan.selectedPace ||
      paceMode !== appliedPlan.paceMode ||
      mixedRowsChanged
    );
  }, [
    appliedPlan,
    mixedRows,
    paceMode,
    programKey,
    selectedPace,
    startTermKey
  ]);

  const handleShare = async () => {
    const url = buildShareUrl(
      appliedPlan.programKey,
      appliedPlan.startTermKey,
      appliedPlan.selectedPace,
      appliedPlan.paceMode,
      appliedPlan.mixedRows
    );
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('Link copied to clipboard.');
    } catch (error) {
      console.error('Clipboard unavailable', error);
      setShareStatus('Copy failed. Link opened in a new tab.');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleApplyPlan = () => {
    setAppliedPlan({
      programKey,
      startTermKey,
      selectedPace,
      paceMode,
      mixedRows
    });
    setShareStatus('');
  };

  return (
    <div className="min-h-screen bg-tech-white text-tech-navy">
      <div className="mx-auto flex min-h-screen max-w-[1320px] flex-col px-4 py-4">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-tech-goldDark">
              Georgia Tech Online
            </p>
            <h1 className="text-2xl font-semibold text-tech-goldMedium">
              OMS Degree Planning Calculator
            </h1>
            <p className="text-xs text-tech-navy/70">
              Compare pacing options and map the fastest, most cost-efficient OMS degree plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg bg-tech-navy px-4 py-2 font-semibold text-tech-white transition hover:opacity-90"
            >
              Share My Degree Plan
            </button>
          </div>
        </header>

        {shareStatus ? <p className="mt-2 text-xs text-tech-goldDark">{shareStatus}</p> : null}

        <main className="dashboard-grid mt-3 grid flex-1 gap-4 lg:grid-cols-[minmax(360px,1fr)_minmax(520px,2fr)]">
          <section className="flex flex-col gap-3 rounded-2xl border border-tech-gold/40 bg-white p-4 shadow-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                Step 1 — Choose Program
              </p>
              <div className="mt-3 grid gap-2">
                {PROGRAMS.map((program) => (
                  <button
                    key={program.key}
                    type="button"
                    onClick={() => setProgramKey(program.key)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      programKey === program.key
                        ? 'border-tech-gold bg-tech-gold/20'
                        : 'border-tech-gold/30 bg-tech-white hover:border-tech-gold/60'
                    }`}
                  >
                    <p className="text-base font-semibold text-tech-navy">
                      {program.key.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-tech-navy/70">{program.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                Pacing
              </p>
              <label className="mt-2 block text-xs font-semibold text-tech-navy">
                Start semester
                <select
                  className="mt-2 w-full rounded-lg border border-tech-gold/40 bg-white px-3 py-2 text-sm focus:border-tech-gold focus:outline-none focus:ring-2 focus:ring-tech-gold/30"
                  value={startTermKey}
                  onChange={(event) => setStartTermKey(event.target.value)}
                >
                  {START_TERMS.map((term) => (
                    <option key={term.key} value={term.key}>
                      {term.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-3 grid gap-2">
                <div className="inline-flex rounded-full border border-tech-gold/30 bg-tech-white p-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                  <button
                    type="button"
                    onClick={() => setPaceMode('constant')}
                    className={`rounded-full px-3 py-2 transition ${
                      paceMode === 'constant'
                        ? 'bg-tech-navy text-tech-white'
                        : 'text-tech-goldDark hover:bg-tech-gold/10'
                    }`}
                  >
                    Constant Pace
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaceMode('mixed')}
                    className={`rounded-full px-3 py-2 transition ${
                      paceMode === 'mixed'
                        ? 'bg-tech-navy text-tech-white'
                        : 'text-tech-goldDark hover:bg-tech-gold/10'
                    }`}
                  >
                    Custom Mixed Load
                  </button>
                </div>

                {paceMode === 'constant' ? (
                  <div className="rounded-xl border border-tech-gold/30 bg-tech-white p-3 text-xs">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                      Courses per term
                      <select
                        className="mt-2 w-full rounded-lg border border-tech-gold/30 bg-white px-3 py-2 text-sm focus:border-tech-gold focus:outline-none focus:ring-2 focus:ring-tech-gold/30"
                        value={selectedPace}
                        onChange={(event) => setSelectedPace(Number(event.target.value))}
                      >
                        {PACE_OPTIONS.map((paceOption) => (
                          <option key={paceOption} value={paceOption}>
                            {paceOption} credits
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="mt-3 space-y-2 rounded-lg border border-tech-gold/20 bg-tech-gold/10 px-3 py-2 text-[11px] text-tech-navy/80">
                      <div className="flex items-center justify-between">
                        <span>Estimated finish</span>
                        <span className="font-semibold">{selectedRow.finishTerm.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Projected total</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedRow.fullDegree.totalCost)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Avg per term</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedRow.fullDegree.averagePerTerm)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-tech-gold/30 bg-tech-white p-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                        Mixed Load Planner
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setMixedRows((rows) => [
                            ...rows,
                            {
                              id: `row-${rows.length + 1}`,
                              terms: 1,
                              creditsPerTerm: 3
                            }
                          ])
                        }
                        className="rounded-full border border-tech-gold/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark transition hover:bg-tech-gold/10"
                      >
                        Add block
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {mixedRows.map((row, index) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"
                        >
                          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                            Terms
                            <input
                              type="number"
                              min={0}
                              className="mt-1 w-full rounded-lg border border-tech-gold/30 px-2 py-1 text-sm"
                              value={row.terms}
                              onChange={(event) => {
                                const value = Number(event.target.value);
                                setMixedRows((rows) =>
                                  rows.map((item) =>
                                    item.id === row.id
                                      ? { ...item, terms: Number.isFinite(value) ? value : 0 }
                                      : item
                                  )
                                );
                              }}
                            />
                          </label>
                          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                            Credits each
                            <input
                              type="number"
                              min={0}
                              className="mt-1 w-full rounded-lg border border-tech-gold/30 px-2 py-1 text-sm"
                              value={row.creditsPerTerm}
                              onChange={(event) => {
                                const value = Number(event.target.value);
                                setMixedRows((rows) =>
                                  rows.map((item) =>
                                    item.id === row.id
                                      ? {
                                          ...item,
                                          creditsPerTerm: Number.isFinite(value) ? value : 0
                                        }
                                      : item
                                  )
                                );
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setMixedRows((rows) => rows.filter((item) => item.id !== row.id))
                            }
                            disabled={mixedRows.length === 1}
                            className="mt-4 rounded-full border border-tech-gold/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark transition hover:bg-tech-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Remove block ${index + 1}`}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg border border-tech-gold/30 bg-tech-gold/10 px-3 py-2 text-[11px] text-tech-navy/70">
                      Planned credits: {mixedPlanDraft.plannedCredits} · Required:{' '}
                      {degreeCreditsByProgram[programKey]} · Covered:{' '}
                      {mixedPlanDraft.creditsCovered}
                    </div>
                    {isMixedIncomplete ? (
                      <p className="mt-2 text-[11px] text-tech-goldDark">
                        Add more terms to cover the remaining credits.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyPlan}
              disabled={!isPlanDirty}
              className="mt-2 w-full rounded-xl bg-tech-goldMedium px-4 py-2 text-sm font-semibold text-tech-navy transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Update Dashboard
            </button>
          </section>

          <section className="flex flex-col gap-3">
            <section className="flex flex-col gap-3 rounded-2xl border border-tech-gold/40 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-tech-goldMedium">Financial Summary</h2>
              <div className="rounded-2xl bg-tech-navy px-4 py-4 text-tech-white">
                <h3 className="text-sm font-semibold text-tech-gold">
                  Your {selectedProgram?.key.toUpperCase()} Plan
                </h3>
                <div className="mt-3">
                  <p className="text-3xl font-semibold">
                    {formatCurrency(activePlan.totalCost)}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-tech-gold">
                    Total Degree Cost
                  </p>
                  <p className="mt-1 text-xs text-tech-gold">
                    Finish {activePlan.finishTerm.label}
                  </p>
                </div>
                <div className="mt-4 grid gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Avg per term</span>
                    <span className="font-semibold">
                      {formatCurrency(activePlan.averagePerTerm)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Terms needed</span>
                    <span className="font-semibold">{activePlan.numberOfTerms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tuition total</span>
                    <span className="font-semibold">
                      {formatCurrency(activePlan.totalTuition)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fee total</span>
                    <span className="font-semibold">{formatCurrency(activePlan.totalFees)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                    Tuition total
                  </p>
                  <p className="mt-2 text-lg font-semibold text-tech-navy">
                    {formatCurrency(activePlan.totalTuition)}
                  </p>
                </div>
                <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                    Fee total
                  </p>
                  <p className="mt-2 text-lg font-semibold text-tech-navy">
                    {formatCurrency(activePlan.totalFees)}
                  </p>
                </div>
                <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                    Avg per term
                  </p>
                  <p className="mt-2 text-lg font-semibold text-tech-navy">
                    {formatCurrency(activePlan.averagePerTerm)}
                  </p>
                </div>
                <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                    Time to graduate
                  </p>
                  <p className="mt-2 text-lg font-semibold text-tech-navy">
                    {activePlan.numberOfTerms} semesters
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-tech-gold/30 bg-tech-gold/10 px-4 py-3 text-xs text-tech-navy">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                  Fee Strategy
                </p>
                <p className="mt-2">
                  You pay the online fee {activePlan.feePayments} times across your degree.
                </p>
              </div>

              <div className="rounded-2xl border border-tech-gold/30 bg-white px-4 py-3 text-xs text-tech-navy/80">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                  Official rates (Spring 2026)
                </p>
                <div className="mt-2 space-y-2">
                  {PROGRAMS.map((program) => (
                    <div key={program.key} className="flex items-center justify-between">
                      <span>{program.label}</span>
                      <span className="font-semibold">
                        {formatCurrency(program.perCreditRate)}/credit
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-tech-gold/30 pt-2">
                    <p>
                      Fee rule: credits &lt; {onlineLearningFeeRule.thresholdCredits} ⇒{' '}
                      {formatCurrency(onlineLearningFeeRule.belowThresholdFee)}, credits ≥{' '}
                      {onlineLearningFeeRule.thresholdCredits} ⇒{' '}
                      {formatCurrency(onlineLearningFeeRule.atOrAboveThresholdFee)}
                    </p>
                  </div>
                  <div className="border-t border-tech-gold/30 pt-2">
                    <p className="font-semibold">Degree credit requirements</p>
                    {PROGRAMS.map((program) => (
                      <p key={program.key}>
                        {program.label}: {degreeCreditsByProgram[program.key]} credits
                      </p>
                    ))}
                  </div>
                  <div className="rounded-lg border border-tech-gold/30 bg-tech-gold/10 px-3 py-2 text-[11px] text-tech-navy/70">
                    Data transparency:{' '}
                    <a
                      href="https://bursar.gatech.edu/student/tuition/sp26/sp26_totalsA.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-tech-navy underline decoration-tech-gold/60 underline-offset-2"
                    >
                      Spring 2026 rates PDF
                    </a>
                    .
                  </div>
                </div>
              </div>
            </section>

            {appliedPlan.paceMode === 'mixed' ? (
              <section className="rounded-2xl border border-tech-gold/30 bg-white px-4 py-3 text-xs text-tech-navy/80 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                  Calendar timeline
                </p>
                <div className="mt-2 space-y-2">
                  {mixedPlan.schedule.length === 0 ? (
                    <p className="text-tech-navy/60">Add terms to see a timeline.</p>
                  ) : (
                    mixedPlan.schedule.map((term) => {
                      const termTuition =
                        Math.round(
                          perCreditRateByProgram[appliedPlan.programKey] * term.credits * 100
                        ) / 100;
                      const termTotal =
                        Math.round((termTuition + term.fee) * 100) / 100;
                      return (
                        <div key={term.termLabel} className="flex items-center justify-between">
                          <span>{term.termLabel}</span>
                          <span className="font-semibold">
                            {term.credits} credits | Total: {formatCurrency(termTotal)} (Fee:{' '}
                            {formatCurrency(term.fee)})
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            ) : null}

            <details className="rounded-2xl border border-tech-gold/40 bg-white p-4 text-xs text-tech-navy/80 shadow-sm">
              <summary className="cursor-pointer text-sm font-semibold text-tech-goldMedium">
                Explain the math
              </summary>
              <ul className="mt-3 space-y-2">
                <li>
                  <strong className="text-tech-goldDark">Total tuition:</strong> required credits ×
                  per-credit rate.
                </li>
                <li>
                  <strong className="text-tech-goldDark">Terms needed:</strong> ceil(required credits
                  ÷ credits per term).
                </li>
                <li>
                  <strong className="text-tech-goldDark">Fee per term:</strong> credits per term &lt;{' '}
                  {onlineLearningFeeRule.thresholdCredits}
                  ? {formatCurrency(onlineLearningFeeRule.belowThresholdFee)} :{' '}
                  {formatCurrency(onlineLearningFeeRule.atOrAboveThresholdFee)}.
                </li>
                <li>
                  <strong className="text-tech-goldDark">Total fees:</strong> fee per term × terms
                  needed.
                </li>
                <li>
                  <strong className="text-tech-goldDark">Finish semester:</strong> advance term-by-term
                  using Spring → Summer → Fall (3 terms per year).
                </li>
              </ul>
            </details>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
