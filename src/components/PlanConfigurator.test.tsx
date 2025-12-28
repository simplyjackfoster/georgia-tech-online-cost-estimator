import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PlanConfigurator from './PlanConfigurator';

describe('PlanConfigurator', () => {
  it('lets users switch to mixed mode', async () => {
    const handlePaceModeChange = vi.fn();
    render(
      <PlanConfigurator
        draftProgramKey="omscs"
        draftStartTermKey="spring-2026"
        onDraftProgramChange={vi.fn()}
        onDraftStartTermChange={vi.fn()}
        onApplyDraft={vi.fn()}
        paceMode="constant"
        onPaceModeChange={handlePaceModeChange}
        paceRows={[
          {
            creditsPerTerm: 3,
            finishTerm: { label: 'Fall 2026' },
            fullDegree: { totalCost: 900, averagePerTerm: 225, numberOfTerms: 4 }
          }
        ]}
        selectedPace={3}
        onSelectPace={vi.fn()}
        mixedRows={[{ id: 'row-1', terms: 2, creditsPerTerm: 3 }]}
        onMixedRowsChange={vi.fn()}
        mixedPlan={{
          numberOfTerms: 2,
          totalFees: 0,
          totalTuition: 0,
          totalCost: 0,
          averagePerTerm: 0,
          finishTerm: { label: 'Fall 2026', key: 'fall-2026', season: 'Fall', year: 2026 },
          feePayments: 2,
          plannedCredits: 6,
          creditsCovered: 6,
          schedule: []
        }}
        programKey="omscs"
        isMixedIncomplete={false}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /mixed load/i }));

    expect(handlePaceModeChange).toHaveBeenCalledWith('mixed');
  });
});
