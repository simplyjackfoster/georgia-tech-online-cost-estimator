import React from 'react';
import { CURRENT_RATES, PROGRAMS, RESIDENCY_OPTIONS, getPerCreditRate } from '../data/rates';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { formatCurrency } from '../lib/calc';
import { TERM_SEQUENCE } from '../lib/plan';
import Accordion from './Accordion';
import TrustCard from './TrustCard';

const OfficialRates: React.FC = () => {
  const fee = CURRENT_RATES.onlineLearningFee;
  return (
    <>
      <p className="mt-2 text-[11px] text-tech-navy/60">
        Sources: Office of the Bursar {CURRENT_RATES.label} tuition totals. Last updated: September 2026.
      </p>
      <div className="mt-3 space-y-2">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="text-tech-navy/60">
              <th className="pb-1 font-medium">Per credit</th>
              {RESIDENCY_OPTIONS.map((option) => (
                <th key={option.key} className="pb-1 text-right font-medium">
                  {option.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROGRAMS.map((program) => (
              <tr key={program.key}>
                <td className="py-0.5 pr-2">{program.key.toUpperCase()}</td>
                {RESIDENCY_OPTIONS.map((option) => (
                  <td key={option.key} className="py-0.5 text-right font-semibold tabular-nums">
                    {formatCurrency(getPerCreditRate(program.key, option.key))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] text-tech-navy/60">
          Students admitted before Fall 2025 pay the in-state rate regardless of residency.
        </p>
        <div className="border-t border-tech-gold/30 pt-2">
          <p>
            Fee rule: credits &lt; {fee.thresholdCredits} ⇒ {formatCurrency(fee.belowThresholdFee)}, credits ≥{' '}
            {fee.thresholdCredits} ⇒ {formatCurrency(fee.atOrAboveThresholdFee)}
          </p>
        </div>
        <div className="border-t border-tech-gold/30 pt-2">
          <p className="font-semibold">Degree credit requirements</p>
          {PROGRAMS.map((program) => (
            <p key={program.key}>
              {program.label}: {CURRENT_RATES.degreeCredits[program.key]} credits
            </p>
          ))}
        </div>
        <div className="rounded-lg border border-tech-gold/30 bg-tech-gold/10 px-3 py-2 text-[11px] text-tech-navy/70">
          Data transparency:{' '}
          <a href={CURRENT_RATES.sourceUrl} className="text-tech-navy underline" target="_blank" rel="noreferrer">
            Office of the Bursar {CURRENT_RATES.label} tuition totals
          </a>
          . Tuition and fee math aligns with the Online MS program totals.
        </div>
      </div>
    </>
  );
};

const ExplainMath: React.FC = () => {
  const fee = CURRENT_RATES.onlineLearningFee;
  return (
    <ul className="mt-3 space-y-2">
      <li>
        <strong className="text-tech-goldDark">Total tuition:</strong> required credits × per-credit rate
        (by program and residency).
      </li>
      <li>
        <strong className="text-tech-goldDark">Terms needed:</strong> divide required credits by credits per
        term and round up to the next whole term.
      </li>
      <li>
        <strong className="text-tech-goldDark">Fee per term:</strong> if credits per term are below{' '}
        {fee.thresholdCredits}, the fee is {formatCurrency(fee.belowThresholdFee)}; otherwise it is{' '}
        {formatCurrency(fee.atOrAboveThresholdFee)}.
      </li>
      <li>
        <strong className="text-tech-goldDark">Total fees:</strong> fee per term × terms needed.
      </li>
      <li>
        <strong className="text-tech-goldDark">Finish semester:</strong> advance term-by-term using{' '}
        {TERM_SEQUENCE.join(' → ')} ({TERM_SEQUENCE.length} terms per year).
      </li>
    </ul>
  );
};

const InfoSidebar: React.FC = () => {
  const isDesktop = useIsDesktop();

  return (
    <aside className="flex flex-col gap-3 text-xs text-tech-navy/80">
      <Accordion title="Official rates" className="card" collapsible={!isDesktop}>
        <OfficialRates />
      </Accordion>
      <Accordion title="Explain the math" className="card">
        <ExplainMath />
      </Accordion>
      <TrustCard />
    </aside>
  );
};

export default InfoSidebar;
