import { EventEmitter } from 'node:events';

export const EVENTS = Object.freeze({
  BOOK_PRICE_UPDATED: 'book:price_updated',
  BOOK_STOCK_REPLENISHED: 'book:stock_replenished',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  BOOK_CLUB_BOOK_CHANGED: 'book_club:book_changed',
  PRICE_ALERT_TRIGGERED: 'alert:price_triggered',
  STOCK_ALERT_TRIGGERED: 'alert:stock_triggered',
});

class AsyncAppEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Allow robust listener registration
    this.setMaxListeners(50);
  }

  /**
   * Safely emit events with async handler error safety.
   * If a listener fails, log the error without breaking the caller process.
   */
  emitAsync(event, payload) {
    const listeners = this.listeners(event);
    if (listeners.length === 0) return Promise.resolve([]);

    const promises = listeners.map(async (listener) => {
      try {
        await listener(payload);
      } catch (err) {
        console.error(`[EventBus Error] Event "${event}" handler failed:`, err);
      }
    });

    return Promise.all(promises);
  }
}

export const eventBus = new AsyncAppEventEmitter();
export default eventBus;
