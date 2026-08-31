import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService.js';
import './NotificationDropdown.css';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // Silently swallow network / auth errors if logged out
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({
        unreadOnly: activeTab === 'unread',
        limit: 20,
      });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, activeTab]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (notif, e) => {
    e?.stopPropagation();
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Handle error silently
      }
    }

    // Smart navigation based on notification data
    if (notif.data?.orderId) {
      navigate('/orders');
      setIsOpen(false);
    } else if (notif.data?.clubId) {
      navigate(`/book-clubs/${notif.data.clubId}`);
      setIsOpen(false);
    } else if (notif.data?.bookId) {
      navigate(`/books/${notif.data.bookId}`);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Handle error silently
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetchUnreadCount();
    } catch {
      // Handle error silently
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price_drop':
        return '🏷️';
      case 'stock_replenished':
        return '📦';
      case 'order_update':
        return '🚚';
      case 'book_club':
        return '📖';
      default:
        return '🔔';
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={handleToggle}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" role="dialog" aria-label="Notifications">
          <div className="notification-header">
            <h3>🔔 Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                {activeTab === 'unread'
                  ? 'No unread notifications 🎉'
                  : 'You have no notifications yet'}
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={(e) => handleMarkAsRead(notif, e)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-msg">{notif.message}</div>
                    <div className="notification-time">
                      {new Date(notif.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {!notif.read && <span className="unread-dot" title="Unread" />}

                  <button
                    type="button"
                    className="delete-notif-btn"
                    onClick={(e) => handleDelete(notif.id, e)}
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
