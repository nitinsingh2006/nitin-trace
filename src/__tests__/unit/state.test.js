/**
 * Unit Tests for State Management
 *
 * Tests the reactive state store functionality including:
 * - Getting and setting state
 * - Subscribing to changes
 * - State persistence
 * - State reset
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import store from '../../core/state.js';

describe('State Store', () => {
  beforeEach(() => {
    // Reset state before each test
    store.reset();
    localStorage.clear();
  });

  describe('get() and set()', () => {
    it('should get initial state values', () => {
      expect(store.get('editor.language')).toBe('javascript');
      expect(store.get('trace.isTracing')).toBe(false);
      expect(store.get('ai.provider')).toBe('claude');
    });

    it('should set and get state values', () => {
      store.set('editor.code', 'console.log("test")');
      expect(store.get('editor.code')).toBe('console.log("test")');
    });

    it('should set nested state values', () => {
      store.set('trace.currentIndex', 5);
      expect(store.get('trace.currentIndex')).toBe(5);
    });

    it('should return undefined for non-existent paths', () => {
      expect(store.get('nonexistent.path')).toBeUndefined();
    });

    it('should return entire state when no path provided', () => {
      const state = store.get();
      expect(state).toHaveProperty('editor');
      expect(state).toHaveProperty('trace');
      expect(state).toHaveProperty('ai');
    });
  });

  describe('update()', () => {
    it('should merge updates with existing object', () => {
      store.set('editor', { code: 'test', language: 'python' });
      store.update('editor', { fontSize: 16 });

      const editor = store.get('editor');
      expect(editor.code).toBe('test');
      expect(editor.language).toBe('python');
      expect(editor.fontSize).toBe(16);
    });

    it('should replace non-object values', () => {
      store.set('trace.currentIndex', 5);
      store.update('trace.currentIndex', 10);
      expect(store.get('trace.currentIndex')).toBe(10);
    });
  });

  describe('subscribe()', () => {
    it('should notify subscribers on state change', () => {
      const callback = vi.fn();
      store.subscribe('editor.code', callback);

      store.set('editor.code', 'new code');

      expect(callback).toHaveBeenCalledWith('new code', '', 'editor.code');
    });

    it('should notify parent path subscribers', () => {
      const callback = vi.fn();
      store.subscribe('editor', callback);

      store.set('editor.code', 'test');

      expect(callback).toHaveBeenCalled();
    });

    it('should notify wildcard subscribers', () => {
      const callback = vi.fn();
      store.subscribe('*', callback);

      store.set('editor.code', 'test');

      expect(callback).toHaveBeenCalledWith('test', '', 'editor.code');
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = store.subscribe('editor.code', callback);

      store.set('editor.code', 'test1');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      store.set('editor.code', 'test2');
      expect(callback).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should not notify on silent updates', () => {
      const callback = vi.fn();
      store.subscribe('editor.code', callback);

      store.set('editor.code', 'test', true); // Silent update

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('reset()', () => {
    it('should reset entire state', () => {
      store.set('editor.code', 'test');
      store.set('trace.currentIndex', 5);

      store.reset();

      expect(store.get('editor.code')).toBe('');
      expect(store.get('trace.currentIndex')).toBe(-1);
    });

    it('should reset specific path', () => {
      store.set('editor.code', 'test');
      store.set('editor.language', 'python');

      store.reset('editor.code');

      expect(store.get('editor.code')).toBe('');
      expect(store.get('editor.language')).toBe('python');
    });
  });

  describe('persist() and restore()', () => {
    it('should persist state to localStorage', () => {
      store.set('ai.apiKey', 'test-key');
      store.set('settings.autoSave', false);

      store.persist(['ai.apiKey', 'settings.autoSave']);

      const stored = JSON.parse(localStorage.getItem('n-trace-state'));
      expect(stored['ai.apiKey']).toBe('test-key');
      expect(stored['settings.autoSave']).toBe(false);
    });

    it('should restore state from localStorage', () => {
      const data = {
        'ai.apiKey': 'restored-key',
        'settings.autoSave': false
      };
      localStorage.setItem('n-trace-state', JSON.stringify(data));

      store.restore();

      expect(store.get('ai.apiKey')).toBe('restored-key');
      expect(store.get('settings.autoSave')).toBe(false);
    });

    it('should set isConfigured when API key is restored', () => {
      const data = {
        'ai.apiKey': 'sk-ant-api03-test'
      };
      localStorage.setItem('n-trace-state', JSON.stringify(data));

      store.restore();

      expect(store.get('ai.isConfigured')).toBe(true);
    });

    it('should handle missing localStorage data gracefully', () => {
      expect(() => store.restore()).not.toThrow();
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('n-trace-state', 'invalid json');
      expect(() => store.restore()).not.toThrow();
    });
  });

  describe('clearPersisted()', () => {
    it('should clear persisted state from localStorage', () => {
      store.set('ai.apiKey', 'test-key');
      store.persist(['ai.apiKey']);

      expect(localStorage.getItem('n-trace-state')).not.toBeNull();

      store.clearPersisted();

      expect(localStorage.getItem('n-trace-state')).toBeNull();
    });
  });

  describe('debug()', () => {
    it('should return debug information', () => {
      const callback = vi.fn();
      store.subscribe('editor.code', callback);

      const debug = store.debug();

      expect(debug).toHaveProperty('state');
      expect(debug).toHaveProperty('subscribers');
      expect(debug.subscribers['editor.code']).toBeGreaterThanOrEqual(1);
    });
  });

  describe('auth state', () => {
    it('should have initial auth values', () => {
      expect(store.get('auth.isLoggedIn')).toBe(false);
      expect(store.get('auth.user')).toBeNull();
    });

    it('should allow setting logged in state and user info', () => {
      const testUser = { name: 'Test Nitin', email: 'test@example.com', provider: 'Google' };
      store.set('auth.user', testUser);
      store.set('auth.isLoggedIn', true);

      expect(store.get('auth.isLoggedIn')).toBe(true);
      expect(store.get('auth.user')).toEqual(testUser);
    });
  });
});