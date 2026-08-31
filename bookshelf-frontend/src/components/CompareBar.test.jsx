import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ComparisonContext } from '../context/ComparisonContext.jsx';
import CompareBar from './CompareBar.jsx';

function renderWithCtx(overrides = {}) {
  const defaults = {
    compareIds: [],
    compareCount: 0,
    maxCompare: 5,
    isComparing: () => false,
    toggleCompare: vi.fn(),
    addToCompare: vi.fn(),
    removeFromCompare: vi.fn(),
    clearCompare: vi.fn(),
  };
  const ctx = { ...defaults, ...overrides };
  return render(
    <MemoryRouter>
      <ComparisonContext.Provider value={ctx}>
        <CompareBar />
      </ComparisonContext.Provider>
    </MemoryRouter>
  );
}

describe('CompareBar', () => {
  it('renders nothing when no books are selected', () => {
    const { container } = renderWithCtx();
    expect(container.firstChild).toBeNull();
  });

  it('shows the book count when books are selected', () => {
    renderWithCtx({
      compareIds: ['b1', 'b2'],
      compareCount: 2,
    });
    expect(screen.getByText(/2 books selected/)).toBeInTheDocument();
  });

  it('shows singular for one book', () => {
    renderWithCtx({
      compareIds: ['b1'],
      compareCount: 1,
    });
    expect(screen.getByText(/1 book selected/)).toBeInTheDocument();
  });

  it('shows max hint when below limit', () => {
    renderWithCtx({
      compareIds: ['b1'],
      compareCount: 1,
      maxCompare: 5,
    });
    expect(screen.getByText(/add up to 5/)).toBeInTheDocument();
  });

  it('does not show compare button when fewer than 2 books', () => {
    renderWithCtx({
      compareIds: ['b1'],
      compareCount: 1,
    });
    expect(screen.queryByText(/Compare now/)).not.toBeInTheDocument();
  });

  it('shows compare button when 2+ books selected', () => {
    renderWithCtx({
      compareIds: ['b1', 'b2'],
      compareCount: 2,
    });
    expect(screen.getByText(/Compare now/)).toBeInTheDocument();
  });

  it('calls clearCompare when clear button is clicked', () => {
    const clearCompare = vi.fn();
    renderWithCtx({
      compareIds: ['b1', 'b2'],
      compareCount: 2,
      clearCompare,
    });
    fireEvent.click(screen.getByText('Clear'));
    expect(clearCompare).toHaveBeenCalled();
  });
});
