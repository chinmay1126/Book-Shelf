import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import eventBus, { EVENTS } from '../utils/eventEmitter.js';
import * as notificationService from '../services/notificationService.js';
import {
  handleBookPriceUpdated,
  handleBookStockReplenished,
  handleOrderStatusChanged,
  handleBookClubBookChanged,
} from '../subscribers/notificationSubscribers.js';
import Notification from '../models/Notification.js';
import PriceAlert from '../models/PriceAlert.js';
import StockAlert from '../models/StockAlert.js';

describe('Reactive Async Event Bus & Notification Engine', () => {
  const dummyUserId = new mongoose.Types.ObjectId();

  it('eventBus emitAsync executes async listeners safely without breaking callers', async () => {
    let triggered = false;
    const testListener = async (data) => {
      triggered = data.flag;
    };

    eventBus.on('test:event', testListener);
    await eventBus.emitAsync('test:event', { flag: true });

    assert.equal(triggered, true);
    eventBus.removeListener('test:event', testListener);
  });

  it('eventBus gracefully handles listener throwing error', async () => {
    const errorListener = async () => {
      throw new Error('Listener internal failure');
    };

    eventBus.on('test:error_event', errorListener);
    // Must resolve without throwing
    await assert.doesNotReject(async () => {
      await eventBus.emitAsync('test:error_event', {});
    });

    eventBus.removeListener('test:error_event', errorListener);
  });

  it('notificationService creates and formats in-app notification', async () => {
    // Stub Notification model creation for unit testing
    const originalCreate = Notification.create;
    try {
      Notification.create = async (payload) => ({
        _id: new mongoose.Types.ObjectId(),
        ...payload,
        read: false,
        readAt: null,
        createdAt: new Date(),
      });

      const notif = await notificationService.createNotification({
        userId: dummyUserId,
        type: 'price_drop',
        title: 'Price Drop Alert',
        message: 'Book price has dropped',
        data: { bookId: 'book-123' },
      });

      assert.equal(notif.userId, dummyUserId.toString());
      assert.equal(notif.type, 'price_drop');
      assert.equal(notif.title, 'Price Drop Alert');
      assert.equal(notif.read, false);
    } finally {
      Notification.create = originalCreate;
    }
  });

  it('handleOrderStatusChanged creates order update notification', async () => {
    let createdPayload = null;
    const originalCreate = Notification.create;

    try {
      Notification.create = async (payload) => {
        createdPayload = payload;
        return {
          _id: new mongoose.Types.ObjectId(),
          ...payload,
          read: false,
          readAt: null,
          createdAt: new Date(),
        };
      };

      await handleOrderStatusChanged({
        orderId: 'ord_12345678',
        userId: dummyUserId,
        oldStatus: 'pending',
        newStatus: 'shipped',
      });

      assert.ok(createdPayload);
      assert.equal(createdPayload.userId, dummyUserId);
      assert.equal(createdPayload.type, 'order_update');
      assert.ok(createdPayload.title.includes('Shipped'));
    } finally {
      Notification.create = originalCreate;
    }
  });

  it('handleBookClubBookChanged notifies all club members', async () => {
    const createdNotifications = [];
    const originalCreate = Notification.create;
    const member1 = new mongoose.Types.ObjectId();
    const member2 = new mongoose.Types.ObjectId();

    try {
      Notification.create = async (payload) => {
        createdNotifications.push(payload);
        return {
          _id: new mongoose.Types.ObjectId(),
          ...payload,
          read: false,
          readAt: null,
          createdAt: new Date(),
        };
      };

      await handleBookClubBookChanged({
        clubId: 'club-1',
        clubName: 'Sci-Fi Readers',
        bookId: 'book-456',
        bookTitle: 'Dune Messiah',
        memberUserIds: [member1.toString(), member2.toString()],
      });

      assert.equal(createdNotifications.length, 2);
      assert.equal(createdNotifications[0].userId, member1.toString());
      assert.equal(createdNotifications[1].userId, member2.toString());
      assert.equal(createdNotifications[0].type, 'book_club');
    } finally {
      Notification.create = originalCreate;
    }
  });
});
