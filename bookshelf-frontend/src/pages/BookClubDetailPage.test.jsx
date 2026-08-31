import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { _id: 'u1', name: 'Alice' } }),
}));

vi.mock('../services/bookClubService.js', () => ({
  getClub: vi.fn(),
  getClubStats: vi.fn(),
  leaveClub: vi.fn(),
  updateProgress: vi.fn(),
  sendMessage: vi.fn(),
  deleteMessage: vi.fn(),
  setCurrentBook: vi.fn(),
  deleteClub: vi.fn(),
  transferOwnership: vi.fn(),
  removeMember: vi.fn(),
}));

import BookClubDetailPage from './BookClubDetailPage.jsx';
import {
  getClub,
  getClubStats,
  sendMessage,
} from '../services/bookClubService.js';

const FAKE_CLUB = {
  id: 'c1',
  name: 'Fiction Fans',
  description: 'We love reading fiction together',
  genre: 'Fiction',
  maxMembers: 0,
  currentBookId: 'b1',
  currentBookTitle: 'Dune',
  isPublic: true,
  ownerId: 'u1',
  ownerName: 'Alice',
  memberCount: 3,
  members: [
    { userId: 'u1', role: 'owner', joinedAt: '2026-08-01T00:00:00.000Z', readingProgress: 75 },
    { userId: 'u2', role: 'member', joinedAt: '2026-08-02T00:00:00.000Z', readingProgress: 50 },
    { userId: 'u3', role: 'member', joinedAt: '2026-08-03T00:00:00.000Z', readingProgress: null },
  ],
  messageCount: 2,
  tags: [],
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-15T00:00:00.000Z',
  messages: [
    {
      _id: 'm1',
      authorId: 'u1',
      authorName: 'Alice',
      content: 'Welcome to the club!',
      bookId: null,
      createdAt: '2026-08-01T10:00:00.000Z',
    },
    {
      _id: 'm2',
      authorId: 'u2',
      authorName: 'Bob',
      content: 'Excited to read Dune together!',
      bookId: 'b1',
      createdAt: '2026-08-01T11:00:00.000Z',
    },
  ],
};

const FAKE_STATS = {
  totalMembers: 3,
  membersReading: 2,
  membersFinished: 0,
  avgProgress: 63,
  currentBookId: 'b1',
  currentBookTitle: 'Dune',
  members: [
    { userId: 'u1', role: 'owner', readingProgress: 75 },
    { userId: 'u2', role: 'member', readingProgress: 50 },
    { userId: 'u3', role: 'member', readingProgress: null },
  ],
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/book-clubs/c1']}>
      <Routes>
        <Route path="/book-clubs/:id" element={<BookClubDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('BookClubDetailPage', () => {
  beforeEach(() => {
    getClub.mockResolvedValue(FAKE_CLUB);
    getClubStats.mockResolvedValue(FAKE_STATS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the club name', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Fiction Fans')).toBeInTheDocument();
    });
  });

  it('shows the back link', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('← All Clubs')).toBeInTheDocument();
    });
  });

  it('displays the club description', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('We love reading fiction together')).toBeInTheDocument();
    });
  });

  it('shows the genre tag', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Fiction')).toBeInTheDocument();
    });
  });

  it('displays the current book', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText(/Dune/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows member count', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText(/3 members/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays discussion messages', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Welcome to the club!')).toBeInTheDocument();
      expect(screen.getByText('Excited to read Dune together!')).toBeInTheDocument();
    });
  });

  it('shows message author names', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText(/Alice/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('shows the tabs', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText(/Discussion/)).toBeInTheDocument();
      expect(screen.getByText(/Members/)).toBeInTheDocument();
      expect(screen.getByText(/Progress/)).toBeInTheDocument();
    });
  });

  it('shows stats summary', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText(/Progress/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Progress/));
    await waitFor(() => {
      expect(screen.getByText('63%')).toBeInTheDocument();
    });
  });

  it('shows reading progress presets', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText(/Progress/)).toBeInTheDocument();
    });
    const progressTab = screen.getByText(/Progress/);
    fireEvent.click(progressTab);
    await waitFor(() => {
      expect(screen.getAllByText('75%').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows the settings button for owner', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
    });
  });

  it('shows the message input', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument();
    });
  });
});
