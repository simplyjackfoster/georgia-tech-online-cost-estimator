import React from 'react';

type HeaderProps = {
  onShare: () => void;
  shareStatus: string;
};

const Header: React.FC<HeaderProps> = ({ onShare, shareStatus }) => {
  return (
    <>
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-tech-goldDark">
            Georgia Tech Online
          </p>
          <h1 className="text-2xl font-semibold text-tech-goldMedium">
            OMS Degree Planning Calculator
          </h1>
          <p className="text-xs text-tech-navy/70">
            Compare pacing options and map your OMS degree plan with the fastest, most
            cost-efficient path.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={onShare}
            className="rounded-lg bg-tech-navy px-4 py-2 font-semibold text-tech-white transition hover:opacity-90"
          >
            Share My Degree Plan
          </button>
        </div>
      </header>

      {shareStatus ? <p className="mt-2 text-xs text-tech-goldDark">{shareStatus}</p> : null}
    </>
  );
};

export default Header;
