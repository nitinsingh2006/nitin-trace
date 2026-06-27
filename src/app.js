/**
 * N-Trace — App Orchestrator
 *
 * Initialized from main.js entry point.
 * Mounts all components, handles keyboard shortcuts, and orchestrates the AI trace logic.
 *
 * @module app
 */

import store from './core/state.js';
import eventBus, { EVENTS } from './core/events.js';
import { fetchExecutionTrace } from './services/ai/index.js';
import { loadTrace } from './services/trace.js';
import { saveTraceToHistory } from './services/history.js';
import { getEditor } from './services/editor.js';
import { LANGUAGES } from './utils/constants.js';

// Components
import { initHeader } from './components/header.js';
import { initEditorPanel } from './components/editor-panel.js';
import { initVisualizerPanel } from './components/visualizer-panel.js';
import { initPlaybackBar } from './components/playback-bar.js';
import { initFooter } from './components/footer.js';
import { initKeyboardHelp } from './components/keyboard-help.js';
import { initFAB } from './components/fab.js';
import { initOnboarding } from './components/onboarding.js';
import './components/toast.js'; // Registers event bus listeners

/**
 * Initialize the application shell and mount all subcomponents.
 */
export function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Render core layout structures
  appContainer.innerHTML = `
    <div class="app-shell">
      <div id="header-mount"></div>
      <main class="app-main" id="app-main">
        <div id="editor-mount" style="display: contents;"></div>
        <div id="visualizer-mount" style="display: contents;"></div>
      </main>
    </div>
    <div id="modals-mount"></div>
  `;

  // Cache mount targets
  const headerMount = appContainer.querySelector('#header-mount');
  const appMain = appContainer.querySelector('#app-main');
  const editorMount = appContainer.querySelector('#editor-mount');
  const visualizerMount = appContainer.querySelector('#visualizer-mount');
  const modalsMount = appContainer.querySelector('#modals-mount');

  // Mount components
  initHeader(headerMount);
  initEditorPanel(editorMount);
  initVisualizerPanel(visualizerMount);

  // Mount PlaybackBar inside visualizer panel after it is rendered in DOM
  const panelVisualizer = appMain.querySelector('#panel-visualizer');
  if (panelVisualizer) {
    initPlaybackBar(panelVisualizer);
  }

  // Lazy load modals to keep the initial JS bundle small
  const loadModals = async () => {
    const [
      { initSettingsModal },
      { initGitHubModals },
      { initHistoryDrawer },
      { initAuthModal }
    ] = await Promise.all([
      import('./components/settings-modal.js'),
      import('./components/github-modal.js'),
      import('./components/history-drawer.js'),
      import('./components/auth-modal.js')
    ]);
    initSettingsModal(modalsMount);
    initGitHubModals(modalsMount);
    initHistoryDrawer(modalsMount);
    initAuthModal(modalsMount);
  };

  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => loadModals());
  } else {
    setTimeout(loadModals, 100);
  }

  // Render footer at the bottom of the app shell
  const appShell = appContainer.querySelector('.app-shell');
  if (appShell) {
    initFooter(appShell);
  }

  // Mount FAB for mobile trace execution
  initFAB(appContainer);

  // Start onboarding tour for first-time visitors
  initOnboarding();

  // Initialize keyboard shortcuts help panel
  initKeyboardHelp();

  // Initialize keyboard shortcuts
  initKeyboardShortcuts();
}

