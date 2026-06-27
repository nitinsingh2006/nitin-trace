/**
 * NitinTrace — Utility Helpers
 */

/**
 * Debounce — delays fn invocation until ms of silence since last call.
 * Fixed: uses closure properly instead of broken `this` arrow function.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(fn, ms = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Generate a short unique ID (not cryptographically secure — for UI use only).
 * @returns {string}
 */
export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Escape HTML to prevent XSS in dynamic content.
 * Uses a pure string replace (no DOM dependency — works in workers/tests).
 * @param {*} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format a Date to a human-readable string.
 * @param {Date|number|string} date
 * @returns {string}
 */
export function formatTime(date) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Clamp a number between min and max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Sleep for ms milliseconds (async/await compatible).
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}

/**
 * Truncate a string to maxLength with ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 80) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Check if a value is a non-empty string.
 * @param {*} val
 * @returns {boolean}
 */
export function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Validate a Gemini API key format (basic check).
 * @param {string} key
 * @returns {boolean}
 */
export function isValidGeminiKey(key) {
  return isNonEmptyString(key) && key.startsWith('AIza') && key.length > 20;
}

/**
 * Validate a Groq API key format (basic check).
 * @param {string} key
 * @returns {boolean}
 */
export function isValidGroqKey(key) {
  return isNonEmptyString(key) && key.startsWith('gsk_') && key.length > 20;
}

/**
 * Mask an API key for display (show only last 4 chars).
 * @param {string} key
 * @returns {string}
 */
export function maskApiKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return '•'.repeat(key.length - 4) + key.slice(-4);
}

/**
 * Deep clone an object (simple JSON-based clone).
 * @param {*} obj
 * @returns {*}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
