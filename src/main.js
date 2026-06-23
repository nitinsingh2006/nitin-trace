/**
 * NitinTrace — AI-Powered Code Execution Visualizer
 * Main entry point
 *
 * Architecture:
 * - /src/components/  → UI components (header, editor, visualizer, controls)
 * - /src/services/    → Business logic (AI client, trace engine, storage)
 * - /src/utils/       → Constants, helpers, shared utilities
 * - /src/style.css    → Design system + global styles
 */

import './style.css';
import { DEFAULTS } from './utils/constants';
import { initEditor, setEditorLanguage, getEditor } from './services/editor';
import { resetVisualizer } from './services/visualizer';
import { fetchExecutionTrace } from './services/ai';
import { escapeHtml } from './utils/helpers';
import { initHistoryDB, saveTraceToHistory, getTraceHistory, deleteTraceFromHistory, clearAllTraceHistory } from './services/history';
import { formatTime } from './utils/helpers';
import { initFooter } from './components/footer';
import {
  togglePlayback,
  stepForward,
  stepBackward,
  jumpToStart,
  jumpToEnd,
  setPlaybackSpeed,
  loadTrace,
  getTraceSteps
} from './services/trace';
import {
  verifyGitHubToken,
  pushCodeTrace,
  getGitHubUser,
  getGitHubToken,
  saveGitHubSession,
  clearGitHubSession,
  REPO_NAME
} from './services/github';

