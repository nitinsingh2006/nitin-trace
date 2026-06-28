/**
 * N-Trace — History Drawer Component
 *
 * Renders the saved trace history list side-drawer.
 * Users can search, load past execution traces, or clear all saved records.
 * Integrates directly with IndexedDB history service and state store.
 */

import store from '../core/state.js';
import eventBus from '../core/events.js';
import { getTraceHistory, clearAllTraceHistory } from '../services/history.js';
import { formatTime, escapeHtml } from '../utils/helpers.js';
export function initHistoryDrawer(container) {
  const drawerHtml = `
    <!-- History Drawer -->
    <div class="drawer-overlay" id="history-drawer" style="display:none;">
      <div class="drawer" role="dialog" aria-labelledby="history-title">
        <div class="drawer-header">
          <h2 id="history-title">⏳ Trace History</h2>
          <button class="drawer-close" id="history-close" title="Close">&times;</button>
        </div>
        <div class="drawer-search" style="padding: 0 1.25rem 1rem;">
          <input type="text" id="history-search" class="form-input" placeholder="Search traces by code or language..." />
        </div>
        <div class="drawer-body" id="history-list" style="flex:1; overflow-y:auto; padding: 0 1.25rem 1.25rem; display:flex; flex-direction:column; gap:0.75rem;">
          <!-- History list items render here -->
        </div>
        <div class="drawer-footer" style="padding:1rem 1.25rem; border-top:1px solid var(--border-color); background:rgba(255,255,255,0.01);">
          <button class="btn btn-ghost" id="btn-clear-history" style="width:100%; border-color:rgba(248,113,113,0.25); color:#f87171;">Clear All History</button>
        </div>
      </div>
    </div>
  `;

  // Render
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = drawerHtml;
  const drawerEl = tempDiv.firstElementChild;
  container.appendChild(drawerEl);

  // Cache elements
  const btnClose = drawerEl.querySelector('#history-close');
  const btnClear = drawerEl.querySelector('#btn-clear-history');
  const searchInput = drawerEl.querySelector('#history-search');
  const listEl = drawerEl.querySelector('#history-list');

  const closeDrawer = () => {
    store.set('ui.historyOpen', false);
  };

  btnClose.addEventListener('click', closeDrawer);
  drawerEl.addEventListener('click', (e) => {
    if (e.target === drawerEl) closeDrawer();
  });

  btnClear.addEventListener('click', async () => {
    try {
      await clearAllTraceHistory();
      await renderHistoryList();
      eventBus.emit('toast:show', { message: 'History cleared.', type: 'success' });
    } catch {
      eventBus.emit('toast:show', { message: 'Failed to clear history.', type: 'error' });
    }
  });

  searchInput.addEventListener('input', () => {
    renderHistoryList(searchInput.value.trim().toLowerCase());
  });

  const renderHistoryList = async (filter = '') => {
    try {
      let items = await getTraceHistory();
      if (filter) {
        items = items.filter(item =>
          item.code.toLowerCase().includes(filter) ||
          item.language.toLowerCase().includes(filter)
        );
      }
      if (items.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:2rem;font-size:0.88rem;">No traces saved yet.</div>';
        return;
      }

      listEl.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}" style="
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.85rem 1rem;
          cursor: pointer;
          transition: all 0.15s ease;
        ">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
            <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--accent-cyan);font-weight:600;text-transform:uppercase;">${escapeHtml(item.language)}</span>
            <span style="font-size:0.7rem;color:var(--text-muted);">${formatTime(new Date(item.timestamp))}</span>
          </div>
          <pre style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-secondary);white-space:pre;overflow:hidden;text-overflow:ellipsis;max-height:2.4em;line-height:1.2em;">${escapeHtml(item.code.slice(0, 120))}</pre>
          <div style="display:flex;justify-content:flex-end;margin-top:0.5rem;gap:0.5rem;">
            <span style="font-size:0.7rem;color:var(--text-muted);">${item.steps.length} steps</span>
          </div>
        </div>
      `).join('');

      // Click to reload trace
      listEl.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.id;
          const item = items.find(i => i.id === id);
          if (item) {
            eventBus.emit('editor:set-code', { code: item.code, language: item.language });

            // Emit trace restore event
            eventBus.emit('history:restore', item.steps);

            closeDrawer();
            eventBus.emit('toast:show', { message: 'Trace loaded from history.', type: 'success' });
          }
        });
      });
    } catch (err) {
      console.error('Failed to load history:', err);
      listEl.innerHTML = '<div style="text-align:center;color:#f87171;padding:2rem;">Failed to load history.</div>';
    }
  };

  // Subscribe to history drawer open state
  store.subscribe('ui.historyOpen', (isOpen) => {
    if (isOpen) {
      renderHistoryList();
      drawerEl.style.display = 'flex';
      searchInput.value = '';
      searchInput.focus();
    } else {
      drawerEl.style.display = 'none';
    }
  });
}
