/**
 * NitinTrace — Authentication & User Dashboard Modal
 *
 * Implements a local-first user authentication simulator (Google, GitHub, X, Email)
 * and an interactive User Dashboard to manage profile settings, API Keys, and saved trace files.
 */

import store from '../core/state.js';
import eventBus from '../core/events.js';
import { getTraceHistory, deleteTraceFromHistory } from '../services/history.js';

export function initAuthModal(container) {
  const modalHtml = `
    <div class="modal-overlay" id="auth-modal" style="display:none;">
      <div class="modal auth-card" role="dialog" aria-labelledby="auth-title">
        
        <!-- CLOSE BUTTON -->
        <button class="modal-close" id="auth-close" title="Close" aria-label="Close modal">&times;</button>
        
        <!-- SIGN IN VIEW -->
        <div id="auth-signin-view">
          <div class="auth-header">
            <div class="auth-logo">⟐</div>
            <h2 id="auth-title">Sign up or Log in</h2>
            <p class="auth-subtitle">Store your profile, keys, and traces securely on your local PC.</p>
          </div>
          
          <div class="auth-body">
            <!-- Social Sign-in Buttons -->
            <div class="auth-social-group">
              <button class="btn btn-social" id="btn-auth-google">
                <span class="social-icon">Google</span>
                <span>Continue with Google</span>
              </button>
              <button class="btn btn-social" id="btn-auth-github">
                <span class="social-icon">GitHub</span>
                <span>Continue with GitHub</span>
              </button>
              <button class="btn btn-social" id="btn-auth-x">
                <span class="social-icon">𝕏</span>
                <span>Continue with X / Twitter</span>
              </button>
            </div>
            
            <div class="auth-divider">
              <span>or</span>
            </div>
            
            <!-- Local Email Login Form -->
            <form class="auth-form" id="auth-email-form">
              <div class="form-group">
                <label for="auth-email-input">Email address</label>
                <input type="email" id="auth-email-input" class="form-input" placeholder="e.g., nitin@example.com" required />
              </div>
              <div class="form-group">
                <label for="auth-password-input">Password</label>
                <input type="password" id="auth-password-input" class="form-input" placeholder="••••••••" required />
              </div>
              <button type="submit" class="btn btn-primary auth-submit-btn">
                Continue with Email
              </button>
            </form>
          </div>
        </div>

        <!-- DASHBOARD VIEW -->
        <div id="auth-dashboard-view" style="display:none;">
          <div class="dashboard-header">
            <div class="user-profile-summary">
              <div class="user-avatar-large" id="dashboard-avatar">N</div>
              <div class="user-profile-meta">
                <h2 id="dashboard-name">Nitin Singh</h2>
                <p id="dashboard-email">nitin@nitintrace.dev</p>
                <span class="badge badge-provider" id="dashboard-provider">Google Account</span>
              </div>
            </div>
          </div>

          <div class="dashboard-body">
            <!-- Tab headers -->
            <div class="dashboard-tabs">
              <button class="tab-btn active" data-tab="tab-keys">🔑 Keys & Tokens</button>
              <button class="tab-btn" data-tab="tab-files">📂 Saved Traces</button>
            </div>

            <!-- Tab Content: Keys & Tokens -->
            <div class="tab-content active" id="tab-keys">
              <div class="keys-grid">
                <div class="form-group">
                  <label for="dash-gemini-key">Google Gemini API Key</label>
                  <div class="input-with-button">
                    <input type="password" id="dash-gemini-key" class="form-input" placeholder="Not configured" />
                    <button class="btn btn-ghost toggle-key-visibility" title="Toggle visibility">👁️</button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="dash-groq-key">Groq API Key</label>
                  <div class="input-with-button">
                    <input type="password" id="dash-groq-key" class="form-input" placeholder="Not configured" />
                    <button class="btn btn-ghost toggle-key-visibility" title="Toggle visibility">👁️</button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="dash-openai-key">OpenAI API Key</label>
                  <div class="input-with-button">
                    <input type="password" id="dash-openai-key" class="form-input" placeholder="Not configured" />
                    <button class="btn btn-ghost toggle-key-visibility" title="Toggle visibility">👁️</button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="dash-claude-key">Anthropic Claude API Key</label>
                  <div class="input-with-button">
                    <input type="password" id="dash-claude-key" class="form-input" placeholder="Not configured" />
                    <button class="btn btn-ghost toggle-key-visibility" title="Toggle visibility">👁️</button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="dash-github-token">GitHub Personal Access Token (PAT)</label>
                  <div class="input-with-button">
                    <input type="password" id="dash-github-token" class="form-input" placeholder="Not configured" />
                    <button class="btn btn-ghost toggle-key-visibility" title="Toggle visibility">👁️</button>
                  </div>
                </div>
              </div>

              <div class="dashboard-actions-row">
                <button class="btn btn-primary" id="btn-save-keys">Save Keys</button>
              </div>
            </div>

            <!-- Tab Content: Saved Files / Traces -->
            <div class="tab-content" id="tab-files">
              <div class="saved-files-list" id="saved-files-container">
                <div class="empty-files-state">
                  <span class="empty-icon">📁</span>
                  <p>No saved execution traces yet.</p>
                  <span class="empty-subtitle">Your executed code traces will automatically appear here.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-footer">
            <div class="footer-meta">Joined on <span id="dashboard-joined-date">June 2026</span></div>
            <button class="btn btn-danger-outline" id="btn-auth-signout">Sign Out</button>
          </div>
        </div>
        
      </div>
    </div>
  `;

  // Render modal structure
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  const modalEl = tempDiv.firstElementChild;
  container.appendChild(modalEl);

  // Cache elements
  const btnClose = modalEl.querySelector('#auth-close');
  const signinView = modalEl.querySelector('#auth-signin-view');
  const dashboardView = modalEl.querySelector('#auth-dashboard-view');
  
  // Sign-in view elements
  const btnGoogle = modalEl.querySelector('#btn-auth-google');
  const btnGithub = modalEl.querySelector('#btn-auth-github');
  const btnX = modalEl.querySelector('#btn-auth-x');
  const emailForm = modalEl.querySelector('#auth-email-form');
  const emailInput = modalEl.querySelector('#auth-email-input');
  const passwordInput = modalEl.querySelector('#auth-password-input');

  // Dashboard view elements
  const dashboardAvatar = modalEl.querySelector('#dashboard-avatar');
  const dashboardName = modalEl.querySelector('#dashboard-name');
  const dashboardEmail = modalEl.querySelector('#dashboard-email');
  const dashboardProvider = modalEl.querySelector('#dashboard-provider');
  const dashboardJoinedDate = modalEl.querySelector('#dashboard-joined-date');
  const btnSignout = modalEl.querySelector('#btn-auth-signout');

  // Tab inputs
  const tabBtns = modalEl.querySelectorAll('.tab-btn');
  const tabContents = modalEl.querySelectorAll('.tab-content');
  const geminiInput = modalEl.querySelector('#dash-gemini-key');
  const groqInput = modalEl.querySelector('#dash-groq-key');
  const openaiInput = modalEl.querySelector('#dash-openai-key');
  const claudeInput = modalEl.querySelector('#dash-claude-key');
  const githubInput = modalEl.querySelector('#dash-github-token');
  const btnSaveKeys = modalEl.querySelector('#btn-save-keys');
  const savedFilesContainer = modalEl.querySelector('#saved-files-container');

  // Visible key logic
  const toggleVisibilityBtns = modalEl.querySelectorAll('.toggle-key-visibility');
  toggleVisibilityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });

  // Close helper
  const closeAuthModal = () => {
    store.set('ui.modalOpen', null);
  };
  btnClose.addEventListener('click', closeAuthModal);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeAuthModal();
  });

  // Tab switching logic
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      modalEl.querySelector(`#${targetId}`).classList.add('active');

      if (targetId === 'tab-files') {
        loadSavedFilesList();
      }
    });
  });

  // Load profile values into inputs
  const populateKeyInputs = () => {
    geminiInput.value = store.get('settings.geminiApiKey') || '';
    groqInput.value = store.get('settings.groqApiKey') || '';
    openaiInput.value = store.get('settings.openaiApiKey') || '';
    claudeInput.value = store.get('settings.claudeApiKey') || '';
    githubInput.value = store.get('github.token') || '';
  };

  // Save keys action
  btnSaveKeys.addEventListener('click', () => {
    store.set('settings.geminiApiKey', geminiInput.value.trim());
    store.set('settings.groqApiKey', groqInput.value.trim());
    store.set('settings.openaiApiKey', openaiInput.value.trim());
    store.set('settings.claudeApiKey', claudeInput.value.trim());
    
    const githubVal = githubInput.value.trim();
    store.set('github.token', githubVal);
    store.set('github.isAuthenticated', !!githubVal);

    eventBus.emit('toast:show', { message: 'Keys and tokens saved locally!', type: 'success' });
  });

  // Login Simulator Action
  const performSimulatedLogin = (name, email, provider) => {
    eventBus.emit('toast:show', { message: `Connecting to ${provider}...`, type: 'info' });
    
    // Simulate slight network delay
    setTimeout(() => {
      const user = {
        name,
        email,
        provider,
        avatar: name.charAt(0).toUpperCase(),
        createdAt: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
      };
      
      store.set('auth.user', user);
      store.set('auth.isLoggedIn', true);
      
      eventBus.emit('toast:show', { message: `Successfully logged in via ${provider}!`, type: 'success' });
      renderViewFromState();
    }, 800);
  };

  btnGoogle.addEventListener('click', () => {
    performSimulatedLogin('Nitin Singh', 'nsingh987610@gmail.com', 'Google');
  });

  btnGithub.addEventListener('click', () => {
    performSimulatedLogin('nitinsingh2006', 'nsingh987610@gmail.com', 'GitHub');
  });

  btnX.addEventListener('click', () => {
    performSimulatedLogin('Nitin Singh', 'nsingh987610@gmail.com', 'X / Twitter');
  });

  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const name = email.split('@')[0];
    performSimulatedLogin(name.charAt(0).toUpperCase() + name.slice(1), email, 'Email');
  });

  // Sign out action
  btnSignout.addEventListener('click', () => {
    store.set('auth.user', null);
    store.set('auth.isLoggedIn', false);
    eventBus.emit('toast:show', { message: 'Signed out successfully.', type: 'info' });
    renderViewFromState();
  });

  // Render Saved Files List
  const loadSavedFilesList = async () => {
    savedFilesContainer.innerHTML = '<div class="spinner-container"><div class="spinner"></div><p>Loading files...</p></div>';
    
    try {
      const history = await getTraceHistory();
      if (!history || history.length === 0) {
        savedFilesContainer.innerHTML = `
          <div class="empty-files-state">
            <span class="empty-icon">📁</span>
            <p>No saved execution traces yet.</p>
            <span class="empty-subtitle">Your executed code traces will automatically appear here.</span>
          </div>
        `;
        return;
      }

      savedFilesContainer.innerHTML = '';
      history.forEach(item => {
        const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const fileEl = document.createElement('div');
        fileEl.className = 'saved-file-item';
        fileEl.innerHTML = `
          <div class="file-info-col">
            <div class="file-name-row">
              <span class="file-lang-icon">${getLanguageIcon(item.language)}</span>
              <span class="file-name-title">trace-${item.id.slice(0, 6)}.${getFileExtension(item.language)}</span>
            </div>
            <div class="file-meta-row">
              <span>${item.language.toUpperCase()}</span> • <span>${item.steps.length} Steps</span> • <span class="file-date">${dateStr}</span>
            </div>
          </div>
          <div class="file-actions-col">
            <button class="btn btn-ghost btn-load-file" data-id="${item.id}" title="Load trace into Editor">Load</button>
            <button class="btn btn-ghost btn-delete-file btn-danger-hover" data-id="${item.id}" title="Delete trace">🗑️</button>
          </div>
        `;

        // Wire Actions
        fileEl.querySelector('.btn-load-file').addEventListener('click', () => {
          eventBus.emit('editor:set-code', { code: item.code, language: item.language });
          
          // Re-load the traces into visualizer
          store.set('trace.steps', item.steps);
          store.set('trace.totalSteps', item.steps.length);
          store.set('trace.currentIndex', 0);
          store.set('trace.isPlaying', false);

          eventBus.emit('toast:show', { message: `Loaded trace-${item.id.slice(0, 6)} into visualizer!`, type: 'success' });
          closeAuthModal();
        });

        fileEl.querySelector('.btn-delete-file').addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm('Are you sure you want to delete this trace file?')) {
            try {
              await deleteTraceFromHistory(item.id);
              eventBus.emit('toast:show', { message: 'Trace file deleted.', type: 'info' });
              loadSavedFilesList(); // reload list
            } catch {
              eventBus.emit('toast:show', { message: 'Failed to delete file.', type: 'error' });
            }
          }
        });

        savedFilesContainer.appendChild(fileEl);
      });
    } catch (err) {
      savedFilesContainer.innerHTML = '<p class="error-msg">Failed to load saved files.</p>';
    }
  };

  // Helper getters
  const getLanguageIcon = (lang) => {
    const icons = { javascript: '🟨', python: '🐍', java: '☕', cpp: '⚙️', c: '🔧', rust: '🦀', go: '🐹' };
    return icons[lang] || '📄';
  };

  const getFileExtension = (lang) => {
    const exts = { javascript: 'js', python: 'py', java: 'java', cpp: 'cpp', c: 'c', rust: 'rs', go: 'go' };
    return exts[lang] || 'txt';
  };

  // Sync state with UI view
  const renderViewFromState = () => {
    const isLoggedIn = store.get('auth.isLoggedIn') || false;
    const user = store.get('auth.user');

    if (isLoggedIn && user) {
      signinView.style.display = 'none';
      dashboardView.style.display = 'block';

      // Update values
      dashboardAvatar.textContent = user.avatar || 'U';
      dashboardName.textContent = user.name || 'User';
      dashboardEmail.textContent = user.email || '';
      dashboardProvider.textContent = `${user.provider} Account`;
      dashboardJoinedDate.textContent = user.createdAt || '';

      populateKeyInputs();
      
      // If we are currently on the files tab, refresh files list
      const activeTabBtn = modalEl.querySelector('.tab-btn.active');
      if (activeTabBtn && activeTabBtn.dataset.tab === 'tab-files') {
        loadSavedFilesList();
      }
    } else {
      signinView.style.display = 'block';
      dashboardView.style.display = 'none';
      
      // Clear forms
      emailInput.value = '';
      passwordInput.value = '';
    }
  };

  // Listen for open/close state of modalOpen
  store.subscribe('ui.modalOpen', (modalType) => {
    if (modalType === 'auth') {
      renderViewFromState();
      modalEl.style.display = 'flex';
    } else if (!modalType) {
      modalEl.style.display = 'none';
    }
  });
}
