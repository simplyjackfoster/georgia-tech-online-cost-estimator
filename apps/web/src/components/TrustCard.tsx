import React, { useEffect, useState } from 'react';

type TrustCardProps = {
  className?: string;
};

const TrustCard: React.FC<TrustCardProps> = ({ className = '' }) => {
  const [adoptionCount, setAdoptionCount] = useState<number | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
  const adoptionUrl = apiBaseUrl ? `${apiBaseUrl}/api/adoption` : null;
  const sourceUrl = import.meta.env.VITE_SOURCE_URL ?? 'https://github.com';

  useEffect(() => {
    if (!adoptionUrl || typeof fetch !== 'function') {
      return;
    }

    const controller = new AbortController();

    const loadAdoptionCount = async () => {
      try {
        const response = await fetch(adoptionUrl, { signal: controller.signal });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { count?: number };
        if (typeof data?.count === 'number' && Number.isFinite(data.count)) {
          setAdoptionCount(Math.max(0, Math.floor(data.count)));
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setAdoptionCount(null);
        }
      }
    };

    loadAdoptionCount();

    return () => controller.abort();
  }, [adoptionUrl]);

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
