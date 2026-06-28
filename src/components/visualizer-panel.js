/**
 * N-Trace — Visualizer Panel Component
 *
 * Renders the execution trace details: explanation card, variables table,
 * console output, program output, line preview, and progress bar.
 * Subscribes reactively to state updates: trace.steps, trace.currentIndex, trace.isTracing, trace.error.
 */

import store from '../core/state.js';
import eventBus from '../core/events.js';
import { getEditor } from '../services/editor.js';
import { escapeHtml } from '../utils/helpers.js';

export function initVisualizerPanel(container) {
  const panelHtml = `
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

        <!-- Dynamic Loader screen -->
        <div class="editor-loading" id="trace-loading" style="display:none;">
          <div class="spinner"></div>
          <p style="font-weight:600;letter-spacing:0.02em;">Simulating execution trace...</p>
          <p id="trace-loading-provider-text" style="font-size:0.75rem;color:var(--text-muted);max-width:280px;text-align:center;">
            AI is tracing control flow, variables, and output step-by-step.
          </p>
        </div>

        <!-- Dynamic Error screen -->
        <div class="empty-state" id="trace-error-panel" style="display:none; animation: fade-in 0.3s ease-out; padding-top: 3rem;">
          <div class="empty-icon" style="color:var(--accent-pink); animation: none; opacity:0.9;">⚠️</div>
          <h3 style="color:#f87171;">Simulation Failed</h3>
          <p id="trace-error-message" style="max-width:400px; font-size:0.88rem; margin-bottom:1.5rem; line-height:1.6; color:var(--text-secondary);">
            An unexpected error occurred during execution simulation.
          </p>
          <div style="display:flex; gap:0.75rem;">
            <button class="btn btn-ghost" id="btn-error-retry" style="border-color:rgba(248,113,113,0.3); color:#f87171;">🔄 Retry</button>
            <button class="btn btn-ghost" id="btn-error-settings">⚙️ Settings</button>
          </div>
        </div>

        <!-- Visualization sections (hidden until trace runs) -->
        <div class="viz-sections" id="viz-sections" style="display:none;">
          <!-- Executing line preview -->
          <section class="viz-section viz-exec-line" id="viz-exec-line" style="display:none;">
            <div class="section-label">⚡ Executing Line</div>
            <div class="exec-line-preview" id="exec-line-preview">
              <code id="exec-line-code"></code>
            </div>
          </section>

          <section class="viz-section viz-explanation" id="viz-explanation">
            <div class="section-label">💬 What's happening</div>
            <div class="explanation-content" id="explanation-content"></div>
          </section>

          <section class="viz-section viz-variables" id="viz-variables">
            <div class="section-label">📊 Variables</div>
            <div class="variables-table-container" id="variables-table-container"></div>
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
    </div>
  `;

  // Render
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = panelHtml;
  const panelEl = tempDiv.firstElementChild;
  container.appendChild(panelEl);

  // Cache elements
  const btnSaveGithub = panelEl.querySelector('#btn-save-github');
  const stepCounter = panelEl.querySelector('#step-counter');
  const progressContainer = panelEl.querySelector('#step-progress-container');
  const progressFill = panelEl.querySelector('#step-progress-fill');

  const emptyState = panelEl.querySelector('#empty-state');
  const loadingScreen = panelEl.querySelector('#trace-loading');
  const loadingText = panelEl.querySelector('#trace-loading-provider-text');
  const errorScreen = panelEl.querySelector('#trace-error-panel');
  const errorMessage = panelEl.querySelector('#trace-error-message');
  const btnRetry = panelEl.querySelector('#btn-error-retry');
  const btnErrorSettings = panelEl.querySelector('#btn-error-settings');

  const vizSections = panelEl.querySelector('#viz-sections');
  const execLineSection = panelEl.querySelector('#viz-exec-line');
  const execLineCode = panelEl.querySelector('#exec-line-code');
  const explanationEl = panelEl.querySelector('#explanation-content');
  const variablesContainer = panelEl.querySelector('#variables-table-container');
  const consoleEl = panelEl.querySelector('#console-output');
  const finalOutputEl = panelEl.querySelector('#final-output');

  let lastVariablesState = {};

  // Wire Save to GitHub
  btnSaveGithub.addEventListener('click', () => {
    store.set('ui.githubSaveModalOpen', true);
  });

  // Wire Retry & Settings inside error panel
  btnRetry.addEventListener('click', () => {
    eventBus.emit('trace:retry');
  });

  btnErrorSettings.addEventListener('click', () => {
    store.set('ui.settingsOpen', true);
  });

  // React to loading state
  store.subscribe('trace.isTracing', (isTracing) => {
    if (isTracing) {
      emptyState.style.display = 'none';
      errorScreen.style.display = 'none';
      vizSections.style.display = 'none';

      const provider = store.get('settings.provider') || 'gemini';
      const labels = { gemini: 'Gemini', groq: 'Groq', openai: 'OpenAI', claude: 'Claude' };
      loadingText.textContent = `${labels[provider] || provider} is tracing control flow, variables, and output step-by-step.`;
      loadingScreen.style.display = 'flex';
      btnSaveGithub.style.display = 'none';
    } else {
      loadingScreen.style.display = 'none';
    }
  });

  // React to error state
  store.subscribe('trace.error', (error) => {
    if (error) {
      emptyState.style.display = 'none';
      loadingScreen.style.display = 'none';
      vizSections.style.display = 'none';
      btnSaveGithub.style.display = 'none';

      errorMessage.textContent = error;
      errorScreen.style.display = 'flex';
    } else {
      errorScreen.style.display = 'none';
    }
  });

  // Main UI rendering function when trace steps/index update
  const renderCurrentStep = () => {
    const steps = store.get('trace.steps') || [];
    const index = store.get('trace.currentIndex');

    if (steps.length === 0 || index < 0) {
      // Show empty state if not loading and no error
      if (!store.get('trace.isTracing') && !store.get('trace.error')) {
        emptyState.style.display = 'flex';
        vizSections.style.display = 'none';
        btnSaveGithub.style.display = 'none';
        progressContainer.style.display = 'none';
        stepCounter.textContent = 'Step 0 / 0';
      }
      return;
    }

    const stepData = steps[index];
    if (!stepData) return;

    emptyState.style.display = 'none';
    errorScreen.style.display = 'none';
    loadingScreen.style.display = 'none';
    vizSections.style.display = 'flex';
    btnSaveGithub.style.display = 'inline-flex';

    // 1. Update Step Counter
    stepCounter.textContent = `Step ${index + 1} / ${steps.length}`;

    // 2. Update Step Progress Bar
    progressContainer.style.display = 'block';
    if (progressFill) {
      const pct = steps.length > 1 ? (index / (steps.length - 1)) * 100 : 100;
      progressFill.style.width = `${pct.toFixed(1)}%`;
      const hue = Math.round(180 + (pct / 100) * 120); // 180=cyan, 300=pink
      progressFill.style.background = `hsl(${hue}, 100%, 65%)`;
      progressFill.style.boxShadow = `0 0 8px hsl(${hue}, 100%, 65%)`;
    }

    // 3. Line Preview
    if (stepData.line) {
      try {
        const editor = getEditor();
        if (editor) {
          const model = editor.getModel();
          const lineContent = model.getLineContent(stepData.line).trim();
          if (lineContent) {
            execLineCode.textContent = `Line ${stepData.line}:  ${lineContent}`;
            execLineSection.style.display = 'block';
          } else {
            execLineSection.style.display = 'none';
          }
        }
      } catch {
        execLineSection.style.display = 'none';
      }
    } else {
      execLineSection.style.display = 'none';
    }

    // 4. Explanation Card (fade animation)
    explanationEl.classList.add('explanation-fade-out');
    setTimeout(() => {
      let explanationHTML = escapeHtml(stepData.explanation || '');
      explanationHTML = explanationHTML.replace(/`([^`]+)`/g, '<code>$1</code>');
      explanationEl.innerHTML = explanationHTML;
      explanationEl.classList.remove('explanation-fade-out');
    }, 100);

    // 5. Variables Table
    renderVariables(stepData.variables || {});

    // 6. Console Output
    const consoleText = stepData.console || '';
    consoleEl.innerHTML = escapeHtml(consoleText) + '<span class="console-cursor"></span>';
    consoleEl.scrollTop = consoleEl.scrollHeight;

    // 7. Program Output (from last step)
    const lastStep = steps[steps.length - 1];
    const finalConsole = lastStep?.console || '';
    if (finalConsole.trim()) {
      finalOutputEl.innerHTML = escapeHtml(finalConsole);
    } else {
      finalOutputEl.innerHTML = '<span style="font-size:0.82rem;color:var(--text-muted);font-style:italic;">No console output at end of program.</span>';
    }
  };

  const renderVariables = (variablesObj) => {
    // If first step or trace just restarted, clear comparison state
    const index = store.get('trace.currentIndex');
    if (index === 0) {
      lastVariablesState = {};
    }

    if (Object.keys(variablesObj).length === 0) {
      variablesContainer.innerHTML = `<div class="text-muted" style="font-size:0.85rem;font-style:italic;">No active variables in scope at this step.</div>`;
      lastVariablesState = {};
      return;
    }

    let html = `
      <table class="variables-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Type</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
    `;

    const newCache = {};

    for (const [name, rawVal] of Object.entries(variablesObj)) {
      let valString = '';
      let valType = '';

      // Check if rawVal is the new {value, type} format from parser
      if (rawVal && typeof rawVal === 'object' && 'value' in rawVal && 'type' in rawVal) {
        valString = rawVal.value;
        valType = rawVal.type;
      } else if (rawVal === null || rawVal === undefined) {
        valString = 'null';
        valType = 'null';
      } else if (typeof rawVal === 'object') {
        valString = JSON.stringify(rawVal);
        valType = Array.isArray(rawVal) ? 'Array' : 'Object';
      } else {
        valString = String(rawVal);
        valType = typeof rawVal;
        valType = valType.charAt(0).toUpperCase() + valType.slice(1);
      }

      const prevVal = lastVariablesState[name];
      const isChanged = prevVal !== undefined && prevVal !== valString;
      const isNew = prevVal === undefined;

      let badge = '';
      if (isNew) {
        badge = '<span class="var-badge var-badge-new">NEW</span>';
      } else if (isChanged) {
        badge = '<span class="var-badge var-badge-changed">CHANGED</span>';
      }

      const highlightClass = (isChanged || isNew) ? 'var-changed' : '';

      html += `
        <tr>
          <td class="var-name">${escapeHtml(name)}</td>
          <td class="var-type">${escapeHtml(valType)}</td>
          <td class="var-val ${highlightClass}">${badge}${escapeHtml(valString)}</td>
        </tr>
      `;

      newCache[name] = valString;
    }

    html += `</tbody></table>`;
    variablesContainer.innerHTML = html;

    // Cache current state for the next step's comparison
    lastVariablesState = newCache;
  };

  // Subscribe to changes in steps and current index
  store.subscribe('trace.steps', renderCurrentStep);
  store.subscribe('trace.currentIndex', renderCurrentStep);

  // Subscribe to trace reset
  eventBus.on('trace:reset', () => {
    lastVariablesState = {};
    emptyState.style.display = 'flex';
    vizSections.style.display = 'none';
    btnSaveGithub.style.display = 'none';
    progressContainer.style.display = 'none';
    stepCounter.textContent = 'Step 0 / 0';
  });
}
