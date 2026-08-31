import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

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
  updateClub: vi.fn(),
}));

import { useBookClub } from './useBookClub.js';
import {
  getClub,
  getClubStats,
  sendMessage,
  updateProgress,
  leaveClub,
} from '../services/bookClubService.js';

const FAKE_CLUB = {
  id: 'c1',
  name: 'Sci-Fi Enthusiasts',
  genre: 'Sci-Fi',
  members: [
    { userId: 'u1', role: 'owner', readingProgress: 25 },
    { userId: 'u2', role: 'member', readingProgress: 50 },
  ],
  messages: [{ _id: 'm1', content: 'Hello' }],
};

const FAKE_STATS = {
  avgProgress: 38,
  membersReading: 2,
};

describe('useBookClub hook', () => {
  beforeEach(() => {
    getClub.mockResolvedValue(FAKE_CLUB);
    getClubStats.mockResolvedValue(FAKE_STATS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches club details and stats on mount', async () => {
    const { result } = renderHook(() => useBookClub('c1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.club.name).toBe('Sci-Fi Enthusiasts');
    expect(result.current.isOwner).toBe(true);
    expect(result.current.isMember).toBe(true);
    expect(result.current.myProgress).toBe(25);
  });

  it('sends discussion message', async () => {
    sendMessage.mockResolvedValue({ _id: 'm2', content: 'New message' });
    const { result } = renderHook(() => useBookClub('c1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSendMessage('New message');
    });

    expect(sendMessage).toHaveBeenCalledWith('c1', { content: 'New message' });
    await waitFor(() => {
      expect(result.current.club.messages).toHaveLength(2);
    });
  });

  it('updates reading progress', async () => {
    updateProgress.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useBookClub('c1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSetProgress(75);
    });

    expect(updateProgress).toHaveBeenCalledWith('c1', 75);
    await waitFor(() => {
      expect(result.current.myProgress).toBe(75);
    });
  });

  it('leaves club', async () => {
    leaveClub.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useBookClub('c1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let res;
    await act(async () => {
      res = await result.current.handleLeave();
    });

    expect(leaveClub).toHaveBeenCalledWith('c1');
    expect(res).toBe(true);
  });
});
