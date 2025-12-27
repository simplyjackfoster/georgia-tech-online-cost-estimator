import React, { useEffect, useMemo, useState } from 'react';
import { ScenarioCard } from './components/ScenarioCard';
import {
  PROGRAMS,
  degreeCreditsByProgram,
  onlineLearningFeeRule,
  perCreditRateByProgram
} from './data/rates';
import {
  calculateFullDegree,
  calculatePerTerm,
  formatCurrency,
  getProgramCredits,
  type Mode,
  type ScenarioInput,
  validateScenario
} from './lib/calc';

// React + Vite keeps the calculator fast, offline-friendly, and easy to ship as a static bundle.
const DEFAULT_SCENARIO: ScenarioInput = {
  id: 'base',
  label: 'Fall 2026',
  programKey: 'omscs',
  credits: 3,
  creditsPerTerm: 3,
  terms: 6,
  useAutoTerms: true,
  termsPerYear: 3
};

const MAX_SCENARIOS = 3;

const serializeScenario = (scenario: ScenarioInput, index: number, params: URLSearchParams) => {
  params.set(`s${index}p`, scenario.programKey);
  params.set(`s${index}c`, String(scenario.credits));
  params.set(`s${index}cpt`, String(scenario.creditsPerTerm));
  params.set(`s${index}t`, String(scenario.terms));
  params.set(`s${index}a`, scenario.useAutoTerms ? '1' : '0');
  params.set(`s${index}y`, String(scenario.termsPerYear));
  params.set(`s${index}l`, scenario.label);
};

const parseScenario = (params: URLSearchParams, index: number): ScenarioInput | null => {
  const programKey = params.get(`s${index}p`);
  const credits = Number(params.get(`s${index}c`));
  const creditsPerTerm = Number(params.get(`s${index}cpt`));
  const terms = Number(params.get(`s${index}t`));
  const useAutoTerms = params.get(`s${index}a`) === '1';
  const termsPerYear = Number(params.get(`s${index}y`));
  const label = params.get(`s${index}l`) ?? '';

  if (!programKey || !(programKey in perCreditRateByProgram)) {
    return null;
  }

  return {
    id: `shared-${index}`,
    label: label || `Scenario ${index + 1}`,
    programKey: programKey as ScenarioInput['programKey'],
    credits: Number.isFinite(credits) ? credits : DEFAULT_SCENARIO.credits,
    creditsPerTerm: Number.isFinite(creditsPerTerm) ? creditsPerTerm : DEFAULT_SCENARIO.creditsPerTerm,
    terms: Number.isFinite(terms) ? terms : DEFAULT_SCENARIO.terms,
    useAutoTerms,
    termsPerYear: termsPerYear === 2 ? 2 : 3
  };
};

