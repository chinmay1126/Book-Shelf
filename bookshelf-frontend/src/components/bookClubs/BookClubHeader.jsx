import { Link } from 'react-router-dom';

/**
 * Header section for Book Club detail view.
 * Displays club title, genre tag, member counts, description, current book, and owner controls.
 */
export default function BookClubHeader({
  club,
  isMember,
  isOwner,
  onLeave,
  onOpenSettings,
  onDeleteClub,
}) {
  if (!club) return null;

  return (
    <header className="bcd-page__header">
      <Link to="/book-clubs" className="bcd-page__back-link">
        ← All Clubs
      </Link>

      <div className="bcd-page__header-main">
        <div className="bcd-page__title-row">
          <h1 className="bcd-page__title">{club.name}</h1>
          {club.genre && <span className="bcd-page__genre-badge">{club.genre}</span>}
          {!club.isPublic && <span className="bcd-page__private-badge">🔒 Private</span>}
        </div>

        {club.description && <p className="bcd-page__desc">{club.description}</p>}

        <div className="bcd-page__meta">
          <span>👥 {club.memberCount ?? club.members?.length ?? 0} members</span>
          {club.currentBookTitle && (
            <span>
              📖 Current Book:{' '}
              {club.currentBookId ? (
                <Link to={`/book/${club.currentBookId}`} className="bcd-page__book-link">
                  {club.currentBookTitle}
                </Link>
              ) : (
                club.currentBookTitle
              )}
            </span>
          )}
          {club.ownerName && <span>Created by {club.ownerName}</span>}
        </div>

        <div className="bcd-page__header-actions">
          {isMember && !isOwner && (
            <button
              type="button"
              className="bcd-page__action-btn bcd-page__action-btn--leave"
              onClick={onLeave}
            >
              Leave Club
            </button>
          )}

          {isOwner && (
            <>
              <button
                type="button"
                className="bcd-page__action-btn bcd-page__action-btn--settings"
                onClick={onOpenSettings}
              >
                ⚙️ Settings
              </button>

              <button
                type="button"
                className="bcd-page__action-btn bcd-page__action-btn--delete"
                onClick={onDeleteClub}
              >
                🗑️ Delete Club
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
