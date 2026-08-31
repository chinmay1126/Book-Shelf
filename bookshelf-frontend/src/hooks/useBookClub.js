import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getClub,
  leaveClub,
  updateProgress,
  sendMessage,
  deleteMessage,
  setCurrentBook,
  getClubStats,
  deleteClub,
  transferOwnership,
  removeMember,
  updateClub,
} from '../services/bookClubService.js';

/**
 * Custom hook to manage all book club details, statistics, discussion messages,
 * member permissions, and admin actions.
 */
export function useBookClub(clubId) {
  const { user } = useAuth();
  const userId = user?._id;
  const messagesEndRef = useRef(null);

  const [club, setClub] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('discussion');
  const [myProgress, setMyProgress] = useState(0);

  const flash = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }, []);

  const loadClub = useCallback(async () => {
    if (!clubId) return;
    try {
      const data = await getClub(clubId);
      setClub(data);

      const me = data.members?.find((m) => m.userId === userId);
      if (me && me.readingProgress !== null && me.readingProgress !== undefined) {
        setMyProgress(me.readingProgress);
      }
    } catch (err) {
      flash(err?.message || 'Failed to load club');
    } finally {
      setLoading(false);
    }
  }, [clubId, userId, flash]);

  const loadStats = useCallback(async () => {
    if (!clubId) return;
    try {
      const data = await getClubStats(clubId);
      setStats(data);
    } catch {
      // silent
    }
  }, [clubId]);

  useEffect(() => {
    loadClub();
    loadStats();
  }, [loadClub, loadStats]);

  // Auto-scroll to latest message safely
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [club?.messages?.length]);

  // Helpers
  const isMember = Boolean(club?.members?.some((m) => m.userId === userId));
  const myMemberRecord = club?.members?.find((m) => m.userId === userId);
  const isOwner = myMemberRecord?.role === 'owner';
  const isModerator = myMemberRecord?.role === 'owner' || myMemberRecord?.role === 'moderator';

  // Actions
  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
    try {
      const msg = await sendMessage(clubId, { content: content.trim() });
      setClub((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), msg],
      }));
      return true;
    } catch (err) {
      flash(err?.message || 'Failed to send message');
      return false;
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(clubId, messageId);
      setClub((prev) => ({
        ...prev,
        messages: (prev?.messages || []).filter((m) => m._id !== messageId),
      }));
      flash('Message deleted');
    } catch (err) {
      flash(err?.message || 'Failed to delete message');
    }
  };

  const handleSetProgress = async (progress) => {
    try {
      await updateProgress(clubId, progress);
      setMyProgress(progress);
      setClub((prev) => ({
        ...prev,
        members: (prev?.members || []).map((m) =>
          m.userId === userId ? { ...m, readingProgress: progress } : m
        ),
      }));
      flash(`Progress set to ${progress}%`);
      loadStats();
    } catch (err) {
      flash(err?.message || 'Failed to update progress');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveClub(clubId);
      flash('Left the club');
      return true;
    } catch (err) {
      flash(err?.message || 'Failed to leave club');
      return false;
    }
  };

  const handleDeleteClub = async () => {
    try {
      await deleteClub(clubId);
      flash('Club deleted');
      return true;
    } catch (err) {
      flash(err?.message || 'Failed to delete club');
      return false;
    }
  };

  const handleUpdateSettings = async (settingsData) => {
    try {
      const updated = await updateClub(clubId, settingsData);
      setClub((prev) => ({ ...prev, ...updated }));
      flash('Club settings updated');
      return true;
    } catch (err) {
      flash(err?.message || 'Failed to update settings');
      return false;
    }
  };

  const handleSetBook = async (bookId, bookTitle) => {
    try {
      const updated = await setCurrentBook(clubId, bookId, bookTitle);
      setClub(updated);
      flash('Club book updated!');
      loadStats();
      return true;
    } catch (err) {
      flash(err?.message || 'Failed to set book');
      return false;
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    try {
      await removeMember(clubId, targetUserId);
      setClub((prev) => ({
        ...prev,
        members: (prev?.members || []).filter((m) => m.userId !== targetUserId),
      }));
      flash('Member removed');
      loadStats();
    } catch (err) {
      flash(err?.message || 'Failed to remove member');
    }
  };

  const handleTransferOwnership = async (targetUserId) => {
    try {
      const updated = await transferOwnership(clubId, targetUserId);
      setClub(updated);
      flash('Ownership transferred');
    } catch (err) {
      flash(err?.message || 'Failed to transfer ownership');
    }
  };

  return {
    club,
    stats,
    loading,
    toastMessage,
    activeTab,
    setActiveTab,
    myProgress,
    isMember,
    isOwner,
    isModerator,
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
  };
}

export default useBookClub;
