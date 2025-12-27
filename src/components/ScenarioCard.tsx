import React from 'react';
import {
  MAX_CREDITS_PER_TERM,
  MAX_TERMS,
  PROGRAMS,
  TERMS_PER_YEAR_OPTIONS,
  degreeCreditsByProgram,
  onlineLearningFeeRule
} from '../data/rates';
import {
  type FullDegreeResult,
  type Mode,
  type PerTermResult,
  type ScenarioInput,
  type ScenarioValidation,
  formatCurrency,
  formatTermDuration
} from '../lib/calc';
import { InfoTooltip } from './InfoTooltip';

interface ScenarioCardProps {
  scenario: ScenarioInput;
  index: number;
  mode: Mode;
  perTermOutput: PerTermResult;
  fullDegreeOutput: FullDegreeResult;
  validation: ScenarioValidation;
  onChange: (scenario: ScenarioInput) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  onReset?: () => void;
}

const labelStyles = 'text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark';
const inputStyles =
  'mt-1 w-full rounded-lg border border-tech-gold/40 bg-white px-3 py-2 text-sm focus:border-tech-gold focus:outline-none focus:ring-2 focus:ring-tech-gold/30';

const presetCredits = [3, 6, 9];

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  index,
  mode,
  perTermOutput,
  fullDegreeOutput,
  validation,
  onChange,
  onRemove,
  onDuplicate,
  onReset
}) => {
  const programOptions = PROGRAMS;
  const programMeta = programOptions.find((program) => program.key === scenario.programKey);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-tech-gold/40 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-tech-goldDark">
            Scenario {index + 1}
          </p>
          <input
            className="mt-2 w-full rounded-md border border-tech-gold/40 px-2 py-1 text-sm font-semibold text-tech-navy focus:border-tech-gold focus:outline-none focus:ring-2 focus:ring-tech-gold/30"
            aria-label={`Scenario ${index + 1} label`}
            value={scenario.label}
            onChange={(event) =>
              onChange({
                ...scenario,
                label: event.target.value
              })
            }
          />
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-tech-navy">
          {onDuplicate ? (
            <button type="button" onClick={onDuplicate} className="hover:text-tech-goldDark">
              Duplicate
            </button>
          ) : null}
          {onReset ? (
            <button type="button" onClick={onReset} className="hover:text-tech-goldDark">
              Reset
            </button>
          ) : null}
          {onRemove ? (
            <button type="button" onClick={onRemove} className="hover:text-tech-goldDark">
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        <label>
          <span className={labelStyles}>Program</span>
          <select
            className={inputStyles}
            value={scenario.programKey}
            onChange={(event) =>
              onChange({
                ...scenario,
                programKey: event.target.value as ScenarioInput['programKey']
              })
            }
          >
            {programOptions.map((program) => (
              <option key={program.key} value={program.key}>
                {program.label} (${program.perCreditRate}/credit)
              </option>
            ))}
          </select>
          {validation.programError ? (
            <p className="mt-1 text-xs text-tech-goldDark">{validation.programError}</p>
          ) : null}
        </label>

        {mode === 'per-term' ? (
          <label>
            <div className="flex items-center justify-between">
              <span className={labelStyles}>Credits this term</span>
              <InfoTooltip
                label="Explain"
                description={`Tuition is credits × rate. Online learning fee is ${formatCurrency(
                  onlineLearningFeeRule.belowThresholdFee
                )} if credits < ${onlineLearningFeeRule.thresholdCredits}, otherwise ${formatCurrency(
                  onlineLearningFeeRule.atOrAboveThresholdFee
                )}.`}
              />
            </div>
            <input
              className={`${inputStyles} ${validation.creditsError ? 'border-tech-goldDark' : ''}`}
              type="number"
              min={1}
              max={MAX_CREDITS_PER_TERM}
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
              <div className="mt-2 flex flex-wrap gap-2">
                {presetCredits.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="rounded-full bg-tech-gold/20 px-3 py-1 text-xs font-semibold text-tech-navy"
                    onClick={() =>
                      onChange({
                        ...scenario,
                        credits: preset
                      })
                    }
                  >
                    {preset} credits
                  </button>
                ))}
              </div>
            )}
          </label>
        ) : (
          <>
            <div className="text-xs text-tech-navy/70">
              Degree requirement: {degreeCreditsByProgram[scenario.programKey]} credits
            </div>
            <label>
              <span className={labelStyles}>Credits per term</span>
              <input
                className={`${inputStyles} ${
                  validation.creditsPerTermError ? 'border-tech-goldDark' : ''
                }`}
                type="number"
                min={1}
                max={MAX_CREDITS_PER_TERM}
                value={scenario.creditsPerTerm}
                onChange={(event) =>
                  onChange({
                    ...scenario,
                    creditsPerTerm: Number(event.target.value)
                  })
                }
              />
              {validation.creditsPerTermError ? (
                <p className="mt-1 text-xs text-tech-goldDark">{validation.creditsPerTermError}</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {presetCredits.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="rounded-full bg-tech-gold/20 px-3 py-1 text-xs font-semibold text-tech-navy"
                      onClick={() =>
                        onChange({
                          ...scenario,
                          creditsPerTerm: preset
                        })
                      }
                    >
                      {preset} credits
                    </button>
                  ))}
                </div>
              )}
            </label>

            <label>
              <div className="flex items-center justify-between">
                <span className={labelStyles}>Number of terms</span>
                <label className="flex items-center gap-2 text-xs text-tech-navy">
                  <input
                    type="checkbox"
                    checked={scenario.useAutoTerms}
                    onChange={(event) =>
                      onChange({
                        ...scenario,
                        useAutoTerms: event.target.checked
                      })
                    }
                  />
                  Auto
                </label>
              </div>
              <input
                className={`${inputStyles} ${validation.termsError ? 'border-tech-goldDark' : ''}`}
                type="number"
                min={1}
                max={MAX_TERMS}
                disabled={scenario.useAutoTerms}
                value={scenario.useAutoTerms ? fullDegreeOutput.numberOfTerms : scenario.terms}
                onChange={(event) =>
                  onChange({
                    ...scenario,
                    terms: Number(event.target.value)
                  })
                }
              />
              {validation.termsError ? (
                <p className="mt-1 text-xs text-tech-goldDark">{validation.termsError}</p>
              ) : null}
            </label>

            <label>
              <span className={labelStyles}>Terms per year</span>
              <select
                className={inputStyles}
                value={scenario.termsPerYear}
                onChange={(event) =>
                  onChange({
                    ...scenario,
                    termsPerYear: Number(event.target.value) as ScenarioInput['termsPerYear']
                  })
                }
              >
                {TERMS_PER_YEAR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} terms/year
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-tech-navy px-4 py-4 text-tech-white">
        {mode === 'per-term' ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span>Tuition</span>
              <span className="font-semibold">{formatCurrency(perTermOutput.tuition)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>Online learning fee</span>
              <span className="font-semibold">
                {formatCurrency(perTermOutput.onlineLearningFee)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-tech-white/30 pt-3 text-base">
              <span className="font-semibold">Term total</span>
              <span className="text-lg font-semibold">{formatCurrency(perTermOutput.total)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span>Total tuition</span>
              <span className="font-semibold">{formatCurrency(fullDegreeOutput.totalTuition)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>Fee per term</span>
              <span className="font-semibold">{formatCurrency(fullDegreeOutput.feePerTerm)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>Total fees</span>
              <span className="font-semibold">{formatCurrency(fullDegreeOutput.totalFees)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-tech-white/30 pt-3 text-sm">
              <span>Average per term</span>
              <span className="font-semibold">{formatCurrency(fullDegreeOutput.averagePerTerm)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-tech-white/30 pt-3 text-base">
              <span className="font-semibold">Degree total</span>
              <span className="text-lg font-semibold">{formatCurrency(fullDegreeOutput.totalCost)}</span>
            </div>
            <div className="mt-2 text-xs text-tech-white/70">
              Time to graduate:{' '}
              {formatTermDuration(
                fullDegreeOutput.timeToGraduateYears,
                fullDegreeOutput.timeToGraduateMonths
              )}
            </div>
          </>
        )}
      </div>

      {mode === 'full-degree' ? (
        <p className="mt-3 text-[11px] text-tech-navy/70">
          Fees are estimated assuming your credits per term stay constant.
        </p>
      ) : null}

      {programMeta ? (
        <p className="mt-2 text-[11px] text-tech-navy/60">
          Rate: {formatCurrency(programMeta.perCreditRate)} per credit
        </p>
      ) : null}
    </div>
  );
};
