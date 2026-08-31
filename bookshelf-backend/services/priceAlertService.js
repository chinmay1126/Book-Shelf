import PriceAlert from '../models/PriceAlert.js';
import bookRepository from '../repositories/bookRepository.js';

export function formatAlert(alert) {
  const obj = alert.toObject ? alert.toObject() : alert;
  return {
    id: obj._id.toString(),
    bookId: obj.bookId,
    targetPrice: obj.targetPrice,
    currentPriceAtCreation: obj.currentPriceAtCreation,
    active: obj.active,
    notified: obj.notified,
    notifiedAt: obj.notifiedAt,
    createdAt: obj.createdAt,
  };
}

export function getCurrentPrice(bookId) {
  const book = bookRepository.getBookById(bookId);
  return book?.price ?? null;
}

export async function createAlert(userId, { bookId, targetPrice }) {
  const existing = await PriceAlert.findOne({ userId, bookId, active: true });
  if (existing) {
    existing.targetPrice = targetPrice;
    await existing.save();

    return {
      message: 'Alert updated to new target price',
      alert: formatAlert(existing),
      isUpdate: true,
    };
  }

  const currentPrice = getCurrentPrice(bookId);

  const alert = await PriceAlert.create({
    userId,
    bookId,
    targetPrice,
    currentPriceAtCreation: currentPrice,
  });

  return {
    message: 'Price alert created',
    alert: formatAlert(alert),
    isUpdate: false,
  };
}

export async function getMyAlerts(userId, { active }) {
  const filter = { userId };
  if (active === 'true') filter.active = true;
  if (active === 'false') filter.active = false;

  const alerts = await PriceAlert.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return alerts.map((a) => {
    const currentPrice = getCurrentPrice(a.bookId);
    return {
      ...formatAlert(a),
      currentPrice,
      priceChanged: currentPrice !== null && currentPrice !== a.currentPriceAtCreation,
      isAtOrBelow: currentPrice !== null && currentPrice <= a.targetPrice,
    };
  });
}

export async function checkAlert(userId, bookId) {
  const alert = await PriceAlert.findOne({
    userId,
    bookId,
    active: true,
  }).lean();

  if (!alert) {
    return { hasAlert: false, alert: null };
  }

  const currentPrice = getCurrentPrice(alert.bookId);
  return {
    hasAlert: true,
    alert: {
      ...formatAlert(alert),
      currentPrice,
      isAtOrBelow: currentPrice !== null && currentPrice <= alert.targetPrice,
    },
  };
}

export async function toggleAlert(alertId, userId) {
  const alert = await PriceAlert.findById(alertId);

  if (!alert) {
    const err = new Error('Alert not found');
    err.statusCode = 404;
    throw err;
  }

  if (alert.userId.toString() !== userId.toString()) {
    const err = new Error('Not your alert');
    err.statusCode = 403;
    throw err;
  }

  alert.active = !alert.active;
  await alert.save();

  return {
    message: alert.active ? 'Alert resumed' : 'Alert paused',
    alert: formatAlert(alert),
  };
}

export async function updateAlert(alertId, userId, targetPrice) {
  if (typeof targetPrice !== 'number' || targetPrice < 0) {
    const err = new Error('Valid targetPrice is required');
    err.statusCode = 400;
    throw err;
  }

  const alert = await PriceAlert.findById(alertId);

  if (!alert) {
    const err = new Error('Alert not found');
    err.statusCode = 404;
    throw err;
  }

  if (alert.userId.toString() !== userId.toString()) {
    const err = new Error('Not your alert');
    err.statusCode = 403;
    throw err;
  }

  alert.targetPrice = targetPrice;
  alert.notified = false;
  alert.notifiedAt = null;
  await alert.save();

  return {
    message: 'Target price updated',
    alert: formatAlert(alert),
  };
}

export async function deleteAlert(alertId, userId) {
  const alert = await PriceAlert.findById(alertId);

  if (!alert) {
    const err = new Error('Alert not found');
    err.statusCode = 404;
    throw err;
  }

  if (alert.userId.toString() !== userId.toString()) {
    const err = new Error('Not your alert');
    err.statusCode = 403;
    throw err;
  }

  await PriceAlert.findByIdAndDelete(alertId);
  return { message: 'Alert deleted' };
}

export async function deleteByBookId(userId, bookId) {
  const result = await PriceAlert.findOneAndDelete({
    userId,
    bookId,
  });

  if (!result) {
    const err = new Error('No alert found for this book');
    err.statusCode = 404;
    throw err;
  }

  return { message: 'Alert deleted' };
}

export async function checkAllAlerts() {
  const activeAlerts = await PriceAlert.find({ active: true }).lean();

  let triggered = 0;
  let alreadyNotified = 0;

  for (const alert of activeAlerts) {
    if (alert.notified) {
      alreadyNotified++;
      continue;
    }

    const currentPrice = getCurrentPrice(alert.bookId);
    if (currentPrice !== null && currentPrice <= alert.targetPrice) {
      await PriceAlert.findByIdAndUpdate(alert._id, {
        notified: true,
        notifiedAt: new Date(),
      });
      triggered++;
    }
  }

  return {
    message: 'Price check complete',
    totalActive: activeAlerts.length,
    triggered,
    alreadyNotified,
  };
}
