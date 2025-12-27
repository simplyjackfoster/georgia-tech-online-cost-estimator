import React from 'react';

interface InfoTooltipProps {
  label: string;
  description: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ label, description }) => {
  return (
    <span className="relative inline-flex items-center gap-1 text-sm text-tech-navy">
      <span>{label}</span>
      <span
        className="group inline-flex h-5 w-5 items-center justify-center rounded-full border border-tech-goldDark text-[11px] font-semibold text-tech-goldDark"
        aria-label={description}
        role="img"
      >
        i
        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-lg bg-tech-navy px-3 py-2 text-xs text-tech-white opacity-0 shadow-lg transition group-hover:opacity-100">
          {description}
        </span>
      </span>
    </span>
  );
};
