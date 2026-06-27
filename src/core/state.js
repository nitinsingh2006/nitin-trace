/**
 * Centralized Reactive State Management
 *
 * Implements a pub/sub pattern for reactive state updates.
 * Single source of truth for all application state.
 *
 * @module core/state
 */

class StateStore {
  constructor() {
    this.state = {
      // Editor state
      editor: {
        code: '',
        language: 'javascript',
        theme: 'vs-dark',
        fontSize: 14,
        wordWrap: 'on'
      },

      // Trace state
      trace: {
        isTracing: false,
        isPlaying: false,
        currentIndex: -1,
        totalSteps: 0,
        steps: [],
        speed: 1000, // ms per step
        error: null
      },

      // AI state
      ai: {
        provider: 'claude', // Only Claude now
        apiKey: null,
        isConfigured: false,
        lastError: null,
        requestCount: 0,
        tokenUsage: {
          input: 0,
          output: 0,
          total: 0
        }
      },

      // GitHub state
      github: {
        isAuthenticated: false,
        token: null,
        username: null,
        lastRepo: null
      },

      // History state
      history: {
        traces: [],
        currentFilter: 'all',
        searchQuery: '',
        sortBy: 'date',
        sortOrder: 'desc'
      },

      // UI state
      ui: {
        theme: 'dark', // 'light' | 'dark' | 'system'
        accentColor: '#00f0ff',
        sidebarOpen: false,
        modalOpen: null, // 'settings' | 'github' | 'history' | null
        toasts: [],
        isOnboarding: false,
        onboardingStep: 0
      },

      // Settings state
      settings: {
        autoSave: true,
        showLineNumbers: true,
        enableKeyboardShortcuts: true,
        playbackSpeed: 1000,
        maxHistoryItems: 100,
        enableAnalytics: false,
        enableErrorReporting: false,
        explanationLanguage: 'english'
      },

      // Auth state
      auth: {
        user: null, // { name, email, avatar, provider, id, createdAt }
        isLoggedIn: false
      }
    };

    // Subscribers: { path: [callback1, callback2, ...] }
    this.subscribers = {};

    // State history for undo/redo (future feature)
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Get state value by path
   * @param {string} path - Dot-notation path (e.g., 'editor.code')
   * @returns {*} State value
   */
  get(path) {
    if (!path) return this.state;

    const keys = path.split('.');
    let value = this.state;

    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }

    return value;
  }

  /**
   * Set state value by path
   * @param {string} path - Dot-notation path
   * @param {*} value - New value
   * @param {boolean} silent - Skip notifications if true
   */
  set(path, value, silent = false) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.state;

    // Navigate to parent object
    for (const key of keys) {
      if (!(key in target)) {
        target[key] = {};
      }
      target = target[key];
    }

    // Set value
    const oldValue = target[lastKey];
    target[lastKey] = value;

