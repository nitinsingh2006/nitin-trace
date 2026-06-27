/**
 * NitinTrace — Google Gemini AI Adapter
 *
 * Handles all Gemini-specific API communication.
 * Uses Authorization header (Bearer) instead of URL query param to prevent
 * API key exposure in browser history and network logs.
 */

import { CONFIG } from '@core/config.js';
import {
  EXECUTION_TRACE_SYSTEM_PROMPT,
  GEMINI_RESPONSE_SCHEMA,
  buildUserPrompt,
} from './prompts.js';
import { parseTraceResponseAsync } from './worker-client.js';

const { GEMINI } = CONFIG.AI;

/**
 * Fetch an execution trace from the Gemini API.
 * @param {string} code - Source code to trace
 * @param {string} language - Programming language identifier
 * @param {string} apiKey - Gemini API key
 * @param {string} [model] - Gemini model ID (defaults to config)
 * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation
 * @returns {Promise<import('./response-parser.js').TraceStep[]>}
 */
export async function fetchGeminiTrace(code, language, apiKey, model, signal) {
  const selectedModel = model || GEMINI.DEFAULT_MODEL;

  // NOTE: Gemini v1beta requires the key as a query param OR in x-goog-api-key header.
  // We use the header approach to keep the key out of the URL / browser history.
  const endpoint = `${GEMINI.ENDPOINT}/${selectedModel}:generateContent`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: buildUserPrompt(code, language) }],
      },
    ],
    systemInstruction: {
      parts: [{ text: EXECUTION_TRACE_SYSTEM_PROMPT }],
    },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: GEMINI_RESPONSE_SCHEMA,
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  };

  let lastError = null;

  for (let attempt = 0; attempt < GEMINI.MAX_RETRIES; attempt++) {
    try {
      if (signal?.aborted) {
        throw new Error('Trace cancelled.');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey, // Secure: header instead of URL param
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.error?.message || response.statusText;

        if (response.status === 401 || response.status === 403) {
          throw new Error(`Invalid Gemini API key. Please check your key in Settings. (${response.status})`);
        }
        if (response.status === 429) {
          throw new Error('Gemini rate limit reached. Please wait a moment and try again.');
        }
        if (response.status >= 500) {
          throw new Error(`Gemini server error (${response.status}). Retrying...`);
        }
        throw new Error(`Gemini API Error (${response.status}): ${msg}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        // Check for safety filter blocks
        const finishReason = data?.candidates?.[0]?.finishReason;
        if (finishReason === 'SAFETY') {
          throw new Error('Gemini flagged this code as unsafe. Try different code.');
        }
        throw new Error('Gemini returned an empty response. Please try again.');
      }

      const { steps, error } = await parseTraceResponseAsync(text);
      if (error) throw new Error(error);

      return steps;

    } catch (err) {
      // Don't retry on these errors
      if (
        err.name === 'AbortError' ||
        err.message.includes('cancelled') ||
        err.message.includes('Invalid Gemini API key') ||
        err.message.includes('flagged')
      ) {
        throw err;
      }

      lastError = err;
      console.warn(`[Gemini] Attempt ${attempt + 1} failed:`, err.message);

      if (attempt < GEMINI.MAX_RETRIES - 1) {
        await delay(GEMINI.RETRY_DELAY_MS * (attempt + 1)); // Exponential backoff
      }
    }
  }

  throw lastError;
}

function delay(ms) {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}
