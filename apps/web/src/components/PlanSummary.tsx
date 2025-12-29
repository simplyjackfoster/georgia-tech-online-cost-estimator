import React from 'react';
import { formatCurrency } from '../lib/calc';
import { type MixedPlanResult } from '../lib/plan';
import { type ProgramKey } from '../data/rates';

type ActivePlan = MixedPlanResult & {
  finishTerm: { label: string };
};

type PlanSummaryProps = {
  activePlan: ActivePlan;
  selectedProgramKey?: ProgramKey;
  paceMode: 'constant' | 'mixed';
  mixedSchedule: MixedPlanResult['schedule'];
  id?: string;
};

const PlanSummary: React.FC<PlanSummaryProps> = ({
  activePlan,
  selectedProgramKey,
  paceMode,
  mixedSchedule,
  id
}) => {
  return (
    <section
      id={id}
      className="flex flex-col gap-3 rounded-2xl border border-tech-gold/40 bg-white p-3 shadow-sm sm:p-4"
    >
      <div className="hidden rounded-2xl bg-tech-navy px-4 py-4 text-tech-white sm:block">
        <p className="text-[11px] uppercase tracking-[0.2em] text-tech-gold">Your degree plan</p>
        <h2 className="mt-2 text-xl font-semibold">
          Your {selectedProgramKey?.toUpperCase()} Plan
        </h2>
        <div className="mt-3">
          <p className="text-3xl font-semibold">{formatCurrency(activePlan.totalCost)}</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-tech-gold">Total Degree Cost</p>
          <p className="mt-1 text-xs text-tech-gold">Finish {activePlan.finishTerm.label}</p>
        </div>
        <div className="mt-4 grid gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Avg per term</span>
            <span className="font-semibold">{formatCurrency(activePlan.averagePerTerm)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Terms needed</span>
            <span className="font-semibold">{activePlan.numberOfTerms}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tuition total</span>
            <span className="font-semibold">{formatCurrency(activePlan.totalTuition)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Fee total</span>
            <span className="font-semibold">{formatCurrency(activePlan.totalFees)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-tech-navy px-4 py-4 text-tech-white sm:hidden">
        <p className="text-[10px] uppercase tracking-[0.2em] text-tech-gold">Your degree plan</p>
        <h2 className="mt-2 text-lg font-semibold">
          Your {selectedProgramKey?.toUpperCase()} Plan
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-tech-white/80">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-tech-gold">
              Total cost
            </p>
            <p className="mt-1 text-xl font-semibold text-tech-white tabular-nums">
              {formatCurrency(activePlan.totalCost)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-tech-gold">Finish</p>
            <p className="mt-1 text-sm font-semibold text-tech-white">
              {activePlan.finishTerm.label}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-tech-gold">
              Avg/term
            </p>
            <p className="mt-1 text-sm font-semibold text-tech-white tabular-nums">
              {formatCurrency(activePlan.averagePerTerm)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-tech-gold">Terms</p>
            <p className="mt-1 text-sm font-semibold text-tech-white">
              {activePlan.numberOfTerms}
            </p>
          </div>
        </div>
        <details className="mt-4 rounded-xl border border-tech-gold/30 bg-tech-navy/50 px-3 py-2 text-xs text-tech-white">
          <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-tech-navy">
            Details
          </summary>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span>Tuition total</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(activePlan.totalTuition)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fee total</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(activePlan.totalFees)}
              </span>
            </div>
            <div className="rounded-lg border border-tech-gold/30 bg-tech-navy/40 px-3 py-2 text-[11px] text-tech-white/80">
              Fee strategy: pay the online fee {activePlan.feePayments} times across your degree.
            </div>
            {paceMode === 'mixed' ? (
              <div className="rounded-lg border border-tech-gold/30 bg-tech-navy/40 px-3 py-2 text-[11px] text-tech-white/80">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-gold">
                  Calendar timeline
                </p>
                <div className="mt-2 space-y-2">
                  {mixedSchedule.length === 0 ? (
                    <p className="text-tech-white/60">Add terms to see a timeline.</p>
                  ) : (
                    mixedSchedule.map((term) => (
                      <div key={term.termLabel} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-tech-white">{term.termLabel}</p>
                          <p className="text-[10px] text-tech-white/60">{term.credits} credits</p>
                        </div>
                        <p className="text-right text-xs font-semibold text-tech-white tabular-nums">
                          {formatCurrency(term.total)} total
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </details>
      </div>

      <div className="hidden grid gap-3 md:grid-cols-2 sm:grid">
        <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">
            Tuition total
          </p>
          <p className="mt-2 text-lg font-semibold text-tech-navy">
            {formatCurrency(activePlan.totalTuition)}
          </p>
        </div>
        <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">Fee total</p>
          <p className="mt-2 text-lg font-semibold text-tech-navy">
            {formatCurrency(activePlan.totalFees)}
          </p>
        </div>
        <div className="rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">Avg per term</p>
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

      <div className="hidden rounded-2xl border border-tech-gold/30 bg-tech-gold/10 px-4 py-3 text-xs text-tech-navy sm:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
          Fee Strategy
        </p>
        <p className="mt-2">
          You pay the online fee {activePlan.feePayments} times across your degree.
        </p>
      </div>

      {paceMode === 'mixed' ? (
        <div className="hidden rounded-2xl border border-tech-gold/30 bg-white px-4 py-3 text-xs text-tech-navy/80 sm:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
            Calendar timeline
          </p>
          <div className="mt-2 space-y-2">
            {mixedSchedule.length === 0 ? (
              <p className="text-tech-navy/60">Add terms to see a timeline.</p>
            ) : (
              mixedSchedule.map((term) => (
                <div key={term.termLabel} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-tech-navy">{term.termLabel}</p>
                    <p className="text-[11px] text-tech-navy/60">{term.credits} credits</p>
                  </div>
                  <p className="text-right text-sm font-semibold text-tech-navy">
                    {formatCurrency(term.total)} total
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default PlanSummary;
