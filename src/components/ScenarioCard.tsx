import React from 'react';
import { MAX_CREDITS, ProgramKey, PROGRAMS, TERMS, TermKey } from '../data/rates';
import { ScenarioInput, ScenarioOutput, ScenarioValidation, formatCurrency } from '../lib/calc';
import { InfoTooltip } from './InfoTooltip';

interface ScenarioCardProps {
  scenario: ScenarioInput;
  index: number;
  output: ScenarioOutput;
  validation: ScenarioValidation;
  onChange: (scenario: ScenarioInput) => void;
  onRemove?: () => void;
}

const labelStyles = 'text-sm font-semibold text-tech-goldDark';
const inputStyles =
  'mt-2 w-full rounded-lg border border-tech-gold/40 bg-white px-3 py-2 text-sm focus:border-tech-gold focus:outline-none focus:ring-2 focus:ring-tech-gold/30';

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  index,
  output,
  validation,
  onChange,
  onRemove
}) => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-tech-gold/40 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-tech-goldDark">Scenario {index + 1}</p>
          <h3 className="mt-2 text-lg font-semibold text-tech-goldMedium">
            {PROGRAMS[scenario.programKey].name}
          </h3>
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-tech-goldDark hover:text-tech-navy"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4">
        <label>
          <span className={labelStyles}>Program</span>
          <select
            className={inputStyles}
            value={scenario.programKey}
            onChange={(event) =>
              onChange({
                ...scenario,
                programKey: event.target.value as ProgramKey
              })
            }
          >
            {Object.entries(PROGRAMS).map(([key, program]) => (
              <option key={key} value={key}>
                {program.name}
              </option>
            ))}
          </select>
          {validation.programError ? (
            <p className="mt-1 text-xs text-tech-goldDark">{validation.programError}</p>
          ) : null}
        </label>

        <label>
          <div className="flex items-center justify-between">
            <span className={labelStyles}>Credits for this term</span>
            <InfoTooltip
              label="Explain"
              description="Tuition is calculated by multiplying credits by the program rate per credit, then adding the online learning fee when credits are above zero."
            />
          </div>
          <input
            className={`${inputStyles} ${validation.creditsError ? 'border-tech-goldDark' : ''}`}
            type="number"
            min={1}
            max={MAX_CREDITS}
            value={scenario.credits}
            onChange={(event) =>
              onChange({
                ...scenario,
                credits: Number(event.target.value)
              })
            }
          />
          {validation.creditsError ? (
            <p className="mt-1 text-xs text-tech-goldDark">{validation.creditsError}</p>
          ) : (
            <p className="mt-1 text-xs text-tech-navy/70">Recommended 3-9 credits for most online terms.</p>
          )}
        </label>

        <label>
          <span className={labelStyles}>Term</span>
          <select
            className={inputStyles}
            value={scenario.term}
            onChange={(event) =>
              onChange({
                ...scenario,
                term: event.target.value as TermKey
              })
            }
          >
            {Object.entries(TERMS).map(([key, term]) => (
              <option key={key} value={key}>
                {term.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-xl bg-tech-navy px-4 py-4 text-tech-white">
        <div className="flex items-center justify-between text-sm">
          <span>Tuition</span>
          <span className="font-semibold">{formatCurrency(output.tuition)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>Online learning fee</span>
          <span className="font-semibold">{formatCurrency(output.onlineLearningFee)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-tech-white/30 pt-3 text-base">
          <span className="font-semibold">Term total</span>
          <span className="text-lg font-semibold">{formatCurrency(output.total)}</span>
        </div>
      </div>
    </div>
  );
};
