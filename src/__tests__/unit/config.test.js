/**
 * Unit Tests for Configuration
 *
 * Tests the runtime configuration functionality including:
 * - Configuration access
 * - Environment variable handling
 * - Feature flags
 * - Language configuration
 */

import { describe, it, expect } from 'vitest';
import config, {
  validateConfig,
  getConfig,
  isFeatureEnabled,
  getLanguage,
  getSupportedLanguages,
  isDevelopment,
  isProduction,
  isDebugEnabled
} from '../../core/config.js';

describe('Configuration', () => {
  describe('config object', () => {
    it('should have app metadata', () => {
      expect(config.app.name).toBe('N-Trace');
      expect(config.app.version).toBeDefined();
      expect(config.app.author).toBe('Nitin Singh');
    });

    it('should have environment settings', () => {
      expect(config.env).toHaveProperty('isDevelopment');
      expect(config.env).toHaveProperty('isProduction');
      expect(config.env).toHaveProperty('mode');
    });

    it('should have AI configuration', () => {
      expect(config.ai.provider).toBe('gemini');
      expect(config.ai.GEMINI).toHaveProperty('DEFAULT_MODEL');
      expect(config.ai.GEMINI).toHaveProperty('ENDPOINT');
      expect(config.ai.GEMINI.DEFAULT_MODEL).toBe('gemini-2.0-flash');
      expect(config.ai.GROQ).toHaveProperty('DEFAULT_MODEL');
      expect(config.ai.OPENAI).toHaveProperty('DEFAULT_MODEL');
      expect(config.ai.CLAUDE).toHaveProperty('DEFAULT_MODEL');
      expect(config.ai.CLAUDE.DEFAULT_MODEL).toBe('claude-sonnet-4-20250514');
    });

    it('should have editor configuration', () => {
      expect(config.editor.defaultLanguage).toBe('javascript');
      expect(config.editor.defaultTheme).toBe('vs-dark');
      expect(config.editor.fontSize).toBe(14);
    });

    it('should have supported languages', () => {
      expect(config.languages).toBeInstanceOf(Array);
      expect(config.languages.length).toBeGreaterThan(0);

      const jsLang = config.languages.find(l => l.id === 'javascript');
      expect(jsLang).toBeDefined();
      expect(jsLang.name).toBe('JavaScript');
      expect(jsLang.extension).toBe('.js');
    });

    it('should have feature flags', () => {
      expect(config.features).toHaveProperty('export');
      expect(config.features).toHaveProperty('share');
      expect(config.features).toHaveProperty('pwa');
    });

    it('should have keyboard shortcuts', () => {
      expect(config.shortcuts).toHaveProperty('trace');
      expect(config.shortcuts).toHaveProperty('play');
      expect(config.shortcuts.trace).toBe('Ctrl+Enter');
    });
  });

  describe('getConfig()', () => {
    it('should get nested config values', () => {
      expect(getConfig('app.name')).toBe('N-Trace');
      expect(getConfig('ai.provider')).toBe('gemini');
      expect(getConfig('editor.defaultLanguage')).toBe('javascript');
    });

    it('should return undefined for non-existent paths', () => {
      expect(getConfig('nonexistent.path')).toBeUndefined();
    });

    it('should handle deep nesting', () => {
      expect(getConfig('ai.CLAUDE.DEFAULT_MODEL')).toBe('claude-sonnet-4-20250514');
    });
  });

  describe('isFeatureEnabled()', () => {
    it('should return true for enabled features', () => {
      expect(isFeatureEnabled('export')).toBe(true);
      expect(isFeatureEnabled('pwa')).toBe(true);
    });

    it('should return false for disabled features', () => {
      expect(isFeatureEnabled('collaboration')).toBe(false);
    });

    it('should return false for non-existent features', () => {
      expect(isFeatureEnabled('nonexistent')).toBe(false);
    });
  });

  describe('getLanguage()', () => {
    it('should return language configuration by ID', () => {
      const js = getLanguage('javascript');
      expect(js).toBeDefined();
      expect(js.name).toBe('JavaScript');
      expect(js.extension).toBe('.js');
    });

    it('should return undefined for non-existent language', () => {
      expect(getLanguage('nonexistent')).toBeUndefined();
    });

    it('should support all major languages', () => {
      expect(getLanguage('python')).toBeDefined();
      expect(getLanguage('java')).toBeDefined();
      expect(getLanguage('cpp')).toBeDefined();
      expect(getLanguage('typescript')).toBeDefined();
    });
  });

  describe('getSupportedLanguages()', () => {
    it('should return array of all languages', () => {
      const languages = getSupportedLanguages();
      expect(languages).toBeInstanceOf(Array);
      expect(languages.length).toBeGreaterThan(15);
    });

    it('should return a copy of the array', () => {
      const languages1 = getSupportedLanguages();
      const languages2 = getSupportedLanguages();
      expect(languages1).not.toBe(languages2);
    });
  });

  describe('Environment helpers', () => {
    it('should detect development mode', () => {
      expect(typeof isDevelopment()).toBe('boolean');
    });

    it('should detect production mode', () => {
      expect(typeof isProduction()).toBe('boolean');
    });

    it('should detect debug mode', () => {
      expect(typeof isDebugEnabled()).toBe('boolean');
    });

    it('should have opposite dev/prod states', () => {
      // In test environment, one should be true and other false
      expect(isDevelopment() !== isProduction()).toBe(true);
    });
  });

  describe('validateConfig()', () => {
    it('should return validation result', () => {
      const result = validateConfig();
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });

    it('should have errors array', () => {
      const result = validateConfig();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should have warnings array', () => {
      const result = validateConfig();
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should warn about missing API key', () => {
      const result = validateConfig();
      const hasApiKeyWarning = result.warnings.some(w =>
        w.includes('Claude API key') || w.includes('not configured')
      );
      expect(hasApiKeyWarning).toBe(true);
    });
  });

  describe('Security configuration', () => {
    it('should have security settings', () => {
      expect(config.security).toBeDefined();
      expect(config.security.apiKeyMinLength).toBeGreaterThan(0);
      expect(config.security.maxCodeLength).toBeGreaterThan(0);
    });

    it('should have allowed origins', () => {
      expect(config.security.allowedOrigins).toBeInstanceOf(Array);
      expect(config.security.allowedOrigins.length).toBeGreaterThan(0);
    });
  });

  describe('Performance configuration', () => {
    it('should have performance settings', () => {
      expect(config.performance).toBeDefined();
      expect(config.performance.debounceDelay).toBeGreaterThan(0);
      expect(config.performance.throttleDelay).toBeGreaterThan(0);
    });
  });

  describe('Trace configuration', () => {
    it('should have trace settings', () => {
      expect(config.trace.defaultSpeed).toBe(1000);
      expect(config.trace.minSpeed).toBeLessThan(config.trace.maxSpeed);
      expect(config.trace.maxSteps).toBeGreaterThan(0);
    });
  });

  describe('UI configuration', () => {
    it('should have UI settings', () => {
      expect(config.ui.defaultTheme).toBe('dark');
      expect(config.ui.accentColor).toBe('#00f0ff');
    });

    it('should have breakpoints', () => {
      expect(config.ui.breakpoints.mobile).toBeLessThan(config.ui.breakpoints.tablet);
      expect(config.ui.breakpoints.tablet).toBeLessThan(config.ui.breakpoints.desktop);
    });
  });
});
