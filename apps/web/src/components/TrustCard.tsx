import React from 'react';
import { usePlansGeneratedCount } from '../hooks/usePlansGeneratedCount';

type TrustCardProps = {
  className?: string;
};

const TrustCard: React.FC<TrustCardProps> = ({ className = '' }) => {
  const { count, status, days } = usePlansGeneratedCount(30);
  const sourceUrl = import.meta.env.VITE_SOURCE_URL ?? 'https://github.com';

  const usageLabel = () => {
    if (status === 'loading') {
      return 'Usage: …';
    }
    if (status === 'error' || count === null) {
      return 'Usage: unavailable';
    }
    return `Usage: ${count.toLocaleString()} plans generated (last ${days} days)`;
  };

  return (
    <section
      className={`rounded-2xl border border-tech-gold/30 bg-tech-white px-4 py-3 text-xs text-tech-navy ${className}`}
    >
      <h3 className="eyebrow">Methodology</h3>
      <p className="mt-2 text-sm font-semibold text-tech-navy">
        Based on official Georgia Tech tuition data and straightforward math.
      </p>
      <p className="mt-2 text-[11px] font-medium text-tech-navy/60">{usageLabel()}</p>
      <a
        className="focus-ring mt-3 inline-flex w-full items-center justify-center rounded-lg border border-tech-navy px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-tech-navy transition hover:bg-tech-navy hover:text-tech-white"
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
