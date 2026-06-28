/**
 * N-Trace — Playback Bar Component
 *
 * Renders playback control buttons (restart, step back, play/pause, step forward, end)
 * and speed controls slider.
 * Reactively subscribes to state store (trace.steps, trace.currentIndex, trace.isPlaying, settings.speed)
 * to update disabled button states and icon displays.
 */

import store from '../core/state.js';
import eventBus from '../core/events.js';

export function initPlaybackBar(container) {
  const barHtml = `
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
  `;

  // Render
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = barHtml;
  const barEl = tempDiv.firstElementChild;
  container.appendChild(barEl);

  // Cache elements
  const btnRestart = barEl.querySelector('#btn-restart');
  const btnStepBack = barEl.querySelector('#btn-step-back');
  const btnPlayPause = barEl.querySelector('#btn-play-pause');
  const playPauseIcon = barEl.querySelector('#play-pause-icon');
  const btnStepForward = barEl.querySelector('#btn-step-forward');
  const btnEnd = barEl.querySelector('#btn-end');
  const speedSlider = barEl.querySelector('#speed-slider');
  const speedValue = barEl.querySelector('#speed-value');

  // Load initial speed
  const initialSpeed = store.get('settings.speed') || 1;
  speedSlider.value = initialSpeed;
  speedValue.textContent = `${initialSpeed}x`;

  // Wire up button click handlers
  btnPlayPause.addEventListener('click', () => eventBus.emit('playback:toggle'));
  btnStepBack.addEventListener('click', () => eventBus.emit('playback:prev'));
  btnStepForward.addEventListener('click', () => eventBus.emit('playback:next'));
  btnRestart.addEventListener('click', () => eventBus.emit('playback:restart'));
  btnEnd.addEventListener('click', () => eventBus.emit('playback:end'));

  // Wire up speed slider input listener
  speedSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    store.set('settings.speed', val);
  });

  // Keep speed slider and display in sync with state
  store.subscribe('settings.speed', (val) => {
    if (parseFloat(speedSlider.value) !== val) {
      speedSlider.value = val;
    }
    speedValue.textContent = `${val}x`;
  });

  // Reactive subscription to playback state to update buttons
  const updatePlaybackButtons = () => {
    const steps = store.get('trace.steps') || [];
    const index = store.get('trace.currentIndex');
    const isPlaying = store.get('trace.isPlaying');

    const hasSteps = steps.length > 0;
    const hasPrev = index > 0;
    const hasNext = index < steps.length - 1;

    // Disabled states
    btnRestart.disabled = !hasSteps;
    btnEnd.disabled = !hasSteps;
    btnPlayPause.disabled = !hasSteps;
    btnStepBack.disabled = !hasSteps || !hasPrev;
    btnStepForward.disabled = !hasSteps || !hasNext;

    // Play/Pause icon
    playPauseIcon.textContent = isPlaying ? '⏸' : '▶';
  };

  store.subscribe('trace.steps', updatePlaybackButtons);
  store.subscribe('trace.currentIndex', updatePlaybackButtons);
  store.subscribe('trace.isPlaying', updatePlaybackButtons);

  // Initial state run
  updatePlaybackButtons();
}
