/**
 * N-Trace — Editor Panel Component
 *
 * Renders the editor panel container, initializes the Monaco Editor,
 * manages language selection, and wires the Trace button via Event Bus.
 */

import store from '../core/state.js';
import eventBus from '../core/events.js';
import { initEditor, setEditorLanguage, getEditor } from '../services/editor.js';
import { LANGUAGES } from '../utils/constants.js';
import { exportToMarkdown, exportToJSON, downloadAsFile } from '../services/export-service.js';
import { generateShareUrlWithSteps } from '../utils/share.js';

export function initEditorPanel(container) {
  const panelHtml = `
    <div class="panel panel-editor" id="panel-editor">
      <div class="panel-header">
        <div class="panel-title">
          <span class="panel-icon">✏️</span>
          Code Input
        </div>
        <div class="panel-actions" style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="btn btn-ghost" id="btn-share" title="Share Trace Link" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 6px; display: flex; align-items: center; gap: 0.25rem; height: 28px; line-height: 1;">
            <span>🔗</span>
            <span class="btn-label" style="font-size: 0.75rem;">Share</span>
          </button>
          <select class="language-select" id="language-select" title="Select Language">
            <optgroup label="Popular">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
            </optgroup>
            <optgroup label="Systems">
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="rust">Rust</option>
            </optgroup>
            <optgroup label="Modern">
              <option value="go">Go</option>
              <option value="kotlin">Kotlin</option>
              <option value="dart">Dart</option>
              <option value="scala">Scala</option>
              <option value="swift">Swift</option>
            </optgroup>
            <optgroup label="Scripting">
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="bash">Bash</option>
              <option value="r">R</option>
            </optgroup>
          </select>
        </div>
      </div>
      <div class="editor-container" id="editor-container">
        <div class="editor-loading">
          <div class="spinner"></div>
          <p>Loading editor...</p>
        </div>
      </div>
      <div class="panel-footer">
        <div class="export-dropdown">
          <button class="btn btn-ghost" id="btn-export" title="Export Trace" style="padding: 0.45rem 0.85rem; font-size: 0.8rem; border-radius: 6px; display: flex; align-items: center; gap: 0.35rem;">
            <span>📥</span>
            <span>Export</span>
            <span style="font-size: 0.65rem; opacity: 0.7;">▾</span>
          </button>
          <div class="export-menu" id="export-menu" style="display: none; position: absolute; bottom: 100%; margin-bottom: 4px; left: 0; background: var(--bg-surface-solid, #1a1a2e); border: 1px solid var(--border-color, #2a2a4a); border-radius: 8px; min-width: 180px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); z-index: 100; overflow: hidden;">
            <button class="export-menu-item" data-action="markdown" style="display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.6rem 1rem; border: none; background: none; color: var(--text-primary, #e0e0f0); font-size: 0.8rem; cursor: pointer; text-align: left; font-family: var(--font-ui, inherit); transition: background 0.15s;">
              <span style="font-size: 1rem;">📄</span> Download Markdown
            </button>
            <button class="export-menu-item" data-action="json" style="display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.6rem 1rem; border: none; background: none; color: var(--text-primary, #e0e0f0); font-size: 0.8rem; cursor: pointer; text-align: left; font-family: var(--font-ui, inherit); transition: background 0.15s;">
              <span style="font-size: 1rem;">📋</span> Download JSON
            </button>
            <button class="export-menu-item" data-action="share" style="display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.6rem 1rem; border: none; background: none; color: var(--text-primary, #e0e0f0); font-size: 0.8rem; cursor: pointer; text-align: left; font-family: var(--font-ui, inherit); transition: background 0.15s;">
              <span style="font-size: 1rem;">🔗</span> Copy Share URL
            </button>
          </div>
        </div>
        <button class="btn btn-primary btn-trace" id="btn-trace" title="Trace Execution (Ctrl+Enter)">
          <span class="btn-icon">▶</span>
          <span class="btn-label">Trace Execution</span>
        </button>
      </div>
    </div>
  `;

  // Render
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = panelHtml;
  const panelEl = tempDiv.firstElementChild;
  container.appendChild(panelEl);

  // Cache elements
  const langSelect = panelEl.querySelector('#language-select');
  const editorContainer = panelEl.querySelector('#editor-container');
  const btnTrace = panelEl.querySelector('#btn-trace');
  const btnOriginalContent = btnTrace.innerHTML;

  let editorInitialized = false;

  const renderPlaceholder = () => {
    const lang = store.get('settings.language') || 'javascript';
    const sample = LANGUAGES[lang]?.sample || '';
    editorContainer.innerHTML = `
      <textarea class="editor-placeholder" readonly style="
        width: 100%;
        height: 100%;
        background: #0d0d1e;
        color: var(--text-secondary);
        border: none;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 13px;
        line-height: 20px;
        padding: 12px;
        resize: none;
        outline: none;
        cursor: pointer;
      ">${sample}</textarea>
    `;

    const placeholder = editorContainer.querySelector('.editor-placeholder');
    const triggerEvents = ['mouseenter', 'click', 'focus', 'touchstart'];
    const onInteract = () => {
      triggerEvents.forEach(evt => placeholder.removeEventListener(evt, onInteract));
      loadAndInitEditor();
    };
    triggerEvents.forEach(evt => placeholder.addEventListener(evt, onInteract));
  };

  const loadAndInitEditor = async () => {
    if (editorInitialized) return getEditor();
    editorInitialized = true;

    editorContainer.innerHTML = `
      <div class="editor-loading">
        <div class="spinner"></div>
        <p>Loading editor...</p>
      </div>
    `;

    try {
      const lang = store.get('settings.language') || 'javascript';
      const editor = await initEditor(editorContainer, lang);
      return editor;
    } catch (err) {
      editorInitialized = false;
      renderPlaceholder();
      eventBus.emit('toast:show', { message: 'Failed to initialize editor. Please refresh.', type: 'error' });
      throw err;
    }
  };

  // Initialize selected language from state
  const initialLang = store.get('settings.language') || 'javascript';
  langSelect.value = initialLang;

  // Render the initial placeholder instead of loading Monaco immediately
  renderPlaceholder();

  // Listen to set-code event to load code (from history or examples)
  eventBus.on('editor:set-code', async ({ code, language }) => {
    if (language) {
      store.set('settings.language', language);
    }
    const editor = await loadAndInitEditor();
    if (editor) {
      editor.setValue(code);
    }
  });

  // Handle language changes
  langSelect.addEventListener('change', (e) => {
    const newLang = e.target.value;
    store.set('settings.language', newLang);
  });

  // Keep state and dropdown in sync (e.g. when examples are loaded or state is loaded)
  store.subscribe('settings.language', (newLang) => {
    if (langSelect.value !== newLang) {
      langSelect.value = newLang;
    }
    if (editorInitialized) {
      setEditorLanguage(newLang);
    } else {
      renderPlaceholder();
    }
  });

  // Handle Trace Execution request
  const requestTrace = () => {
    const editor = getEditor();
    if (!editor) {
      if (!editorInitialized) {
        loadAndInitEditor().then(() => {
          setTimeout(requestTrace, 100);
        });
      } else {
        eventBus.emit('toast:show', { message: 'Editor not ready.', type: 'error' });
      }
      return;
    }

    const code = editor.getValue().trim();
    if (!code) {
      eventBus.emit('toast:show', { message: 'Please write some code to trace first.', type: 'warning' });
      return;
    }

    const language = langSelect.value;
    eventBus.emit('trace:request', { code, language });
  };

  btnTrace.addEventListener('click', requestTrace);

  // Bind Ctrl+Enter logic inside editor
  eventBus.on('editor:ctrl-enter', requestTrace);

  // Listen to trace lifecycle events to update button state
  eventBus.on('trace:start', () => {
    btnTrace.disabled = true;
    btnTrace.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> &nbsp; Tracing...';
  });

  const resetTraceButton = () => {
    btnTrace.disabled = false;
    btnTrace.innerHTML = btnOriginalContent;
  };

  eventBus.on('trace:complete', resetTraceButton);
  eventBus.on('trace:error', resetTraceButton);

  // ─── Export Dropdown ────────────────────────────────────────────────────

  const btnExport = panelEl.querySelector('#btn-export');
  const exportMenu = panelEl.querySelector('#export-menu');
  const exportItems = panelEl.querySelectorAll('.export-menu-item');

  const toggleExportMenu = (show) => {
    exportMenu.style.display = show ? 'block' : 'none';
  };

  btnExport.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = exportMenu.style.display === 'block';
    toggleExportMenu(!isOpen);
  });

  document.addEventListener('click', () => {
    toggleExportMenu(false);
  });

  const getTraceData = () => {
    const editor = getEditor();
    const code = editor ? editor.getValue().trim() : '';
    const language = langSelect.value;
    const steps = store.get('trace.steps') || [];
    return { code, language, steps };
  };

  const handleExport = async (action) => {
    toggleExportMenu(false);
    const { code, language, steps } = getTraceData();

    if (!code) {
      eventBus.emit('toast:show', { message: 'No code to export.', type: 'warning' });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);

    switch (action) {
      case 'markdown': {
        const md = exportToMarkdown(code, language, steps);
        downloadAsFile(md, `n-trace-${timestamp}.md`, 'text/markdown');
        eventBus.emit('toast:show', { message: 'Markdown report downloaded.', type: 'success' });
        break;
      }
      case 'json': {
        const json = exportToJSON(code, language, steps);
        downloadAsFile(json, `n-trace-${timestamp}.json`, 'application/json');
        eventBus.emit('toast:show', { message: 'JSON export downloaded.', type: 'success' });
        break;
      }
      case 'share': {
        if (steps.length === 0) {
          eventBus.emit('toast:show', { message: 'Run a trace before sharing.', type: 'warning' });
          return;
        }
        try {
          const url = await generateShareUrlWithSteps(code, language, steps);
          await navigator.clipboard.writeText(url);
          eventBus.emit('toast:show', { message: 'Share URL copied to clipboard!', type: 'success' });
        } catch {
          eventBus.emit('toast:show', { message: 'Failed to generate share URL.', type: 'error' });
        }
        break;
      }
    }
  };

  exportItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      handleExport(item.dataset.action);
    });
  });
}
