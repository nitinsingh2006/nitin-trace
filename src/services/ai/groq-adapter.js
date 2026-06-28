/**
 * N-Trace — Groq AI Adapter
 *
 * Handles all Groq-specific API communication (OpenAI-compatible format).
 */

import { CONFIG } from '@core/config.js';
import {
  getActiveSystemPrompt,
  GROQ_JSON_ADDENDUM,
  buildUserPrompt,
} from './prompts.js';
import { parseTraceResponseAsync } from './worker-client.js';

const { GROQ } = CONFIG.AI;

/**
 * Fetch an execution trace from the Groq API.
 * @param {string} code - Source code to trace
 * @param {string} language - Programming language identifier
 * @param {string} apiKey - Groq API key
 * @param {string} [model] - Groq model ID (defaults to config)
 * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation
 * @returns {Promise<import('./response-parser.js').TraceStep[]>}
 */
export async function fetchGroqTrace(code, language, apiKey, model, signal) {
  const selectedModel = model || GROQ.DEFAULT_MODEL;

  const requestBody = {
    model: selectedModel,
    messages: [
      {
        role: 'system',
        content: getActiveSystemPrompt() + GROQ_JSON_ADDENDUM,
      },
      {
        role: 'user',
        content: buildUserPrompt(code, language),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 8192,
  };

  let lastError = null;

  for (let attempt = 0; attempt < GROQ.MAX_RETRIES; attempt++) {
    try {
      if (signal?.aborted) {
        throw new Error('Trace cancelled.');
      }

      const response = await fetch(GROQ.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.error?.message || response.statusText;

        if (response.status === 401) {
          throw new Error(`Invalid Groq API key. Please check your key in Settings.`);
        }
        if (response.status === 429) {
          throw new Error('Groq rate limit reached. Please wait a moment and try again.');
        }
        if (response.status === 400 && msg.includes('model')) {
          throw new Error(`Groq model "${selectedModel}" is unavailable. Please select a different model.`);
        }
        if (response.status >= 500) {
          throw new Error(`Groq server error (${response.status}). Retrying...`);
        }
        throw new Error(`Groq API Error (${response.status}): ${msg}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error('Groq returned an empty response. Please try again.');
      }

      const { steps, error } = await parseTraceResponseAsync(text);
      if (error) throw new Error(error);

      return steps;

    } catch (err) {
      // Don't retry on these errors
      if (
        err.name === 'AbortError' ||
        err.message.includes('cancelled') ||
        err.message.includes('Invalid Groq API key') ||
        err.message.includes('unavailable')
      ) {
        throw err;
      }

      lastError = err;
      console.warn(`[Groq] Attempt ${attempt + 1} failed:`, err.message);

      if (attempt < GROQ.MAX_RETRIES - 1) {
        await delay(GROQ.RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function delay(ms) {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}
