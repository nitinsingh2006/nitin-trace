/**
 * NitinTrace — Playback & Execution Trace Engine
 *
 * Coordinates trace playback store, step timers, active lines, and speeds.
 * Uses the centralized reactive store store and event bus to communicate.
 */

import store from '../core/state.js';
import eventBus from '../core/events.js';
import { highlightActiveLine, clearActiveLineHighlight } from './editor.js';

let playbackTimer = null;

// Base delay in ms per step at 1x speed
const BASE_STEP_DELAY = 1500;

/**
 * Load a new trace array and start playback
 * @param {Array} newSteps - The steps array from Gemini/Groq API
 */
export function loadTrace(newSteps) {
  stopPlayback();

  const steps = newSteps || [];
  store.set('trace.steps', steps);
  store.set('trace.error', null);

  if (steps.length === 0) {
    store.set('trace.currentIndex', -1);
    clearActiveLineHighlight();
    return;
  }

  // Set to initial step
  goToStep(0);
}

/**
 * Jump to a specific step by index
 * @param {number} index - target step index
 */
export function goToStep(index) {
  const steps = store.get('trace.steps') || [];
  if (steps.length === 0) return;
  if (index < 0 || index >= steps.length) return;

  store.set('trace.currentIndex', index);
  const currentStep = steps[index];

  // Update Monaco Highlight
  if (currentStep && currentStep.line !== undefined) {
    highlightActiveLine(currentStep.line);
  } else {
    clearActiveLineHighlight();
  }
}

/**
 * Start execution play timer
 */
export function startPlayback() {
  const steps = store.get('trace.steps') || [];
  let currentIndex = store.get('trace.currentIndex');

  if (steps.length === 0 || store.get('trace.isPlaying')) return;

  if (currentIndex >= steps.length - 1) {
    // If at the end, restart from step 0
    currentIndex = 0;
    store.set('trace.currentIndex', 0);
  }

  store.set('trace.isPlaying', true);
  runPlaybackLoop();
}

/**
 * Pause execution playback timer
 */
export function pausePlayback() {
  store.set('trace.isPlaying', false);
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
}

/**
 * Toggles play/pause store
 */
export function togglePlayback() {
  if (store.get('trace.isPlaying')) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

/**
 * Stops playback entirely and resets
 */
export function stopPlayback() {
  pausePlayback();
  store.set('trace.isPlaying', false);
  store.set('trace.steps', []);
  store.set('trace.currentIndex', -1);
  clearActiveLineHighlight();
}

/**
 * Internal loop runner for play timeout sequence
 */
function runPlaybackLoop() {
  if (!store.get('trace.isPlaying')) return;

  const speed = store.get('settings.speed') || 1.0;
  const delay = BASE_STEP_DELAY / speed;

  playbackTimer = setTimeout(() => {
    const steps = store.get('trace.steps') || [];
    const currentIndex = store.get('trace.currentIndex');

    if (currentIndex < steps.length - 1) {
      stepForward();
      runPlaybackLoop();
    } else {
      pausePlayback();
      eventBus.emit('toast:show', { message: 'Execution trace complete!', type: 'success' });
    }
  }, delay);
}

/**
 * Move forward 1 step
 */
export function stepForward() {
  const steps = store.get('trace.steps') || [];
  const currentIndex = store.get('trace.currentIndex');
  if (currentIndex < steps.length - 1) {
    goToStep(currentIndex + 1);
  }
}

/**
 * Move backward 1 step
 */
export function stepBackward() {
  const currentIndex = store.get('trace.currentIndex');
  if (currentIndex > 0) {
    goToStep(currentIndex - 1);
  }
}

/**
 * Jump to first step
 */
export function jumpToStart() {
  const steps = store.get('trace.steps') || [];
  if (steps.length > 0) {
    goToStep(0);
  }
}

/**
 * Jump to last step
 */
export function jumpToEnd() {
  const steps = store.get('trace.steps') || [];
  if (steps.length > 0) {
    goToStep(steps.length - 1);
  }
}

/**
 * Get current trace steps
 */
export function getTraceSteps() {
  return store.get('trace.steps') || [];
}

// ─── Event Bus Listeners ──────────────────────────────────────────────────

eventBus.on('playback:toggle', togglePlayback);
eventBus.on('playback:prev', stepBackward);
eventBus.on('playback:next', stepForward);
eventBus.on('playback:restart', jumpToStart);
eventBus.on('playback:end', jumpToEnd);

eventBus.on('history:restore', (steps) => {
  loadTrace(steps);
});

eventBus.on('trace:reset', () => {
  stopPlayback();
});
