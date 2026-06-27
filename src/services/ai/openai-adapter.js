/**
 * NitinTrace — OpenAI AI Adapter
 *
 * Handles all OpenAI-specific API communication (OpenAI-compatible format).
 */

import { CONFIG } from '@core/config.js';
import {
  EXECUTION_TRACE_SYSTEM_PROMPT,
  buildUserPrompt,
} from './prompts.js';
import { parseTraceResponseAsync } from './worker-client.js';

const { OPENAI } = CONFIG.AI;

/**
 * Fetch an execution trace from the OpenAI API.
 * @param {string} code - Source code to trace
 * @param {string} language - Programming language identifier
 * @param {string} apiKey - OpenAI API key
 * @param {string} [model] - OpenAI model ID (defaults to config)
 * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation
 * @returns {Promise<import('./response-parser.js').TraceStep[]>}
 */
export async function fetchOpenaiTrace(code, language, apiKey, model, signal) {
  const selectedModel = model || OPENAI.DEFAULT_MODEL;

  const requestBody = {
    model: selectedModel,
    messages: [
      {
        role: 'system',
        content: EXECUTION_TRACE_SYSTEM_PROMPT,
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

  for (let attempt = 0; attempt < OPENAI.MAX_RETRIES; attempt++) {
    try {
      if (signal?.aborted) {
        throw new Error('Trace cancelled.');
      }

      const response = await fetch(OPENAI.ENDPOINT, {
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
          throw new Error(`Invalid OpenAI API key. Please check your key in Settings.`);
        }
        if (response.status === 429) {
          throw new Error('OpenAI rate limit reached. Please wait a moment and try again.');
        }
        if (response.status === 400 && msg.includes('model')) {
          throw new Error(`OpenAI model "${selectedModel}" is unavailable. Please select a different model.`);
        }
        if (response.status >= 500) {
          throw new Error(`OpenAI server error (${response.status}). Retrying...`);
        }
        throw new Error(`OpenAI API Error (${response.status}): ${msg}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error('OpenAI returned an empty response. Please try again.');
      }

      const { steps, error } = await parseTraceResponseAsync(text);
      if (error) throw new Error(error);

      return steps;

    } catch (err) {
      if (
        err.name === 'AbortError' ||
        err.message.includes('cancelled') ||
        err.message.includes('Invalid OpenAI API key') ||
        err.message.includes('unavailable')
      ) {
        throw err;
      }

      lastError = err;
      console.warn(`[OpenAI] Attempt ${attempt + 1} failed:`, err.message);

      if (attempt < OPENAI.MAX_RETRIES - 1) {
        await delay(OPENAI.RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function delay(ms) {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}
