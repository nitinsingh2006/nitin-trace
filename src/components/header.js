/**
 * NitinTrace — Header Component
 *
 * Renders the top navigation bar.
 * Subscribes to the global store store to reflect GitHub auth status reactively.
 * Decoupled from modals and drawers via event bus and store updates.
 */

import store from '../core/state.js';
import eventBus from '../core/events.js';

export function initHeader(container) {
  const headerHtml = `
    <header class="app-header" id="app-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">⟐</span>
          <span class="logo-text">Nitin<span class="logo-accent">Trace</span></span>
        </div>
        <span class="version-badge">v1.0</span>
      </div>
      <div class="header-right">
        <button class="btn btn-ghost" id="btn-history" title="Trace History" aria-label="Trace History">
          <span class="btn-icon">⏳</span>
          <span class="btn-label">History</span>
        </button>
        <button class="btn btn-ghost" id="btn-examples" title="Example Code" aria-label="Example Code">
          <span class="btn-icon">📚</span>
          <span class="btn-label">Examples</span>
        </button>
        <button class="btn btn-ghost btn-github-header" id="btn-github" title="Connect GitHub" aria-label="Connect GitHub">
          <span class="btn-icon" id="github-btn-icon">🐙</span>
          <span class="btn-label" id="github-btn-label">GitHub</span>
        </button>
        <button class="btn btn-ghost" id="btn-settings" title="Settings" aria-label="Settings">
          <span class="btn-icon">⚙️</span>
          <span class="btn-label">Settings</span>
        </button>
        <button class="btn btn-ghost btn-auth-header" id="btn-auth" title="Account Settings" aria-label="Account Settings" style="margin-left: 0.25rem;">
          <span class="btn-icon" id="auth-btn-icon">👤</span>
          <span class="btn-label" id="auth-btn-label">Sign In</span>
        </button>
      </div>
    </header>
  `;

  // Render
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = headerHtml;
  const headerEl = tempDiv.firstElementChild;
  container.appendChild(headerEl);

  // Cache elements
  const btnHistory = headerEl.querySelector('#btn-history');
  const btnExamples = headerEl.querySelector('#btn-examples');
  const btnGithub = headerEl.querySelector('#btn-github');
  const btnSettings = headerEl.querySelector('#btn-settings');
  const githubBtnIcon = headerEl.querySelector('#github-btn-icon');
  const githubBtnLabel = headerEl.querySelector('#github-btn-label');

  // Event handlers
  btnHistory.addEventListener('click', () => {
    store.set('ui.historyOpen', true);
  });

  btnExamples.addEventListener('click', () => {
    eventBus.emit('ui:load-example');
  });

  btnGithub.addEventListener('click', () => {
    store.set('ui.githubModalOpen', true);
  });

  btnSettings.addEventListener('click', () => {
    store.set('ui.settingsOpen', true);
  });

  const btnAuth = headerEl.querySelector('#btn-auth');
  const authBtnIcon = headerEl.querySelector('#auth-btn-icon');
  const authBtnLabel = headerEl.querySelector('#auth-btn-label');

  btnAuth.addEventListener('click', () => {
    store.set('ui.modalOpen', 'auth');
  });

  // Reactive subscription to GitHub auth status
  const updateGitHubButton = () => {
    const token = store.get('github.token');
    const username = store.get('github.username');
    const avatar = store.get('github.avatar');

    if (token && username) {
      if (avatar) {
        githubBtnIcon.innerHTML = `<img src="${avatar}" style="width:16px;height:16px;border-radius:50%;vertical-align:middle;object-fit:cover;" alt="Avatar" />`;
      } else {
        githubBtnIcon.textContent = '🐙';
      }
      githubBtnLabel.textContent = username;
    } else {
      githubBtnIcon.textContent = '🐙';
      githubBtnLabel.textContent = 'GitHub';
    }
  };

  // Reactive subscription to user auth status
  const updateAuthButton = () => {
    const isLoggedIn = store.get('auth.isLoggedIn') || false;
    const user = store.get('auth.user');

    if (isLoggedIn && user) {
      authBtnIcon.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg, var(--accent-cyan, #00f0ff), var(--accent-purple, #8b5cf6));color:#000;font-size:0.7rem;font-weight:700;line-height:1;">${user.avatar}</span>`;
      authBtnLabel.textContent = user.name.split(' ')[0];
      btnAuth.title = 'User Dashboard';
    } else {
      authBtnIcon.textContent = '👤';
      authBtnLabel.textContent = 'Sign In';
      btnAuth.title = 'Sign In';
    }
  };

  // Subscribe to changes
  store.subscribe('github.token', updateGitHubButton);
  store.subscribe('github.username', updateGitHubButton);
  store.subscribe('github.avatar', updateGitHubButton);
  store.subscribe('auth.isLoggedIn', updateAuthButton);
  store.subscribe('auth.user', updateAuthButton);

  // Run once initially
  updateGitHubButton();
  updateAuthButton();
}
