/**
 * NitinTrace — AI Response Parser & Validator
 *
 * Validates, sanitizes, and normalizes AI responses into a guaranteed
 * safe trace step array before any DOM rendering.
 *
 * Security: All string values are sanitized to prevent XSS.
 */

/**
 * @typedef {Object} TraceStep
 * @property {number} line - 1-indexed source line number
 * @property {string} explanation - Plain-English explanation
 * @property {Object} variables - Variable name → value map
 * @property {string} console - Cumulative console output
 */

/**
 * Escape HTML special characters to prevent XSS when rendering AI output.
 * @param {*} value - Any value
 * @returns {string}
 */
function sanitizeString(value) {
  if (typeof value !== 'string') {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize a variables object — recursively converts values to safe strings.
 * @param {*} vars
 * @returns {Object}
 */
function sanitizeVariables(vars) {
  if (!vars || typeof vars !== 'object' || Array.isArray(vars)) {
    return {};
  }

  const result = {};
  for (const [key, value] of Object.entries(vars)) {
    // Sanitize the key (variable name)
    const safeKey = sanitizeString(key).slice(0, 100); // Max 100 chars per key
    if (!safeKey) continue;

    // Convert value to a display string
    let displayValue;
    if (value === null) {
      displayValue = 'null';
    } else if (value === undefined) {
      displayValue = 'undefined';
    } else if (typeof value === 'object') {
      try {
        displayValue = JSON.stringify(value, null, 0);
        if (displayValue.length > 500) {
          displayValue = displayValue.slice(0, 497) + '...';
        }
      } catch {
        displayValue = '[object]';
      }
    } else {
      displayValue = String(value);
      if (displayValue.length > 500) {
        displayValue = displayValue.slice(0, 497) + '...';
      }
    }

    result[safeKey] = sanitizeString(displayValue);
  }
  return result;
}

/**
 * Parse and validate a raw JSON string into trace steps.
 * @param {string} rawText - Raw JSON string from AI response
 * @returns {{ steps: TraceStep[], error: string|null }}
 */
export function parseTraceResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { steps: [], error: 'Empty response from AI model.' };
  }

  // Clean: strip markdown code fences if present (Groq sometimes wraps anyway)
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '');
  }

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return {
      steps: [],
      error: `AI returned invalid JSON. Please try again. (${e.message})`,
    };
  }

  // Validate top-level shape
  if (!parsed || typeof parsed !== 'object') {
    return { steps: [], error: 'AI response is not a valid object.' };
  }

  if (!Array.isArray(parsed.steps)) {
    return { steps: [], error: 'AI response missing "steps" array.' };
  }

  if (parsed.steps.length === 0) {
    return { steps: [], error: 'AI returned an empty trace. Try different code.' };
  }

  // Validate and sanitize each step
  const steps = [];
  for (let i = 0; i < parsed.steps.length; i++) {
    const raw = parsed.steps[i];

    if (!raw || typeof raw !== 'object') {
      continue; // Skip invalid steps silently
    }

    const step = {
      line: typeof raw.line === 'number' && raw.line > 0 ? Math.floor(raw.line) : 1,
      explanation: sanitizeString(raw.explanation || 'No explanation provided.'),
      variables: sanitizeVariables(raw.variables),
      console: sanitizeString(raw.console || ''),
    };

    steps.push(step);
  }

  if (steps.length === 0) {
    return { steps: [], error: 'All trace steps were invalid. Please try again.' };
  }

  return { steps, error: null };
}
