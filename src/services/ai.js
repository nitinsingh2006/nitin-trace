/**
 * NitinTrace — Gemini & Groq AI Service Layer
 * Performs structured execution simulation of code snippets in any programming language.
 */

const SYSTEM_INSTRUCTION_GEMINI = `You are a precise programming language execution simulation engine.
Your task is to trace the step-by-step execution of the provided code snippet in the specified language.
Do not execute the code in a sandbox. Instead, trace the execution flow mentally and compile a detailed, step-by-step trace history.

Follow these strict rules for tracing:
1. Step-by-Step execution flow: Follow control flow (loops, condition gates, helper function call stack pushing/popping, returns) line by line.
2. Line numbers: For each step, identify the exact 1-indexed line number in the source code being executed.
3. Variable scope: Track variables in scope at each step. Include their name and current state value (evaluate objects, strings, arrays, booleans, and numbers clearly).
4. Console Outputs: Track accumulated console prints (stdout). If a step prints to console, include the updated cumulative console string.
5. High quality explanations: Explain what that specific line execution does during this step in plain English (keep it brief and dev-friendly, referencing variables by name).
6. Limit steps: To avoid huge responses, trace up to a maximum of 30 steps. If the execution has infinite loops or more steps, stop tracing at step 30 and output a final step indicating execution limit reached.
7. Error Detection & Fault Simulation: Check the code for syntax errors (e.g. unclosed tags, syntax typos like trailing junk characters, mismatching brackets, invalid tokens) and runtime errors (e.g. referencing undefined variables, division by zero, null pointer dereferences) BEFORE generating the trace.
   - If there is a syntax or compilation error: Stop tracing immediately. Generate EXACTLY ONE step at the error line. Set the 'explanation' to describe the syntax/compilation error clearly, set the 'variables' to an empty object, and set the 'console' output to display the compilation/syntax error message (e.g. "SyntaxError: Unexpected identifier").
   - If there is a runtime error: Trace the execution step-by-step normally up to the line where the error occurs. At that line, record the error: set the 'explanation' to describe the exception thrown (e.g. "ReferenceError: x is not defined"), output the error details/call stack to the 'console', and terminate the trace at that step. Do not execute any further lines.`;

const SYSTEM_INSTRUCTION_GROQ = `You are a precise programming language execution simulation engine.
Your task is to trace the step-by-step execution of the provided code snippet in the specified language.
Do not execute the code in a sandbox. Instead, trace the execution flow mentally and compile a detailed, step-by-step trace history.

Ensure you respond with a JSON object containing a "steps" key, which is an array of steps.
Each step object in the "steps" array must contain exactly these keys:
- "line": (integer) The 1-indexed line number in the source code being executed.
- "explanation": (string) Short explanation of what happens on this line at this step.
- "variables": (object) Map of variable names currently in scope to their values.
- "console": (string) The full cumulative console output printed up to this step. If nothing is printed yet, return an empty string.

Follow these strict rules for tracing:
1. Step-by-Step execution flow: Follow control flow (loops, condition gates, helper function call stack pushing/popping, returns) line by line.
2. Line numbers: For each step, identify the exact 1-indexed line number in the source code being executed.
3. Variable scope: Track variables in scope at each step. Include their name and current state value (evaluate objects, strings, arrays, booleans, and numbers clearly).
4. Console Outputs: Track accumulated console prints (stdout). If a step prints to console, include the updated cumulative console string.
5. High quality explanations: Explain what that specific line execution does during this step in plain English (keep it brief and dev-friendly, referencing variables by name).
6. Limit steps: To avoid huge responses, trace up to a maximum of 30 steps. If the execution has infinite loops or more steps, stop tracing at step 30 and output a final step indicating execution limit reached.
7. Error Detection & Fault Simulation: Check the code for syntax errors (e.g. unclosed tags, syntax typos like trailing junk characters, mismatching brackets, invalid tokens) and runtime errors (e.g. referencing undefined variables, division by zero, null pointer dereferences) BEFORE generating the trace.
   - If there is a syntax or compilation error: Stop tracing immediately. Generate EXACTLY ONE step at the error line. Set the 'explanation' to describe the syntax/compilation error clearly, set the 'variables' to an empty object, and set the 'console' output to display the compilation/syntax error message (e.g. "SyntaxError: Unexpected identifier").
   - If there is a runtime error: Trace the execution step-by-step normally up to the line where the error occurs. At that line, record the error: set the 'explanation' to describe the exception thrown (e.g. "ReferenceError: x is not defined"), output the error details/call stack to the 'console', and terminate the trace at that step. Do not execute any further lines.

Your response must be a single, valid JSON object matching the format above. Do not wrap the JSON output in markdown backticks (like \`\`\`json or \`\`\`), just output raw JSON.`;

