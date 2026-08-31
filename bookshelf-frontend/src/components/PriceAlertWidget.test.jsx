import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import PriceAlertWidget from './PriceAlertWidget.jsx';

// Mock auth hook
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { _id: 'u1', name: 'Test User' } }),
}));

// Mock price alert service
vi.mock('../services/priceAlertService.js', () => ({
  checkAlert: vi.fn().mockResolvedValue({ hasAlert: false, alert: null }),
  createAlert: vi.fn().mockResolvedValue({ alert: { id: 'a1', targetPrice: 250 } }),
  deleteByBookId: vi.fn().mockResolvedValue({}),
}));

vi.mock('../utils/bookFormat.js', () => ({
  formatPrice: (p) => `₹${p}`,
}));

describe('PriceAlertWidget', () => {
  it('renders the price alert heading', async () => {
    render(<PriceAlertWidget bookId="b1" currentPrice={349} />);
    await waitFor(() => {
      expect(screen.getByText(/Price Alert/)).toBeInTheDocument();
    });
  });

  it('shows current price', async () => {
    render(<PriceAlertWidget bookId="b1" currentPrice={349} />);
    await waitFor(() => {
      expect(screen.getByText(/Current price/)).toBeInTheDocument();
      expect(screen.getByText('₹349')).toBeInTheDocument();
    });
  });

  it('shows target price input', async () => {
    render(<PriceAlertWidget bookId="b1" currentPrice={349} />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Notify me when price drops to/)).toBeInTheDocument();
    });
  });

  it('shows set alert button', async () => {
    render(<PriceAlertWidget bookId="b1" currentPrice={349} />);
    await waitFor(() => {
      expect(screen.getByText('Set alert')).toBeInTheDocument();
    });
  });

  it('suggests 10% below current price as default', async () => {
    render(<PriceAlertWidget bookId="b1" currentPrice={300} />);
    await waitFor(() => {
      const input = screen.getByLabelText(/Notify me when price drops to/);
      expect(input.value).toBe('270');
    });
  });
});
