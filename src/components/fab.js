/**
 * N-Trace — Floating Action Button (FAB) for mobile trace execution
 */
import store from '../core/state.js';
import eventBus from '../core/events.js';

export function initFAB(container) {
  const fab = document.createElement('button');
  fab.id = 'btn-fab';
  fab.className = 'fab-trace';
  fab.setAttribute('aria-label', 'Execute Trace');
  fab.innerHTML = '▶';
  container.appendChild(fab);

  fab.addEventListener('click', () => {
    eventBus.emit('trace:request-fab');
  });

  store.subscribe('trace.steps', (steps) => {
    fab.style.display = (steps && steps.length > 0) ? 'none' : 'flex';
  });

  eventBus.on('trace:start', () => { fab.style.display = 'none'; });
  eventBus.on('trace:reset', () => { fab.style.display = 'flex'; });

  return () => fab.remove();
}
