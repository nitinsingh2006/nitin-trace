/**
 * Unit tests — trace.js
 *
 * Tests the playback & execution trace engine through the public API.
 * The editor module is mocked because trace.js imports it for line highlighting.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the editor module — Monaco is not available in jsdom
vi.mock('../../services/editor.js', () => ({
  highlightActiveLine: vi.fn(),
  clearActiveLineHighlight: vi.fn(),
}));

import {
  loadTrace,
  goToStep,
  stepForward,
  stepBackward,
  jumpToStart,
  jumpToEnd,
  togglePlayback,
  startPlayback,
  pausePlayback,
  stopPlayback,
} from '../../services/trace.js';
import store from '../../core/state.js';
import { highlightActiveLine, clearActiveLineHighlight } from '../../services/editor.js';

/** Sample steps for testing */
const SAMPLE_STEPS = [
  { step: 1, line: 1, explanation: 'Declare x = 5', variables: { x: 5 }, console: '' },
  { step: 2, line: 2, explanation: 'Declare y = 10', variables: { x: 5, y: 10 }, console: '' },
  { step: 3, line: 3, explanation: 'Print result', variables: { x: 5, y: 10 }, console: '15' },
];

describe('trace.js — loadTrace()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset trace state before each test
    store.reset('trace');
  });

  afterEach(() => {
    // Ensure playback is stopped between tests
    pausePlayback();
  });

  it('loadTrace([]) sets steps to [] and currentIndex to -1', () => {
    loadTrace([]);
    expect(store.get('trace.steps')).toEqual([]);
    expect(store.get('trace.currentIndex')).toBe(-1);
  });

  it('loadTrace([]) calls clearActiveLineHighlight', () => {
    loadTrace([]);
    expect(clearActiveLineHighlight).toHaveBeenCalled();
  });

  it('loadTrace(steps) stores the steps in state', () => {
    loadTrace(SAMPLE_STEPS);
    expect(store.get('trace.steps')).toEqual(SAMPLE_STEPS);
  });

  it('loadTrace(steps) goes to step 0 (currentIndex = 0)', () => {
    loadTrace(SAMPLE_STEPS);
    expect(store.get('trace.currentIndex')).toBe(0);
  });

  it('loadTrace(steps) highlights the first line', () => {
    loadTrace(SAMPLE_STEPS);
    expect(highlightActiveLine).toHaveBeenCalledWith(SAMPLE_STEPS[0].line);
  });

  it('loadTrace(null) treats null as empty and sets currentIndex to -1', () => {
    loadTrace(null);
    expect(store.get('trace.steps')).toEqual([]);
    expect(store.get('trace.currentIndex')).toBe(-1);
  });

  it('loadTrace clears error state', () => {
    store.set('trace.error', 'previous error');
    loadTrace(SAMPLE_STEPS);
    expect(store.get('trace.error')).toBeNull();
  });
});

describe('trace.js — goToStep()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.reset('trace');
    loadTrace(SAMPLE_STEPS);
  });

  afterEach(() => {
    pausePlayback();
  });

  it('goToStep(0) sets currentIndex to 0', () => {
    goToStep(0);
    expect(store.get('trace.currentIndex')).toBe(0);
  });

  it('goToStep(1) sets currentIndex to 1', () => {
    goToStep(1);
    expect(store.get('trace.currentIndex')).toBe(1);
  });

  it('goToStep(2) sets currentIndex to last index', () => {
    goToStep(2);
    expect(store.get('trace.currentIndex')).toBe(2);
  });

  it('goToStep(-1) is a no-op (out of bounds, index unchanged)', () => {
    goToStep(1); // set a known position first
    const before = store.get('trace.currentIndex');
    goToStep(-1);
    expect(store.get('trace.currentIndex')).toBe(before);
  });

  it('goToStep(999) is a no-op (out of bounds, index unchanged)', () => {
    goToStep(1);
    const before = store.get('trace.currentIndex');
    goToStep(999);
    expect(store.get('trace.currentIndex')).toBe(before);
  });

  it('goToStep highlights the corresponding line', () => {
    vi.clearAllMocks();
    goToStep(2);
    expect(highlightActiveLine).toHaveBeenCalledWith(SAMPLE_STEPS[2].line);
  });
});

