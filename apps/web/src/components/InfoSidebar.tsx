import React from 'react';
import { PROGRAMS, degreeCreditsByProgram, onlineLearningFeeRule } from '../data/rates';
import { formatCurrency } from '../lib/calc';
import Accordion from './Accordion';
import TrustCard from './TrustCard';

const InfoSidebar: React.FC = () => {
  const officialRatesContent = (
    <>
      <p className="mt-2 text-[11px] text-tech-navy/60">
        Sources: Office of the Bursar Spring 2026 tuition totals. Last updated: December 2026.
      </p>
      <div className="mt-3 space-y-2">
        {PROGRAMS.map((program) => (
          <div key={program.key} className="flex items-center justify-between">
            <span>{program.label}</span>
            <span className="font-semibold">{formatCurrency(program.perCreditRate)}/credit</span>
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
            className="text-tech-navy underline"
            target="_blank"
            rel="noreferrer"
          >
            Office of the Bursar Spring 2026 tuition totals
          </a>
          . Tuition and fee math aligns with the Online MS program totals.
        </div>
      </div>
    </>
  );

  const explainMathContent = (
    <ul className="mt-3 space-y-2">
      <li>
        <strong className="text-tech-goldDark">Total tuition:</strong> required credits × per-credit
        rate.
      </li>
      <li>
        <strong className="text-tech-goldDark">Terms needed:</strong> divide required credits by
        credits per term and round up to the next whole term.
      </li>
      <li>
        <strong className="text-tech-goldDark">Fee per term:</strong> if credits per term are below{' '}
        {onlineLearningFeeRule.thresholdCredits}, the fee is{' '}
        {formatCurrency(onlineLearningFeeRule.belowThresholdFee)}; otherwise it is{' '}
        {formatCurrency(onlineLearningFeeRule.atOrAboveThresholdFee)}.
      </li>
      <li>
        <strong className="text-tech-goldDark">Total fees:</strong> fee per term × terms needed.
      </li>
      <li>
        <strong className="text-tech-goldDark">Finish semester:</strong> advance term-by-term using
        Spring → Summer → Fall (3 terms per year).
      </li>
    </ul>
  );

  return (
    <aside className="flex flex-col gap-3">
      <section className="hidden rounded-2xl border border-tech-gold/40 bg-white p-4 text-xs text-tech-navy/80 shadow-sm sm:block">
        <h2 className="text-sm font-semibold text-tech-goldMedium">Official rates</h2>
        {officialRatesContent}
      </section>

      <section className="rounded-2xl border border-tech-gold/40 bg-white p-3 text-xs text-tech-navy/80 shadow-sm sm:hidden">
        <Accordion
          title="Official rates"
          className="rounded-2xl"
          buttonClassName="flex w-full items-center justify-between text-sm font-semibold text-tech-goldMedium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          panelClassName="mt-3"
        >
          {officialRatesContent}
        </Accordion>
      </section>

      <details className="hidden rounded-2xl border border-tech-gold/40 bg-white p-4 text-xs text-tech-navy/80 shadow-sm sm:block">
        <summary className="cursor-pointer text-sm font-semibold text-tech-goldMedium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
          Explain the math
        </summary>
        {explainMathContent}
      </details>

      <section className="rounded-2xl border border-tech-gold/40 bg-white p-3 text-xs text-tech-navy/80 shadow-sm sm:hidden">
        <Accordion
          title="Explain the math"
          className="rounded-2xl"
          buttonClassName="flex w-full items-center justify-between text-sm font-semibold text-tech-goldMedium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          panelClassName="mt-3"
        >
          {explainMathContent}
        </Accordion>
      </section>

      <TrustCard />

    </aside>
  );
};

export default InfoSidebar;
