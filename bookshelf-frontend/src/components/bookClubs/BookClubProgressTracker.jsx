/**
 * Reading progress tracker component for Book Club detail view.
 * Shows personal progress updater, quick percentage presets, and overall group stats.
 */
export default function BookClubProgressTracker({
  stats,
  myProgress,
  isMember,
  onSetProgress,
}) {
  const PRESETS = [0, 25, 50, 75, 100];

  return (
    <section className="bcd-page__progress-section">
      <h3 className="bcd-page__sub-title">📊 Reading Progress & Stats</h3>

      {/* Aggregate Stats Summary */}
      {stats && (
        <div className="bcd-page__stats-grid">
          <div className="bcd-page__stat-card">
            <span className="bcd-page__stat-label">Average Progress</span>
            <span className="bcd-page__stat-value">{stats.avgProgress ?? 0}%</span>
          </div>
          <div className="bcd-page__stat-card">
            <span className="bcd-page__stat-label">Currently Reading</span>
            <span className="bcd-page__stat-value">{stats.membersReading ?? 0}</span>
          </div>
          <div className="bcd-page__stat-card">
            <span className="bcd-page__stat-label">Finished Book</span>
            <span className="bcd-page__stat-value">{stats.membersFinished ?? 0}</span>
          </div>
          <div className="bcd-page__stat-card">
            <span className="bcd-page__stat-label">Total Members</span>
            <span className="bcd-page__stat-value">{stats.totalMembers ?? 0}</span>
          </div>
        </div>
      )}

      {/* Member Personal Progress Updater */}
      {isMember && (
        <div className="bcd-page__my-progress">
          <h4 className="bcd-page__progress-heading">Update Your Reading Progress</h4>
          <div className="bcd-page__progress-current">
            <span>Your current progress:</span>
            <span className="bcd-page__progress-value">{myProgress ?? 0}%</span>
          </div>

          <div className="bcd-page__progress-bar-large">
            <div
              className="bcd-page__progress-fill-large"
              style={{ width: `${Math.min(100, Math.max(0, myProgress ?? 0))}%` }}
            />
          </div>

          <div className="bcd-page__progress-presets">
            {PRESETS.map((pct) => (
              <button
                key={pct}
                type="button"
                className={`bcd-page__preset-btn ${myProgress === pct ? 'bcd-page__preset-btn--active' : ''}`}
                onClick={() => onSetProgress(pct)}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
