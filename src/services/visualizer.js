/**
 * CodeTrace — Visualizer Panel Service
 * Manages DOM updates, variable state rendering with change animations,
 * console updates, explanation card fades, step counters, and playback state.
 */

import { escapeHtml } from '../utils/helpers';
import { getEditor } from './editor';

let currentStepIndex = -1;
let totalStepsCount = 0;
let lastVariablesState = {};

/**
 * Reset the visualizer to initial state
 */
export function resetVisualizer() {
  currentStepIndex = -1;
  totalStepsCount = 0;
  lastVariablesState = {};
  
  // Reset DOM
  document.getElementById('empty-state').style.display = 'flex';
  document.getElementById('viz-sections').style.display = 'none';
  document.getElementById('step-counter').textContent = 'Step 0 / 0';
  document.getElementById('explanation-content').innerHTML = '';
  document.getElementById('variables-table-container').innerHTML = '';
  document.getElementById('console-output').innerHTML = '<span class="console-cursor"></span>';
  document.getElementById('final-output').innerHTML = '<span style="font-size:0.82rem;color:var(--text-muted);font-style:italic;">Run a trace to see program output.</span>';

  // Reset progress bar
  const progressContainer = document.getElementById('step-progress-container');
  const progressFill = document.getElementById('step-progress-fill');
  if (progressContainer) progressContainer.style.display = 'none';
  if (progressFill) progressFill.style.width = '0%';

  // Hide executing line
  const execLine = document.getElementById('viz-exec-line');
  if (execLine) execLine.style.display = 'none';

  // Hide GitHub save button
  const btnSaveGithub = document.getElementById('btn-save-github');
  if (btnSaveGithub) btnSaveGithub.style.display = 'none';

  updatePlaybackButtons(false, false, false, false, false);
}

/**
 * Update the visualizer DOM for a specific step
 * @param {Object} stepData - The execution step data
 * @param {number} index - Index of the current step
 * @param {number} totalSteps - Total number of steps
 */
export function renderStep(stepData, index, totalSteps) {
  currentStepIndex = index;
  totalStepsCount = totalSteps;

  // Toggle visibility of empty state and content sections
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('viz-sections').style.display = 'flex';

  // Show GitHub save button
  const btnSaveGithub = document.getElementById('btn-save-github');
  if (btnSaveGithub) btnSaveGithub.style.display = 'inline-flex';

  // 1. Update Step Counter
  document.getElementById('step-counter').textContent = `Step ${index + 1} / ${totalSteps}`;

  // 2. Update Step Progress Bar
  const progressContainer = document.getElementById('step-progress-container');
  const progressFill = document.getElementById('step-progress-fill');
  if (progressContainer) progressContainer.style.display = 'block';
  if (progressFill) {
    const pct = totalSteps > 1 ? (index / (totalSteps - 1)) * 100 : 100;
    progressFill.style.width = `${pct.toFixed(1)}%`;
    // Color shifts from cyan → purple → pink as you progress
    const hue = Math.round(180 + (pct / 100) * 120); // 180=cyan, 300=pink
    progressFill.style.background = `hsl(${hue}, 100%, 65%)`;
    progressFill.style.boxShadow = `0 0 8px hsl(${hue}, 100%, 65%)`;
  }

  // 3. Show Executing Line Code Preview (student-friendly)
  const execLineSection = document.getElementById('viz-exec-line');
  const execLineCode = document.getElementById('exec-line-code');
  if (execLineSection && execLineCode && stepData.line) {
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
    } catch(e) {
      execLineSection.style.display = 'none';
    }
  } else if (execLineSection) {
    execLineSection.style.display = 'none';
  }

  // 4. Render AI Explanation Card with fade-in/slide-in transition
  const explanationEl = document.getElementById('explanation-content');
  explanationEl.classList.add('explanation-fade-out');
  setTimeout(() => {
    // Format code blocks in explanations if any
    let explanationHTML = escapeHtml(stepData.explanation);
    // Convert `code` to <code>code</code>
    explanationHTML = explanationHTML.replace(/`([^`]+)`/g, '<code>$1</code>');
    explanationEl.innerHTML = explanationHTML;
    explanationEl.classList.remove('explanation-fade-out');
  }, 100);

  // 5. Render Variables Table with change-flash highlight
  renderVariables(stepData.variables || {});

  // 6. Render Console Output
  const consoleEl = document.getElementById('console-output');
  const consoleText = stepData.console || '';
  consoleEl.innerHTML = escapeHtml(consoleText) + '<span class="console-cursor"></span>';
  // Scroll console to bottom
  consoleEl.scrollTop = consoleEl.scrollHeight;

  // 7. Update Playback Button Disabled states
  const hasPrev = index > 0;
  const hasNext = index < totalSteps - 1;
  updatePlaybackButtons(true, hasPrev, true, hasNext, true);
}

/**
 * Renders the variables table, comparing values with previous step to trigger animation
 */
function renderVariables(variablesObj) {
  const container = document.getElementById('variables-table-container');
  
  if (Object.keys(variablesObj).length === 0) {
    container.innerHTML = `<div class="text-muted" style="font-size:0.85rem;font-style:italic;">No active variables in scope at this step.</div>`;
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

  for (const [name, rawVal] of Object.entries(variablesObj)) {
    // Determine visual value and type
    let valString = '';
    let valType = '';

    if (rawVal === null || rawVal === undefined) {
      valString = 'null';
      valType = 'null';
    } else if (typeof rawVal === 'object') {
      valString = JSON.stringify(rawVal);
      valType = Array.isArray(rawVal) ? 'Array' : 'Object';
    } else {
      valString = String(rawVal);
      valType = typeof rawVal;
      // Capitalize type
      valType = valType.charAt(0).toUpperCase() + valType.slice(1);
    }

    const prevVal = lastVariablesState[name];
    const isChanged = prevVal !== undefined && prevVal !== valString;
    const isNew = prevVal === undefined;

    // Build badge for NEW or CHANGED variables (student-friendly)
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

    // Cache current string representation for next step comparison
    lastVariablesState[name] = valString;
  }

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

/**
 * Configure states of control buttons
 */
export function updatePlaybackButtons(playPauseEnabled, stepBackEnabled, restartEnabled, stepForwardEnabled, endEnabled) {
  document.getElementById('btn-play-pause').disabled = !playPauseEnabled;
  document.getElementById('btn-step-back').disabled = !stepBackEnabled;
  document.getElementById('btn-restart').disabled = !restartEnabled;
  document.getElementById('btn-step-forward').disabled = !stepForwardEnabled;
  document.getElementById('btn-end').disabled = !endEnabled;
}

/**
 * Toggle the play/pause button icon state
 * @param {boolean} isPlaying - Playing state status
 */
export function setPlayIconState(isPlaying) {
  const iconEl = document.getElementById('play-pause-icon');
  iconEl.textContent = isPlaying ? '⏸' : '▶';
}

/**
 * Set the complete final program output (from the last trace step).
 * This is always visible regardless of the current playback step.
 * @param {string} text - The full accumulated console output from the last step.
 */
export function setFinalOutput(text) {
  const el = document.getElementById('final-output');
  if (!el) return;
  if (text && text.trim()) {
    el.innerHTML = escapeHtml(text) + '<span class="console-cursor"></span>';
  } else {
    el.innerHTML = '<span style="font-size:0.82rem;color:var(--text-muted);font-style:italic;">No console output produced by this program.</span>';
  }
}
