import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PlanSummary from './PlanSummary';

describe('PlanSummary', () => {
  it('renders summary totals and finish term', () => {
    render(
      <PlanSummary
        activePlan={{
          numberOfTerms: 4,
          totalFees: 200,
          totalTuition: 1000,
          totalCost: 1200,
          averagePerTerm: 300,
          finishTerm: { label: 'Fall 2026' },
          feePayments: 4,
          plannedCredits: 30,
          creditsCovered: 30,
          schedule: []
        }}
        selectedProgramKey="omscs"
        paceMode="constant"
        mixedSchedule={[]}
      />
    );

    expect(screen.getByText(/total degree cost/i)).toBeInTheDocument();
    expect(screen.getByText(/finish fall 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/4 semesters/i)).toBeInTheDocument();
  });
});
