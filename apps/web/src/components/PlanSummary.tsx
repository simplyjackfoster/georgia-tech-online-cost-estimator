import React from 'react';
import { RESIDENCY_OPTIONS, type ProgramKey, type Residency } from '../data/rates';
import { formatCurrency } from '../lib/calc';
import type { PaceMode, PlanResult } from '../lib/plan';
import CalendarTimeline from './CalendarTimeline';

type PlanSummaryProps = {
  plan: PlanResult;
  programKey: ProgramKey;
  residency: Residency;
  paceMode: PaceMode;
  id?: string;
};

const STAT_CARD = 'rounded-xl border border-tech-gold/30 bg-tech-white px-4 py-3';

const PlanSummary: React.FC<PlanSummaryProps> = ({ plan, programKey, residency, paceMode, id }) => {
  const residencyLabel = RESIDENCY_OPTIONS.find((option) => option.key === residency)?.label;
  const headingId = `${id ?? 'plan-summary'}-heading`;

  return (
    <section id={id} className="card flex flex-col gap-3" aria-labelledby={headingId}>
      <div className="rounded-2xl bg-tech-navy px-4 py-4 text-tech-white">
        <p className="text-[11px] uppercase tracking-[0.2em] text-tech-gold">Your degree plan</p>
        <h2 id={headingId} className="mt-2 text-lg font-semibold sm:text-xl">
          Your {programKey.toUpperCase()} Plan
        </h2>
        <div className="mt-3">
          <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{formatCurrency(plan.totalCost)}</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-tech-gold">Total Degree Cost</p>
          <p className="mt-1 text-xs text-tech-gold">
            Finish {plan.finishTerm.label}
            {residencyLabel ? ` · ${residencyLabel} rates` : ''}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className={STAT_CARD}>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">Tuition total</dt>
          <dd className="mt-2 text-lg font-semibold text-tech-navy tabular-nums">
            {formatCurrency(plan.totalTuition)}
          </dd>
        </div>
        <div className={STAT_CARD}>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">Fee total</dt>
          <dd className="mt-2 text-lg font-semibold text-tech-navy tabular-nums">
            {formatCurrency(plan.totalFees)}
          </dd>
        </div>
        <div className={STAT_CARD}>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">Avg per term</dt>
          <dd className="mt-2 text-lg font-semibold text-tech-navy tabular-nums">
            {formatCurrency(plan.averagePerTerm)}
          </dd>
        </div>
        <div className={STAT_CARD}>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-tech-goldDark">Time to graduate</dt>
          <dd className="mt-2 text-lg font-semibold text-tech-navy">{plan.numberOfTerms} semesters</dd>
        </div>
      </dl>

      <div className="rounded-2xl border border-tech-gold/30 bg-tech-gold/10 px-4 py-3 text-xs text-tech-navy">
        <p className="eyebrow">Fee Strategy</p>
        <p className="mt-2">You pay the online fee {plan.feePayments} times across your degree.</p>
      </div>

      {paceMode === 'mixed' ? <CalendarTimeline schedule={plan.schedule} /> : null}
    </section>
  );
};

export default PlanSummary;
