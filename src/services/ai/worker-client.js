/**
 * NitinTrace — Trace Worker Client
 * Interface to communicate with the trace-worker.
 * Falls back to synchronous parsing in environments where Web Workers are unavailable (e.g., tests).
 */

import TraceWorker from '../../workers/trace-worker.js?worker';

/**
 * Parses trace response asynchronously using a Web Worker.
 * @param {string} rawText - Raw JSON text from AI response
 * @returns {Promise<Object>} Object containing { steps, error }
 */
export async function parseTraceResponseAsync(rawText) {
  if (typeof Worker === 'undefined' || import.meta.env.MODE === 'test') {
    // Fallback for testing environments
    const { parseTraceResponse } = await import('./response-parser.js');
    return parseTraceResponse(rawText);
  }

  return new Promise((resolve, reject) => {
    try {
      const worker = new TraceWorker();

      worker.onmessage = (event) => {
        worker.terminate();
        if (event.data.success) {
          resolve(event.data.result);
        } else {
          resolve({ steps: [], error: event.data.error });
        }
      };

      worker.onerror = (error) => {
        worker.terminate();
        reject(error);
      };

      worker.postMessage({ rawText });
    } catch {
      // Fallback in case of worker initialization issues
      import('./response-parser.js').then(({ parseTraceResponse }) => {
        resolve(parseTraceResponse(rawText));
      }).catch(reject);
    }
  });
}
