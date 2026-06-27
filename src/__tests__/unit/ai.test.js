/**
 * Unit tests — AI service orchestrator (src/services/ai/index.js)
 *
 * Mocks:
 *  - @core/state.js         → returns controlled provider / apiKey / model values
 *  - gemini-adapter.js      → returns canned steps without real HTTP
 *  - groq-adapter.js        → returns canned steps without real HTTP
 *
 * We use the alias path (@core/state.js) in vi.mock because that is what
 * the module under test imports. Vitest resolves aliases from vite.config.js.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Adapter mocks (must be before import of index.js) ──────────────────────
vi.mock('../../services/ai/gemini-adapter.js', () => ({
  fetchGeminiTrace: vi.fn().mockResolvedValue([
    { step: 1, line: 1, explanation: 'Assign x = 5', variables: { x: 5 }, console: '' },
    { step: 2, line: 2, explanation: 'Print x', variables: { x: 5 }, console: '5' },
  ]),
}));

vi.mock('../../services/ai/groq-adapter.js', () => ({
  fetchGroqTrace: vi.fn().mockResolvedValue([
    { step: 1, line: 1, explanation: 'Assign x = 5', variables: { x: 5 }, console: '' },
    { step: 2, line: 2, explanation: 'Print x', variables: { x: 5 }, console: '5' },
  ]),
}));

vi.mock('../../services/ai/openai-adapter.js', () => ({
  fetchOpenaiTrace: vi.fn(),
}));

vi.mock('../../services/ai/claude-adapter.js', () => ({
  fetchClaudeTrace: vi.fn(),
}));

const mockSteps = [
  { step: 1, line: 1, explanation: 'Assign x = 5', variables: { x: 5 }, console: '' },
  { step: 2, line: 2, explanation: 'Print x', variables: { x: 5 }, console: '5' },
];

// ── State mock — controls what provider/apiKey/model are "configured" ───────
vi.mock('@core/state.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    subscribe: vi.fn(),
  },
}));

// ── Imports (after mocks are registered) ────────────────────────────────────
import { fetchExecutionTrace, cancelTrace } from '../../services/ai/index.js';
import { fetchGeminiTrace } from '../../services/ai/gemini-adapter.js';
import { fetchGroqTrace } from '../../services/ai/groq-adapter.js';
import store from '@core/state.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Configure the mocked state.get to return values based on path lookups.
 */
function configureState({ provider = 'gemini', geminiKey = '', groqKey = '', geminiModel = 'gemini-2.0-flash', groqModel = 'llama-3.3-70b-versatile' } = {}) {
  store.get.mockImplementation((path) => {
    const map = {
      'settings.provider':     provider,
      'settings.geminiApiKey': geminiKey,
      'settings.groqApiKey':   groqKey,
      'settings.geminiModel':  geminiModel,
      'settings.groqModel':    groqModel,
    };
    return map[path] ?? null;
  });
}

