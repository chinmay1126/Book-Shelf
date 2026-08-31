import { Link } from 'react-router-dom';

/**
 * Single Book Club Card component for directory listing & discovery grids.
 */
export default function BookClubCard({
  club,
  isMember,
  user,
  onJoin,
  isMine = false,
}) {
  if (isMine) {
    return (
      <Link
        to={`/book-clubs/${club.id}`}
        className="bc-page__club-card bc-page__club-card--mine"
      >
        <div className="bc-page__club-card-header">
          <h3 className="bc-page__club-name">{club.name}</h3>
          {club.genre && <span className="bc-page__club-genre">{club.genre}</span>}
        </div>
        {club.description && <p className="bc-page__club-desc">{club.description}</p>}
        <div className="bc-page__club-meta">
          <span>👥 {club.memberCount ?? club.members?.length ?? 0} member{club.memberCount !== 1 ? 's' : ''}</span>
          {club.currentBookTitle && <span>📖 {club.currentBookTitle}</span>}
        </div>
      </Link>
    );
  }

  return (
    <div className="bc-page__club-card">
      <div className="bc-page__club-card-header">
        <h3 className="bc-page__club-name">{club.name}</h3>
        {club.genre && <span className="bc-page__club-genre">{club.genre}</span>}
      </div>
      {club.description && <p className="bc-page__club-desc">{club.description}</p>}
      <div className="bc-page__club-meta">
        <span>👥 {club.memberCount ?? club.members?.length ?? 0} member{club.memberCount !== 1 ? 's' : ''}</span>
        {club.currentBookTitle && <span>📖 {club.currentBookTitle}</span>}
        {club.ownerName && <span>Created by {club.ownerName}</span>}
      </div>
      <div className="bc-page__club-actions">
        <Link to={`/book-clubs/${club.id}`} className="bc-page__view-btn">
          View
        </Link>
        {user && !isMember && (
          <button
            type="button"
            className="bc-page__join-btn"
            onClick={() => onJoin(club.id)}
          >
            Join
          </button>
        )}
        {user && isMember && <span className="bc-page__member-badge">✓ Member</span>}
      </div>
    </div>
  );
}
