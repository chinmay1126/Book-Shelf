/**
 * Member list component for Book Club detail view.
 * Shows members, roles, join dates, reading progress, and admin controls.
 */
export default function BookClubMemberList({
  members = [],
  currentUserId,
  isOwner,
  onRemoveMember,
  onTransferOwnership,
}) {
  return (
    <section className="bcd-page__members-section">
      <h3 className="bcd-page__sub-title">Club Members ({members.length})</h3>

      <div className="bcd-page__members-grid">
        {members.map((member) => {
          const isMe = member.userId === currentUserId;
          const isMemberOwner = member.role === 'owner';

          return (
            <div key={member.userId} className="bcd-page__member-card">
              <div className="bcd-page__member-info">
                <span className="bcd-page__member-name">
                  {member.userName || member.userId} {isMe ? '(You)' : ''}
                </span>
                <span className={`bcd-page__role-badge bcd-page__role-badge--${member.role}`}>
                  {member.role}
                </span>
              </div>

              <div className="bcd-page__member-details">
                {member.joinedAt && (
                  <span className="bcd-page__member-joined">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                )}

                {member.readingProgress !== null && member.readingProgress !== undefined && (
                  <div className="bcd-page__member-progress-mini">
                    <span className="bcd-page__mini-label">Progress: {member.readingProgress}%</span>
                    <div className="bcd-page__mini-bar">
                      <div
                        className="bcd-page__mini-fill"
                        style={{ width: `${Math.min(100, Math.max(0, member.readingProgress))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isOwner && !isMemberOwner && (
                <div className="bcd-page__member-actions">
                  <button
                    type="button"
                    className="bcd-page__member-btn bcd-page__member-btn--transfer"
                    onClick={() => onTransferOwnership(member.userId)}
                  >
                    Make Owner
                  </button>
                  <button
                    type="button"
                    className="bcd-page__member-btn bcd-page__member-btn--remove"
                    onClick={() => onRemoveMember(member.userId)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
