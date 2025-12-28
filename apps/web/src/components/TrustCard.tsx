import React from 'react';
import { useAdoptionCount } from '../hooks/useAdoptionCount';

type TrustCardProps = {
  className?: string;
};

const TrustCard: React.FC<TrustCardProps> = ({ className = '' }) => {
  const adoptionCount = useAdoptionCount();
  const sourceUrl = import.meta.env.VITE_SOURCE_URL ?? 'https://github.com';

  return (
    <section
      className={`rounded-2xl border border-tech-gold/30 bg-tech-white px-4 py-3 text-xs text-tech-navy ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
        Built in the open
      </p>
      {adoptionCount !== null ? (
        <p className="mt-2 text-sm font-semibold text-tech-navy">
          ★ {adoptionCount.toLocaleString()}+ OMSCS plans generated
        </p>
      ) : null}
      <p className="mt-2 text-xs text-tech-navy/70">
        Open-source, auditable math, privacy-first analytics.
      </p>
      <a
        className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-tech-navy px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-navy transition hover:bg-tech-navy hover:text-tech-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        href={sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        View source on GitHub
      </a>
    </section>
  );
};

export default TrustCard;
