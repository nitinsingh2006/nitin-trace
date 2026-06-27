/**
 * NitinTrace — Settings Modal Component
 *
 * Renders settings dialog allowing users to configure AI provider (Gemini or Groq),
 * model preferences, and API keys.
 * Syncs seamlessly with the reactive state store.
 */

import store from '../core/state.js';
import eventBus from '../core/events.js';
import { CONFIG } from '../core/config.js';
import { isValidApiKey } from '../utils/sanitize.js';

export function initSettingsModal(container) {
  const modalHtml = `
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
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
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

          <div class="form-group" id="group-openai-key" style="display:none;">
            <label for="openai-key-input">OpenAI API Key</label>
            <input type="password" id="openai-key-input" class="form-input" placeholder="Paste your OpenAI API key..." />
            <p class="form-hint">Get a key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">OpenAI Platform</a></p>
          </div>

          <div class="form-group" id="group-claude-key" style="display:none;">
            <label for="claude-key-input">Anthropic Claude API Key</label>
            <input type="password" id="claude-key-input" class="form-input" placeholder="Paste your Anthropic API key..." />
            <p class="form-hint">Get a key at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">Anthropic Console</a></p>
          </div>
          
          <div class="form-group">
            <label for="model-select">Model</label>
            <select id="model-select" class="form-input"></select>
          </div>
          
          <div class="form-group">
            <label for="explanation-lang-select">Explanation Language</label>
            <select id="explanation-lang-select" class="form-input">
              <option value="english">English</option>
              <option value="hindi">Hindi / Hinglish</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="settings-cancel">Cancel</button>
          <button class="btn btn-primary" id="settings-save">Save Settings</button>
        </div>
      </div>
    </div>
  `;

  // Render
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  const modalEl = tempDiv.firstElementChild;
  container.appendChild(modalEl);

  // Cache elements
  const providerSelect = modalEl.querySelector('#provider-select');
  const geminiKeyInput = modalEl.querySelector('#gemini-key-input');
  const groqKeyInput = modalEl.querySelector('#groq-key-input');
  const openaiKeyInput = modalEl.querySelector('#openai-key-input');
  const claudeKeyInput = modalEl.querySelector('#claude-key-input');
  const groupGeminiKey = modalEl.querySelector('#group-gemini-key');
  const groupGroqKey = modalEl.querySelector('#group-groq-key');
  const groupOpenaiKey = modalEl.querySelector('#group-openai-key');
  const groupClaudeKey = modalEl.querySelector('#group-claude-key');
  const modelSelect = modalEl.querySelector('#model-select');
  const explanationLangSelect = modalEl.querySelector('#explanation-lang-select');

  const btnClose = modalEl.querySelector('#settings-close');
  const btnCancel = modalEl.querySelector('#settings-cancel');
  const btnSave = modalEl.querySelector('#settings-save');

  // Load current values from state
  const loadFormValues = () => {
    providerSelect.value = store.get('settings.provider') || 'gemini';
    geminiKeyInput.value = store.get('settings.geminiApiKey') || '';
    groqKeyInput.value = store.get('settings.groqApiKey') || '';
    openaiKeyInput.value = store.get('settings.openaiApiKey') || '';
    claudeKeyInput.value = store.get('settings.claudeApiKey') || '';
    explanationLangSelect.value = store.get('settings.explanationLanguage') || 'english';

    updateProviderFields();
  };

  const AVAILABLE_MODELS_MAP = {
    gemini: CONFIG.AI.GEMINI.AVAILABLE_MODELS,
    groq: CONFIG.AI.GROQ.AVAILABLE_MODELS,
    openai: CONFIG.AI.OPENAI.AVAILABLE_MODELS,
    claude: CONFIG.AI.CLAUDE.AVAILABLE_MODELS,
  };

  const DEFAULT_MODEL_MAP = {
    gemini: CONFIG.AI.GEMINI.DEFAULT_MODEL,
    groq: CONFIG.AI.GROQ.DEFAULT_MODEL,
    openai: CONFIG.AI.OPENAI.DEFAULT_MODEL,
    claude: CONFIG.AI.CLAUDE.DEFAULT_MODEL,
  };

  const populateModels = (provider) => {
    modelSelect.innerHTML = '';
    const selectedModel = store.get(`settings.${provider}Model`);
    const availableModels = AVAILABLE_MODELS_MAP[provider] || [];

    availableModels.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.label;
      modelSelect.appendChild(opt);
    });

    const defaultModel = DEFAULT_MODEL_MAP[provider];
    modelSelect.value = selectedModel || defaultModel;
  };

  const updateProviderFields = () => {
    const provider = providerSelect.value;
    groupGeminiKey.style.display = provider === 'gemini' ? 'block' : 'none';
    groupGroqKey.style.display = provider === 'groq' ? 'block' : 'none';
    groupOpenaiKey.style.display = provider === 'openai' ? 'block' : 'none';
    groupClaudeKey.style.display = provider === 'claude' ? 'block' : 'none';
    populateModels(provider);
  };

  providerSelect.addEventListener('change', updateProviderFields);

  // Close handlers
  const closeSettings = () => {
    store.set('ui.settingsOpen', false);
  };

  btnClose.addEventListener('click', closeSettings);
  btnCancel.addEventListener('click', closeSettings);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeSettings();
  });

  const PROVIDER_LABELS = { gemini: 'Gemini', groq: 'Groq', openai: 'OpenAI', claude: 'Claude' };

  // Save handler
  btnSave.addEventListener('click', () => {
    const provider = providerSelect.value;
    const geminiKey = geminiKeyInput.value.trim();
    const groqKey = groqKeyInput.value.trim();
    const openaiKey = openaiKeyInput.value.trim();
    const claudeKey = claudeKeyInput.value.trim();
    const model = modelSelect.value;

    const keyMap = { gemini: geminiKey, groq: groqKey, openai: openaiKey, claude: claudeKey };
    const activeKey = keyMap[provider];
    const providerLabel = PROVIDER_LABELS[provider] || provider;

    // Validate API key format
    if (activeKey && !isValidApiKey(activeKey, provider)) {
      const keyHint = activeKey.length > 8 ? activeKey.slice(0, 4) + '...' + activeKey.slice(-4) : activeKey;
      eventBus.emit('toast:show', {
        message: `${providerLabel} API key format looks invalid: ${keyHint}. Please check and try again.`,
        type: 'error'
      });
      return;
    }

    // Save to state store (which auto-persists to sessionStorage/localStorage)
    store.set('settings.provider', provider);
    store.set('settings.geminiApiKey', geminiKey);
    store.set('settings.groqApiKey', groqKey);
    store.set('settings.openaiApiKey', openaiKey);
    store.set('settings.claudeApiKey', claudeKey);
    store.set(`settings.${provider}Model`, model);
    store.set('settings.explanationLanguage', explanationLangSelect.value);

    closeSettings();

    if (activeKey) {
      eventBus.emit('toast:show', { message: `${providerLabel} configured successfully!`, type: 'success' });
    } else {
      eventBus.emit('toast:show', { message: `Settings saved, but ${providerLabel} API key is empty.`, type: 'warning' });
    }
  });

  const FOCUS_MAP = { gemini: geminiKeyInput, groq: groqKeyInput, openai: openaiKeyInput, claude: claudeKeyInput };

  // Subscribe to settings open state changes
  store.subscribe('ui.settingsOpen', (isOpen) => {
    if (isOpen) {
      loadFormValues();
      modalEl.style.display = 'flex';
      const focusEl = FOCUS_MAP[providerSelect.value];
      if (focusEl) focusEl.focus();
    } else {
      modalEl.style.display = 'none';
    }
  });

  // Check if API keys are missing on boot to guide user
  setTimeout(() => {
    if (store.get('auth.isLoggedIn')) {
      const geminiKey = store.get('settings.geminiApiKey');
      const groqKey = store.get('settings.groqApiKey');
      const openaiKey = store.get('settings.openaiApiKey');
      const claudeKey = store.get('settings.claudeApiKey');
      if (!geminiKey && !groqKey && !openaiKey && !claudeKey) {
        eventBus.emit('toast:show', { message: 'Welcome to NitinTrace! Setup your AI API Key to get started.', type: 'info' });
        store.set('ui.settingsOpen', true);
      }
    }
  }, 1000);
}
