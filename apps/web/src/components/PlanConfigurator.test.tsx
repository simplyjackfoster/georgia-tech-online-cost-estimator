import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PlanConfigurator from './PlanConfigurator';
import { DEFAULT_SELECTION, buildPaceRows, type PlanSelection } from '../lib/plan';

const renderConfigurator = (overrides: Partial<PlanSelection> = {}) => {
  const draft: PlanSelection = { ...DEFAULT_SELECTION, ...overrides };
  const onChange = vi.fn();
  const onMixedRowsChange = vi.fn();
  const onApply = vi.fn();
  render(
    <PlanConfigurator
      draft={draft}
      paceRows={buildPaceRows(draft)}
      isMixedIncomplete={false}
      onChange={onChange}
      onMixedRowsChange={onMixedRowsChange}
      onApply={onApply}
    />
  );
  return { onChange, onMixedRowsChange, onApply };
};

describe('PlanConfigurator', () => {
  it('reports program, residency, and pace changes as draft patches', async () => {
    const { onChange } = renderConfigurator();

    await userEvent.click(screen.getByRole('radio', { name: /OMSA/ }));
    await userEvent.click(screen.getByRole('radio', { name: /^in-state$/i }));
    await userEvent.click(screen.getByRole('radio', { name: /^3 credits$/i }));

    expect(onChange).toHaveBeenCalledWith({ programKey: 'omsa' });
    expect(onChange).toHaveBeenCalledWith({ residency: 'in-state' });
    expect(onChange).toHaveBeenCalledWith({ pace: 3 });
  });

  it('lets users switch to mixed mode', async () => {
    const { onChange } = renderConfigurator();

    await userEvent.click(screen.getByRole('radio', { name: /custom schedule/i }));

    expect(onChange).toHaveBeenCalledWith({ paceMode: 'mixed' });
  });

  it('shows the per-credit rate for the drafted program and residency', () => {
    renderConfigurator({ programKey: 'omscsec', residency: 'out-of-country' });

    expect(screen.getByText(/\$406\.00\/credit/)).toBeInTheDocument();
  });

  it('updates mixed rows when editing term credits', () => {
    const { onMixedRowsChange } = renderConfigurator({
      paceMode: 'mixed',
      mixedRows: [{ id: 'row-1', terms: 2, creditsPerTerm: 3 }]
    });

    fireEvent.change(screen.getByLabelText('Credits for Summer 2026'), { target: { value: '6' } });

    const updater = onMixedRowsChange.mock.calls.at(-1)?.[0];
    expect(typeof updater).toBe('function');
    expect(updater([{ id: 'row-1', terms: 2, creditsPerTerm: 3 }])).toEqual([
      { id: 'row-1', terms: 1, creditsPerTerm: 3 },
      { id: 'row-2', terms: 1, creditsPerTerm: 6 }
    ]);
  });

  it('calls onApply from the update button', async () => {
    const { onApply } = renderConfigurator();

    await userEvent.click(screen.getByRole('button', { name: /update my plan/i }));

    expect(onApply).toHaveBeenCalledTimes(1);
  });
});
