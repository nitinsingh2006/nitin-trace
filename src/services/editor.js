/**
 * CodeTrace — Monaco Editor Service
 * Handles initialization, loading, formatting, language change,
 * themes, and execution line highlighting.
 */

import { LANGUAGES } from '../utils/constants';

let editorInstance = null;
let currentDecorations = [];

/**
 * Loads Monaco from CDN using AMD loader
 */
export function loadMonaco() {
  return new Promise((resolve, reject) => {
    if (window.monaco) {
      resolve(window.monaco);
      return;
    }

    if (!window.require) {
      reject(new Error('Monaco loader not found on page. Please refresh.'));
      return;
    }

    window.require.config({
      paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
    });

    window.require(['vs/editor/editor.main'], function () {
      resolve(window.monaco);
    }, function (err) {
      reject(err);
    });
  });
}

/**
 * Initialize Monaco Editor in the given container
 */
export async function initEditor(container, initialLanguage) {
  try {
    const monaco = await loadMonaco();
    
    // Define custom dark cyber theme matching style.css design tokens
    monaco.editor.defineTheme('codetrace-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'f3f4f6', background: '0d0d1e' },
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '8b5cf6', fontStyle: 'bold' },
        { token: 'string', foreground: '00f0ff' },
        { token: 'number', foreground: 'ec4899' },
        { token: 'regexp', foreground: 'ec4899' },
        { token: 'type', foreground: '3b82f6' },
        { token: 'class', foreground: '3b82f6', fontStyle: 'bold' },
        { token: 'function', foreground: '00f0ff', fontStyle: 'bold' },
        { token: 'variable', foreground: 'f3f4f6' }
      ],
      colors: {
        'editor.background': '#0d0d1e',
        'editor.foreground': '#f3f4f6',
        'editor.lineHighlightBackground': '#151530',
        'editorCursor.foreground': '#00f0ff',
        'editor.selectionBackground': '#2b2b54',
        'editor.inactiveSelectionBackground': '#1b1b3a',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#00f0ff',
        'editorWidget.background': '#111129',
        'editorWidget.border': '#222240',
      }
    });

    const sampleCode = LANGUAGES[initialLanguage]?.sample || '';

    // Create the editor instance
    editorInstance = monaco.editor.create(container, {
      value: sampleCode,
      language: initialLanguage,
      theme: 'codetrace-theme',
      automaticLayout: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 20,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 12, bottom: 12 },
      bracketPairColorization: { enabled: true },
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      fontLigatures: true
    });

    // Clear loading indicator (keep Monaco DOM intact)
    const loadingEl = container.querySelector('.editor-loading');
    if (loadingEl) loadingEl.remove();
    editorInstance.layout();

    return editorInstance;
  } catch (error) {
    console.error('Failed to init Monaco Editor:', error);
    container.innerHTML = `<div class="editor-error">Failed to load editor. Refresh page or check internet connection.</div>`;
    throw error;
  }
}

/**
 * Returns current editor instance
 */
export function getEditor() {
  return editorInstance;
}

/**
 * Change the editor language and load the corresponding sample code
 */
export function setEditorLanguage(languageId) {
  if (!editorInstance) return;
  const monaco = window.monaco;
  const model = editorInstance.getModel();
  
  // Set language model
  monaco.editor.setModelLanguage(model, languageId);
  
  // Update value with sample code
  const sample = LANGUAGES[languageId]?.sample || '';
  editorInstance.setValue(sample);
  
  // Clear any existing active line highlights
  clearActiveLineHighlight();
}

/**
 * Highlight a specific line of code during execution step
 */
export function highlightActiveLine(lineNumber) {
  if (!editorInstance) return;
  
  // Clear old decorations
  clearActiveLineHighlight();

  // Monaco line numbers are 1-indexed
  if (lineNumber < 1) return;

  const model = editorInstance.getModel();
  const lineCount = model.getLineCount();
  if (lineNumber > lineCount) return;

  // Add new decoration
  currentDecorations = editorInstance.deltaDecorations([], [
    {
      range: new window.monaco.Range(lineNumber, 1, lineNumber, 1),
      options: {
        isWholeLine: true,
        className: 'codetrace-active-line-decor'
      }
    }
  ]);

  // Scroll line into view center
  editorInstance.revealLineInCenterIfOutsideViewport(lineNumber);
}

/**
 * Clear the current active line highlight decoration
 */
export function clearActiveLineHighlight() {
  if (!editorInstance || !currentDecorations.length) return;
  editorInstance.deltaDecorations(currentDecorations, []);
  currentDecorations = [];
}
