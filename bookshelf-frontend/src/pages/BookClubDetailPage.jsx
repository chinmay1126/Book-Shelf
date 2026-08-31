import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useBookClub } from '../hooks/useBookClub.js';
import BookClubHeader from '../components/bookClubs/BookClubHeader.jsx';
import BookClubDiscussion from '../components/bookClubs/BookClubDiscussion.jsx';
import BookClubMemberList from '../components/bookClubs/BookClubMemberList.jsx';
import BookClubProgressTracker from '../components/bookClubs/BookClubProgressTracker.jsx';
import BookClubSettingsModal from '../components/bookClubs/BookClubSettingsModal.jsx';
import './BookClubDetailPage.css';

export default function BookClubDetailPage() {
  const { id: clubId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const {
    club,
    stats,
    loading,
    toastMessage,
    activeTab,
    setActiveTab,
    myProgress,
    isMember,
    isOwner,
    messagesEndRef,
    handleSendMessage,
    handleDeleteMessage,
    handleSetProgress,
    handleLeave,
    handleDeleteClub,
    handleUpdateSettings,
    handleSetBook,
    handleRemoveMember,
    handleTransferOwnership,
  } = useBookClub(clubId);

  if (loading) {
    return (
      <main className="bcd-page bcd-page--loading">
        <div className="bcd-page__spinner" />
        <span>Loading book club…</span>
      </main>
    );
  }

  if (!club) {
    return (
      <main className="bcd-page bcd-page--error">
        <h2>Book Club Not Found</h2>
        <p>The club you are looking for does not exist or has been removed.</p>
        <Link to="/book-clubs" className="bcd-page__back-btn">
          ← Back to All Clubs
        </Link>
      </main>
    );
  }

  const onLeaveClub = async () => {
    if (window.confirm('Are you sure you want to leave this club?')) {
      const ok = await handleLeave();
      if (ok) navigate('/book-clubs');
    }
  };

  const onDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this club?')) {
      const ok = await handleDeleteClub();
      if (ok) navigate('/book-clubs');
    }
  };

  return (
    <div className="bcd-page">
      {toastMessage && (
        <div className="bcd-page__toast" role="status">
          {toastMessage}
        </div>
      )}

      {/* Header section */}
      <BookClubHeader
        club={club}
        isMember={isMember}
        isOwner={isOwner}
        onLeave={onLeaveClub}
        onOpenSettings={() => setShowSettingsModal(true)}
        onDeleteClub={onDelete}
      />

      {/* Main Navigation Tabs */}
      <nav className="bcd-page__tabs" aria-label="Book Club sections">
        <button
          type="button"
          className={`bcd-page__tab ${activeTab === 'discussion' ? 'bcd-page__tab--active' : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          💬 Discussion ({club.messages?.length ?? 0})
        </button>
        <button
          type="button"
          className={`bcd-page__tab ${activeTab === 'members' ? 'bcd-page__tab--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Members ({club.members?.length ?? 0})
        </button>
        <button
          type="button"
          className={`bcd-page__tab ${activeTab === 'progress' ? 'bcd-page__tab--active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          📊 Progress & Stats
        </button>
      </nav>

      {/* Tab Panels */}
      <div className="bcd-page__tab-content">
        {activeTab === 'discussion' && (
          <BookClubDiscussion
            messages={club.messages}
            currentUserId={user?._id}
            isOwner={isOwner}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            messagesEndRef={messagesEndRef}
          />
        )}

        {activeTab === 'members' && (
          <BookClubMemberList
            members={club.members}
            currentUserId={user?._id}
            isOwner={isOwner}
            onRemoveMember={handleRemoveMember}
            onTransferOwnership={handleTransferOwnership}
          />
        )}

        {activeTab === 'progress' && (
          <BookClubProgressTracker
            stats={stats}
            myProgress={myProgress}
            isMember={isMember}
            onSetProgress={handleSetProgress}
          />
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <BookClubSettingsModal
          club={club}
          onClose={() => setShowSettingsModal(false)}
          onUpdateSettings={handleUpdateSettings}
          onSetBook={handleSetBook}
        />
      )}
    </div>
  );
}
