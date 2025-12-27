import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows validation when credits are below minimum', async () => {
    render(<App />);

    const creditInput = screen.getByLabelText(/credits this term/i);
    await userEvent.clear(creditInput);
    await userEvent.type(creditInput, '0');

    expect(screen.getByText(/credits must be at least 1/i)).toBeInTheDocument();
  });
});
