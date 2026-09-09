import React from 'react';
import { formatCurrency } from '../lib/calc';

type StickyPlanBarProps = {
  totalCost: number;
  finishLabel: string;
  onCopyShare: () => void;
  onViewDetails: () => void;
};

const BUTTON =
  'focus-ring w-full shrink-0 rounded-full px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] transition min-[360px]:px-3 min-[360px]:py-2 min-[360px]:text-[10px] min-[420px]:w-auto';

const StickyPlanBar: React.FC<StickyPlanBarProps> = ({ totalCost, finishLabel, onCopyShare, onViewDetails }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-tech-gold/30 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center">
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">Total cost</p>
        <p className="text-lg font-semibold text-tech-navy tabular-nums">{formatCurrency(totalCost)}</p>
        <p className="text-[11px] text-tech-navy/70">Finish {finishLabel}</p>
      </div>
      <div className="flex w-full flex-col gap-2 min-[420px]:w-auto min-[420px]:flex-row min-[420px]:items-center max-[360px]:flex-col-reverse max-[360px]:items-stretch">
        <button
          type="button"
          onClick={onCopyShare}
          className={`${BUTTON} border border-tech-navy text-tech-navy hover:bg-tech-navy hover:text-tech-white`}
        >
          Copy share link
        </button>
        <button type="button" onClick={onViewDetails} className={`${BUTTON} bg-tech-navy text-tech-white hover:opacity-90`}>
          View details
        </button>
      </div>
    </div>
  </div>
);

export default StickyPlanBar;
