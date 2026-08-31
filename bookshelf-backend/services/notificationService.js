import Notification from '../models/Notification.js';

export function formatNotification(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    type: obj.type,
    title: obj.title,
    message: obj.message,
    data: obj.data || {},
    read: obj.read,
    readAt: obj.readAt,
    createdAt: obj.createdAt,
  };
}

export async function createNotification({ userId, type, title, message, data = {} }) {
  if (!userId || !type || !title || !message) {
    const err = new Error('userId, type, title, and message are required for notification');
    err.statusCode = 400;
    throw err;
  }

  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
  });

  return formatNotification(notification);
}

export async function getUserNotifications(userId, { unreadOnly = false, page = 1, limit = 20 } = {}) {
  const filter = { userId };
  if (unreadOnly === 'true' || unreadOnly === true) {
    filter.read = false;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, read: false }),
  ]);

  return {
    notifications: notifications.map((n) => formatNotification(n)),
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
}

export async function getUnreadCount(userId) {
  const count = await Notification.countDocuments({ userId, read: false });
  return { unreadCount: count };
}

export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOne({ _id: notificationId, userId });

  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }

  if (!notification.read) {
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return formatNotification(notification);
}

export async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );

  return { message: 'All notifications marked as read', updatedCount: result.modifiedCount };
}

export async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });

  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }

  return { message: 'Notification deleted' };
}
