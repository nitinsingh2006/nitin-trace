// Tests the full flow: state -> AI service -> trace -> visualizer
// Mocks the AI adapters
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AI adapters
vi.mock('../../services/ai/gemini-adapter.js', () => ({
  fetchGeminiTrace: vi.fn().mockResolvedValue([
    { step: 1, line: 1, explanation: 'Start', variables: {}, console: '' },
    { step: 2, line: 2, explanation: 'Declare x=1', variables: { x: 1 }, console: '' },
  ]),
}));

import store from '../../core/state.js';
import { loadTrace, stepForward, goToStep } from '../../services/trace.js';
import { saveTraceToHistory, getTraceHistory } from '../../services/history.js';

describe('Full Trace Flow Integration', () => {
  beforeEach(() => {
    store.reset();
  });

  it('should load a trace and update state correctly', () => {
    const steps = [
      { step: 1, line: 1, explanation: 'Start', variables: {}, console: '' },
      { step: 2, line: 2, explanation: 'x = 1', variables: { x: 1 }, console: '' },
    ];

    loadTrace(steps);
    expect(store.get('trace.steps')).toHaveLength(2);
    expect(store.get('trace.currentIndex')).toBe(0);
  });

  it('should step forward through trace steps', () => {
    const steps = [
      { step: 1, line: 1, explanation: 'Start', variables: {}, console: '' },
      { step: 2, line: 2, explanation: 'x = 1', variables: { x: 1 }, console: '' },
      { step: 3, line: 3, explanation: 'Print', variables: { x: 1 }, console: '1' },
    ];
    loadTrace(steps);
    goToStep(0);
    stepForward();
    expect(store.get('trace.currentIndex')).toBe(1);
  });

  it('should save and restore trace from history', async () => {
    const code = 'const x = 1;';
    const steps = [{ step: 1, line: 1, explanation: 'x=1', variables: { x: 1 }, console: '' }];
    await saveTraceToHistory(code, 'javascript', steps);
    const history = await getTraceHistory();

    expect(history).toHaveLength(1);
    expect(history[0].code).toBe(code);
    expect(history[0].language).toBe('javascript');
  });
});