/**
 * Global keyboard shortcuts
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Escape key should always close modals/drawers, even if an input field is focused
    if (e.key === 'Escape') {
      store.set('ui.settingsOpen', false);
      store.set('ui.githubModalOpen', false);
      store.set('ui.githubSaveModalOpen', false);
      store.set('ui.historyOpen', false);
      store.set('ui.modalOpen', null);
      return;
    }

    // Don't intercept when typing in input/textarea/select
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // Don't intercept when Monaco editor is focused
    if (document.activeElement?.closest('.monaco-editor')) {
      // Only handle Ctrl+Enter inside Monaco
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        eventBus.emit(EVENTS.KEYBOARD_SHORTCUT, { key: 'trace', originalEvent: e });
      }
      return;
    }

    switch (e.key) {
      case ' ':
        e.preventDefault();
        eventBus.emit(EVENTS.TRACE_PLAY);
        break;
      case 'ArrowLeft':
        eventBus.emit(EVENTS.KEYBOARD_SHORTCUT, { key: 'prevStep', originalEvent: e });
        break;
      case 'ArrowRight':
        eventBus.emit(EVENTS.KEYBOARD_SHORTCUT, { key: 'nextStep', originalEvent: e });
        break;
      case 'Home':
        eventBus.emit(EVENTS.KEYBOARD_SHORTCUT, { key: 'firstStep', originalEvent: e });
        break;
      case 'End':
        e.preventDefault();
        eventBus.emit(EVENTS.KEYBOARD_SHORTCUT, { key: 'lastStep', originalEvent: e });
        break;
      case 'Enter':
        if (e.ctrlKey) {
          e.preventDefault();
          eventBus.emit(EVENTS.KEYBOARD_SHORTCUT, { key: 'trace', originalEvent: e });
        }
        break;
    }
  });
}

// ─── AI Trace Request Orchestration ──────────────────────────────────────

const PROVIDER_API_KEY_MAP = {
  gemini: 'settings.geminiApiKey',
  groq: 'settings.groqApiKey',
  openai: 'settings.openaiApiKey',
  claude: 'settings.claudeApiKey',
};

const PROVIDER_LABELS = { gemini: 'Gemini', groq: 'Groq', openai: 'OpenAI', claude: 'Claude' };

eventBus.on(EVENTS.TRACE_START, async ({ code, language }) => {
  const provider = store.get('settings.provider') || 'gemini';
  const apiKey = store.get(PROVIDER_API_KEY_MAP[provider]);

  if (!apiKey) {
    eventBus.emit(EVENTS.UI_TOAST_SHOW, {
      message: 'Please add your AI API key in Settings.',
      type: 'warning'
    });
    store.set('ui.modalOpen', 'settings');
    return;
  }

  store.set('trace.isTracing', true);
  store.set('trace.error', null);

  try {
    const providerLabel = PROVIDER_LABELS[provider] || provider;
    eventBus.emit(EVENTS.UI_TOAST_SHOW, {
      message: `Contacting ${providerLabel} API...`,
      type: 'info'
    });

    const traceSteps = await fetchExecutionTrace(code, language, apiKey);

    if (traceSteps && traceSteps.length > 0) {
      eventBus.emit(EVENTS.UI_TOAST_SHOW, {
        message: `Trace generated successfully! (${traceSteps.length} steps)`,
        type: 'success'
      });

      loadTrace(traceSteps);
      eventBus.emit(EVENTS.TRACE_COMPLETE, { steps: traceSteps });

      // Save to history
      saveTraceToHistory(code, language, traceSteps)
        .catch(err => console.warn('Failed to save to history:', err));
    } else {
      throw new Error('Trace returned zero execution steps.');
    }
  } catch (error) {
    console.error(error);
    const errMsg = error.message || 'An unexpected error occurred during execution simulation.';
    store.set('trace.error', errMsg);
    eventBus.emit(EVENTS.TRACE_ERROR, { message: errMsg });
  } finally {
    store.set('trace.isTracing', false);
  }
});

// Trace Retry
eventBus.on('trace:retry', () => {
  const editor = getEditor();
  if (editor) {
    const code = editor.getValue().trim();
    const language = store.get('editor.language');
    if (code) {
      eventBus.emit(EVENTS.TRACE_START, { code, language });
    }
  }
});

// Load examples
eventBus.on('ui:load-example', () => {
  const language = store.get('editor.language') || 'javascript';
  const sample = LANGUAGES[language]?.sample || '';
  eventBus.emit(EVENTS.EDITOR_CODE_CHANGE, { code: sample, language });
  eventBus.emit(EVENTS.UI_TOAST_SHOW, {
    message: `Loaded ${language} example code.`,
    type: 'success'
  });
  store.set('trace.steps', []);
  store.set('trace.currentIndex', -1);
});