/**
 * Normalizes and fetches execution trace steps from the selected provider.
 * @param {string} code - The source code to trace.
 * @param {string} language - The programming language identifier.
 * @param {string} apiKey - API Key for the active provider.
 * @param {string} provider - 'gemini' or 'groq'.
 * @param {string} model - Model ID.
 * @returns {Promise<Array>} List of execution trace steps.
 */
export async function fetchExecutionTrace(code, language, apiKey, provider = 'gemini', model = '') {
  if (!apiKey) {
    throw new Error(`API key is missing. Set your ${provider === 'gemini' ? 'Gemini' : 'Groq'} API key in Settings.`);
  }

  if (provider === 'gemini') {
    const selectedModel = model || 'gemini-2.0-flash';
    return fetchGeminiTrace(code, language, apiKey, selectedModel);
  } else if (provider === 'groq') {
    const selectedModel = model || 'llama-3.3-70b-versatile';
    return fetchGroqTrace(code, language, apiKey, selectedModel);
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Fetch execution trace using Google Gemini API (structured JSON schema)
 */
async function fetchGeminiTrace(code, language, apiKey, model) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const userPrompt = `Trace the following ${language} code execution:

\`\`\`${language}
${code}
\`\`\`

Ensure you trace starting from the entry point (main function or first top-level statements) to the end of execution. Make sure variable values are parsed accurately.`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: userPrompt }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: SYSTEM_INSTRUCTION_GEMINI }
      ]
    },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
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
                  description: 'The 1-indexed line number currently executing.'
                },
                explanation: {
                  type: 'STRING',
                  description: 'Short explanation of what happens on this line at this step.'
                },
                variables: {
                  type: 'OBJECT',
                  description: 'State variables in scope and their values at this step.'
                },
                console: {
                  type: 'STRING',
                  description: 'The full cumulative console output printed by the program up to this step.'
                }
              },
              required: ['line', 'explanation', 'variables', 'console']
            }
          }
        },
        required: ['steps']
      }
    }
  };

  let attempt = 0;
  const maxAttempts = 2;
  let lastError = null;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`Gemini API Error (${response.status}): ${errorMessage}`);
      }

      const responseData = await response.json();
      const candidates = responseData.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No execution trace steps returned from Gemini. Try again.');
      }

      const responseText = candidates[0].content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error('Empty response from AI model.');
      }

      const parsedData = JSON.parse(responseText);
      if (!parsedData || !Array.isArray(parsedData.steps)) {
        throw new Error('Invalid trace schema: steps is not an array.');
      }

      return parsedData.steps;

    } catch (error) {
      attempt++;
      lastError = error;
      console.warn(`Gemini API attempt ${attempt} failed:`, error);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
}

/**
 * Fetch execution trace using Groq API (OpenAI-compatible Chat Completions JSON mode)
 */
async function fetchGroqTrace(code, language, apiKey, model) {
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const userPrompt = `Trace the following ${language} code execution:

\`\`\`${language}
${code}
\`\`\`

Ensure you trace starting from the entry point (main function or first top-level statements) to the end of execution. Make sure variable values are parsed accurately. Return the output as valid JSON.`;

  const requestBody = {
    model: model,
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION_GROQ },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1
  };

  let attempt = 0;
  const maxAttempts = 2;
  let lastError = null;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`Groq API Error (${response.status}): ${errorMessage}`);
      }

      const responseData = await response.json();
      const text = responseData.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('Empty response from Groq.');
      }

      // Sanitize the response text in case Groq wraps it in backticks despite instructions
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
      }

      const parsedData = JSON.parse(cleanedText);
      if (!parsedData || !Array.isArray(parsedData.steps)) {
        throw new Error('Invalid trace format returned from Groq: steps is not an array.');
      }

      return parsedData.steps;

    } catch (error) {
      attempt++;
      lastError = error;
      console.warn(`Groq API attempt ${attempt} failed:`, error);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
}
