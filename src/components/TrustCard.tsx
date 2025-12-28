import React from 'react';

type TrustCardProps = {
  className?: string;
};

const TrustCard: React.FC<TrustCardProps> = ({ className = '' }) => {
  return (
    <section
      className={`rounded-2xl border border-tech-gold/20 bg-[#f8f3ea] px-4 py-3 text-tech-navy shadow-sm ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-tech-goldDark">
        EARLY OMSCS COHORT
      </p>
      <p className="mt-2 text-sm text-tech-navy/80">
        This calculator is open-source and in early release. You&apos;re one of the first OMSCS
        students to use it.
      </p>
      <p className="mt-2 text-xs font-semibold text-tech-navy/80">★ First OMSCS plan generated</p>
      <a
        className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-tech-gold/40 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-navy transition hover:border-tech-gold/60 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f3ea] md:w-auto"
        href="https://github.com/simplyjackfoster/georgia-tech-online-cost-planner"
        rel="noreferrer"
        target="_blank"
      >
        View source on GitHub
      </a>
    </section>
  );
};

export default TrustCard;
