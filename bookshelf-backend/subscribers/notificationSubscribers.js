import eventBus, { EVENTS } from '../utils/eventEmitter.js';
import PriceAlert from '../models/PriceAlert.js';
import StockAlert from '../models/StockAlert.js';
import * as notificationService from '../services/notificationService.js';

/**
 * Handle Price Drop Event:
 * Finds active price alerts matching or below target price, triggers in-app notification & marks alert notified.
 */
export async function handleBookPriceUpdated({ bookId, oldPrice, newPrice, bookTitle }) {
  if (!bookId || newPrice === undefined) return;

  // Only trigger price alerts if price dropped
  if (oldPrice !== undefined && newPrice >= oldPrice) return;

  const activeAlerts = await PriceAlert.find({
    bookId,
    active: true,
    notified: false,
    targetPrice: { $gte: newPrice },
  });

  for (const alert of activeAlerts) {
    const formattedPrice = typeof newPrice === 'number' ? `$${newPrice.toFixed(2)}` : newPrice;
    await notificationService.createNotification({
      userId: alert.userId,
      type: 'price_drop',
      title: 'Price Drop Alert! 🏷️',
      message: `"${bookTitle || 'A book on your alert list'}" is now available for ${formattedPrice}!`,
      data: {
        bookId,
        bookTitle,
        targetPrice: alert.targetPrice,
        newPrice,
        oldPrice,
      },
    });

    alert.notified = true;
    alert.notifiedAt = new Date();
    await alert.save();

    await eventBus.emitAsync(EVENTS.PRICE_ALERT_TRIGGERED, {
      alertId: alert._id.toString(),
      userId: alert.userId.toString(),
      bookId,
      newPrice,
    });
  }
}

/**
 * Handle Stock Replenishment Event:
 * Finds subscribers waiting for back-in-stock alert, notifies them and marks alert notified.
 */
export async function handleBookStockReplenished({ bookId, newStock, bookTitle }) {
  if (!bookId || !newStock || newStock <= 0) return;

  const waitingAlerts = await StockAlert.find({
    bookId,
    notified: false,
  });

  for (const alert of waitingAlerts) {
    await notificationService.createNotification({
      userId: alert.userId,
      type: 'stock_replenished',
      title: 'Back in Stock! 📦',
      message: `"${bookTitle || 'A book on your wishlist'}" is back in stock with ${newStock} units available!`,
      data: {
        bookId,
        bookTitle,
        newStock,
      },
    });

    alert.notified = true;
    alert.notifiedAt = new Date();
    await alert.save();

    await eventBus.emitAsync(EVENTS.STOCK_ALERT_TRIGGERED, {
      alertId: alert._id.toString(),
      userId: alert.userId.toString(),
      bookId,
      newStock,
    });
  }
}

/**
 * Handle Order Status Change Event:
 * Notifies customer of updated order fulfillment status.
 */
export async function handleOrderStatusChanged({ orderId, userId, oldStatus, newStatus }) {
  if (!orderId || !userId || !newStatus) return;

  const statusTitleMap = {
    confirmed: 'Order Confirmed! ✅',
    processing: 'Order Processing ⚙️',
    shipped: 'Order Shipped! 🚚',
    delivered: 'Order Delivered! 🎉',
    canceled: 'Order Canceled ❌',
  };

  const title = statusTitleMap[newStatus] || 'Order Status Updated';
  const message = `Your order #${orderId.slice(-8)} status has changed to "${newStatus.toUpperCase()}".`;

  await notificationService.createNotification({
    userId,
    type: 'order_update',
    title,
    message,
    data: {
      orderId,
      oldStatus,
      newStatus,
    },
  });
}

/**
 * Handle Book Club Event:
 * Notifies members when a club book is changed.
 */
export async function handleBookClubBookChanged({ clubId, clubName, bookId, bookTitle, memberUserIds = [] }) {
  if (!clubId || !memberUserIds.length) return;

  for (const userId of memberUserIds) {
    await notificationService.createNotification({
      userId,
      type: 'book_club',
      title: 'New Club Book Selected! 📖',
      message: `"${clubName}" has started reading "${bookTitle || 'a new book'}"!`,
      data: {
        clubId,
        clubName,
        bookId,
        bookTitle,
      },
    });
  }
}

/**
 * Register all event subscribers to the central Event Bus.
 */
export function registerNotificationSubscribers() {
  eventBus.on(EVENTS.BOOK_PRICE_UPDATED, handleBookPriceUpdated);
  eventBus.on(EVENTS.BOOK_STOCK_REPLENISHED, handleBookStockReplenished);
  eventBus.on(EVENTS.ORDER_STATUS_CHANGED, handleOrderStatusChanged);
  eventBus.on(EVENTS.BOOK_CLUB_BOOK_CHANGED, handleBookClubBookChanged);
}

// Auto-register on import
registerNotificationSubscribers();
