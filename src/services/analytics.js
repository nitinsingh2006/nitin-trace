/**
 * NitinTrace — Analytics Service
 *
 * Lightweight event tracking using Navigator.sendBeacon for reliability.
 * In production, events are sent to a configurable endpoint.
 * In development, events are logged to console.
 */

const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || null;
const DEBUG = import.meta.env.DEV;

const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pageLoadTime = Date.now();
const eventQueue = [];

function getBasePayload() {
  return {
    sessionId,
    url: window.location.href,
    referrer: document.referrer || '',
    userAgent: navigator.userAgent.slice(0, 120),
    screen: `${window.screen.width}x${window.screen.height}`,
    timestamp: new Date().toISOString(),
    language: navigator.language,
  };
}

export function trackEvent(name, data = {}) {
  const payload = { ...getBasePayload(), event: name, ...data };

  if (DEBUG) {
    console.log(`[Analytics] ${name}`, data);
  }

  if (ANALYTICS_ENDPOINT) {
    eventQueue.push(payload);
    flushQueue();
  }
}

function flushQueue() {
  if (eventQueue.length === 0) return;
  const chunk = eventQueue.splice(0, 10);
  try {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify(chunk));
  } catch {
    // silently fail — analytics should never break the app
  }
}

// Auto-track page view
export function initAnalytics() {
  trackEvent('page_view', {
    loadTime: Date.now() - pageLoadTime,
  });
}

// Track timing events
export function trackTiming(category, variable, value, label) {
  trackEvent('timing', { category, variable, value, label });
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushQueue);
}

export function getSessionId() {
  return sessionId;
}
