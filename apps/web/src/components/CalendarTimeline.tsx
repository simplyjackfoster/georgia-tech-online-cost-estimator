import React from 'react';
import { formatCurrency } from '../lib/calc';
import type { ScheduledTerm } from '../lib/plan';

type CalendarTimelineProps = {
  schedule: ScheduledTerm[];
};

const CalendarTimeline: React.FC<CalendarTimelineProps> = ({ schedule }) => (
  <div className="rounded-2xl border border-tech-gold/30 bg-white px-4 py-3 text-xs text-tech-navy/80">
    <p className="eyebrow">Calendar timeline</p>
    <div className="mt-2 space-y-2">
      {schedule.length === 0 ? (
        <p className="text-tech-navy/60">Add terms to see a timeline.</p>
      ) : (
        schedule.map((term) => (
          <div key={term.termLabel} className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-tech-navy">{term.termLabel}</p>
              <p className="text-[11px] text-tech-navy/60">{term.credits} credits</p>
            </div>
            <p className="text-right text-sm font-semibold text-tech-navy tabular-nums">
              {formatCurrency(term.total)} total
            </p>
          </div>
        ))
      )}
    </div>
  </div>
);

export default CalendarTimeline;
