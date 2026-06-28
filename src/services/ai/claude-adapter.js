/**
 * N-Trace — Anthropic Claude AI Adapter
 *
 * Handles all Claude-specific API communication (Anthropic Messages API).
 * Claude does not support response_format, so JSON instructions are embedded
 * in the system prompt.
 */

import { CONFIG } from '@core/config.js';
import {
  getActiveSystemPrompt,
  CLAUDE_JSON_ADDENDUM,
  buildUserPrompt,
} from './prompts.js';
import { parseTraceResponseAsync } from './worker-client.js';

const { CLAUDE } = CONFIG.AI;

/**
 * Fetch an execution trace from the Anthropic Claude API.
 * @param {string} code - Source code to trace
 * @param {string} language - Programming language identifier
 * @param {string} apiKey - Anthropic API key
 * @param {string} [model] - Claude model ID (defaults to config)
 * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation
 * @returns {Promise<import('./response-parser.js').TraceStep[]>}
 */
export async function fetchClaudeTrace(code, language, apiKey, model, signal) {
  const selectedModel = model || CLAUDE.DEFAULT_MODEL;

  const requestBody = {
    model: selectedModel,
    max_tokens: 8192,
    system: getActiveSystemPrompt() + CLAUDE_JSON_ADDENDUM,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(code, language),
      },
    ],
    temperature: 0.1,
  };

  let lastError = null;

  for (let attempt = 0; attempt < CLAUDE.MAX_RETRIES; attempt++) {
    try {
      if (signal?.aborted) {
        throw new Error('Trace cancelled.');
      }

      const response = await fetch(CLAUDE.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.error?.message || response.statusText;

        if (response.status === 401) {
          throw new Error(`Invalid Claude API key. Please check your key in Settings.`);
        }
        if (response.status === 429) {
          throw new Error('Claude rate limit reached. Please wait a moment and try again.');
        }
        if (response.status === 400 && msg.includes('model')) {
          throw new Error(`Claude model "${selectedModel}" is unavailable. Please select a different model.`);
        }
        if (response.status >= 500) {
          throw new Error(`Claude server error (${response.status}). Retrying...`);
        }
        throw new Error(`Claude API Error (${response.status}): ${msg}`);
      }

      const data = await response.json();
      const text = data?.content?.[0]?.text;

      if (!text) {
        const stopReason = data?.stop_reason;
        if (stopReason === 'error') {
          throw new Error('Claude encountered an error processing the request.');
        }
        throw new Error('Claude returned an empty response. Please try again.');
      }

      const { steps, error } = await parseTraceResponseAsync(text);
      if (error) throw new Error(error);

      return steps;

    } catch (err) {
      if (
        err.name === 'AbortError' ||
        err.message.includes('cancelled') ||
        err.message.includes('Invalid Claude API key') ||
        err.message.includes('unavailable')
      ) {
        throw err;
      }

      lastError = err;
      console.warn(`[Claude] Attempt ${attempt + 1} failed:`, err.message);

      if (attempt < CLAUDE.MAX_RETRIES - 1) {
        await delay(CLAUDE.RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function delay(ms) {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}
