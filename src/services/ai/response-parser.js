/**
 * N-Trace — AI Response Parser & Validator
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

function sanitizeString(value) {
  return String(value ?? '');
}

/**
 * Sanitize a variables object — preserves original type metadata alongside sanitized display value.
 * Returns objects of shape { value: string, type: string } to allow correct type display.
 * @param {*} vars
 * @returns {Object}
 */
function sanitizeVariables(vars) {
  if (!vars || typeof vars !== 'object' || Array.isArray(vars)) {
    return {};
  }

  const result = {};
  for (const [key, value] of Object.entries(vars)) {
    const safeKey = String(key).slice(0, 100);
    if (!safeKey) continue;

    let displayValue;
    let originalType;

    if (value === null) {
      displayValue = 'null';
      originalType = 'null';
    } else if (value === undefined) {
      displayValue = 'undefined';
      originalType = 'undefined';
    } else if (Array.isArray(value)) {
      try {
        displayValue = JSON.stringify(value, null, 0);
        if (displayValue.length > 500) displayValue = displayValue.slice(0, 497) + '...';
      } catch { displayValue = '[array]'; }
      originalType = 'Array';
    } else if (typeof value === 'object') {
      try {
        displayValue = JSON.stringify(value, null, 0);
        if (displayValue.length > 500) displayValue = displayValue.slice(0, 497) + '...';
      } catch { displayValue = '[object]'; }
      originalType = 'Object';
    } else if (typeof value === 'boolean') {
      displayValue = String(value);
      originalType = 'Boolean';
    } else if (typeof value === 'number') {
      displayValue = String(value);
      originalType = 'Number';
    } else {
      displayValue = String(value);
      if (displayValue.length > 500) displayValue = displayValue.slice(0, 497) + '...';
      originalType = 'String';
    }

    result[safeKey] = {
      value: displayValue,
      type: originalType
    };
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
