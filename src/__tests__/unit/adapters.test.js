import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock config to avoid alias resolution issues in test environment
vi.mock('@core/config.js', () => ({
  CONFIG: {
    AI: {
      GEMINI: {
        ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
        DEFAULT_MODEL: 'gemini-2.0-flash',
        AVAILABLE_MODELS: [],
        MAX_RETRIES: 1,
        RETRY_DELAY_MS: 100,
      },
      GROQ: {
        ENDPOINT: 'https://api.groq.com/openai/v1/chat/completions',
        DEFAULT_MODEL: 'llama-3.3-70b-versatile',
        AVAILABLE_MODELS: [],
        MAX_RETRIES: 1,
        RETRY_DELAY_MS: 100,
      },
      OPENAI: {
        ENDPOINT: 'https://api.openai.com/v1/chat/completions',
        DEFAULT_MODEL: 'gpt-4o',
        AVAILABLE_MODELS: [],
        MAX_RETRIES: 1,
        RETRY_DELAY_MS: 100,
      },
      CLAUDE: {
        ENDPOINT: 'https://api.anthropic.com/v1/messages',
        DEFAULT_MODEL: 'claude-sonnet-4-20250514',
        AVAILABLE_MODELS: [],
        MAX_RETRIES: 1,
        RETRY_DELAY_MS: 100,
      },
      rateLimit: { maxRequestsPerMinute: 50, maxRequestsPerHour: 1000 }
    }
  }
}));

// Mock worker-client to avoid actual worker usage in tests
// Must use plain functions (not vi.fn) to survive vi.clearAllMocks in setup.js
const mockWorkerSteps = [
  { step: 1, line: 1, explanation: 'Start', variables: {}, console: '' },
  { step: 2, line: 2, explanation: 'x = 1', variables: { x: 1 }, console: '' },
];

vi.mock('../../services/ai/worker-client.js', () => ({
  parseTraceResponseAsync: () => Promise.resolve({
    steps: mockWorkerSteps,
    error: null
  })
}));

import { fetchGeminiTrace } from '../../services/ai/gemini-adapter.js';
import { fetchGroqTrace } from '../../services/ai/groq-adapter.js';
import { fetchOpenaiTrace } from '../../services/ai/openai-adapter.js';
import { fetchClaudeTrace } from '../../services/ai/claude-adapter.js';

const SAMPLE_CODE = 'const x = 1;';
const SAMPLE_LANG = 'javascript';
const FAKE_KEY = 'test-api-key-placeholder';

describe('OpenAI Adapter', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '{"steps":[]}' } }]
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends request to the correct OpenAI endpoint', async () => {
    await fetchOpenaiTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.openai.com'),
      expect.any(Object)
    );
  });

  it('uses Bearer token authorization', async () => {
    await fetchOpenaiTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    const opts = fetch.mock.calls[0][1];
    expect(opts.headers['Authorization']).toBe(`Bearer ${FAKE_KEY}`);
  });

  it('sends JSON response_format', async () => {
    await fetchOpenaiTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    const opts = fetch.mock.calls[0][1];
    const body = JSON.parse(opts.body);
    expect(body.response_format).toEqual({ type: 'json_object' });
  });

  it('throws on missing API key gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
    });
    await expect(fetchOpenaiTrace(SAMPLE_CODE, SAMPLE_LANG, 'bad-key'))
      .rejects.toThrow(/Invalid OpenAI API key/i);
  });

  it('handles rate limit errors', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: { message: 'Rate limited' } })
    });
    await expect(fetchOpenaiTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY))
      .rejects.toThrow(/rate limit/i);
  });
});

describe('Claude Adapter', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: '{"steps":[]}' }]
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends request to the correct Claude endpoint', async () => {
    await fetchClaudeTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.anthropic.com'),
      expect.any(Object)
    );
  });

  it('uses x-api-key header', async () => {
    await fetchClaudeTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    const opts = fetch.mock.calls[0][1];
    expect(opts.headers['x-api-key']).toBe(FAKE_KEY);
  });

  it('sends anthropic-version header', async () => {
    await fetchClaudeTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    const opts = fetch.mock.calls[0][1];
    expect(opts.headers['anthropic-version']).toBe('2023-06-01');
  });

  it('includes system prompt in request body', async () => {
    await fetchClaudeTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    const opts = fetch.mock.calls[0][1];
    const body = JSON.parse(opts.body);
    expect(body.system).toBeTruthy();
  });

  it('throws on 401 error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Unauthorized' } })
    });
    await expect(fetchClaudeTrace(SAMPLE_CODE, SAMPLE_LANG, 'bad-key'))
      .rejects.toThrow(/Invalid Claude API key/i);
  });
});

describe('Gemini Adapter', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: '{"steps":[]}' }] } }]
      })
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('uses x-goog-api-key header', async () => {
    await fetchGeminiTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    const opts = fetch.mock.calls[0][1];
    expect(opts.headers['x-goog-api-key']).toBe(FAKE_KEY);
  });

  it('sends responseSchema in generationConfig', async () => {
    await fetchGeminiTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    const opts = fetch.mock.calls[0][1];
    const body = JSON.parse(opts.body);
    expect(body.generationConfig.responseSchema).toBeTruthy();
  });

  it('throws on 401 error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Unauthorized' } })
    });
    await expect(fetchGeminiTrace(SAMPLE_CODE, SAMPLE_LANG, 'bad-key'))
      .rejects.toThrow(/Invalid Gemini API key/i);
  });
});

describe('Groq Adapter', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '{"steps":[]}' } }]
      })
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('uses Bearer token authorization', async () => {
    await fetchGroqTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    const opts = fetch.mock.calls[0][1];
    expect(opts.headers['Authorization']).toBe(`Bearer ${FAKE_KEY}`);
  });

  it('sends JSON response_format', async () => {
    await fetchGroqTrace(SAMPLE_CODE, SAMPLE_LANG, FAKE_KEY);
    const opts = fetch.mock.calls[0][1];
    const body = JSON.parse(opts.body);
    expect(body.response_format).toEqual({ type: 'json_object' });
  });

  it('throws on 401 error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Invalid' } })
    });
    await expect(fetchGroqTrace(SAMPLE_CODE, SAMPLE_LANG, 'bad-key'))
      .rejects.toThrow(/Invalid Groq API key/i);
  });
});
