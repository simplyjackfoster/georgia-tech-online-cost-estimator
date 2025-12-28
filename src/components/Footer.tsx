import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-6 rounded-2xl border border-tech-gold/30 bg-white px-4 py-4 text-[11px] text-tech-navy/70 shadow-sm">
      <p className="font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
        Disclaimer
      </p>
      <p className="mt-2">
        Independent student-built tool. Not affiliated with, endorsed by, or sponsored by
        Georgia Tech.
      </p>
      <div className="mt-3">
        <a
          className="inline-flex items-center gap-2 rounded-full border border-tech-gold/40 bg-tech-gold/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-navy transition hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold"
          href="https://github.com/simplyjackfoster/georgia-tech-online-cost-planner"
          rel="noreferrer"
          target="_blank"
        >
          <span className="text-tech-goldDark">GitHub</span>
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-tech-navy/80"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.9-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.27 2.75 1.03A9.3 9.3 0 0 1 12 6.8c.85 0 1.7.12 2.5.34 1.9-1.3 2.74-1.03 2.74-1.03.55 1.43.2 2.49.1 2.75.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.94.68 1.9 0 1.38-.01 2.5-.01 2.84 0 .26.18.58.69.48A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
          </svg>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
