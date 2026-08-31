import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import BookshelfWidget from './BookshelfWidget.jsx';

// Mock the hooks
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { _id: 'u1', name: 'Test User' } }),
}));

vi.mock('../hooks/useReadingList.js', () => ({
  useReadingList: () => ({
    entries: [],
    stats: null,
    loading: false,
    checkBook: vi.fn().mockResolvedValue({ onList: false, entry: null }),
    addBook: vi.fn().mockResolvedValue({ entry: { id: 'e1', shelf: 'want-to-read' } }),
    update: vi.fn().mockResolvedValue({ entry: { id: 'e1', shelf: 'currently-reading' } }),
    removeBook: vi.fn().mockResolvedValue({}),
  }),
}));

describe('BookshelfWidget', () => {
  it('renders three shelf buttons', () => {
    render(<BookshelfWidget bookId="b1" />);
    expect(screen.getByText(/Want to Read/)).toBeInTheDocument();
    expect(screen.getByText(/Currently Reading/)).toBeInTheDocument();
    expect(screen.getByText(/Finished/)).toBeInTheDocument();
  });

  it('shows toast notification after being added to list', async () => {
    render(<BookshelfWidget bookId="b1" />);
    const wantBtn = screen.getByText(/Want to Read/);
    wantBtn.click();
    await waitFor(() => {
      expect(screen.getByText(/Added to/)).toBeInTheDocument();
    });
  });
});
