/**
 * NitinTrace — AI-Powered Code Execution Visualizer
 * Main Entry Point
 */

import './style.css';
import { initApp } from './app.js';
import { initLandingPage } from './pages/landing/landing.js';
import { initAnalytics } from './services/analytics.js';

// Track whether the app has been initialized
let appInitialized = false;
let landingCleanup = null;

function bootApp() {
  if (appInitialized) return;
  appInitialized = true;
  if (landingCleanup) {
    landingCleanup.destroy();
    landingCleanup = null;
  }
  initApp();
}

function showLanding() {
  const container = document.getElementById('app');
  if (!container) return;

  landingCleanup = initLandingPage(container);
  // Listen for start event from landing page (dispatched on window by landing.js)
  window.addEventListener('nitintrace:start', bootApp, { once: true });
}

// Boot the application on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initAnalytics();
  // Show landing page on first visit, or app if returning
  const hasVisited = localStorage.getItem('nitintrace_hasVisited');
  if (hasVisited) {
    bootApp();
  } else {
    showLanding();
    localStorage.setItem('nitintrace_hasVisited', 'true');
  }
});

// Register Service Worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('NitinTrace Service Worker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  });
}
