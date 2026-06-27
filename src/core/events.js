/**
 * Custom Event Bus
 *
 * Decouples components from each other using pub/sub pattern.
 * Allows components to communicate without direct dependencies.
 *
 * @module core/events
 */

class EventBus {
  constructor() {
    // Event listeners: { eventName: [callback1, callback2, ...] }
    this.listeners = {};

    // Event history for debugging
    this.history = [];
    this.maxHistorySize = 100;

    // Enable/disable logging
    this.debug = import.meta.env.VITE_DEBUG_MODE === 'true';
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @param {object} [options] - Options
   * @param {boolean} [options.once=false] - Remove listener after first call
   * @param {number} [options.priority=0] - Higher priority callbacks run first
   * @returns {Function} Unsubscribe function
   */
  on(event, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      id: Math.random().toString(36).substr(2, 9)
    };

    this.listeners[event].push(listener);

    // Sort by priority (higher first)
    this.listeners[event].sort((a, b) => b.priority - a.priority);

    if (this.debug) {
      console.log(`[EventBus] Subscribed to "${event}"`, { listenerId: listener.id, options });
    }

    // Return unsubscribe function
    return () => this.off(event, listener.id);
  }

  /**
   * Subscribe to an event (fires only once)
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    return this.on(event, callback, { once: true });
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {string|Function} callbackOrId - Callback function or listener ID
   */
  off(event, callbackOrId) {
    if (!this.listeners[event]) return;

    if (typeof callbackOrId === 'string') {
      // Remove by ID
      this.listeners[event] = this.listeners[event].filter(
        listener => listener.id !== callbackOrId
      );
    } else {
      // Remove by callback reference
      this.listeners[event] = this.listeners[event].filter(
        listener => listener.callback !== callbackOrId
      );
    }

    if (this.listeners[event].length === 0) {
      delete this.listeners[event];
    }

    if (this.debug) {
      console.log(`[EventBus] Unsubscribed from "${event}"`);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {Promise<void>}
   */
  async emit(event, data) {
    const timestamp = Date.now();

    // Add to history
    this.addToHistory({ event, data, timestamp });

    if (this.debug) {
      console.log(`[EventBus] Emitting "${event}"`, data);
    }

    if (!this.listeners[event]) {
      if (this.debug) {
        console.log(`[EventBus] No listeners for "${event}"`);
      }
      return;
    }

    // Create a copy to avoid issues if listeners modify the array
    const listeners = [...this.listeners[event]];

    // Execute callbacks
    for (const listener of listeners) {
      try {
        await listener.callback(data, event);

        // Remove if once
        if (listener.once) {
          this.off(event, listener.id);
        }
      } catch (error) {
        console.error(`[EventBus] Error in listener for "${event}":`, error);

        // Emit error event
        if (event !== 'error') {
          this.emit('error', {
            originalEvent: event,
            error,
            data
          });
        }
      }
    }
  }

  /**
   * Emit an event synchronously (use sparingly)
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emitSync(event, data) {
    const timestamp = Date.now();

    // Add to history
    this.addToHistory({ event, data, timestamp });

    if (this.debug) {
      console.log(`[EventBus] Emitting (sync) "${event}"`, data);
    }

    if (!this.listeners[event]) return;

    const listeners = [...this.listeners[event]];

    for (const listener of listeners) {
      try {
        listener.callback(data, event);

        if (listener.once) {
          this.off(event, listener.id);
        }
      } catch (error) {
        console.error(`[EventBus] Error in listener for "${event}":`, error);
      }
    }
  }

  /**
   * Remove all listeners for an event (or all events)
   * @param {string} [event] - Event name (removes all if omitted)
   */
  clear(event) {
    if (event) {
      delete this.listeners[event];
      if (this.debug) {
        console.log(`[EventBus] Cleared listeners for "${event}"`);
      }
    } else {
      this.listeners = {};
      if (this.debug) {
        console.log('[EventBus] Cleared all listeners');
      }
    }
  }

  /**
   * Check if an event has listeners
   * @param {string} event - Event name
   * @returns {boolean}
   */
  hasListeners(event) {
    return !!(this.listeners[event] && this.listeners[event].length > 0);
  }

  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number}
   */
  listenerCount(event) {
    return this.listeners[event]?.length || 0;
  }

  /**
   * Get all event names with listeners
   * @returns {string[]}
   */
  eventNames() {
    return Object.keys(this.listeners);
  }

  /**
   * Add event to history
   * @private
   */
  addToHistory(entry) {
    this.history.push(entry);

    // Keep history size limited
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get event history
   * @param {number} [limit] - Max number of events to return
   * @returns {Array}
   */
  getHistory(limit) {
    if (limit) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Get debug info
   */
  debug() {
    return {
      listeners: Object.keys(this.listeners).reduce((acc, event) => {
        acc[event] = this.listeners[event].length;
        return acc;
      }, {}),
      historySize: this.history.length,
      recentEvents: this.history.slice(-10).map(e => e.event)
    };
  }
}

// Create singleton instance
const eventBus = new EventBus();

// Export both the instance and the class
export default eventBus;
export { EventBus };

// Common event names (for consistency)
export const EVENTS = {
  // Editor events
  EDITOR_CODE_CHANGE: 'editor:code:change',
  EDITOR_LANGUAGE_CHANGE: 'editor:language:change',
  EDITOR_THEME_CHANGE: 'editor:theme:change',
  EDITOR_READY: 'editor:ready',

  // Trace events
  TRACE_START: 'trace:start',
  TRACE_COMPLETE: 'trace:complete',
  TRACE_ERROR: 'trace:error',
  TRACE_STEP_CHANGE: 'trace:step:change',
  TRACE_PLAY: 'trace:play',
  TRACE_PAUSE: 'trace:pause',
  TRACE_STOP: 'trace:stop',
  TRACE_SPEED_CHANGE: 'trace:speed:change',

  // AI events
  AI_REQUEST_START: 'ai:request:start',
  AI_REQUEST_COMPLETE: 'ai:request:complete',
  AI_REQUEST_ERROR: 'ai:request:error',
  AI_CONFIG_CHANGE: 'ai:config:change',

  // GitHub events
  GITHUB_AUTH_SUCCESS: 'github:auth:success',
  GITHUB_AUTH_ERROR: 'github:auth:error',
  GITHUB_PUSH_START: 'github:push:start',
  GITHUB_PUSH_COMPLETE: 'github:push:complete',
  GITHUB_PUSH_ERROR: 'github:push:error',

  // History events
  HISTORY_SAVE: 'history:save',
  HISTORY_LOAD: 'history:load',
  HISTORY_DELETE: 'history:delete',
  HISTORY_CLEAR: 'history:clear',

  // UI events
  UI_MODAL_OPEN: 'ui:modal:open',
  UI_MODAL_CLOSE: 'ui:modal:close',
  UI_TOAST_SHOW: 'ui:toast:show',
  UI_TOAST_HIDE: 'ui:toast:hide',
  UI_THEME_CHANGE: 'ui:theme:change',
  UI_SIDEBAR_TOGGLE: 'ui:sidebar:toggle',

  // Keyboard events
  KEYBOARD_SHORTCUT: 'keyboard:shortcut',

  // App lifecycle events
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  APP_BEFORE_UNLOAD: 'app:before:unload'
};