describe('trace.js — stepForward()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.reset('trace');
    loadTrace(SAMPLE_STEPS);
  });

  afterEach(() => {
    pausePlayback();
  });

  it('stepForward() increments currentIndex by 1', () => {
    goToStep(0);
    stepForward();
    expect(store.get('trace.currentIndex')).toBe(1);
  });

  it('stepForward() at last step stays at last step (no overflow)', () => {
    const lastIndex = SAMPLE_STEPS.length - 1;
    goToStep(lastIndex);
    stepForward();
    expect(store.get('trace.currentIndex')).toBe(lastIndex);
  });

  it('stepForward() advances through all steps sequentially', () => {
    goToStep(0);
    stepForward(); // → 1
    stepForward(); // → 2 (last)
    expect(store.get('trace.currentIndex')).toBe(2);
  });
});

describe('trace.js — stepBackward()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.reset('trace');
    loadTrace(SAMPLE_STEPS);
  });

  afterEach(() => {
    pausePlayback();
  });

  it('stepBackward() decrements currentIndex by 1', () => {
    goToStep(2);
    stepBackward();
    expect(store.get('trace.currentIndex')).toBe(1);
  });

  it('stepBackward() at step 0 stays at 0', () => {
    goToStep(0);
    stepBackward();
    expect(store.get('trace.currentIndex')).toBe(0);
  });

  it('stepBackward() moves back through steps correctly', () => {
    goToStep(2);
    stepBackward(); // → 1
    stepBackward(); // → 0
    expect(store.get('trace.currentIndex')).toBe(0);
  });
});

describe('trace.js — jumpToStart() / jumpToEnd()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.reset('trace');
    loadTrace(SAMPLE_STEPS);
  });

  afterEach(() => {
    pausePlayback();
  });

  it('jumpToStart() goes to index 0', () => {
    goToStep(2);
    jumpToStart();
    expect(store.get('trace.currentIndex')).toBe(0);
  });

  it('jumpToEnd() goes to the last index', () => {
    goToStep(0);
    jumpToEnd();
    expect(store.get('trace.currentIndex')).toBe(SAMPLE_STEPS.length - 1);
  });

  it('jumpToStart() is a no-op when steps are empty', () => {
    store.reset('trace'); // steps = []
    jumpToStart();
    expect(store.get('trace.currentIndex')).toBe(-1); // unchanged from reset
  });

  it('jumpToEnd() is a no-op when steps are empty', () => {
    store.reset('trace');
    jumpToEnd();
    expect(store.get('trace.currentIndex')).toBe(-1);
  });
});

describe('trace.js — togglePlayback()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.reset('trace');
    loadTrace(SAMPLE_STEPS);
    goToStep(0);
  });

  afterEach(() => {
    pausePlayback();
  });

  it('togglePlayback() starts playback when not playing', () => {
    expect(store.get('trace.isPlaying')).toBe(false);
    togglePlayback();
    expect(store.get('trace.isPlaying')).toBe(true);
    pausePlayback(); // clean up
  });

  it('togglePlayback() stops playback when already playing', () => {
    startPlayback();
    expect(store.get('trace.isPlaying')).toBe(true);
    togglePlayback();
    expect(store.get('trace.isPlaying')).toBe(false);
  });

  it('pausePlayback() sets isPlaying to false', () => {
    startPlayback();
    pausePlayback();
    expect(store.get('trace.isPlaying')).toBe(false);
  });

  it('stopPlayback() resets steps and currentIndex', () => {
    stopPlayback();
    expect(store.get('trace.steps')).toEqual([]);
    expect(store.get('trace.currentIndex')).toBe(-1);
    expect(store.get('trace.isPlaying')).toBe(false);
  });
});
