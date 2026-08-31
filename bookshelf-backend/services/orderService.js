import orderRepository from '../repositories/orderRepository.js';
import { canAccess } from '../utils/roles.js';
import eventBus, { EVENTS } from '../utils/eventEmitter.js';

export const VALID_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'canceled',
  'payment_failed',
];

export async function getMyOrders(userId) {
  return await orderRepository.findByUserId(userId);
}

export async function getOrderById(orderId, currentUser) {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (!canAccess(currentUser, order.userId)) {
    const err = new Error('Not authorized to view this order');
    err.statusCode = 403;
    throw err;
  }

  return order;
}

export async function getAllOrders(queryParams) {
  const { status, page, limit } = queryParams || {};
  if (status || page || limit) {
    return await orderRepository.findWithPagination({ status, page, limit });
  }
  return await orderRepository.findAll();
}

export async function updateOrderStatus(orderId, status) {
  if (!status || !VALID_STATUSES.includes(status)) {
    const err = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const order = await orderRepository.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const updatedOrder = await orderRepository.updateStatus(orderId, status);

  if (order.status !== status) {
    const userIdStr = updatedOrder?.userId
      ? updatedOrder.userId.toString()
      : order?.userId
      ? order.userId.toString()
      : null;

    if (userIdStr) {
      await eventBus.emitAsync(EVENTS.ORDER_STATUS_CHANGED, {
        orderId: updatedOrder?._id ? updatedOrder._id.toString() : orderId,
        userId: userIdStr,
        oldStatus: order.status,
        newStatus: status,
      });
    }
  }

  return updatedOrder;
}

export async function cancelOrder(orderId, currentUser) {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (!canAccess(currentUser, order.userId)) {
    const err = new Error('Not authorized to cancel this order');
    err.statusCode = 403;
    throw err;
  }

  if (order.status === 'shipped' || order.status === 'delivered') {
    const err = new Error(`Cannot cancel an order that has already been ${order.status}`);
    err.statusCode = 400;
    throw err;
  }

  if (order.status === 'canceled') {
    return { isAlreadyCanceled: true, order };
  }

  const canceledOrder = await orderRepository.cancelOrder(orderId);

  const userIdStr = canceledOrder?.userId
    ? canceledOrder.userId.toString()
    : order?.userId
    ? order.userId.toString()
    : null;

  if (userIdStr) {
    await eventBus.emitAsync(EVENTS.ORDER_STATUS_CHANGED, {
      orderId: canceledOrder?._id ? canceledOrder._id.toString() : orderId,
      userId: userIdStr,
      oldStatus: order.status,
      newStatus: 'canceled',
    });
  }

  return { isAlreadyCanceled: false, order: canceledOrder };
}
