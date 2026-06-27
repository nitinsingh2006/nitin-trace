/**
 * NitinTrace — AI System Prompts
 *
 * Centralized prompt templates for all AI providers.
 * Both Gemini and Groq share the same core instruction — single source of truth.
 */

/**
 * Core execution simulation instruction shared by all providers.
 * Keep under 1000 tokens for cost efficiency.
 */
export const EXECUTION_TRACE_SYSTEM_PROMPT = `You are a precise programming language execution simulation engine.
Your task is to trace the step-by-step execution of the provided code snippet in the specified language.
Do NOT execute the code in a sandbox. Instead, trace the execution flow mentally and produce a detailed step-by-step trace.

Follow these strict rules:
1. EXECUTION FLOW: Follow control flow (loops, conditions, function calls, returns) line by line.
2. LINE NUMBERS: For each step, identify the exact 1-indexed line number being executed.
3. VARIABLE SCOPE: Track all variables in scope. Show their name and current evaluated value (evaluate objects, strings, arrays, numbers clearly).
4. CONSOLE OUTPUT: Track cumulative stdout. Include the updated cumulative output string on each step that prints.
5. EXPLANATIONS: Explain what that specific line does in brief, dev-friendly plain English (reference variable names).
6. STEP LIMIT: Trace a maximum of 30 steps. If there are more (e.g. infinite loops), stop at step 30 with a final step noting "Execution limit reached (30 steps)".
7. ERROR DETECTION:
   - SYNTAX ERROR: Generate EXACTLY ONE step at the error line. Set explanation = description of the syntax error. Set variables = {}. Set console = the error message (e.g. "SyntaxError: Unexpected token").
   - RUNTIME ERROR: Trace normally up to the failing line. At that step, set explanation = description of the exception. Set console = the error + stack trace. Stop after that step.`;

/**
 * Build the user-facing prompt for a trace request.
 * @param {string} code - Source code to trace
 * @param {string} language - Programming language
 * @returns {string}
 */
export function buildUserPrompt(code, language) {
  return `Trace the following ${language} code execution:

\`\`\`${language}
${code}
\`\`\`

Start from the entry point (main function or first top-level statement). Evaluate all variable values accurately.`;
}

/**
 * Claude-specific addendum: force raw JSON output (Claude does not support response_format).
 */
export const CLAUDE_JSON_ADDENDUM = `
IMPORTANT: You MUST respond with a single valid JSON object containing a "steps" array.
Each step must have: "line" (integer), "explanation" (string), "variables" (object), "console" (string).
Output raw JSON only. Do NOT wrap in markdown code fences.`;

/**
 * Groq-specific addendum: force raw JSON output (no markdown wrapping).
 */
export const GROQ_JSON_ADDENDUM = `
Your response MUST be a single valid JSON object with a "steps" key.
Each step in "steps" must have: "line" (integer), "explanation" (string), "variables" (object), "console" (string).
Do NOT wrap the JSON in markdown code fences (\`\`\`json). Output raw JSON only.`;

/**
 * JSON schema for Gemini structured output.
 * Ensures guaranteed valid JSON response format.
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    steps: {
      type: 'ARRAY',
      description: 'List of execution steps in chronological order.',
      items: {
        type: 'OBJECT',
        properties: {
          line: {
            type: 'INTEGER',
            description: 'The 1-indexed line number currently executing.',
          },
          explanation: {
            type: 'STRING',
            description: 'Brief plain-English explanation of what happens on this line.',
          },
          variables: {
            type: 'OBJECT',
            description: 'All variables currently in scope with their values.',
          },
          console: {
            type: 'STRING',
            description: 'Full cumulative console/stdout output up to this step.',
          },
        },
        required: ['line', 'explanation', 'variables', 'console'],
      },
    },
  },
  required: ['steps'],
};
