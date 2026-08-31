import { useState } from 'react';

const GENRE_OPTIONS = [
  '', 'Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Romance',
  'Non-Fiction', 'Self-Help', 'Manga', 'Horror', 'Biography',
  'History', 'Science', 'Philosophy',
];

/**
 * Modal / drawer component for editing book club settings and current book.
 */
export default function BookClubSettingsModal({
  club,
  onClose,
  onUpdateSettings,
  onSetBook,
}) {
  const [name, setName] = useState(club?.name || '');
  const [genre, setGenre] = useState(club?.genre || '');
  const [description, setDescription] = useState(club?.description || '');
  const [isPublic, setIsPublic] = useState(club?.isPublic ?? true);

  const [bookId, setBookId] = useState(club?.currentBookId || '');
  const [bookTitle, setBookTitle] = useState(club?.currentBookTitle || '');

  const [savingSettings, setSavingSettings] = useState(false);
  const [savingBook, setSavingBook] = useState(false);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    await onUpdateSettings({ name, genre, description, isPublic });
    setSavingSettings(false);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setSavingBook(true);
    await onSetBook(bookId, bookTitle);
    setSavingBook(false);
  };

  return (
    <div className="bcd-page__modal-overlay" onClick={onClose}>
      <div className="bcd-page__modal" onClick={(e) => e.stopPropagation()}>
        <div className="bcd-page__modal-header">
          <h2>⚙️ Book Club Settings</h2>
          <button type="button" className="bcd-page__close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="bcd-page__modal-body">
          {/* Section 1: Basic Club Info */}
          <form className="bcd-page__settings-form" onSubmit={handleSettingsSubmit}>
            <h3>Club Details</h3>
            <div className="bcd-page__field">
              <label htmlFor="edit-club-name">Club Name</label>
              <input
                id="edit-club-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="bcd-page__field">
              <label htmlFor="edit-club-genre">Genre Focus</label>
              <select
                id="edit-club-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="">All genres</option>
                {GENRE_OPTIONS.filter(Boolean).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="bcd-page__field">
              <label htmlFor="edit-club-desc">Description</label>
              <textarea
                id="edit-club-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="bcd-page__field">
              <label className="bcd-page__checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Public Club (anyone can join)
              </label>
            </div>

            <button
              type="submit"
              className="bcd-page__submit-btn"
              disabled={savingSettings}
            >
              {savingSettings ? 'Saving…' : 'Save Details'}
            </button>
          </form>

          <hr className="bcd-page__modal-divider" />

          {/* Section 2: Set Current Book */}
          <form className="bcd-page__settings-form" onSubmit={handleBookSubmit}>
            <h3>Set Currently Reading Book</h3>
            <div className="bcd-page__field">
              <label htmlFor="edit-book-title">Book Title</label>
              <input
                id="edit-book-title"
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. Dune"
                required
              />
            </div>

            <div className="bcd-page__field">
              <label htmlFor="edit-book-id">Book ID (optional)</label>
              <input
                id="edit-book-id"
                type="text"
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                placeholder="e.g. b1"
              />
            </div>

            <button
              type="submit"
              className="bcd-page__submit-btn"
              disabled={savingBook}
            >
              {savingBook ? 'Updating…' : 'Set Current Book'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