// App initialization
function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-shell">
      <header class="app-header" id="app-header">
        <div class="header-left">
          <div class="logo">
            <span class="logo-icon">⟐</span>
            <span class="logo-text">Nitin<span class="logo-accent">Trace</span></span>
          </div>
          <span class="version-badge">v0.1 MVP</span>
        </div>
        <div class="header-right">
          <button class="btn btn-ghost" id="btn-history" title="Trace History">
            <span class="btn-icon">⏳</span>
            <span class="btn-label">History</span>
          </button>
          <button class="btn btn-ghost" id="btn-examples" title="Example Code">
            <span class="btn-icon">📚</span>
            <span class="btn-label">Examples</span>
          </button>
          <button class="btn btn-ghost btn-github-header" id="btn-github" title="Connect GitHub">
            <span class="btn-icon" id="github-btn-icon">🐙</span>
            <span class="btn-label" id="github-btn-label">GitHub</span>
          </button>
          <button class="btn btn-ghost" id="btn-settings" title="Settings">
            <span class="btn-icon">⚙️</span>
            <span class="btn-label">Settings</span>
          </button>
        </div>
      </header>

      <main class="app-main" id="app-main">
        <div class="panel panel-editor" id="panel-editor">
          <div class="panel-header">
            <div class="panel-title">
              <span class="panel-icon">✏️</span>
              Code Input
            </div>
            <div class="panel-actions">
              <select class="language-select" id="language-select" title="Select Language">
                <optgroup label="Popular">
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="typescript">TypeScript</option>
                </optgroup>
                <optgroup label="Systems">
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                  <option value="rust">Rust</option>
                </optgroup>
                <optgroup label="Modern">
                  <option value="go">Go</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="dart">Dart</option>
                  <option value="scala">Scala</option>
                  <option value="swift">Swift</option>
                </optgroup>
                <optgroup label="Scripting">
                  <option value="ruby">Ruby</option>
                  <option value="php">PHP</option>
                  <option value="bash">Bash</option>
                  <option value="r">R</option>
                </optgroup>
              </select>
            </div>
          </div>
          <div class="editor-container" id="editor-container">
            <!-- Monaco Editor will be mounted here -->
            <div class="editor-loading">
              <div class="spinner"></div>
              <p>Loading editor...</p>
            </div>
          </div>
          <div class="panel-footer">
            <button class="btn btn-primary btn-trace" id="btn-trace" title="Trace Execution (Ctrl+Enter)">
              <span class="btn-icon">▶</span>
              <span class="btn-label">Trace Execution</span>
            </button>
          </div>
        </div>

        <div class="panel panel-visualizer" id="panel-visualizer">
          <div class="panel-header">
            <div class="panel-title">
              <span class="panel-icon">🔍</span>
              Execution Trace
            </div>
            <div class="panel-actions" style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn btn-ghost" id="btn-save-github" style="display:none; padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 6px; height: 28px; line-height: 1;" title="Save Trace to GitHub">
                <span class="btn-icon" style="font-size:0.75rem;">📤</span>
                <span class="btn-label" style="font-size:0.75rem;">Save to GitHub</span>
              </button>
              <span class="step-counter" id="step-counter">Step 0 / 0</span>
            </div>
          </div>
          <div class="visualizer-container" id="visualizer-container">
            <!-- Step progress bar -->
            <div class="step-progress-container" id="step-progress-container" style="display:none;">
              <div class="step-progress-fill" id="step-progress-fill" style="width:0%"></div>
            </div>
            <!-- Empty state shown initially -->
            <div class="empty-state" id="empty-state">
              <div class="empty-icon">⟐</div>
              <h3>Ready to trace</h3>
              <p>Write or paste code on the left, then hit <kbd>Trace Execution</kbd> to see it come alive.</p>
              <div class="empty-hints">
                <div class="hint-item">
                  <span class="hint-key">Ctrl+Enter</span>
                  <span class="hint-desc">Start trace</span>
                </div>
                <div class="hint-item">
                  <span class="hint-key">Space</span>
                  <span class="hint-desc">Play / Pause</span>
                </div>
                <div class="hint-item">
                  <span class="hint-key">← →</span>
                  <span class="hint-desc">Step through</span>
                </div>
              </div>
            </div>

            <!-- Visualization sections (hidden until trace runs) -->
            <div class="viz-sections" id="viz-sections" style="display:none;">
              <!-- Executing line preview for students -->
              <section class="viz-section viz-exec-line" id="viz-exec-line" style="display:none;">
                <div class="section-label">⚡ Executing Line</div>
                <div class="exec-line-preview" id="exec-line-preview">
                  <code id="exec-line-code"></code>
                </div>
              </section>

              <section class="viz-section viz-explanation" id="viz-explanation">
                <div class="section-label">💬 What's happening</div>
                <div class="explanation-content" id="explanation-content">
                  <!-- AI explanation renders here -->
                </div>
              </section>

              <section class="viz-section viz-variables" id="viz-variables">
                <div class="section-label">📊 Variables</div>
                <div class="variables-table-container" id="variables-table-container">
                  <!-- Variable state table renders here -->
                </div>
              </section>

              <section class="viz-section viz-console" id="viz-console">
                <div class="section-label">🖥️ Console Output <span style="font-size:0.7rem;color:var(--text-muted);font-weight:400;margin-left:0.4rem;">(up to current step)</span></div>
                <pre class="console-output" id="console-output"><span class="console-cursor">▋</span></pre>
              </section>

              <section class="viz-section viz-final-output" id="viz-final-output">
                <div class="section-label">📺 Program Output <span style="font-size:0.7rem;color:var(--accent-cyan);font-weight:400;margin-left:0.4rem;">(complete)</span></div>
                <pre class="console-output" id="final-output" style="border-color: rgba(0,240,255,0.15); background: rgba(0,240,255,0.03);"><span style="font-size:0.82rem;color:var(--text-muted);font-style:italic;">Run a trace to see program output.</span></pre>
              </section>
            </div>
          </div>

          <!-- Playback controls bar -->
          <div class="playback-bar" id="playback-bar">
            <div class="playback-controls">
              <button class="ctrl-btn" id="btn-restart" title="Restart (Home)" disabled>
                <span>⏮</span>
              </button>
              <button class="ctrl-btn" id="btn-step-back" title="Step Back (←)" disabled>
                <span>⏪</span>
              </button>
              <button class="ctrl-btn ctrl-btn-primary" id="btn-play-pause" title="Play / Pause (Space)" disabled>
                <span id="play-pause-icon">▶</span>
              </button>
              <button class="ctrl-btn" id="btn-step-forward" title="Step Forward (→)" disabled>
                <span>⏩</span>
              </button>
              <button class="ctrl-btn" id="btn-end" title="Jump to End (End)" disabled>
                <span>⏭</span>
              </button>
            </div>
            <div class="speed-control">
              <label for="speed-slider" class="speed-label">Speed</label>
              <input type="range" id="speed-slider" min="0.5" max="3" step="0.5" value="1" class="speed-slider" />
              <span class="speed-value" id="speed-value">1x</span>
            </div>
          </div>
        </div>
      </main>
    </div>

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
                Every trace creates a file in your chosen repo (default: <code>nitintrace-traces</code>) with an AI-generated execution summary.
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
                <a href="https://github.com/settings/tokens/new?scopes=public_repo&description=NitinTrace+Traces" target="_blank" rel="noopener">🔑 Generate token on GitHub</a>
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
              value="nitintrace-traces"
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

    <!-- Settings Modal -->
    <div class="modal-overlay" id="settings-modal" style="display:none;">
      <div class="modal" role="dialog" aria-labelledby="settings-title">
        <div class="modal-header">
          <h2 id="settings-title">⚙️ Settings</h2>
          <button class="modal-close" id="settings-close" title="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="provider-select">AI Provider</label>
            <select id="provider-select" class="form-input">
              <option value="gemini">Google Gemini</option>
              <option value="groq">Groq</option>
            </select>
          </div>
          <div class="form-group" id="group-gemini-key">
            <label for="gemini-key-input">Google Gemini API Key</label>
            <input type="password" id="gemini-key-input" class="form-input" placeholder="Paste your Gemini API key..." />
            <p class="form-hint">Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a></p>
          </div>
          <div class="form-group" id="group-groq-key" style="display:none;">
            <label for="groq-key-input">Groq API Key</label>
            <input type="password" id="groq-key-input" class="form-input" placeholder="Paste your Groq API key..." />
            <p class="form-hint">Get a key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener">Groq Console</a></p>
          </div>
          <div class="form-group">
            <label for="model-select">Model</label>
            <select id="model-select" class="form-input">
              <!-- Options populated dynamically -->
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="settings-cancel">Cancel</button>
          <button class="btn btn-primary" id="settings-save">Save Settings</button>
        </div>
      </div>
    </div>

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

    <!-- Toast container for notifications -->
    <div class="toast-container" id="toast-container"></div>
  `;

  // Initialize modules
  initSettings();
  initTrace();
  initEditorComponent();
  resetVisualizer();
  initHistory();
  initExamples();
  initGitHub();

  // Render footer at the bottom of the app shell
  const appShell = document.querySelector('.app-shell');
  if (appShell) initFooter(appShell);
}

/**
 * Editor initialization and language selector wiring
 */
async function initEditorComponent() {
  const container = document.getElementById('editor-container');
  const langSelect = document.getElementById('language-select');
  
  // Load initial settings
  const savedLang = localStorage.getItem('codetrace_language') || DEFAULTS.language;
  langSelect.value = savedLang;

  try {
    await initEditor(container, savedLang);
    
    // Wire up language select dropdown change event
    langSelect.addEventListener('change', (e) => {
      const lang = e.target.value;
      setEditorLanguage(lang);
      localStorage.setItem('codetrace_language', lang);
      showToast(`Language changed to ${lang}`, 'success');
    });
  } catch (err) {
    showToast('Failed to initialize editor. Please refresh.', 'error');
  }
}

/**
 * Settings modal logic
 */
function initSettings() {
  const modal = document.getElementById('settings-modal');
  const btnSettings = document.getElementById('btn-settings');
  const btnClose = document.getElementById('settings-close');
  const btnCancel = document.getElementById('settings-cancel');
  const btnSave = document.getElementById('settings-save');

  const providerSelect = document.getElementById('provider-select');
  const geminiKeyInput = document.getElementById('gemini-key-input');
  const groqKeyInput = document.getElementById('groq-key-input');
  const groupGeminiKey = document.getElementById('group-gemini-key');
  const groupGroqKey = document.getElementById('group-groq-key');
  const modelSelect = document.getElementById('model-select');

  // Load saved settings
  const savedProvider = localStorage.getItem('codetrace_provider') || 'gemini';
  // Fallback to legacy key name for Gemini if new one isn't populated
  const savedGeminiKey = localStorage.getItem('codetrace_gemini_api_key') || localStorage.getItem('codetrace_api_key') || '';
  const savedGroqKey = localStorage.getItem('codetrace_groq_api_key') || '';
  const savedModel = localStorage.getItem('codetrace_model') || '';

  providerSelect.value = savedProvider;
  geminiKeyInput.value = savedGeminiKey;
  groqKeyInput.value = savedGroqKey;

  // Helper to populate model options dynamically
  const populateModels = (provider, selectedModelValue) => {
    modelSelect.innerHTML = '';
    if (provider === 'gemini') {
      const models = [
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (fast, free)' },
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (advanced)' },
        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (best quality)' }
      ];
      models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        modelSelect.appendChild(opt);
      });
      // Set to selected or default
      modelSelect.value = selectedModelValue && selectedModelValue.startsWith('gemini') ? selectedModelValue : 'gemini-2.0-flash';
    } else if (provider === 'groq') {
      const models = [
        { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' }
      ];
      models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        modelSelect.appendChild(opt);
      });
      modelSelect.value = selectedModelValue && selectedModelValue.includes('llama') ? selectedModelValue : 'llama-3.3-70b-versatile';
    }
  };

  // Helper to update fields based on provider selection
  const updateProviderFields = () => {
    const provider = providerSelect.value;
    if (provider === 'gemini') {
      groupGeminiKey.style.display = 'block';
      groupGroqKey.style.display = 'none';
      populateModels('gemini', localStorage.getItem('codetrace_model'));
    } else {
      groupGeminiKey.style.display = 'none';
      groupGroqKey.style.display = 'block';
      populateModels('groq', localStorage.getItem('codetrace_model'));
    }
  };

  // Initial render
  updateProviderFields();
  if (savedModel) {
    modelSelect.value = savedModel;
  }

  // Handle provider selection change
  providerSelect.addEventListener('change', updateProviderFields);

  const openModal = () => {
    modal.style.display = 'flex';
    if (providerSelect.value === 'gemini') {
      geminiKeyInput.focus();
    } else {
      groqKeyInput.focus();
    }
  };
  const closeModal = () => { modal.style.display = 'none'; };

  btnSettings.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  btnSave.addEventListener('click', () => {
    const provider = providerSelect.value;
    const geminiKey = geminiKeyInput.value.trim();
    const groqKey = groqKeyInput.value.trim();
    const model = modelSelect.value;

    localStorage.setItem('codetrace_provider', provider);
    localStorage.setItem('codetrace_gemini_api_key', geminiKey);
    localStorage.setItem('codetrace_api_key', geminiKey); // legacy sync
    localStorage.setItem('codetrace_groq_api_key', groqKey);
    localStorage.setItem('codetrace_model', model);

    closeModal();
    
    const activeKey = provider === 'gemini' ? geminiKey : groqKey;
    if (activeKey) {
      showToast(`${provider === 'gemini' ? 'Gemini' : 'Groq'} configured successfully!`, 'success');
    } else {
      showToast(`Settings saved, but ${provider === 'gemini' ? 'Gemini' : 'Groq'} API Key is empty.`, 'warning');
    }
  });

  // Welcome user and guide them on first load if key is missing
  if (!savedGeminiKey && !savedGroqKey) {
    setTimeout(() => {
      showToast('Welcome to NitinTrace! Setup your AI API Key to get started.', 'info');
      openModal();
    }, 1000);
  }
}

/**
 * Trace button and playback controls initialization
 */
function initTrace() {
  const btnTrace = document.getElementById('btn-trace');
  const speedSlider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnStepBack = document.getElementById('btn-step-back');
  const btnStepForward = document.getElementById('btn-step-forward');
  const btnRestart = document.getElementById('btn-restart');
  const btnEnd = document.getElementById('btn-end');

  // Load saved speed
  const savedSpeed = localStorage.getItem('codetrace_speed') || '1';
  speedSlider.value = savedSpeed;
  speedValue.textContent = `${savedSpeed}x`;
  setPlaybackSpeed(savedSpeed);

  // Wire up speed slider input listener
  speedSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    speedValue.textContent = `${val}x`;
    localStorage.setItem('codetrace_speed', val);
    setPlaybackSpeed(val);
  });

  // Wire up playback buttons
  btnPlayPause.addEventListener('click', togglePlayback);
  btnStepBack.addEventListener('click', stepBackward);
  btnStepForward.addEventListener('click', stepForward);
  btnRestart.addEventListener('click', jumpToStart);
  btnEnd.addEventListener('click', jumpToEnd);

  // Wire up Trace Execution button
  btnTrace.addEventListener('click', async () => {
    const provider = localStorage.getItem('codetrace_provider') || 'gemini';
    const apiKey = provider === 'gemini' 
      ? (localStorage.getItem('codetrace_gemini_api_key') || localStorage.getItem('codetrace_api_key'))
      : localStorage.getItem('codetrace_groq_api_key');
      
    if (!apiKey) {
      showToast(`Please add your ${provider === 'gemini' ? 'Gemini' : 'Groq'} API key in settings.`, 'warning');
      document.getElementById('settings-modal').style.display = 'flex';
      return;
    }

    const editor = getEditor();
    if (!editor) {
      showToast('Editor not ready.', 'error');
      return;
    }

    const code = editor.getValue().trim();
    if (!code) {
      showToast('Please write some code to trace first.', 'warning');
      return;
    }

    const langSelect = document.getElementById('language-select');
    const language = langSelect.value;
    const model = localStorage.getItem('codetrace_model') || (provider === 'gemini' ? 'gemini-2.0-flash' : 'llama-3.3-70b-versatile');

    // Show loading state
    btnTrace.disabled = true;
    const originalText = btnTrace.innerHTML;
    btnTrace.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> &nbsp; Tracing...';
    
    // Hide empty state and show spinner in visualization pane
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('viz-sections').style.display = 'none';
    
    // Create temporary loading element in visualizer
    const container = document.getElementById('visualizer-container');
    const loader = document.createElement('div');
    loader.id = 'trace-loading';
    loader.className = 'editor-loading';
    loader.innerHTML = `
      <div class="spinner"></div>
      <p style="font-weight:600;letter-spacing:0.02em;">Simulating execution trace...</p>
      <p style="font-size:0.75rem;color:var(--text-muted);max-width:280px;text-align:center;">
        ${provider === 'gemini' ? 'Gemini' : 'Groq'} is tracing control flow, variables, and output step-by-step.
      </p>
    `;
    container.appendChild(loader);

    try {
      showToast(`Contacting ${provider === 'gemini' ? 'Gemini' : 'Groq'} API...`, 'info');
      const traceSteps = await fetchExecutionTrace(code, language, apiKey, provider, model);
      
      // Remove loading element
      const currentLoader = document.getElementById('trace-loading');
      if (currentLoader) currentLoader.remove();

      if (traceSteps && traceSteps.length > 0) {
        showToast(`Trace generated successfully! (${traceSteps.length} steps)`, 'success');
        
        loadTrace(traceSteps);

        // Save to history
        const langSelect2 = document.getElementById('language-select');
        saveTraceToHistory(code, langSelect2.value, traceSteps).catch(err => console.warn('Failed to save to history:', err));
      } else {
        throw new Error('Trace returned zero execution steps.');
      }
    } catch (error) {
      console.error(error);
      const currentLoader = document.getElementById('trace-loading');
      if (currentLoader) currentLoader.remove();
      
      // Render interactive fallback error panel
      const container = document.getElementById('visualizer-container');
      container.innerHTML = `
        <div class="empty-state" style="animation: fade-in 0.3s ease-out; padding-top: 3rem;">
          <div class="empty-icon" style="color:var(--accent-pink); animation: none; opacity:0.9;">⚠️</div>
          <h3 style="color:#f87171;">Simulation Failed</h3>
          <p style="max-width:400px; font-size:0.88rem; margin-bottom:1.5rem; line-height:1.6; color:var(--text-secondary);">
            ${escapeHtml(error.message || 'An unexpected error occurred during execution simulation.')}
          </p>
          <div style="display:flex; gap:0.75rem;">
            <button class="btn btn-ghost" id="btn-error-retry" style="border-color:rgba(248,113,113,0.3); color:#f87171;">🔄 Retry</button>
            <button class="btn btn-ghost" id="btn-error-settings">⚙️ Settings</button>
          </div>
        </div>
      `;
      
      // Bind interactive settings trigger inside error page
      document.getElementById('btn-error-retry').addEventListener('click', () => btnTrace.click());
      document.getElementById('btn-error-settings').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'flex';
      });
      
      showToast('Trace simulation failed.', 'error');
    } finally {
      btnTrace.disabled = false;
      btnTrace.innerHTML = originalText;
    }
  });
}

/**
 * History drawer logic
 */
function initHistory() {
  const drawer = document.getElementById('history-drawer');
  const btnHistory = document.getElementById('btn-history');
  const btnClose = document.getElementById('history-close');
  const btnClear = document.getElementById('btn-clear-history');
  const searchInput = document.getElementById('history-search');
  const listEl = document.getElementById('history-list');

  const openDrawer = async () => {
    drawer.style.display = 'flex';
    await renderHistoryList();
  };
  const closeDrawer = () => { drawer.style.display = 'none'; };

  btnHistory.addEventListener('click', openDrawer);
  btnClose.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });

  btnClear.addEventListener('click', async () => {
    await clearAllTraceHistory();
    await renderHistoryList();
    showToast('History cleared.', 'success');
  });

  searchInput.addEventListener('input', () => {
    renderHistoryList(searchInput.value.trim().toLowerCase());
  });

  async function renderHistoryList(filter = '') {
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
            const editor = getEditor();
            if (editor) editor.setValue(item.code);
            const langSelect = document.getElementById('language-select');
            langSelect.value = item.language;
            setEditorLanguage(item.language);
            loadTrace(item.steps);
            closeDrawer();
            showToast('Trace loaded from history.', 'success');
          }
        });
      });
    } catch (err) {
      console.error('Failed to load history:', err);
      listEl.innerHTML = '<div style="text-align:center;color:#f87171;padding:2rem;">Failed to load history.</div>';
    }
  }
}

/**
 * Examples button — loads sample code for the selected language
 */
function initExamples() {
  const btnExamples = document.getElementById('btn-examples');
  btnExamples.addEventListener('click', () => {
    const langSelect = document.getElementById('language-select');
    const lang = langSelect.value;
    setEditorLanguage(lang);
    showToast(`Loaded ${lang} example code.`, 'success');
  });
}

/**
 * Toast notification system
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

// Make showToast available globally for other modules
window.showToast = showToast;

// Boot
document.addEventListener('DOMContentLoaded', initApp);

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Don't intercept when typing in input/textarea/select
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  // Don't intercept when Monaco editor is focused
  if (document.activeElement?.closest('.monaco-editor')) {
    // Only handle Ctrl+Enter inside Monaco
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('btn-trace').click();
    }
    return;
  }

  switch (e.key) {
    case ' ':
      e.preventDefault();
      togglePlayback();
      break;
    case 'ArrowRight':
      e.preventDefault();
      stepForward();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      stepBackward();
      break;
    case 'Home':
      e.preventDefault();
      jumpToStart();
      break;
    case 'End':
      e.preventDefault();
      jumpToEnd();
      break;
    case 'Enter':
      if (e.ctrlKey) {
        e.preventDefault();
        document.getElementById('btn-trace').click();
      }
      break;
    case 'Escape':
      // Close any open modals/drawers
      document.getElementById('settings-modal').style.display = 'none';
      document.getElementById('history-drawer').style.display = 'none';
      document.getElementById('github-modal').style.display = 'none';
      document.getElementById('github-save-modal').style.display = 'none';
      break;
  }
});

/**
 * GitHub Integration logic
 */
function initGitHub() {
  const btnGithub = document.getElementById('btn-github');
  const modal = document.getElementById('github-modal');
  const btnClose = document.getElementById('github-close');
  const btnCancel = document.getElementById('github-cancel-btn');
  const btnConnect = document.getElementById('github-connect-btn');
  const btnDisconnect = document.getElementById('github-disconnect-btn');
  const tokenInput = document.getElementById('github-token-input');
  
  const connectForm = document.getElementById('github-connect-form');
  const connectedInfo = document.getElementById('github-connected-info');
  const avatarImg = document.getElementById('github-avatar');
  const displayName = document.getElementById('github-display-name');
  const usernameText = document.getElementById('github-username-text');
  const repoLink = document.getElementById('github-repo-link');
  const repoUrl = document.getElementById('github-repo-url');
  
  const btnSaveGithub = document.getElementById('btn-save-github');

  // Save Modal Elements
  const saveModal = document.getElementById('github-save-modal');
  const saveClose = document.getElementById('github-save-close');
  const saveCancel = document.getElementById('github-save-cancel');
  const saveSubmit = document.getElementById('github-save-submit');
  const saveRepoInput = document.getElementById('github-save-repo');
  const saveFilenameInput = document.getElementById('github-save-filename');
  const saveExtensionLabel = document.getElementById('github-save-extension');

  const getLanguageExtension = (lang) => {
    const EXTENSIONS = {
      javascript: '.js',
      typescript: '.ts',
      python:     '.py',
      java:       '.java',
      cpp:        '.cpp',
      c:          '.c',
      csharp:     '.cs',
      go:         '.go',
      rust:       '.rs',
      ruby:       '.rb',
      php:        '.php',
      swift:      '.swift',
      kotlin:     '.kt',
      dart:       '.dart',
      scala:      '.scala',
      r:          '.r',
      bash:       '.sh',
    };
    return EXTENSIONS[lang] || '.txt';
  };

  const updateGitHubUI = () => {
    const token = getGitHubToken();
    const user = getGitHubUser();
    const btnIcon = document.getElementById('github-btn-icon');
    const btnLabel = document.getElementById('github-btn-label');

    if (token && user) {
      // Connected state
      if (btnIcon) btnIcon.innerHTML = `<img src="${user.avatar_url}" style="width:16px;height:16px;border-radius:50%;vertical-align:middle;object-fit:cover;" />`;
      if (btnLabel) btnLabel.textContent = user.login;
      
      connectForm.style.display = 'none';
      connectedInfo.style.display = 'block';
      avatarImg.src = user.avatar_url;
      displayName.textContent = user.name || user.login;
      usernameText.textContent = `@${user.login}`;
      repoLink.textContent = saveRepoInput.value.trim() || REPO_NAME;
      repoUrl.href = `https://github.com/${user.login}/${saveRepoInput.value.trim() || REPO_NAME}`;
      
      btnDisconnect.style.display = 'block';
      btnCancel.textContent = 'Close';
      btnConnect.style.display = 'none';
    } else {
      // Disconnected state
      if (btnIcon) {
        btnIcon.innerHTML = '';
        btnIcon.textContent = '🐙';
      }
      if (btnLabel) btnLabel.textContent = 'GitHub';
      
      connectForm.style.display = 'block';
      connectedInfo.style.display = 'none';
      tokenInput.value = '';
      
      btnDisconnect.style.display = 'none';
      btnCancel.textContent = 'Cancel';
      btnConnect.style.display = 'flex';
    }
  };

  const openModal = () => {
    modal.style.display = 'flex';
    updateGitHubUI();
    if (!getGitHubToken()) {
      tokenInput.focus();
    }
  };
  const closeModal = () => { modal.style.display = 'none'; };

  btnGithub.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  btnConnect.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    if (!token) {
      showToast('Please enter a GitHub Personal Access Token.', 'warning');
      return;
    }

    // Disable inputs
    btnConnect.disabled = true;
    btnCancel.disabled = true;
    tokenInput.disabled = true;
    const originalContent = btnConnect.innerHTML;
    btnConnect.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-color:var(--bg-shell);"></span>&nbsp; Verifying...';

    try {
      showToast('Verifying token with GitHub...', 'info');
      const user = await verifyGitHubToken(token);
      saveGitHubSession(token, user);
      showToast(`Successfully connected as @${user.login}!`, 'success');
      updateGitHubUI();
      // Auto-close modal after success
      setTimeout(closeModal, 800);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Token verification failed.', 'error');
    } finally {
      btnConnect.disabled = false;
      btnCancel.disabled = false;
      tokenInput.disabled = false;
      btnConnect.innerHTML = originalContent;
    }
  });

  btnDisconnect.addEventListener('click', () => {
    clearGitHubSession();
    showToast('Disconnected from GitHub.', 'info');
    updateGitHubUI();
  });

  // Handle Save to GitHub button click -> opens save config modal
  btnSaveGithub.addEventListener('click', () => {
    const token = getGitHubToken();
    const user = getGitHubUser();

    if (!token || !user) {
      showToast('Please connect your GitHub account first.', 'info');
      openModal();
      return;
    }

    const langSelect = document.getElementById('language-select');
    const language = langSelect.value;

    // Open Save Modal and populate extension
    saveExtensionLabel.textContent = getLanguageExtension(language);
    saveFilenameInput.value = '';
    saveModal.style.display = 'flex';
    saveFilenameInput.focus();
  });

  const closeSaveModal = () => { saveModal.style.display = 'none'; };
  saveClose.addEventListener('click', closeSaveModal);
  saveCancel.addEventListener('click', closeSaveModal);
  saveModal.addEventListener('click', (e) => { if (e.target === saveModal) closeSaveModal(); });

  // Handle Save Submit (Push to custom repo & filename)
  saveSubmit.addEventListener('click', async () => {
    const token = getGitHubToken();
    const user = getGitHubUser();
    
    const editor = getEditor();
    if (!editor) {
      showToast('Editor is not ready.', 'error');
      return;
    }

    const code = editor.getValue().trim();
    if (!code) {
      showToast('No code to save.', 'warning');
      return;
    }

    const langSelect = document.getElementById('language-select');
    const language = langSelect.value;
    const steps = getTraceSteps();

    if (!steps || steps.length === 0) {
      showToast('No trace steps to save. Please run a trace first.', 'warning');
      return;
    }

    const repoName = saveRepoInput.value.trim() || 'nitintrace-traces';
    const customFilename = saveFilenameInput.value.trim();

    // Disable inputs
    saveSubmit.disabled = true;
    saveCancel.disabled = true;
    saveRepoInput.disabled = true;
    saveFilenameInput.disabled = true;
    const originalContent = saveSubmit.innerHTML;
    saveSubmit.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-color:var(--bg-shell);"></span>&nbsp; Saving...';

    try {
      showToast('Saving trace to GitHub...', 'info');
      const result = await pushCodeTrace(token, user.login, code, language, steps, repoName, customFilename);
      showToast('Trace saved to GitHub successfully!', 'success');
      
      // Inject success message in console
      const consoleEl = document.getElementById('console-output');
      if (consoleEl) {
        consoleEl.innerHTML += `\n\n<span style="color:var(--accent-cyan); font-weight:600;">🚀 GitHub Sync Success</span>\n<span style="color:var(--text-secondary);">Pushed trace file to repository:</span>\n<span style="color:var(--text-muted);">📂 ${result.filename}</span>\n🔗 <a href="${result.url}" target="_blank" style="color:var(--accent-cyan); text-decoration:underline;">View file on GitHub ↗</a>\n`;
        consoleEl.scrollTop = consoleEl.scrollHeight;
      }
      
      // Close save modal
      setTimeout(closeSaveModal, 600);
      
      // Sync Repo UI details
      repoLink.textContent = repoName;
      repoUrl.href = `https://github.com/${user.login}/${repoName}`;
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save to GitHub.', 'error');
    } finally {
      saveSubmit.disabled = false;
      saveCancel.disabled = false;
      saveRepoInput.disabled = false;
      saveFilenameInput.disabled = false;
      saveSubmit.innerHTML = originalContent;
    }
  });

  // Initial update
  updateGitHubUI();
}

