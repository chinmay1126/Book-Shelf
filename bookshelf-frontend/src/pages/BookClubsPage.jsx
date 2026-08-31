import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  listClubs,
  getMyClubs,
  createClub,
  joinClub,
} from '../services/bookClubService.js';
import BookClubCard from '../components/bookClubs/BookClubCard.jsx';
import './BookClubsPage.css';

const GENRE_OPTIONS = [
  '', 'Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Romance',
  'Non-Fiction', 'Self-Help', 'Manga', 'Horror', 'Biography',
  'History', 'Science', 'Philosophy',
];

export default function BookClubsPage() {
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────
  const [myClubs, setMyClubs] = useState([]);
  const [publicClubs, setPublicClubs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Create club form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    genre: '',
    isPublic: true,
  });
  const [creating, setCreating] = useState(false);

  // ── Toast message ─────────────────────────────────────────────────────
  const flash = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  }, []);

  // ── Load clubs ────────────────────────────────────────────────────────
  const loadMyClubs = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getMyClubs();
      setMyClubs(data.clubs || []);
    } catch {
      // silent
    }
  }, [user]);

  const loadPublicClubs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 12 };
      if (searchQuery) params.q = searchQuery;
      if (genreFilter) params.genre = genreFilter;

      const data = await listClubs(params);
      setPublicClubs(data.clubs || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      flash(err?.message || 'Failed to load clubs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, genreFilter, flash]);

  useEffect(() => {
    loadMyClubs();
  }, [loadMyClubs]);

  useEffect(() => {
    loadPublicClubs();
  }, [loadPublicClubs]);

  // ── Create club ───────────────────────────────────────────────────────
  async function handleCreateClub(e) {
    e.preventDefault();
    if (!newClub.name.trim()) {
      flash('Club name is required');
      return;
    }
    setCreating(true);
    try {
      const club = await createClub(newClub);
      setMyClubs((prev) => [club, ...prev]);
      setNewClub({ name: '', description: '', genre: '', isPublic: true });
      setShowCreateForm(false);
      flash(`"${club.name}" created!`);
    } catch (err) {
      flash(err?.message || 'Failed to create club');
    } finally {
      setCreating(false);
    }
  }

  // ── Join club ─────────────────────────────────────────────────────────
  async function handleJoin(clubId) {
    try {
      await joinClub(clubId);
      flash('Joined the club!');
      loadMyClubs();
      loadPublicClubs();
    } catch (err) {
      flash(err?.message || 'Failed to join');
    }
  }

  // ── Search submit ─────────────────────────────────────────────────────
  function handleSearch(e) {
    e.preventDefault();
    setCurrentPage(1);
    loadPublicClubs();
  }

  const isMember = (clubId) => myClubs.some((c) => c.id === clubId);

  return (
    <main className="bc-page">
      <header className="bc-page__header">
        <div className="bc-page__header-left">
          <h1 className="bc-page__title">📚 Book Clubs</h1>
          <p className="bc-page__subtitle">
            Join a club to read and discuss books with fellow readers
          </p>
        </div>
        {user && (
          <button
            type="button"
            className="bc-page__create-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ Create Club'}
          </button>
        )}
      </header>

      {message && (
        <div className="bc-page__toast" role="status">
          {message}
        </div>
      )}

      {/* ── Create Club Form ──────────────────────────────────────────── */}
      {showCreateForm && (
        <form className="bc-page__create-form" onSubmit={handleCreateClub}>
          <h2 className="bc-page__form-title">Create a New Club</h2>
          <div className="bc-page__form-grid">
            <div className="bc-page__field">
              <label htmlFor="club-name">Club name *</label>
              <input
                id="club-name"
                type="text"
                maxLength={100}
                value={newClub.name}
                onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                placeholder="e.g. Sci-Fi Enthusiasts"
                required
              />
            </div>
            <div className="bc-page__field">
              <label htmlFor="club-genre">Genre focus</label>
              <select
                id="club-genre"
                value={newClub.genre}
                onChange={(e) => setNewClub({ ...newClub, genre: e.target.value })}
              >
                <option value="">All genres</option>
                {GENRE_OPTIONS.filter(Boolean).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="bc-page__field bc-page__field--full">
              <label htmlFor="club-desc">Description</label>
              <textarea
                id="club-desc"
                maxLength={2000}
                rows={3}
                value={newClub.description}
                onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                placeholder="What will your club read and discuss?"
              />
            </div>
            <div className="bc-page__field">
              <label className="bc-page__checkbox-label">
                <input
                  type="checkbox"
                  checked={newClub.isPublic}
                  onChange={(e) => setNewClub({ ...newClub, isPublic: e.target.checked })}
                />
                Public (anyone can join)
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="bc-page__submit-btn"
            disabled={creating}
          >
            {creating ? 'Creating…' : 'Create Club'}
          </button>
        </form>
      )}

      {/* ── My Clubs ──────────────────────────────────────────────────── */}
      {user && myClubs.length > 0 && (
        <section className="bc-page__section">
          <h2 className="bc-page__section-title">Your Clubs</h2>
          <div className="bc-page__club-grid">
            {myClubs.map((club) => (
              <BookClubCard
                key={club.id}
                club={club}
                isMine={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Discover Public Clubs ─────────────────────────────────────── */}
      <section className="bc-page__section">
        <h2 className="bc-page__section-title">Discover Clubs</h2>

        <form className="bc-page__search-bar" onSubmit={handleSearch}>
          <input
            type="search"
            className="bc-page__search-input"
            placeholder="Search clubs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="bc-page__genre-select"
            value={genreFilter}
            onChange={(e) => {
              setGenreFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All genres</option>
            {GENRE_OPTIONS.filter(Boolean).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <button type="submit" className="bc-page__search-btn">Search</button>
        </form>

        {loading ? (
          <div className="bc-page__loading">
            <div className="bc-page__spinner" />
            <span>Loading clubs…</span>
          </div>
        ) : publicClubs.length === 0 ? (
          <div className="bc-page__empty">
            <p>No clubs found. Be the first to create one!</p>
          </div>
        ) : (
          <>
            <div className="bc-page__club-grid">
              {publicClubs.map((club) => (
                <BookClubCard
                  key={club.id}
                  club={club}
                  isMember={isMember(club.id)}
                  user={user}
                  onJoin={handleJoin}
                />
              ))}
            </div>

            {/* Pagination info bar */}
            {pagination.total > 0 && (
              <div className="bc-page__pagination">
                <button
                  type="button"
                  className="bc-page__page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                <span className="bc-page__page-info">
                  Page {currentPage} of {pagination.pages} ({pagination.total} club{pagination.total !== 1 ? 's' : ''})
                </span>
                <button
                  type="button"
                  className="bc-page__page-btn"
                  disabled={currentPage >= pagination.pages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
