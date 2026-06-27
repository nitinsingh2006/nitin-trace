/**
 * NitinTrace — Toast Notification Component
 *
 * Listens to the event bus for 'toast:show' events to display reactive notifications.
 * Removes the need for window.showToast global pollution.
 */

import eventBus from '../core/events.js';

let container = null;

/**
 * Ensures the toast container element exists in the DOM.
 */
function getContainer() {
  if (container) return container;

  container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Display a toast notification
 * @param {string} message - Message to display
 * @param {'info' | 'success' | 'warning' | 'error'} type - Notification type
 */
export function showToast(message, type = 'info') {
  const toastContainer = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 3000);
}

// Wire up the Event Bus listener
eventBus.on('toast:show', ({ message, type }) => {
  showToast(message, type);
});

// Provide backward compatibility for any direct imports or window reference during transition
window.showToast = showToast;
