import React from 'react';
import { PROGRAMS, START_TERMS, degreeCreditsByProgram, type ProgramKey } from '../data/rates';
import {
  buildTermLabel,
  resolveStartTerm,
  type MixedLoadRow
} from '../lib/plan';

type PaceRow = {
  creditsPerTerm: number;
  finishTerm: { label: string };
  fullDegree: {
    totalCost: number;
    averagePerTerm: number;
    numberOfTerms: number;
  };
};

type PlanConfiguratorProps = {
  draftProgramKey: ProgramKey;
  draftStartTermKey: string;
  onDraftProgramChange: (programKey: ProgramKey) => void;
  onDraftStartTermChange: (termKey: string) => void;
  onApplyDraft: () => void;
  paceMode: 'constant' | 'mixed';
  onPaceModeChange: (mode: 'constant' | 'mixed') => void;
  paceRows: PaceRow[];
  selectedPace: number;
  onSelectPace: (pace: number) => void;
  mixedRows: MixedLoadRow[];
  onMixedRowsChange: React.Dispatch<React.SetStateAction<MixedLoadRow[]>>;
  programKey: ProgramKey;
  isMixedIncomplete: boolean;
};

const expandMixedRows = (rows: MixedLoadRow[]): number[] =>
  rows.flatMap((row) => Array.from({ length: row.terms }, () => row.creditsPerTerm));

const clampCredits = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(9, Math.round(value)));
};

const compressTermCredits = (credits: number[]): MixedLoadRow[] => {
  if (credits.length === 0) {
    return [];
  }
  const normalized = credits.map(clampCredits);
  const rows: MixedLoadRow[] = [];
  let currentCredits = normalized[0];
  let terms = 1;

  for (let index = 1; index < normalized.length; index += 1) {
    const nextCredits = normalized[index];
    if (nextCredits === currentCredits) {
      terms += 1;
    } else {
      rows.push({
        id: `row-${rows.length + 1}`,
        terms,
        creditsPerTerm: currentCredits
      });
      currentCredits = nextCredits;
      terms = 1;
    }
  }

  rows.push({
    id: `row-${rows.length + 1}`,
    terms,
    creditsPerTerm: currentCredits
  });

  return rows;
};

