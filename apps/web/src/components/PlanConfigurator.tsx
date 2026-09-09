import React from 'react';
import {
  CURRENT_RATES,
  PROGRAMS,
  RESIDENCY_OPTIONS,
  START_TERMS,
  getPerCreditRate,
  type Residency
} from '../data/rates';
import { formatCurrency } from '../lib/calc';
import { addTerm, expandMixedRows, removeLastTerm, setTermCredits, type MixedLoadRow } from '../lib/mixedRows';
import { buildTermLabel, resolveStartTerm, type PaceMode, type PaceRow, type PlanSelection } from '../lib/plan';
import ChoiceGroup from './ChoiceGroup';

type PlanConfiguratorProps = {
  draft: PlanSelection;
  paceRows: PaceRow[];
  isMixedIncomplete: boolean;
  onChange: (patch: Partial<PlanSelection>) => void;
  onMixedRowsChange: (updater: (rows: MixedLoadRow[]) => MixedLoadRow[]) => void;
  onApply: () => void;
};

const PROGRAM_OPTIONS = PROGRAMS.map((program) => ({
  value: program.key,
  label: program.key.toUpperCase(),
  description: program.label
}));

const RESIDENCY_CHOICES = RESIDENCY_OPTIONS.map((option) => ({
  value: option.key,
  label: option.label
}));

const PACE_MODE_OPTIONS: Array<{ value: PaceMode; title: string; description: string }> = [
  { value: 'constant', title: 'Same every term (Constant)', description: 'Pick a steady credits-per-term pace.' },
  { value: 'mixed', title: 'Custom schedule (Mixed)', description: 'Some terms different than others.' }
];

