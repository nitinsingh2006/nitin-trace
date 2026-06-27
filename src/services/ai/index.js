/**
 * NitinTrace — AI Service Orchestrator
 *
 * Public API for AI execution tracing. Delegates to provider-specific adapters.
 * This file is the only entry point consumers should import.
 *
 * Usage:
 *   import { fetchExecutionTrace, cancelTrace } from '@services/ai/index.js';
 */

import store from '@/core/state.js';
import { fetchGeminiTrace } from './gemini-adapter.js';
import { fetchGroqTrace } from './groq-adapter.js';
import { fetchOpenaiTrace } from './openai-adapter.js';
import { fetchClaudeTrace } from './claude-adapter.js';

/** Active AbortController — allows cancelling an in-flight trace request */
let activeController = null;

/**
 * Cancel any currently running trace request.
 */
export function cancelTrace() {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}

/**
 * Fetch an execution trace from the configured AI provider.
 *
 * @param {string} code - Source code to trace
 * @param {string} language - Programming language
 * @param {Object} [options] - Override options (for testing / future pro features)
 * @param {string} [options.provider] - Override active provider
 * @param {string} [options.apiKey] - Override API key
 * @param {string} [options.model] - Override model
 * @returns {Promise<import('./response-parser.js').TraceStep[]>}
 * @throws {Error} With user-friendly message on failure
 */
export async function fetchExecutionTrace(code, language, options = {}) {
  // Cancel any previous in-flight request
  cancelTrace();
  activeController = new AbortController();
  const { signal } = activeController;

  // Read from store (can be overridden via options for testing)
  const provider = options.provider ?? store.get('settings.provider');
  const model    = options.model    ?? getActiveModel(provider);
  const apiKey   = options.apiKey   ?? getActiveApiKey(provider);

  if (!apiKey) {
    const providerName = providerLabel(provider);
    throw new Error(
      `${providerName} API key is missing. Click Settings (⚙️) to add your key.`
    );
  }

  try {
    if (provider === 'gemini') {
      return await fetchGeminiTrace(code, language, apiKey, model, signal);
    } else if (provider === 'groq') {
      return await fetchGroqTrace(code, language, apiKey, model, signal);
    } else if (provider === 'openai') {
      return await fetchOpenaiTrace(code, language, apiKey, model, signal);
    } else if (provider === 'claude') {
      return await fetchClaudeTrace(code, language, apiKey, model, signal);
    } else {
      throw new Error(`Unsupported AI provider: "${provider}". Choose Gemini, Groq, OpenAI, or Claude in Settings.`);
    }
  } finally {
    activeController = null;
  }
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

function getActiveApiKey(provider) {
  if (provider === 'gemini') return store.get('settings.geminiApiKey');
  if (provider === 'groq')   return store.get('settings.groqApiKey');
  if (provider === 'openai') return store.get('settings.openaiApiKey');
  if (provider === 'claude') return store.get('settings.claudeApiKey');
  return null;
}

function getActiveModel(provider) {
  if (provider === 'gemini') return store.get('settings.geminiModel');
  if (provider === 'groq')   return store.get('settings.groqModel');
  if (provider === 'openai') return store.get('settings.openaiModel');
  if (provider === 'claude') return store.get('settings.claudeModel');
  return null;
}

function providerLabel(provider) {
  const labels = { gemini: 'Gemini', groq: 'Groq', openai: 'OpenAI', claude: 'Claude' };
  return labels[provider] || provider;
}