describe('fetchExecutionTrace() — provider routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cancelTrace();
  });

  it('calls fetchGeminiTrace when provider is gemini', async () => {
    configureState({ provider: 'gemini', geminiKey: 'AIzaSyTestKey12345678901234567890' });

    const steps = await fetchExecutionTrace('const x = 5;', 'javascript');

    expect(fetchGeminiTrace).toHaveBeenCalledOnce();
    expect(fetchGroqTrace).not.toHaveBeenCalled();
    expect(steps).toEqual(mockSteps);
  });

  it('calls fetchGroqTrace when provider is groq', async () => {
    configureState({ provider: 'groq', groqKey: 'gsk_TestGroqKey1234567890abcdef' });

    const steps = await fetchExecutionTrace('x = 1', 'python');

    expect(fetchGroqTrace).toHaveBeenCalledOnce();
    expect(fetchGeminiTrace).not.toHaveBeenCalled();
    expect(steps).toEqual(mockSteps);
  });

  it('passes code and language to the adapter', async () => {
    configureState({ provider: 'gemini', geminiKey: 'AIzaSyTestKey12345678901234567890' });

    await fetchExecutionTrace('let a = 42;', 'typescript');

    expect(fetchGeminiTrace).toHaveBeenCalledWith(
      'let a = 42;',
      'typescript',
      'AIzaSyTestKey12345678901234567890',
      'gemini-2.0-flash',
      expect.any(AbortSignal),
    );
  });

  it('passes groq-specific options to the groq adapter', async () => {
    configureState({ provider: 'groq', groqKey: 'gsk_TestGroqKey1234567890abcdef', groqModel: 'llama-3.1-70b-versatile' });

    await fetchExecutionTrace('print("hello")', 'python');

    expect(fetchGroqTrace).toHaveBeenCalledWith(
      'print("hello")',
      'python',
      'gsk_TestGroqKey1234567890abcdef',
      'llama-3.1-70b-versatile',
      expect.any(AbortSignal),
    );
  });

  it('options.provider overrides state provider', async () => {
    // State says gemini, but options says groq
    configureState({ provider: 'gemini', geminiKey: 'AIzaSyKey12345678901234567890xxx', groqKey: 'gsk_override12345678901234567890' });

    await fetchExecutionTrace('x = 1', 'python', {
      provider: 'groq',
      apiKey: 'gsk_override12345678901234567890',
      model: 'llama-3.3-70b-versatile',
    });

    expect(fetchGroqTrace).toHaveBeenCalledOnce();
    expect(fetchGeminiTrace).not.toHaveBeenCalled();
  });

  it('options.apiKey overrides state api key', async () => {
    configureState({ provider: 'gemini', geminiKey: '' }); // no key in state

    const overrideKey = 'AIzaSyOverrideKey1234567890xyz';
    await fetchExecutionTrace('x = 1', 'js', {
      provider: 'gemini',
      apiKey: overrideKey,
      model: 'gemini-2.0-flash',
    });

    expect(fetchGeminiTrace).toHaveBeenCalledWith(
      'x = 1',
      'js',
      overrideKey,
      'gemini-2.0-flash',
      expect.any(AbortSignal),
    );
  });
});

describe('fetchExecutionTrace() — missing API key throws', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws a user-friendly error when Gemini key is missing', async () => {
    configureState({ provider: 'gemini', geminiKey: '' });

    await expect(
      fetchExecutionTrace('const x = 1;', 'javascript'),
    ).rejects.toThrow(/Gemini API key is missing/i);
  });

  it('throws a user-friendly error when Groq key is missing', async () => {
    configureState({ provider: 'groq', groqKey: '' });

    await expect(
      fetchExecutionTrace('x = 1', 'python'),
    ).rejects.toThrow(/Groq API key is missing/i);
  });

  it('throws for unsupported provider', async () => {
    // Bypass key check by providing apiKey directly
    await expect(
      fetchExecutionTrace('x = 1', 'python', {
        provider: 'unsupported-provider',
        apiKey: 'some-key',
        model: 'some-model',
      }),
    ).rejects.toThrow(/Unsupported AI provider/i);
  });
});

describe('cancelTrace()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aborts an in-flight request', async () => {
    configureState({ provider: 'gemini', geminiKey: 'AIzaSyTestKey12345678901234567890' });

    // Make the adapter capture the signal so we can inspect it
    let capturedSignal;
    fetchGeminiTrace.mockImplementation((_code, _lang, _key, _model, signal) => {
      capturedSignal = signal;
      // Return a promise that resolves after a delay
      return new Promise(resolve => { setTimeout(() => resolve(mockSteps), 500); });
    });

    // Start the trace (don't await — we want to cancel it)
    const tracePromise = fetchExecutionTrace('const x = 1;', 'javascript');

    // Cancel immediately
    cancelTrace();

    // The signal should be aborted
    expect(capturedSignal?.aborted).toBe(true);

    // Clean up — the promise might resolve or reject depending on the adapter mock
    await tracePromise.catch(() => {});
  });

  it('cancelTrace() is safe to call when no request is in flight', () => {
    expect(() => cancelTrace()).not.toThrow();
  });
});

describe('fetchExecutionTrace() — adapter errors bubble up', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('re-throws errors from the gemini adapter', async () => {
    configureState({ provider: 'gemini', geminiKey: 'AIzaSyTestKey12345678901234567890' });
    fetchGeminiTrace.mockRejectedValueOnce(new Error('Rate limit exceeded'));

    await expect(
      fetchExecutionTrace('x = 1', 'js'),
    ).rejects.toThrow('Rate limit exceeded');
  });

  it('re-throws errors from the groq adapter', async () => {
    configureState({ provider: 'groq', groqKey: 'gsk_TestGroqKey12345678901234567890x' });
    fetchGroqTrace.mockRejectedValueOnce(new Error('Invalid Groq API key'));

    await expect(
      fetchExecutionTrace('x = 1', 'python'),
    ).rejects.toThrow('Invalid Groq API key');
  });
});
