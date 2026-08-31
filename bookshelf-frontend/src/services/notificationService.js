import api from '../utils/api.js';

export const notificationService = {
  /**
   * Fetch user notifications with pagination and optional unread filter
   */
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Fetch total unread count for badge
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete single notification
   */
  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
