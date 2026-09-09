import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

const configurator = () => screen.getByRole('region', { name: /start your oms plan/i });
const summary = () => screen.getByRole('region', { name: /^your \w+ plan$/i });
const applyPlan = () => userEvent.click(within(configurator()).getByRole('button', { name: /update my plan/i }));

describe('App', () => {
  it('matches the baseline layout snapshot', () => {
    const { container } = render(<App />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('defaults to out-of-state OMSCS at 6 credits per term', () => {
    render(<App />);

    // 30 credits × $236 tuition + 5 × $531 fees
    expect(within(summary()).getByText('$9,735.00')).toBeInTheDocument();
    expect(within(summary()).getByText('$7,080.00')).toBeInTheDocument();
  });

  it('does not change the summary until the plan is applied', async () => {
    render(<App />);

    await userEvent.click(within(configurator()).getByRole('radio', { name: /^3 credits$/i }));
    expect(within(summary()).queryByText(/10 semesters/i)).not.toBeInTheDocument();

    await applyPlan();
    expect(within(summary()).getByText(/10 semesters/i)).toBeInTheDocument();
  });

  it('applies in-state tuition when residency is changed', async () => {
    render(<App />);

    await userEvent.click(within(configurator()).getByRole('radio', { name: /^in-state$/i }));
    await applyPlan();

    expect(within(summary()).getByText('$6,810.00')).toBeInTheDocument();
    expect(within(summary()).getByText(/in-state rates/i)).toBeInTheDocument();
  });

  it('renders a single calendar timeline when mixed mode is applied', async () => {
    render(<App />);

    await userEvent.click(within(configurator()).getByRole('radio', { name: /custom schedule/i }));
    await applyPlan();

    expect(screen.getByText(/calendar timeline/i)).toBeInTheDocument();
    expect(within(summary()).getAllByText(/\d+ credits$/i).length).toBeGreaterThan(0);
  });
});
