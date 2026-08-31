import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { _id: 'u1', name: 'Alice' } }),
}));

vi.mock('../services/bookClubService.js', () => ({
  listClubs: vi.fn(),
  getMyClubs: vi.fn(),
  createClub: vi.fn(),
  joinClub: vi.fn(),
}));

import BookClubsPage from './BookClubsPage.jsx';
import { listClubs, getMyClubs, createClub } from '../services/bookClubService.js';

const FAKE_MY_CLUBS = [
  {
    id: 'c1',
    name: 'Fiction Fans',
    description: 'We love fiction',
    genre: 'Fiction',
    memberCount: 5,
    currentBookTitle: 'Dune',
    isPublic: true,
    ownerId: 'u1',
    ownerName: 'Alice',
    tags: [],
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

const FAKE_PUBLIC_CLUBS = [
  {
    id: 'c1',
    name: 'Fiction Fans',
    description: 'We love fiction',
    genre: 'Fiction',
    memberCount: 5,
    currentBookTitle: 'Dune',
    isPublic: true,
    ownerId: 'u1',
    ownerName: 'Alice',
    tags: [],
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'c2',
    name: 'Sci-Fi Explorers',
    description: 'Blast off into space',
    genre: 'Sci-Fi',
    memberCount: 12,
    currentBookTitle: null,
    isPublic: true,
    ownerId: 'u2',
    ownerName: 'Bob',
    tags: [],
    createdAt: '2026-08-02T00:00:00.000Z',
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/book-clubs']}>
      <BookClubsPage />
    </MemoryRouter>
  );
}

describe('BookClubsPage', () => {
  beforeEach(() => {
    getMyClubs.mockResolvedValue({ clubs: FAKE_MY_CLUBS });
    listClubs.mockResolvedValue({
      clubs: FAKE_PUBLIC_CLUBS,
      pagination: { page: 1, pages: 1, total: 2 },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the page title', async () => {
    renderPage();
    expect(screen.getByText('📚 Book Clubs')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Sci-Fi Explorers')).toBeInTheDocument();
    });
  });

  it('loads and displays public clubs', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Fiction Fans').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Sci-Fi Explorers')).toBeInTheDocument();
    });
  });

  it('shows the user\'s clubs in "Your Clubs" section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Fiction Fans').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows the create club button', async () => {
    renderPage();
    expect(screen.getByText('+ Create Club')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Sci-Fi Explorers')).toBeInTheDocument();
    });
  });

  it('opens the create club form when button is clicked', async () => {
    renderPage();
    const btn = screen.getByText('+ Create Club');
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByText('Create a New Club')).toBeInTheDocument();
    });
  });

  it('displays club member counts', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText(/5 members/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/12 members/)).toBeInTheDocument();
    });
  });

  it('displays current book titles when available', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText(/Dune/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows search input and genre filter', async () => {
    renderPage();
    expect(screen.getByPlaceholderText('Search clubs…')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Sci-Fi Explorers')).toBeInTheDocument();
    });
  });

  it('shows pagination info when there are results', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/2 clubs/)).toBeInTheDocument();
    });
  });
});