const buildShareUrl = (mode: Mode, scenarios: ScenarioInput[]): string => {
  const params = new URLSearchParams();
  params.set('mode', mode);
  scenarios.forEach((scenario, index) => {
    serializeScenario(scenario, index, params);
  });
  const query = params.toString();
  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
};

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('per-term');
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([DEFAULT_SCENARIO]);
  const [shareStatus, setShareStatus] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'full-degree') {
      setMode('full-degree');
    }
    const parsed: ScenarioInput[] = [];
    for (let index = 0; index < MAX_SCENARIOS; index += 1) {
      if (params.get(`s${index}p`)) {
        const scenario = parseScenario(params, index);
        if (scenario) {
          parsed.push(scenario);
        }
      }
    }
    if (parsed.length > 0) {
      setScenarios(parsed);
    }
  }, []);

  const perTermOutputs = useMemo(
    () => scenarios.map((scenario) => calculatePerTerm(scenario.programKey, scenario.credits)),
    [scenarios]
  );

  const fullDegreeOutputs = useMemo(
    () =>
      scenarios.map((scenario) =>
        calculateFullDegree(
          scenario.programKey,
          getProgramCredits(scenario.programKey),
          scenario.creditsPerTerm,
          scenario.terms,
          scenario.useAutoTerms,
          scenario.termsPerYear
        )
      ),
    [scenarios]
  );

  const validations = useMemo(
    () => scenarios.map((scenario) => validateScenario(scenario, mode)),
    [scenarios, mode]
  );

  const comparisonTotal = perTermOutputs.reduce((sum, output, index) => {
    if (mode === 'per-term') {
      return sum + output.total;
    }
    return sum + fullDegreeOutputs[index].totalCost;
  }, 0);

  const updateScenario = (updated: ScenarioInput) => {
    setScenarios((prev) => prev.map((scenario) => (scenario.id === updated.id ? updated : scenario)));
  };

  const addScenario = () => {
    setScenarios((prev) => {
      if (prev.length >= MAX_SCENARIOS) {
        return prev;
      }
      return [
        ...prev,
        {
          ...DEFAULT_SCENARIO,
          id: `scenario-${prev.length + 1}`,
          label: `Scenario ${prev.length + 1}`,
          programKey: prev[0]?.programKey ?? 'omscs'
        }
      ];
    });
  };

  const duplicateScenario = (scenario: ScenarioInput) => {
    setScenarios((prev) => {
      if (prev.length >= MAX_SCENARIOS) {
        return prev;
      }
      return [
        ...prev,
        {
          ...scenario,
          id: `scenario-${prev.length + 1}`,
          label: `${scenario.label} copy`
        }
      ];
    });
  };

  const resetScenario = (scenario: ScenarioInput) => {
    updateScenario({
      ...DEFAULT_SCENARIO,
      id: scenario.id,
      label: scenario.label || DEFAULT_SCENARIO.label,
      programKey: scenario.programKey
    });
  };

  const removeScenario = (id: string) => {
    setScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  };

  const handleShare = async () => {
    const url = buildShareUrl(mode, scenarios);
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('Link copied to clipboard.');
    } catch (error) {
      console.error('Clipboard unavailable', error);
      setShareStatus('Copy failed. Link opened in a new tab.');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-tech-white text-tech-navy">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-tech-goldDark">
              Georgia Tech Online
            </p>
            <h1 className="text-2xl font-semibold text-tech-goldMedium">
              Program Cost Calculator
            </h1>
            <p className="text-xs text-tech-navy/70">
              Compare per-term costs or full degree plans with Spring 2026 rates.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={addScenario}
              disabled={scenarios.length >= MAX_SCENARIOS}
              className="rounded-lg border border-tech-gold bg-tech-gold px-3 py-2 font-semibold text-tech-navy transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add scenario
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg bg-tech-navy px-3 py-2 font-semibold text-tech-white transition hover:opacity-90"
            >
              Copy share link
            </button>
          </div>
        </header>

        {shareStatus ? <p className="mt-2 text-xs text-tech-goldDark">{shareStatus}</p> : null}

        <main className="mt-3 grid flex-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
          <section className="flex flex-col gap-3 rounded-2xl border border-tech-gold/40 bg-white p-4 shadow-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
                Mode
              </p>
              <div className="mt-2 flex rounded-lg border border-tech-gold/40 bg-tech-white">
                <button
                  type="button"
                  onClick={() => setMode('per-term')}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                    mode === 'per-term' ? 'bg-tech-navy text-tech-white' : 'text-tech-navy'
                  }`}
                >
                  Per Term
                </button>
                <button
                  type="button"
                  onClick={() => setMode('full-degree')}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                    mode === 'full-degree' ? 'bg-tech-navy text-tech-white' : 'text-tech-navy'
                  }`}
                >
                  Full Degree
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-tech-navy px-3 py-3 text-xs text-tech-white">
              <p className="text-[11px] uppercase tracking-[0.2em] text-tech-gold">
                Combined snapshot
              </p>
              <p className="mt-2 text-lg font-semibold">{formatCurrency(comparisonTotal)}</p>
              <p className="mt-1 text-[11px] text-tech-white/70">
                Sum of scenario totals for quick planning.
              </p>
            </div>

            <div className="text-[11px] text-tech-navy/70">
              <p className="font-semibold text-tech-goldDark">Scenario actions</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Duplicate or reset scenarios with the buttons on each card.</li>
                <li>Shareable links include mode, program, credits, and terms.</li>
              </ul>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((scenario, index) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                index={index}
                mode={mode}
                perTermOutput={perTermOutputs[index]}
                fullDegreeOutput={fullDegreeOutputs[index]}
                validation={validations[index]}
                onChange={updateScenario}
                onDuplicate={
                  scenarios.length < MAX_SCENARIOS ? () => duplicateScenario(scenario) : undefined
                }
                onReset={() => resetScenario(scenario)}
                onRemove={scenarios.length > 1 ? () => removeScenario(scenario.id) : undefined}
              />
            ))}
          </section>

          <aside className="flex flex-col gap-3">
            <section className="rounded-2xl border border-tech-gold/40 bg-white p-4 text-xs text-tech-navy/80 shadow-sm">
              <h2 className="text-sm font-semibold text-tech-goldMedium">Summary</h2>
              <p className="mt-2 text-[11px] text-tech-navy/60">
                {mode === 'per-term'
                  ? 'Per-term totals include tuition plus the online learning fee.'
                  : 'Full degree totals include tuition for required credits and fee estimates.'}
              </p>
              <div className="mt-3 space-y-2">
                {scenarios.map((scenario, index) => (
                  <div key={scenario.id} className="flex items-center justify-between">
                    <span className="truncate">
                      {scenario.label || `Scenario ${index + 1}`}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(
                        mode === 'per-term'
                          ? perTermOutputs[index].total
                          : fullDegreeOutputs[index].totalCost
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {mode === 'full-degree' ? (
              <section className="rounded-2xl border border-tech-gold/40 bg-white p-4 text-xs text-tech-navy/70 shadow-sm">
                <h2 className="text-sm font-semibold text-tech-goldMedium">Full Degree Notes</h2>
                <p className="mt-2">
                  Fees are estimated assuming your credits per term stay constant each term.
                </p>
                <p className="mt-2">
                  If you mix 3-credit and 6-credit terms, totals can differ.
                </p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-tech-gold/40 bg-white p-4 text-xs text-tech-navy/80 shadow-sm">
              <h2 className="text-sm font-semibold text-tech-goldMedium">Data source</h2>
              <div className="mt-3 space-y-2">
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
                  <p className="font-semibold">Degree credits</p>
                  {PROGRAMS.map((program) => (
                    <p key={program.key}>
                      {program.label}: {degreeCreditsByProgram[program.key]} credits
                    </p>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-tech-gold/40 bg-white p-4 text-xs text-tech-navy/80 shadow-sm">
              <h2 className="text-sm font-semibold text-tech-goldMedium">Explain the math</h2>
              {mode === 'per-term' ? (
                <ul className="mt-2 space-y-2">
                  <li>
                    <strong className="text-tech-goldDark">Tuition:</strong> credits × rate
                  </li>
                  <li>
                    <strong className="text-tech-goldDark">Online learning fee:</strong>{' '}
                    credits &lt; {onlineLearningFeeRule.thresholdCredits} ?{' '}
                    {formatCurrency(onlineLearningFeeRule.belowThresholdFee)} :{' '}
                    {formatCurrency(onlineLearningFeeRule.atOrAboveThresholdFee)}
                  </li>
                  <li>
                    <strong className="text-tech-goldDark">Total:</strong> tuition + fee
                  </li>
                </ul>
              ) : (
                <ul className="mt-2 space-y-2">
                  <li>
                    <strong className="text-tech-goldDark">Total tuition:</strong> required credits
                    × rate
                  </li>
                  <li>
                    <strong className="text-tech-goldDark">Terms:</strong> auto = ceil(required
                    credits ÷ credits per term) or manual entry
                  </li>
                  <li>
                    <strong className="text-tech-goldDark">Fee per term:</strong> credits per term
                    &lt; {onlineLearningFeeRule.thresholdCredits} ?{' '}
                    {formatCurrency(onlineLearningFeeRule.belowThresholdFee)} :{' '}
                    {formatCurrency(onlineLearningFeeRule.atOrAboveThresholdFee)}
                  </li>
                  <li>
                    <strong className="text-tech-goldDark">Total fees:</strong> fee per term × terms
                  </li>
                  <li>
                    <strong className="text-tech-goldDark">Total cost:</strong> tuition + fees
                  </li>
                  <li>
                    <strong className="text-tech-goldDark">Average per semester:</strong> total
                    cost ÷ terms
                  </li>
                  <li>
                    <strong className="text-tech-goldDark">Time to graduate:</strong> terms ÷ terms
                    per year, displayed as years and months
                  </li>
                </ul>
              )}
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default App;
