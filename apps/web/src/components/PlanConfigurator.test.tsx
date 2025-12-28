import { fireEvent, render, screen } from '@testing-library/react';
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
        programKey="omscs"
        isMixedIncomplete={false}
      />
    );

    await userEvent.click(screen.getByRole('radio', { name: /custom schedule/i }));

    expect(handlePaceModeChange).toHaveBeenCalledWith('mixed');
  });

  it('updates mixed rows when editing term credits', () => {
    const handleMixedRowsChange = vi.fn();
    render(
      <PlanConfigurator
        draftProgramKey="omscs"
        draftStartTermKey="spring-2026"
        onDraftProgramChange={vi.fn()}
        onDraftStartTermChange={vi.fn()}
        onApplyDraft={vi.fn()}
        paceMode="mixed"
        onPaceModeChange={vi.fn()}
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
        onMixedRowsChange={handleMixedRowsChange}
        programKey="omscs"
        isMixedIncomplete={false}
      />
    );

    const creditsInput = screen.getByLabelText('Credits for Summer 2026');
    fireEvent.change(creditsInput, { target: { value: '6' } });

    expect(handleMixedRowsChange).toHaveBeenCalled();
    const updater =
      handleMixedRowsChange.mock.calls[handleMixedRowsChange.mock.calls.length - 1]?.[0];
    expect(typeof updater).toBe('function');

    const nextRows = updater([{ id: 'row-1', terms: 2, creditsPerTerm: 3 }]);
    expect(nextRows).toEqual([
      { id: 'row-1', terms: 1, creditsPerTerm: 3 },
      { id: 'row-2', terms: 1, creditsPerTerm: 6 }
    ]);
  });
});
