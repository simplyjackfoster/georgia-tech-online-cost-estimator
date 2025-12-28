import React from 'react';
import { PROGRAMS, START_TERMS, degreeCreditsByProgram, type ProgramKey } from '../data/rates';
import { formatCurrency } from '../lib/calc';
import { type MixedLoadRow, type MixedPlanResult } from '../lib/plan';

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
  mixedPlan: MixedPlanResult;
  programKey: ProgramKey;
  isMixedIncomplete: boolean;
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
  mixedPlan,
  programKey,
  isMixedIncomplete
}) => {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-tech-gold/40 bg-white p-4 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
          Start your OMS plan: program + start semester
        </p>
        <div className="mt-3 grid gap-2">
          {PROGRAMS.map((program) => (
            <button
              key={program.key}
              type="button"
              onClick={() => onDraftProgramChange(program.key)}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                draftProgramKey === program.key
                  ? 'border-tech-gold bg-tech-gold/20'
                  : 'border-tech-gold/30 bg-tech-white hover:border-tech-gold/60'
              }`}
            >
              <p className="text-lg font-semibold text-tech-navy">{program.key.toUpperCase()}</p>
              <p className="text-xs text-tech-navy/70">{program.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mt-2 block text-xs font-semibold text-tech-navy">
          Start semester
          <select
            className="mt-2 w-full rounded-lg border border-tech-gold/40 bg-white px-3 py-2 text-sm focus:border-tech-gold focus:outline-none focus:ring-2 focus:ring-tech-gold/30"
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
          className="mt-3 w-full rounded-lg bg-tech-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-tech-white transition hover:opacity-90"
        >
          Update My Plan
        </button>

        <div className="mt-4 rounded-2xl border border-tech-gold/30 bg-tech-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
              Compare paces
            </p>
            <div className="inline-flex rounded-lg border border-tech-gold/40 bg-tech-gold/10 p-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
              <button
                type="button"
                onClick={() => onPaceModeChange('constant')}
                aria-pressed={paceMode === 'constant'}
                className={`rounded-md px-3 py-1.5 transition ${
                  paceMode === 'constant'
                    ? 'bg-tech-navy text-tech-white shadow-sm'
                    : 'text-tech-goldDark hover:bg-tech-gold/20'
                }`}
              >
                Constant Pace
              </button>
              <button
                type="button"
                onClick={() => onPaceModeChange('mixed')}
                aria-pressed={paceMode === 'mixed'}
                className={`rounded-md px-3 py-1.5 transition ${
                  paceMode === 'mixed'
                    ? 'bg-tech-navy text-tech-white shadow-sm'
                    : 'text-tech-goldDark hover:bg-tech-gold/20'
                }`}
              >
                Mixed Load
              </button>
            </div>
          </div>

          {paceMode === 'constant' ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-tech-gold/30">
              <table className="w-full text-left text-xs">
                <thead className="bg-tech-gold/10 text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
                  <tr>
                    <th className="px-3 py-2">Credits / Term</th>
                    <th className="px-3 py-2">Finish Semester</th>
                    <th className="px-3 py-2">Total Cost</th>
                    <th className="px-3 py-2">Avg / Term</th>
                  </tr>
                </thead>
                <tbody>
                  {paceRows.map((row) => (
                    <tr
                      key={row.creditsPerTerm}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectPace(row.creditsPerTerm)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelectPace(row.creditsPerTerm);
                        }
                      }}
                      className={`cursor-pointer border-t border-tech-gold/20 transition ${
                        selectedPace === row.creditsPerTerm
                          ? 'bg-tech-navy text-tech-white'
                          : 'hover:bg-tech-gold/10'
                      }`}
                      aria-pressed={selectedPace === row.creditsPerTerm}
                      aria-label={`Select ${row.creditsPerTerm} credits per term`}
                    >
                      <td className="px-3 py-2 font-semibold">{row.creditsPerTerm}</td>
                      <td className="px-3 py-2">{row.finishTerm.label}</td>
                      <td className="px-3 py-2">{formatCurrency(row.fullDegree.totalCost)}</td>
                      <td className="px-3 py-2">{formatCurrency(row.fullDegree.averagePerTerm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-tech-gold/30 bg-tech-white p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                  Mixed Load Planner
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onMixedRowsChange((rows) => [
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
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                      Terms
                      <input
                        type="number"
                        min={0}
                        className="mt-1 w-full rounded-lg border border-tech-gold/30 px-2 py-1 text-sm"
                        value={row.terms}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          onMixedRowsChange((rows) =>
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
                          onMixedRowsChange((rows) =>
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
                        onMixedRowsChange((rows) => rows.filter((item) => item.id !== row.id))
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
                Planned credits: {mixedPlan.plannedCredits} · Required:{' '}
                {degreeCreditsByProgram[programKey]} · Covered: {mixedPlan.creditsCovered}
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
    </section>
  );
};

export default PlanConfigurator;
