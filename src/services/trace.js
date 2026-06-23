/**
 * CodeTrace — Playback & Execution Trace Engine
 * Coordinates state, timers, speed, active lines, and visualization updates.
 */

import { highlightActiveLine, clearActiveLineHighlight } from './editor';
import { renderStep, setPlayIconState, resetVisualizer, setFinalOutput } from './visualizer';

let steps = [];
let currentIndex = -1;
let isPlaying = false;
let playbackTimer = null;
let speed = 1.0; // speed multiplier (0.5x to 3.0x)

// Base delay in ms per step at 1x speed
const BASE_STEP_DELAY = 2000;

/**
 * Load a new trace history array and start playback
 * @param {Array} newSteps - The steps array from Gemini API
 */
export function loadTrace(newSteps) {
  stopPlayback();
  steps = newSteps || [];
  
  if (steps.length === 0) {
    resetVisualizer();
    clearActiveLineHighlight();
    return;
  }

  // Always show the complete program output from the last step
  const lastStep = steps[steps.length - 1];
  setFinalOutput(lastStep?.console || '');

  currentIndex = 0;
  goToStep(0);
}

/**
 * Jump to a specific step by index
 * @param {number} index - target step index
 */
export function goToStep(index) {
  if (steps.length === 0) return;
  if (index < 0 || index >= steps.length) return;

  currentIndex = index;
  const currentStep = steps[currentIndex];

  // Update Monaco Highlight
  if (currentStep.line !== undefined) {
    highlightActiveLine(currentStep.line);
  } else {
    clearActiveLineHighlight();
  }

  // Render variables, explanations, console outputs
  renderStep(currentStep, currentIndex, steps.length);
}

/**
 * Start execution play timer
 */
export function startPlayback() {
  if (steps.length === 0 || isPlaying) return;
  if (currentIndex >= steps.length - 1) {
    // If at the end, restart from step 0
    currentIndex = 0;
  }

  isPlaying = true;
  setPlayIconState(true);
  
  runPlaybackLoop();
}

/**
 * Pause execution playback timer
 */
export function pausePlayback() {
  isPlaying = false;
  setPlayIconState(false);
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
}

/**
 * Toggles play/pause state
 */
export function togglePlayback() {
  if (isPlaying) {
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
  steps = [];
  currentIndex = -1;
}

/**
 * Internal loop runner for play timeout sequence
 */
function runPlaybackLoop() {
  if (!isPlaying) return;

  const delay = BASE_STEP_DELAY / speed;

  playbackTimer = setTimeout(() => {
    if (currentIndex < steps.length - 1) {
      stepForward();
      runPlaybackLoop();
    } else {
      pausePlayback();
      window.showToast('Execution trace complete!', 'success');
    }
  }, delay);
}

/**
 * Move forward 1 step
 */
export function stepForward() {
  if (currentIndex < steps.length - 1) {
    goToStep(currentIndex + 1);
  }
}

/**
 * Move backward 1 step
 */
export function stepBackward() {
  if (currentIndex > 0) {
    goToStep(currentIndex - 1);
  }
}

/**
 * Jump to first step
 */
export function jumpToStart() {
  if (steps.length > 0) {
    goToStep(0);
  }
}

/**
 * Jump to last step
 */
export function jumpToEnd() {
  if (steps.length > 0) {
    goToStep(steps.length - 1);
  }
}

/**
 * Update the playback speed and dynamically adjust active timer
 * @param {number} newSpeed - speed multiplier (e.g. 0.5, 1.5, 3.0)
 */
export function setPlaybackSpeed(newSpeed) {
  speed = parseFloat(newSpeed) || 1.0;
  if (isPlaying) {
    // Refresh timer immediately with new speed
    if (playbackTimer) {
      clearTimeout(playbackTimer);
    }
    runPlaybackLoop();
  }
}

/**
 * Check if the engine is currently loaded with trace steps
 */
export function hasTraceLoaded() {
  return steps.length > 0;
}

/**
 * Check if playback is active
 */
export function isCurrentlyPlaying() {
  return isPlaying;
}

/**
 * Get current trace steps
 */
export function getTraceSteps() {
  return steps;
}