const PlanConfigurator: React.FC<PlanConfiguratorProps> = ({
  draft,
  paceRows,
  isMixedIncomplete,
  onChange,
  onMixedRowsChange,
  onApply
}) => {
  const selectedRow = paceRows.find((row) => row.creditsPerTerm === draft.pace) ?? paceRows[0];
  const paceChoices = paceRows.map((row) => ({
    value: String(row.creditsPerTerm),
    label: `${row.creditsPerTerm} credits`
  }));

  return (
    <section className="card flex flex-col gap-3" role="region" aria-label="Start your OMS plan">
      <ChoiceGroup
        legend="Start your OMS plan: program + start semester"
        options={PROGRAM_OPTIONS}
        value={draft.programKey}
        onChange={(programKey) => onChange({ programKey })}
        variant="tile"
      />

      <ChoiceGroup
        legend="Residency"
        legendClassName="text-xs font-semibold text-tech-navy"
        options={RESIDENCY_CHOICES}
        value={draft.residency}
        onChange={(residency: Residency) => onChange({ residency })}
      >
        <p className="mt-2 text-[11px] text-tech-navy/60">
          {formatCurrency(getPerCreditRate(draft.programKey, draft.residency))}/credit. Admitted before
          Fall 2025? You pay the in-state rate.
        </p>
      </ChoiceGroup>

      <div>
        <label className="mt-2 block text-xs font-semibold text-tech-navy">
          Start semester
          <select
            className="focus-ring mt-2 w-full rounded-lg border border-tech-gold/40 bg-white px-3 py-2 text-sm focus:border-tech-gold focus:ring-2 focus:ring-tech-gold/30"
            value={draft.startTermKey}
            onChange={(event) => onChange({ startTermKey: event.target.value })}
          >
            {START_TERMS.map((term) => (
              <option key={term.key} value={term.key}>
                {term.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={onApply} className="btn-primary mt-3 w-full">
          Update My Plan
        </button>
      </div>

      <div className="rounded-2xl border border-tech-gold/30 bg-tech-gold/5 p-3 sm:p-4">
        <p className="eyebrow">Pacing</p>
        <p className="text-xs text-tech-navy/60">Choose how many credits you&apos;ll take each term.</p>

        <fieldset className="mt-3 space-y-3">
          <legend className="sr-only">Pacing options</legend>
          {PACE_MODE_OPTIONS.map((option) => {
            const isActive = draft.paceMode === option.value;
            return (
              <div
                key={option.value}
                className={`rounded-xl border transition ${
                  isActive ? 'border-tech-gold/60 bg-tech-gold/15 shadow-sm' : 'border-tech-gold/20 bg-tech-white/70'
                }`}
              >
                <label className="flex cursor-pointer items-start justify-between gap-3 px-4 py-3">
                  <input
                    type="radio"
                    className="choice-input"
                    name="pace-mode"
                    value={option.value}
                    checked={isActive}
                    onChange={() => onChange({ paceMode: option.value })}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-tech-navy">{option.title}</span>
                    <span className="mt-1 block text-xs text-tech-navy/60">{option.description}</span>
                  </span>
                  <span
                    className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      isActive ? 'border-tech-navy bg-tech-navy' : 'border-tech-gold/40 bg-white'
                    }`}
                    aria-hidden="true"
                  >
                    {isActive ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                  </span>
                </label>

                {isActive && option.value === 'constant' ? (
                  <div className="border-t border-tech-gold/20 px-4 py-4 text-xs">
                    <ChoiceGroup
                      legend="Credits per term"
                      options={paceChoices}
                      value={String(draft.pace)}
                      onChange={(value) => {
                        const pace = paceRows.find((row) => String(row.creditsPerTerm) === value)?.creditsPerTerm;
                        if (pace) {
                          onChange({ pace });
                        }
                      }}
                    />
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

                {isActive && option.value === 'mixed' ? (
                  <MixedScheduleEditor
                    draft={draft}
                    isMixedIncomplete={isMixedIncomplete}
                    onMixedRowsChange={onMixedRowsChange}
                  />
                ) : null}
              </div>
            );
          })}
        </fieldset>
      </div>
    </section>
  );
};

type MixedScheduleEditorProps = Pick<PlanConfiguratorProps, 'draft' | 'isMixedIncomplete' | 'onMixedRowsChange'>;

const MixedScheduleEditor: React.FC<MixedScheduleEditorProps> = ({ draft, isMixedIncomplete, onMixedRowsChange }) => {
  const termCredits = expandMixedRows(draft.mixedRows);
  const requiredCredits = CURRENT_RATES.degreeCredits[draft.programKey];
  const plannedCredits = termCredits.reduce((sum, credits) => sum + credits, 0);
  const remainingCredits = Math.max(requiredCredits - plannedCredits, 0);
  const startTerm = resolveStartTerm(draft.startTermKey);

  return (
    <div className="border-t border-tech-gold/20 px-4 py-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Plan by term</p>
        <button type="button" onClick={() => onMixedRowsChange(addTerm)} className="btn-outline">
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
                <label className="eyebrow">
                  Credits
                  <input
                    type="number"
                    min={0}
                    max={9}
                    className="focus-ring mt-1 w-20 rounded-lg border border-tech-gold/30 px-2 py-1 text-sm"
                    value={credits}
                    onChange={(event) => {
                      // Read eagerly: React resets the controlled value before the updater runs.
                      const value = Number(event.target.value);
                      onMixedRowsChange((rows) => setTermCredits(rows, index, value));
                    }}
                    aria-label={`Credits for ${termLabel}`}
                  />
                </label>
                {isLast && termCredits.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => onMixedRowsChange(removeLastTerm)}
                    className="btn-outline mt-5 px-2"
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
        Planned credits: {plannedCredits} • Required: {requiredCredits} • Remaining: {remainingCredits}
      </div>
      {remainingCredits > 0 || isMixedIncomplete ? (
        <p className="mt-2 text-[11px] text-tech-goldDark">Add more terms to cover remaining credits.</p>
      ) : null}
    </div>
  );
};

export default PlanConfigurator;
