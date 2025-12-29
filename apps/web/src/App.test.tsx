import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('matches the baseline layout snapshot', () => {
    const { container } = render(<App />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('updates the dashboard when a pace is selected', async () => {
    render(<App />);

    const paceRow = screen.getAllByLabelText(/select 3 credits per term/i)[0];
    await userEvent.click(paceRow);

    const planButton = within(
      screen.getAllByRole('region', { name: /start your oms plan/i })[0]
    ).getByRole('button', { name: /update my plan/i });
    await userEvent.click(planButton);

    expect(screen.getByText(/10 semesters/i)).toBeInTheDocument();
  });

  it('renders a mixed load timeline when enabled', async () => {
    render(<App />);

    const toggle = screen.getAllByRole('radio', { name: /custom schedule/i })[0];
    await userEvent.click(toggle);

    const planButton = within(
      screen.getAllByRole('region', { name: /start your oms plan/i })[0]
    ).getByRole('button', { name: /update my plan/i });
    await userEvent.click(planButton);

    expect(screen.getByText(/calendar timeline/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\d+ credits/i).length).toBeGreaterThan(0);
  });
});
