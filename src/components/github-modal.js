/**
 * N-Trace — GitHub Integration Modals
 *
 * Renders:
 *  1. GitHub Connect Modal (OAuth/PAT connectivity)
 *  2. GitHub Save Modal (configure repository name and custom filename to push trace)
 *
 * Fully reactive and state-driven.
 */

import store from '../core/state.js';
import eventBus from '../core/events.js';
import { CONFIG } from '../core/config.js';
import { EXTENSIONS } from '../utils/constants.js';
import { verifyGitHubToken, pushCodeTrace } from '../services/github.js';
import { getEditor } from '../services/editor.js';
import { getTraceSteps } from '../services/trace.js';

export function initGitHubModals(container) {
  const modalsHtml = `
    <!-- GitHub Connect Modal -->
    <div class="modal-overlay" id="github-modal" style="display:none;">
      <div class="modal" role="dialog" aria-labelledby="github-title">
        <div class="modal-header">
          <h2 id="github-title">🐙 Connect GitHub</h2>
          <button class="modal-close" id="github-close" title="Close">&times;</button>
        </div>
        <div class="modal-body">

          <!-- Not connected: token input form -->
          <div id="github-connect-form">
            <div class="github-hero">
              <div class="github-hero-icon">🐙</div>
              <p class="github-hero-desc">
                Save your traced code directly to a <strong>GitHub repository</strong>.<br />
                Every trace creates a file in your chosen repo (default: <code>n-trace-traces</code>) with an AI-generated execution summary.
              </p>
            </div>
            <div class="form-group">
              <label for="github-token-input">Personal Access Token (PAT)</label>
              <input
                type="password"
                id="github-token-input"
                class="form-input"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                autocomplete="off"
              />
              <p class="form-hint">
                <a href="https://github.com/settings/tokens/new?scopes=public_repo&description=N-Trace+Traces" target="_blank" rel="noopener">🔑 Generate token on GitHub</a>
                &nbsp;— select <code>public_repo</code> scope only.
              </p>
            </div>
          </div>

          <!-- Connected: user card -->
          <div id="github-connected-info" style="display:none;">
            <div class="github-user-card">
              <img id="github-avatar" src="" alt="GitHub avatar" class="github-avatar" />
              <div class="github-user-details">
                <div class="github-display-name" id="github-display-name"></div>
                <div class="github-username-text" id="github-username-text"></div>
                <div class="github-connected-status">
                  ✅ Connected &nbsp;·&nbsp; Traces → <code id="github-repo-link"></code>
                </div>
              </div>
            </div>
            <div class="github-stats" id="github-stats">
              <div class="github-stat">
                <span class="github-stat-icon">📁</span>
                <span class="github-stat-label">Repository</span>
                <a class="github-stat-value" id="github-repo-url" href="#" target="_blank" rel="noopener">View on GitHub ↗</a>
              </div>
            </div>
          </div>

        </div>
        <div class="modal-footer" style="justify-content:space-between;">
          <div id="github-footer-left">
            <button class="btn btn-ghost" id="github-disconnect-btn" style="display:none; color:#f87171; border-color:rgba(248,113,113,0.25);">Disconnect</button>
          </div>
          <div style="display:flex;gap:0.5rem;" id="github-footer-right">
            <button class="btn btn-ghost" id="github-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="github-connect-btn">
              <span>🐙</span>&nbsp; Connect GitHub
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- GitHub Save Modal -->
    <div class="modal-overlay" id="github-save-modal" style="display:none;">
      <div class="modal" role="dialog" aria-labelledby="github-save-title" style="max-width: 450px;">
        <div class="modal-header">
          <h2 id="github-save-title">📤 Save Trace to GitHub</h2>
          <button class="modal-close" id="github-save-close" title="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group" style="margin-bottom:1.25rem;">
            <label for="github-save-repo" style="display:block;margin-bottom:0.4rem;font-size:0.85rem;color:var(--text-secondary);">Repository Name</label>
            <input
              type="text"
              id="github-save-repo"
              class="form-input"
              value="n-trace-traces"
              placeholder="e.g. my-custom-repo"
              style="width:100%;"
            />
            <p class="form-hint" style="font-size:0.75rem;color:var(--text-muted);margin-top:0.3rem;">
              Repo will be automatically created on your profile if it does not exist.
            </p>
          </div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label for="github-save-filename" style="display:block;margin-bottom:0.4rem;font-size:0.85rem;color:var(--text-secondary);">Filename (Optional)</label>
            <div style="display:flex; align-items:center; gap:0.25rem;">
              <input
                type="text"
                id="github-save-filename"
                class="form-input"
                placeholder="trace_name"
                style="flex:1;"
              />
              <span id="github-save-extension" style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-muted); background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:0.5rem 0.75rem; border-radius:8px;">.js</span>
            </div>
            <p class="form-hint" style="font-size:0.75rem;color:var(--text-muted);margin-top:0.3rem;">
              Leave blank to auto-generate a timestamp-based filename.
            </p>
          </div>
        </div>
        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button class="btn btn-ghost" id="github-save-cancel">Cancel</button>
          <button class="btn btn-primary" id="github-save-submit">
            <span>🚀</span>&nbsp; Push Trace
          </button>
        </div>
      </div>
    </div>
  `;

  // Render
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalsHtml;

  const connectModal = tempDiv.querySelector('#github-modal');
  const saveModal = tempDiv.querySelector('#github-save-modal');

  container.appendChild(connectModal);
  container.appendChild(saveModal);

  // Connect Modal Elements Cache
  const btnCloseConnect = connectModal.querySelector('#github-close');
  const btnCancelConnect = connectModal.querySelector('#github-cancel-btn');
  const btnConnect = connectModal.querySelector('#github-connect-btn');
  const btnDisconnect = connectModal.querySelector('#github-disconnect-btn');
  const tokenInput = connectModal.querySelector('#github-token-input');

  const connectForm = connectModal.querySelector('#github-connect-form');
  const connectedInfo = connectModal.querySelector('#github-connected-info');
  const avatarImg = connectModal.querySelector('#github-avatar');
  const displayName = connectModal.querySelector('#github-display-name');
  const usernameText = connectModal.querySelector('#github-username-text');
  const repoLink = connectModal.querySelector('#github-repo-link');
  const repoUrl = connectModal.querySelector('#github-repo-url');

  // Save Modal Elements Cache
  const saveClose = saveModal.querySelector('#github-save-close');
  const saveCancel = saveModal.querySelector('#github-save-cancel');
  const saveSubmit = saveModal.querySelector('#github-save-submit');
  const saveRepoInput = saveModal.querySelector('#github-save-repo');
  const saveFilenameInput = saveModal.querySelector('#github-save-filename');
  const saveExtensionLabel = saveModal.querySelector('#github-save-extension');

  const getLanguageExtension = (lang) => {
    const ext = EXTENSIONS[lang];
    return ext ? `.${ext}` : '.txt';
  };

  // Sync Connect Modal UI with active state
  const syncConnectUI = () => {
    const token = store.get('github.token');
    const username = store.get('github.username');
    const avatar = store.get('github.avatar');
    const defaultRepo = saveRepoInput.value.trim() || CONFIG.GITHUB.DEFAULT_REPO;

    if (token && username) {
      connectForm.style.display = 'none';
      connectedInfo.style.display = 'block';
      avatarImg.src = avatar || '';
      displayName.textContent = username;
      usernameText.textContent = `@${username}`;
      repoLink.textContent = defaultRepo;
      repoUrl.href = `https://github.com/${username}/${defaultRepo}`;

      btnDisconnect.style.display = 'block';
      btnCancelConnect.textContent = 'Close';
      btnConnect.style.display = 'none';
    } else {
      connectForm.style.display = 'block';
      connectedInfo.style.display = 'none';
      tokenInput.value = '';

      btnDisconnect.style.display = 'none';
      btnCancelConnect.textContent = 'Cancel';
      btnConnect.style.display = 'flex';
    }
  };

  // ── Connect Modal Event Handlers ──────────────────────────────────────────

  const closeConnectModal = () => store.set('ui.githubModalOpen', false);

  btnCloseConnect.addEventListener('click', closeConnectModal);
  btnCancelConnect.addEventListener('click', closeConnectModal);
  connectModal.addEventListener('click', (e) => {
    if (e.target === connectModal) closeConnectModal();
  });

  btnConnect.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    if (!token) {
      eventBus.emit('toast:show', { message: 'Please enter a GitHub Personal Access Token.', type: 'warning' });
      return;
    }

    btnConnect.disabled = true;
    btnCancelConnect.disabled = true;
    tokenInput.disabled = true;
    const originalContent = btnConnect.innerHTML;
    btnConnect.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-color:var(--bg-shell);"></span>&nbsp; Verifying...';

    try {
      eventBus.emit('toast:show', { message: 'Verifying token with GitHub...', type: 'info' });
      const user = await verifyGitHubToken(token);

      // Update state store (session values)
      store.set('github.token', token);
      store.set('github.username', user.login);
      store.set('github.avatar', user.avatar_url);

      eventBus.emit('toast:show', { message: `Successfully connected as @${user.login}!`, type: 'success' });
      setTimeout(closeConnectModal, 800);
    } catch (err) {
      console.error(err);
      eventBus.emit('toast:show', { message: err.message || 'Token verification failed.', type: 'error' });
    } finally {
      btnConnect.disabled = false;
      btnCancelConnect.disabled = false;
      tokenInput.disabled = false;
      btnConnect.innerHTML = originalContent;
    }
  });

  btnDisconnect.addEventListener('click', () => {
    store.set('github.token', null);
    store.set('github.username', null);
    store.set('github.avatar', null);
    eventBus.emit('toast:show', { message: 'Disconnected from GitHub.', type: 'info' });
  });

  // Connect Modal state subscription
  store.subscribe('ui.githubModalOpen', (isOpen) => {
    if (isOpen) {
      syncConnectUI();
      connectModal.style.display = 'flex';
      if (!store.get('github.token')) {
        tokenInput.focus();
      }
    } else {
      connectModal.style.display = 'none';
    }
  });

  // ── Save Modal Event Handlers ─────────────────────────────────────────────

  const closeSaveModal = () => store.set('ui.githubSaveModalOpen', false);

  saveClose.addEventListener('click', closeSaveModal);
  saveCancel.addEventListener('click', closeSaveModal);
  saveModal.addEventListener('click', (e) => {
    if (e.target === saveModal) closeSaveModal();
  });

  saveSubmit.addEventListener('click', async () => {
    const token = store.get('github.token');
    const username = store.get('github.username');

    const editor = getEditor();
    if (!editor) {
      eventBus.emit('toast:show', { message: 'Editor is not ready.', type: 'error' });
      return;
    }

    const code = editor.getValue().trim();
    if (!code) {
      eventBus.emit('toast:show', { message: 'No code to save.', type: 'warning' });
      return;
    }

    const language = store.get('settings.language');
    const steps = getTraceSteps();

    if (!steps || steps.length === 0) {
      eventBus.emit('toast:show', { message: 'No trace steps to save. Please run a trace first.', type: 'warning' });
      return;
    }

    const repoName = saveRepoInput.value.trim() || CONFIG.GITHUB.DEFAULT_REPO;
    const customFilename = saveFilenameInput.value.trim();

    saveSubmit.disabled = true;
    saveCancel.disabled = true;
    saveRepoInput.disabled = true;
    saveFilenameInput.disabled = true;
    const originalContent = saveSubmit.innerHTML;
    saveSubmit.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-color:var(--bg-shell);"></span>&nbsp; Saving...';

    try {
      eventBus.emit('toast:show', { message: 'Saving trace to GitHub...', type: 'info' });
      const result = await pushCodeTrace(token, username, code, language, steps, repoName, customFilename);
      eventBus.emit('toast:show', { message: 'Trace saved to GitHub successfully!', type: 'success' });

      // Inject success message in console
      const consoleEl = document.getElementById('console-output');
      if (consoleEl) {
        consoleEl.innerHTML += `\n\n<span style="color:var(--accent-cyan); font-weight:600;">🚀 GitHub Sync Success</span>\n<span style="color:var(--text-secondary);">Pushed trace file to repository:</span>\n<span style="color:var(--text-muted);">📂 ${result.filename}</span>\n🔗 <a href="${result.url}" target="_blank" style="color:var(--accent-cyan); text-decoration:underline;">View file on GitHub ↗</a>\n`;
        consoleEl.scrollTop = consoleEl.scrollHeight;
      }

      setTimeout(closeSaveModal, 600);
    } catch (err) {
      console.error(err);
      eventBus.emit('toast:show', { message: err.message || 'Failed to save to GitHub.', type: 'error' });
    } finally {
      saveSubmit.disabled = false;
      saveCancel.disabled = false;
      saveRepoInput.disabled = false;
      saveFilenameInput.disabled = false;
      saveSubmit.innerHTML = originalContent;
    }
  });

  // Save Modal state subscription
  store.subscribe('ui.githubSaveModalOpen', (isOpen) => {
    if (isOpen) {
      const token = store.get('github.token');
      if (!token) {
        eventBus.emit('toast:show', { message: 'Please connect your GitHub account first.', type: 'info' });
        store.set('ui.githubModalOpen', true);
        store.set('ui.githubSaveModalOpen', false);
        return;
      }

      const language = store.get('settings.language') || 'javascript';
      saveExtensionLabel.textContent = getLanguageExtension(language);
      saveFilenameInput.value = '';
      saveModal.style.display = 'flex';
      saveFilenameInput.focus();
    } else {
      saveModal.style.display = 'none';
    }
  });

  // Listen to github token/user state changes to sync Connect UI dynamically
  store.subscribe('github.token', syncConnectUI);
  store.subscribe('github.username', syncConnectUI);
}
