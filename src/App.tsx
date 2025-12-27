import React, { useEffect, useMemo, useState } from 'react';
import { ScenarioCard } from './components/ScenarioCard';
import { PROGRAMS, TermKey, TERMS } from './data/rates';
import { calculateScenario, formatCurrency, ScenarioInput, validateScenario } from './lib/calc';

const DEFAULT_SCENARIO: ScenarioInput = {
  id: 'base',
  programKey: 'omscs',
  credits: 3,
  term: 'fall'
};

const MAX_SCENARIOS = 3;

const serializeScenario = (scenario: ScenarioInput): string =>
  [scenario.programKey, scenario.credits, scenario.term].join(',');

const parseScenario = (value: string, id: string): ScenarioInput | null => {
  const [programKey, creditsRaw, term] = value.split(',');
  if (!programKey || !(programKey in PROGRAMS)) {
    return null;
  }
  if (!term || !(term in TERMS)) {
    return null;
  }
  const credits = Number(creditsRaw);
  if (!Number.isFinite(credits)) {
    return null;
  }
  return {
    id,
    programKey: programKey as keyof typeof PROGRAMS,
    credits,
    term: term as TermKey
  };
};

const buildShareUrl = (scenarios: ScenarioInput[]): string => {
  const params = new URLSearchParams();
  scenarios.forEach((scenario, index) => {
    params.set(`s${index}`, serializeScenario(scenario));
  });
  const query = params.toString();
  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
};

const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([DEFAULT_SCENARIO]);
  const [shareStatus, setShareStatus] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed: ScenarioInput[] = [];
    for (let index = 0; index < MAX_SCENARIOS; index += 1) {
      const value = params.get(`s${index}`);
      if (value) {
        const scenario = parseScenario(value, `shared-${index}`);
        if (scenario) {
          parsed.push(scenario);
        }
      }
    }
    if (parsed.length > 0) {
      setScenarios(parsed);
    }
  }, []);

  const outputs = useMemo(
    () => scenarios.map((scenario) => calculateScenario(scenario)),
    [scenarios]
  );

  const validations = useMemo(
    () => scenarios.map((scenario) => validateScenario(scenario)),
    [scenarios]
  );

  const comparisonTotal = outputs.reduce((sum, output) => sum + output.total, 0);

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
          programKey: prev[0]?.programKey ?? 'omscs'
        }
      ];
    });
  };

  const removeScenario = (id: string) => {
    setScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  };

  const handleShare = async () => {
    const url = buildShareUrl(scenarios);
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
    <div className="min-h-screen bg-tech-white">
      <header className="bg-tech-navy px-6 py-8 text-tech-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-tech-gold">Georgia Tech Online</p>
          <h1 className="text-3xl font-semibold text-tech-white sm:text-4xl">
            Program Cost Calculator
          </h1>
          <p className="max-w-2xl text-sm text-tech-white/80">
            Estimate tuition and online learning fees for OMSA, OMSCS, and OMSCSEC. Compare up to
            three scenarios and share the results with teammates or advisors.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <section className="rounded-2xl border border-tech-gold/40 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-tech-goldMedium">Scenario Compare</h2>
              <p className="text-sm text-tech-navy/70">
                Use the same calculator to test different program, term, or credit assumptions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={addScenario}
                disabled={scenarios.length >= MAX_SCENARIOS}
                className="rounded-lg border border-tech-gold bg-tech-gold px-4 py-2 text-sm font-semibold text-tech-navy transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add scenario
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="rounded-lg bg-tech-navy px-4 py-2 text-sm font-semibold text-tech-white transition hover:opacity-90"
              >
                Share
              </button>
            </div>
          </div>
          {shareStatus ? <p className="mt-3 text-xs text-tech-goldDark">{shareStatus}</p> : null}
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              index={index}
              output={outputs[index]}
              validation={validations[index]}
              onChange={updateScenario}
              onRemove={scenarios.length > 1 ? () => removeScenario(scenario.id) : undefined}
            />
          ))}
        </section>

        <section className="mt-6 grid gap-4 rounded-2xl border border-tech-gold/40 bg-tech-navy px-6 py-6 text-tech-white">
          <div>
            <h2 className="text-lg font-semibold">Combined snapshot</h2>
            <p className="text-sm text-tech-white/70">
              Sum of all scenario totals for quick planning conversations.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.2em] text-tech-gold">Total</span>
              <span className="text-2xl font-semibold">{formatCurrency(comparisonTotal)}</span>
            </div>
            <div className="text-xs text-tech-white/70">
              Tuition and online learning fees based on the rates configured in the source of truth.
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-tech-gold/40 bg-white p-6 text-sm text-tech-navy/80">
          <h2 className="text-lg font-semibold text-tech-goldMedium">Explain the math</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <strong className="text-tech-goldDark">Tuition:</strong> Credits × program tuition rate
              per credit.
            </li>
            <li>
              <strong className="text-tech-goldDark">Online learning fee:</strong> Applied once per
              term when credits are greater than zero, based on the official fee schedule.
            </li>
            <li>
              <strong className="text-tech-goldDark">Total:</strong> Tuition + online learning fee.
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-tech-gold/40 bg-white px-6 py-6 text-xs text-tech-navy/60">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Georgia Tech Online Program Cost Calculator</span>
          <span>Rates shown are sourced from official Georgia Tech tuition and fee pages.</span>
        </div>
        <div className="mx-auto mt-3 flex max-w-5xl flex-wrap gap-3 text-[11px] text-tech-navy/70">
          <a
            className="underline"
            href="https://pe.gatech.edu/degrees/online-master-science-analytics/tuition"
            target="_blank"
            rel="noreferrer"
          >
            OMSA tuition source
          </a>
          <a
            className="underline"
            href="https://omscs.gatech.edu/program-info/tuition"
            target="_blank"
            rel="noreferrer"
          >
            OMSCS tuition source
          </a>
          <a
            className="underline"
            href="https://pe.gatech.edu/degrees/cybersecurity/online/tuition"
            target="_blank"
            rel="noreferrer"
          >
            OMSCSEC tuition source
          </a>
          <a
            className="underline"
            href="https://www.bursar.gatech.edu/tuition-fees"
            target="_blank"
            rel="noreferrer"
          >
            Online learning fee source
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
