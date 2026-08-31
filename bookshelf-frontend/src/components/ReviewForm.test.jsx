import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReviewForm from './ReviewForm.jsx';

/**
 * Component tests for ReviewForm.
 *
 * These run in the vitest/jsdom environment that the project already
 * has configured — no extra setup needed.
 */

describe('ReviewForm', () => {
  it('renders all five star buttons', async () => {
    const onSubmit = vi.fn();
    render(<ReviewForm onSubmit={onSubmit} />);

    const stars = screen.getAllByRole('button', { name: /\d Star/i });
    expect(stars).toHaveLength(5);
  });

  it('renders the submit button with correct label', () => {
    render(<ReviewForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
  });

  it('shows an error when submitted without a rating', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<ReviewForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /submit review/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/select a rating/i)).toBeInTheDocument();
  });

  it('calls onSubmit with the selected rating', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ReviewForm onSubmit={onSubmit} />);

    // Click the 4th star.
    const stars = screen.getAllByRole('button', { name: /\d Star/i });
    await user.click(stars[3]);

    await user.click(screen.getByRole('button', { name: /submit review/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 4 })
    );
  });

  it('pre-populates from initial prop', () => {
    render(
      <ReviewForm
        onSubmit={vi.fn()}
        initial={{ rating: 3, title: 'Great book', body: 'Loved it.' }}
      />
    );

    expect(screen.getByDisplayValue('Great book')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Loved it.')).toBeInTheDocument();
  });

  it('shows character count for the body', () => {
    render(<ReviewForm onSubmit={vi.fn()} />);

    expect(screen.getByText('0/2000')).toBeInTheDocument();
  });
});
