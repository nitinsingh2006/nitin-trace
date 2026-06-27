/**
 * NitinTrace — Trace Parsing Web Worker
 * Parses and sanitizes AI trace JSON responses off the main thread.
 */

import { parseTraceResponse } from '../services/ai/response-parser.js';

self.onmessage = (event) => {
  const { rawText } = event.data;
  try {
    const result = parseTraceResponse(rawText);
    self.postMessage({ success: true, result });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};