const PlanConfigurator: React.FC<PlanConfiguratorProps> = ({
  draftProgramKey,
  draftStartTermKey,
  onDraftProgramChange,
  onDraftStartTermChange,
  onApplyDraft,
  paceMode,
  onPaceModeChange,
  paceRows,
  selectedPace,
  onSelectPace,
  mixedRows,
  onMixedRowsChange,
  programKey,
  isMixedIncomplete
}) => {
  const selectedRow = paceRows.find((row) => row.creditsPerTerm === selectedPace) ?? paceRows[0];
  const termCredits = expandMixedRows(mixedRows);
  const requiredCredits = degreeCreditsByProgram[programKey];
  const plannedCredits = termCredits.reduce((sum, credits) => sum + credits, 0);
  const remainingCredits = Math.max(requiredCredits - plannedCredits, 0);
  const startTerm = resolveStartTerm(draftStartTermKey);

  const updateTermCredits = (updater: (credits: number[]) => number[]) => {
    onMixedRowsChange((rows) => {
      const credits = expandMixedRows(rows);
      const nextCredits = updater(credits);
      return compressTermCredits(nextCredits);
    });
  };

  const handleCreditChange = (index: number, value: number) => {
    updateTermCredits((credits) => {
      const next = [...credits];
      next[index] = clampCredits(value);
      return next;
    });
  };

  const handleAddTerm = () => {
    updateTermCredits((credits) => {
      const lastCredits = credits[credits.length - 1];
      const nextCredits = clampCredits(Number.isFinite(lastCredits) ? lastCredits : 3);
      return [...credits, nextCredits || 3];
    });
  };

  const handleRemoveLastTerm = () => {
    updateTermCredits((credits) => credits.slice(0, -1));
  };

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border border-tech-gold/40 bg-white p-3 shadow-sm sm:p-4"
      role="region"
      aria-label="Start your OMS plan"
    >
      <fieldset>
        <legend className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
          Start your OMS plan: program + start semester
        </legend>
        <div className="mt-3 grid gap-2">
          {PROGRAMS.map((program) => (
            <button
              key={program.key}
              type="button"
              onClick={() => onDraftProgramChange(program.key)}
              aria-pressed={draftProgramKey === program.key}
              className={`min-h-[40px] min-w-0 rounded-lg border px-3.5 py-2 text-left transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:min-h-[44px] sm:py-2.5 ${
                draftProgramKey === program.key
                  ? 'border-tech-gold/70 bg-tech-gold/15 shadow-inner'
                  : 'border-tech-gold/30 bg-tech-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)] hover:border-tech-gold/60 hover:bg-tech-gold/10'
              }`}
            >
              <p className="text-sm font-semibold leading-tight tracking-[0.08em] text-tech-navy sm:text-base">
                {program.key.toUpperCase()}
              </p>
              <p className="text-[10px] leading-tight tracking-[0.06em] text-tech-navy/70">
                {program.label}
              </p>
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="mt-2 block text-xs font-semibold text-tech-navy">
          Start semester
          <select
            className="mt-2 w-full rounded-lg border border-tech-gold/40 bg-white px-3 py-2 text-sm focus:border-tech-gold focus:outline-none focus:ring-2 focus:ring-tech-gold/30 focus-visible:ring-tech-gold/60"
            value={draftStartTermKey}
            onChange={(event) => onDraftStartTermChange(event.target.value)}
          >
            {START_TERMS.map((term) => (
              <option key={term.key} value={term.key}>
                {term.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onApplyDraft}
          className="mt-3 w-full rounded-lg bg-tech-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-tech-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Update My Plan
        </button>

        <div className="mt-4 rounded-2xl border border-tech-gold/30 bg-tech-gold/5 p-3 sm:p-4">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
              Pacing
            </p>
            <p className="text-xs text-tech-navy/60">
              Choose how many credits you&apos;ll take each term.
            </p>
          </div>

          <div className="mt-3 space-y-3" role="radiogroup" aria-label="Pacing options">
            <div
              className={`rounded-xl border transition ${
                paceMode === 'constant'
                  ? 'border-tech-gold/60 bg-tech-gold/15 shadow-sm'
                  : 'border-tech-gold/20 bg-tech-white/70'
              }`}
            >
              <button
                type="button"
                role="radio"
                aria-checked={paceMode === 'constant'}
                onClick={() => onPaceModeChange('constant')}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div>
                  <p className="text-sm font-semibold text-tech-navy">Same every term (Constant)</p>
                  <p className="mt-1 text-xs text-tech-navy/60">
                    Pick a steady credits-per-term pace.
                  </p>
                </div>
                <span
                  className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                    paceMode === 'constant'
                      ? 'border-tech-navy bg-tech-navy text-tech-white'
                      : 'border-tech-gold/40 bg-white'
                  }`}
                  aria-hidden="true"
                >
                  {paceMode === 'constant' ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                </span>
              </button>
              {paceMode === 'constant' ? (
                <div className="border-t border-tech-gold/20 px-4 py-4 text-xs">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                    Credits per term
                    <div className="mt-2 flex flex-wrap gap-2">
                      {paceRows.map((row) => (
                        <button
                          key={row.creditsPerTerm}
                          type="button"
                          onClick={() => onSelectPace(row.creditsPerTerm)}
                          aria-pressed={selectedPace === row.creditsPerTerm}
                          aria-label={`Select ${row.creditsPerTerm} credits per term`}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                            selectedPace === row.creditsPerTerm
                              ? 'border-tech-navy bg-tech-navy text-tech-white'
                              : 'border-tech-gold/40 bg-white text-tech-goldDark hover:bg-tech-gold/10'
                          }`}
                        >
                          {row.creditsPerTerm} credits
                        </button>
                      ))}
                    </div>
                  </label>
                  <div className="mt-3 grid gap-2 rounded-lg border border-tech-gold/20 bg-white px-3 py-2 text-[11px] text-tech-navy/70 sm:grid-cols-2">
                    <div>
                      <span className="font-semibold text-tech-navy">Estimated terms:</span>{' '}
                      {selectedRow.fullDegree.numberOfTerms}
                    </div>
                    <div>
                      <span className="font-semibold text-tech-navy">Estimated finish:</span>{' '}
                      {selectedRow.finishTerm.label}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className={`rounded-xl border transition ${
                paceMode === 'mixed'
                  ? 'border-tech-gold/60 bg-tech-gold/15 shadow-sm'
                  : 'border-tech-gold/20 bg-tech-white/70'
              }`}
            >
              <button
                type="button"
                role="radio"
                aria-checked={paceMode === 'mixed'}
                onClick={() => onPaceModeChange('mixed')}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div>
                  <p className="text-sm font-semibold text-tech-navy">Custom schedule (Mixed)</p>
                  <p className="mt-1 text-xs text-tech-navy/60">Some terms different than others.</p>
                </div>
                <span
                  className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                    paceMode === 'mixed'
                      ? 'border-tech-navy bg-tech-navy text-tech-white'
                      : 'border-tech-gold/40 bg-white'
                  }`}
                  aria-hidden="true"
                >
                  {paceMode === 'mixed' ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                </span>
              </button>
              {paceMode === 'mixed' ? (
                <div className="border-t border-tech-gold/20 px-4 py-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                      Plan by term
                    </p>
                    <button
                      type="button"
                      onClick={handleAddTerm}
                      className="rounded-full border border-tech-gold/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark transition hover:bg-tech-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      Add term
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {termCredits.map((credits, index) => {
                      const termLabel = buildTermLabel(startTerm, index);
                      const isLast = index === termCredits.length - 1;
                      return (
                        <div
                          key={`${termLabel}-${index}`}
                          className="grid gap-2 rounded-lg border border-tech-gold/20 bg-white px-3 py-2 sm:grid-cols-[1fr_auto] sm:items-center"
                        >
                          <div>
                            <p className="text-sm font-semibold text-tech-navy">{termLabel}</p>
                            <p className="text-[11px] text-tech-navy/60">Set credits for this term.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                              Credits
                              <input
                                type="number"
                                min={0}
                                max={9}
                                className="mt-1 w-20 rounded-lg border border-tech-gold/30 px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                value={credits}
                                onChange={(event) =>
                                  handleCreditChange(index, Number(event.target.value))
                                }
                                aria-label={`Credits for ${termLabel}`}
                              />
                            </label>
                            {isLast && termCredits.length > 1 ? (
                              <button
                                type="button"
                                onClick={handleRemoveLastTerm}
                                className="mt-5 rounded-full border border-tech-gold/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark transition hover:bg-tech-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 rounded-lg border border-tech-gold/30 bg-tech-gold/10 px-3 py-2 text-[11px] text-tech-navy/70">
                    Planned credits: {plannedCredits} • Required: {requiredCredits} • Remaining:{' '}
                    {remainingCredits}
                  </div>
                  {remainingCredits > 0 || isMixedIncomplete ? (
                    <p className="mt-2 text-[11px] text-tech-goldDark">
                      Add more terms to cover remaining credits.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanConfigurator;
