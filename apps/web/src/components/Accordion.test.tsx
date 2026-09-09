import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Accordion from './Accordion';

describe('Accordion', () => {
  it('renders a static heading with visible content when not collapsible', () => {
    render(
      <Accordion title="Official rates" collapsible={false}>
        <p>Rate table</p>
      </Accordion>
    );

    expect(screen.getByRole('heading', { name: 'Official rates' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Rate table')).toBeVisible();
  });

  it('toggles the panel when collapsible', async () => {
    render(
      <Accordion title="Explain the math">
        <p>Formula</p>
      </Accordion>
    );

    const button = screen.getByRole('button', { name: /explain the math/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Formula')).not.toBeVisible();

    await userEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Formula')).toBeVisible();
  });
});
