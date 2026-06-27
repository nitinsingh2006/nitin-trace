/**
 * NitinTrace — Keyboard Shortcut Help Panel
 * Toggle with the '?' key. Shows all keyboard shortcuts.
 */
const SHORTCUTS = [
  { key: 'Ctrl+Enter', desc: 'Run trace' },
  { key: 'Space', desc: 'Play / Pause' },
  { key: '← / →', desc: 'Step backward / forward' },
  { key: 'Home', desc: 'Jump to first step' },
  { key: 'End', desc: 'Jump to last step' },
  { key: 'Escape', desc: 'Close modals' },
  { key: '?', desc: 'Toggle this help panel' },
];

let helpVisible = false;
let helpEl = null;
let _triggerEl = null;

export function initKeyboardHelp() {
  const html = `
    <div id="keyboard-help-overlay" role="dialog" aria-modal="true"
         aria-label="Keyboard shortcuts"
         style="display:none; position:fixed; inset:0; z-index:3000;
                background:rgba(0,0,0,0.7); backdrop-filter:blur(4px);
                align-items:center; justify-content:center;">
      <div style="background:var(--bg-surface-solid); border:1px solid var(--border-color);
                  border-radius:16px; padding:2rem; min-width:320px; max-width:480px;
                  box-shadow:var(--shadow-panel); width:90%;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem;">
          <h2 id="kb-help-title" style="font-size:1.1rem; font-weight:700; color:var(--text-primary); margin:0;">⌨️ Keyboard Shortcuts</h2>
          <button id="kb-help-close"
                  style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.2rem; padding:0.25rem 0.5rem; border-radius:4px;"
                  aria-label="Close shortcuts panel">×</button>
        </div>
        <div role="list" style="display:flex; flex-direction:column; gap:0.5rem;">
          ${SHORTCUTS.map(s => `
            <div role="listitem" style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid var(--border-color);">
              <kbd style="font-family:var(--font-mono); font-size:0.82rem; padding:0.2rem 0.5rem;
                          background:rgba(255,255,255,0.06); border:1px solid var(--border-color);
                          border-radius:4px; color:var(--accent-cyan);">${s.key}</kbd>
              <span style="font-size:0.85rem; color:var(--text-secondary);">${s.desc}</span>
            </div>
          `).join('')}
        </div>
        <p style="margin-top:1rem; font-size:0.75rem; color:var(--text-muted); text-align:center;">
          Press <kbd style="font-family:var(--font-mono); padding:0.1rem 0.4rem; background:rgba(255,255,255,0.06); border:1px solid var(--border-color); border-radius:3px; color:var(--accent-cyan);">?</kbd> or <kbd style="font-family:var(--font-mono); padding:0.1rem 0.4rem; background:rgba(255,255,255,0.06); border:1px solid var(--border-color); border-radius:3px; color:var(--accent-cyan);">Esc</kbd> to close
        </p>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  helpEl = document.getElementById('keyboard-help-overlay');

  const closeBtn = document.getElementById('kb-help-close');
  closeBtn.addEventListener('click', hide);

  // Click backdrop to close
  helpEl.addEventListener('click', (e) => {
    if (e.target === helpEl) hide();
  });

  // Focus trap inside the dialog
  helpEl.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusable = helpEl.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  // '?' key toggles, Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      toggle();
    }
    if (e.key === 'Escape' && helpVisible) {
      e.stopPropagation();
      hide();
    }
  });
}

function show(triggerEl) {
  if (helpEl) {
    _triggerEl = triggerEl || document.activeElement;
    helpEl.style.display = 'flex';
    helpVisible = true;
    // Focus close button for keyboard users
    const closeBtn = document.getElementById('kb-help-close');
    if (closeBtn) closeBtn.focus();
  }
}

function hide() {
  if (helpEl) {
    helpEl.style.display = 'none';
    helpVisible = false;
    // Return focus to trigger element
    if (_triggerEl && typeof _triggerEl.focus === 'function') {
      _triggerEl.focus();
    }
    _triggerEl = null;
  }
}

function toggle() {
  helpVisible ? hide() : show();
}
