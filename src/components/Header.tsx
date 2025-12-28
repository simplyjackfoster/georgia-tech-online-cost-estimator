import React from 'react';

type HeaderProps = {
  onShare: () => void;
  shareStatus: 'idle' | 'copied' | 'error';
};

const Header: React.FC<HeaderProps> = ({ onShare, shareStatus }) => {
  const isCopied = shareStatus === 'copied';
  const isError = shareStatus === 'error';

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
            Compare pacing options and map your OMS degree plan
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={onShare}
            className={`relative isolate inline-flex min-w-[160px] items-center justify-center overflow-hidden rounded-lg px-4 py-2 font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              isCopied
                ? 'bg-tech-goldDark text-tech-navy'
                : isError
                  ? 'bg-red-600 text-tech-white'
                  : 'bg-tech-navy text-tech-white hover:opacity-90'
            }`}
          >
            <span
              className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ease-out ${
                shareStatus === 'idle' ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}
            >
              Copy share link
            </span>
            <span
              className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ease-out ${
                shareStatus === 'idle' ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
              }`}
            >
              {isCopied ? '✓ Copied' : 'Copy failed'}
            </span>
            <span className="invisible">Copy share link</span>
          </button>
        </div>
      </header>

      {shareStatus !== 'idle' ? (
        <span className="sr-only" role="status" aria-live="polite">
          {isCopied ? 'Link copied to clipboard.' : 'Copy failed. Link opened in a new tab.'}
        </span>
      ) : null}
    </>
  );
};

export default Header;
