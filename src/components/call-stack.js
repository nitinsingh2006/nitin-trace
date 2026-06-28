/**
 * N-Trace — Call Stack Visualizer
 * Renders animated stack frames from trace step data.
 * Shows push/pop animations when frames change between steps.
 */
import store from '../core/state.js';
import '../styles/call-stack.css';

export function initCallStack(container) {
  // Create the call stack section HTML
  const sectionHtml = `
    <section class="viz-section viz-call-stack" id="viz-call-stack" style="display:none;">
      <div class="section-label">📌 Call Stack</div>
      <div class="call-stack-frames" id="call-stack-frames" aria-label="Call stack frames"
           aria-live="polite" role="list">
      </div>
    </section>
  `;
  container.insertAdjacentHTML('beforeend', sectionHtml);

  const section = container.querySelector('#viz-call-stack');
  const framesEl = container.querySelector('#call-stack-frames');
  function renderFrames(frames) {
    if (!frames || frames.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    // Render frames bottom-to-top (stack style)
    // frames array: outermost first (e.g. ['main', 'bubbleSort', 'swap'])
    // We reverse so innermost (top of stack) appears at top visually
    const reversed = [...frames].reverse();
    framesEl.innerHTML = reversed.map((frame, i) => {
      const isTop = i === 0; // top of stack (innermost = first after reverse)
      return `
        <div class="stack-frame ${isTop ? 'stack-frame-active' : ''}" role="listitem"
             style="--frame-depth: ${i}">
          <span class="frame-depth">${frames.length - i - 1}</span>
          <span class="frame-name">${escapeHtml(frame)}</span>
          ${isTop ? '<span class="frame-badge">active</span>' : ''}
        </div>
      `;
    }).join('');

  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Subscribe to trace step changes
  const renderFromState = () => {
    const steps = store.get('trace.steps') || [];
    const index = store.get('trace.currentIndex');
    if (steps.length === 0 || index < 0) {
      section.style.display = 'none';
      return;
    }
    const stepData = steps[index];
    renderFrames(stepData?.callStack || []);
  };

  store.subscribe('trace.currentIndex', renderFromState);
  store.subscribe('trace.steps', renderFromState);
}
