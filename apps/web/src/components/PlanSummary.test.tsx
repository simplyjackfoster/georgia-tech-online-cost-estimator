import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PlanSummary from './PlanSummary';
import { resolveStartTerm, type PlanResult } from '../lib/plan';

const plan: PlanResult = {
  numberOfTerms: 4,
  totalFees: 200,
  totalTuition: 1000,
  totalCost: 1200,
  averagePerTerm: 300,
  finishTerm: resolveStartTerm('fall-2026'),
  feePayments: 4,
  plannedCredits: 30,
  creditsCovered: 30,
  schedule: [{ termLabel: 'Fall 2026', credits: 6, tuition: 1000, fee: 200, total: 1200 }]
};

describe('PlanSummary', () => {
  it('renders summary totals, finish term, and residency once', () => {
    render(<PlanSummary plan={plan} programKey="omscs" residency="out-of-state" paceMode="constant" />);

    expect(screen.getByText(/total degree cost/i)).toBeInTheDocument();
    expect(screen.getByText(/finish fall 2026 · out-of-state rates/i)).toBeInTheDocument();
    expect(screen.getByText(/4 semesters/i)).toBeInTheDocument();
    expect(screen.getByText('$1,200.00')).toBeInTheDocument();
    expect(screen.queryByText(/calendar timeline/i)).not.toBeInTheDocument();
  });

  it('renders the calendar timeline in mixed mode', () => {
    render(<PlanSummary plan={plan} programKey="omscs" residency="in-state" paceMode="mixed" />);

    expect(screen.getByText(/calendar timeline/i)).toBeInTheDocument();
    expect(screen.getByText('6 credits')).toBeInTheDocument();
  });
});
