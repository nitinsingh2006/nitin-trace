/**
 * Unit Tests for Event Bus
 *
 * Tests the custom event bus functionality including:
 * - Event subscription and emission
 * - Priority-based listeners
 * - Once listeners
 * - Event history
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import eventBus, { EVENTS } from '../../core/events.js';

describe('Event Bus', () => {
  beforeEach(() => {
    // Clear all listeners before each test
    eventBus.clear();
    eventBus.clearHistory();
  });

  describe('on() and emit()', () => {
    it('should subscribe and emit events', async () => {
      const callback = vi.fn();
      eventBus.on('test:event', callback);

      await eventBus.emit('test:event', { data: 'test' });

      expect(callback).toHaveBeenCalledWith({ data: 'test' }, 'test:event');
    });

    it('should handle multiple listeners', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test:event', callback1);
      eventBus.on('test:event', callback2);

      await eventBus.emit('test:event', { data: 'test' });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should execute listeners in priority order', async () => {
      const order = [];

      eventBus.on('test:event', () => order.push('low'), { priority: 0 });
      eventBus.on('test:event', () => order.push('high'), { priority: 10 });
      eventBus.on('test:event', () => order.push('medium'), { priority: 5 });

      await eventBus.emit('test:event');

      expect(order).toEqual(['high', 'medium', 'low']);
    });

    it('should return unsubscribe function', async () => {
      const callback = vi.fn();
      const unsubscribe = eventBus.on('test:event', callback);

      await eventBus.emit('test:event');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      await eventBus.emit('test:event');
      expect(callback).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  describe('once()', () => {
    it('should fire listener only once', async () => {
      const callback = vi.fn();
      eventBus.once('test:event', callback);

      await eventBus.emit('test:event', { data: 'test1' });
      await eventBus.emit('test:event', { data: 'test2' });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ data: 'test1' }, 'test:event');
    });
  });

  describe('off()', () => {
    it('should unsubscribe by callback reference', async () => {
      const callback = vi.fn();
      eventBus.on('test:event', callback);

      await eventBus.emit('test:event');
      expect(callback).toHaveBeenCalledTimes(1);

      eventBus.off('test:event', callback);
      await eventBus.emit('test:event');
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear()', () => {
    it('should clear all listeners for an event', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test:event', callback1);
      eventBus.on('test:event', callback2);

      eventBus.clear('test:event');

      await eventBus.emit('test:event');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should clear all listeners for all events', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test:event1', callback1);
      eventBus.on('test:event2', callback2);

      eventBus.clear();

      await eventBus.emit('test:event1');
      await eventBus.emit('test:event2');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('hasListeners()', () => {
    it('should return true when event has listeners', () => {
      eventBus.on('test:event', () => {});
      expect(eventBus.hasListeners('test:event')).toBe(true);
    });

    it('should return false when event has no listeners', () => {
      expect(eventBus.hasListeners('test:event')).toBe(false);
    });
  });

  describe('listenerCount()', () => {
    it('should return correct listener count', () => {
      eventBus.on('test:event', () => {});
      eventBus.on('test:event', () => {});
      eventBus.on('test:event', () => {});

      expect(eventBus.listenerCount('test:event')).toBe(3);
    });

    it('should return 0 for events with no listeners', () => {
      expect(eventBus.listenerCount('test:event')).toBe(0);
    });
  });

  describe('eventNames()', () => {
    it('should return all event names with listeners', () => {
      eventBus.on('test:event1', () => {});
      eventBus.on('test:event2', () => {});

      const names = eventBus.eventNames();

      expect(names).toContain('test:event1');
      expect(names).toContain('test:event2');
    });
  });

  describe('Event History', () => {
    it('should record emitted events', async () => {
      await eventBus.emit('test:event', { data: 'test' });

      const history = eventBus.getHistory();

      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].event).toBe('test:event');
    });

    it('should limit history size', async () => {
      // Emit more than maxHistorySize events
      for (let i = 0; i < 150; i++) {
        await eventBus.emit('test:event', { index: i });
      }

      const history = eventBus.getHistory();

      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('should clear history', async () => {
      await eventBus.emit('test:event');
      eventBus.clearHistory();

      expect(eventBus.getHistory()).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in listeners gracefully', async () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const successCallback = vi.fn();

      eventBus.on('test:event', errorCallback);
      eventBus.on('test:event', successCallback);

      await eventBus.emit('test:event');

      // Both callbacks should be called despite error
      expect(errorCallback).toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalled();
    });

    it('should emit error event on listener error', async () => {
      const errorListener = vi.fn();
      eventBus.on('error', errorListener);

      eventBus.on('test:event', () => {
        throw new Error('Test error');
      });

      await eventBus.emit('test:event');

      expect(errorListener).toHaveBeenCalled();
    });
  });

  describe('EVENTS Constants', () => {
    it('should have predefined event constants', () => {
      expect(EVENTS.TRACE_START).toBeDefined();
      expect(EVENTS.TRACE_COMPLETE).toBeDefined();
      expect(EVENTS.EDITOR_CODE_CHANGE).toBeDefined();
      expect(EVENTS.UI_TOAST_SHOW).toBeDefined();
    });
  });

  describe('emitSync()', () => {
    it('should emit events synchronously', () => {
      const callback = vi.fn();
      eventBus.on('test:event', callback);

      eventBus.emitSync('test:event', { data: 'test' });

      expect(callback).toHaveBeenCalledWith({ data: 'test' }, 'test:event');
    });
  });
});