    // Notify subscribers
    if (!silent) {
      this.notify(path, value, oldValue);
    }
  }

  /**
   * Update state by merging with existing value
   * @param {string} path - Dot-notation path
   * @param {object} updates - Object to merge
   */
  update(path, updates) {
    const current = this.get(path);
    if (typeof current === 'object' && current !== null) {
      this.set(path, { ...current, ...updates });
    } else {
      this.set(path, updates);
    }
  }

  /**
   * Subscribe to state changes
   * @param {string} path - Dot-notation path to watch
   * @param {Function} callback - Called with (newValue, oldValue, path)
   * @returns {Function} Unsubscribe function
   */
  subscribe(path, callback) {
    if (!this.subscribers[path]) {
      this.subscribers[path] = [];
    }

    this.subscribers[path].push(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers[path] = this.subscribers[path].filter(cb => cb !== callback);
    };
  }

  /**
   * Notify subscribers of state change
   * @private
   */
  notify(path, newValue, oldValue) {
    // Notify exact path subscribers
    if (this.subscribers[path]) {
      this.subscribers[path].forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error(`Error in state subscriber for ${path}:`, error);
        }
      });
    }

    // Notify parent path subscribers (e.g., 'editor' when 'editor.code' changes)
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      if (this.subscribers[parentPath]) {
        const parentValue = this.get(parentPath);
        this.subscribers[parentPath].forEach(callback => {
          try {
            callback(parentValue, parentValue, parentPath);
          } catch (error) {
            console.error(`Error in state subscriber for ${parentPath}:`, error);
          }
        });
      }
    }

    // Notify wildcard subscribers (listen to all changes)
    if (this.subscribers['*']) {
      this.subscribers['*'].forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error('Error in wildcard state subscriber:', error);
        }
      });
    }
  }

  /**
   * Reset state to initial values
   * @param {string} [path] - Optional path to reset (resets all if omitted)
   */
  reset(path) {
    if (path) {
      const initialValue = this.getInitialValue(path);
      this.set(path, initialValue);
    } else {
      // Reset entire state
      const oldState = this.state;
      this.state = this.getInitialState();
      this.notify('*', this.state, oldState);
    }
  }

  /**
   * Get initial state structure
   * @private
   */
  getInitialState() {
    return {
      editor: {
        code: '',
        language: 'javascript',
        theme: 'vs-dark',
        fontSize: 14,
        wordWrap: 'on'
      },
      trace: {
        isTracing: false,
        isPlaying: false,
        currentIndex: -1,
        totalSteps: 0,
        steps: [],
        speed: 1000,
        error: null
      },
      ai: {
        provider: 'claude',
        apiKey: null,
        isConfigured: false,
        lastError: null,
        requestCount: 0,
        tokenUsage: {
          input: 0,
          output: 0,
          total: 0
        }
      },
      github: {
        isAuthenticated: false,
        token: null,
        username: null,
        lastRepo: null
      },
      history: {
        traces: [],
        currentFilter: 'all',
        searchQuery: '',
        sortBy: 'date',
        sortOrder: 'desc'
      },
      ui: {
        theme: 'dark',
        accentColor: '#00f0ff',
        sidebarOpen: false,
        modalOpen: null,
        toasts: [],
        isOnboarding: false,
        onboardingStep: 0
      },
      settings: {
        autoSave: true,
        showLineNumbers: true,
        enableKeyboardShortcuts: true,
        playbackSpeed: 1000,
        maxHistoryItems: 100,
        enableAnalytics: false,
        enableErrorReporting: false,
        explanationLanguage: 'english'
      },
      auth: {
        user: null,
        isLoggedIn: false
      }
    };
  }

  /**
   * Get initial value for a specific path
   * @private
   */
  getInitialValue(path) {
    const initialState = this.getInitialState();
    const keys = path.split('.');
    let value = initialState;

    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }

    return value;
  }

  /**
   * Persist state to localStorage
   * @param {string[]} paths - Paths to persist
   */
  persist(paths = ['ai.apiKey', 'github.token', 'settings', 'ui.theme', 'ui.accentColor']) {
    const data = {};

    paths.forEach(path => {
      data[path] = this.get(path);
    });

    try {
      localStorage.setItem('n-trace-state', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  /**
   * Restore state from localStorage
   */
  restore() {
    try {
      const data = localStorage.getItem('n-trace-state');
      if (!data) return;

      const parsed = JSON.parse(data);

      Object.entries(parsed).forEach(([path, value]) => {
        this.set(path, value, true); // Silent update
      });

      // Check if AI is configured
      const apiKey = this.get('ai.apiKey');
      if (apiKey && apiKey.length > 0) {
        this.set('ai.isConfigured', true, true);
      }

      // Check if GitHub is authenticated
      const githubToken = this.get('github.token');
      if (githubToken && githubToken.length > 0) {
        this.set('github.isAuthenticated', true, true);
      }
    } catch (error) {
      console.error('Failed to restore state:', error);
    }
  }

  /**
   * Clear persisted state
   */
  clearPersisted() {
    try {
      localStorage.removeItem('n-trace-state');
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
    }
  }

  /**
   * Get debug info
   */
  debug() {
    return {
      state: this.state,
      subscribers: Object.keys(this.subscribers).reduce((acc, key) => {
        acc[key] = this.subscribers[key].length;
        return acc;
      }, {}),
      historyLength: this.history.length,
      historyIndex: this.historyIndex
    };
  }
}

// Create singleton instance
const store = new StateStore();

// Restore persisted state on initialization
store.restore();

// Auto-persist on state changes (debounced)
let persistTimer = null;
store.subscribe('*', () => {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    store.persist();
  }, 1000); // Persist 1 second after last change
});

export default store;