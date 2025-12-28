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
    </footer>
  );
};

export default Footer;
