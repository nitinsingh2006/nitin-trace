/**
 * Unit tests — helpers.js
 */
import { describe, it, expect } from 'vitest';
import {
  debounce,
  uid,
  escapeHtml,
  clamp,
  truncate,
  isNonEmptyString,
  isValidGeminiKey,
  isValidGroqKey,
  maskApiKey,
} from '../../utils/helpers.js';

describe('debounce()', () => {
  it('calls fn after delay', async () => {
    let calls = 0;
    const fn = debounce(() => calls++, 50);
    fn();
    fn();
    fn();
    expect(calls).toBe(0);
    await new Promise(r => setTimeout(r, 60));
    expect(calls).toBe(1);
  });
});

describe('uid()', () => {
  it('returns a non-empty string', () => {
    expect(typeof uid()).toBe('string');
    expect(uid().length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, uid));
    expect(ids.size).toBe(100);
  });
});

describe('escapeHtml()', () => {
  it('escapes < and >', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('escapes &', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('handles non-strings', () => {
    expect(escapeHtml(42)).toBe('42');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('prevents XSS script injection', () => {
    const xss = '<script>alert("xss")</script>';
    const result = escapeHtml(xss);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });
});

describe('clamp()', () => {
  it('returns value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('truncate()', () => {
  it('does not truncate short strings', () => {
    expect(truncate('hello', 80)).toBe('hello');
  });

  it('truncates long strings with ellipsis', () => {
    const long = 'a'.repeat(100);
    const result = truncate(long, 20);
    expect(result.length).toBe(20);
    expect(result.endsWith('...')).toBe(true);
  });
});

describe('isNonEmptyString()', () => {
  it('returns true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString('   ')).toBe(false);
  });

  it('returns false for non-strings', () => {
    expect(isNonEmptyString(42)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
  });
});

describe('isValidGeminiKey()', () => {
  it('accepts valid Gemini key', () => {
    expect(isValidGeminiKey('AIzaSyAbcdefghijklmnopqrstuvwxyz1234')).toBe(true);
  });

  it('rejects non-AIza prefix', () => {
    expect(isValidGeminiKey('gsk_somekeyhere1234567890')).toBe(false);
  });

  it('rejects short keys', () => {
    expect(isValidGeminiKey('AIza')).toBe(false);
  });
});

describe('isValidGroqKey()', () => {
  it('accepts valid Groq key', () => {
    expect(isValidGroqKey('gsk_abcdefghijklmnopqrstuvwxyz12345678')).toBe(true);
  });

  it('rejects non-gsk_ prefix', () => {
    expect(isValidGroqKey('AIzaSysomething')).toBe(false);
  });
});

describe('maskApiKey()', () => {
  it('masks all but last 4 chars', () => {
    const masked = maskApiKey('AIzaSyAbcdefg');
    expect(masked.endsWith('defg')).toBe(true);
    expect(masked.startsWith('•')).toBe(true);
  });

  it('handles short keys', () => {
    expect(maskApiKey('')).toBe('••••••••');
    expect(maskApiKey('ab')).toBe('••••••••');
  });
});
