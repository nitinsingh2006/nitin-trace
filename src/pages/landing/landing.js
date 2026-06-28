/**
 * N-Trace — Landing Page Component
 *
 * Renders a standalone landing page into a container element.
 * @param {HTMLElement} container
 * @returns {{ destroy: () => void }}
 */

import './landing.css';

const LANGUAGES_LIST = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#',
  'Go', 'Rust', 'Kotlin', 'Swift', 'Ruby', 'PHP', 'Dart', 'Scala', 'R', 'Bash'
];

const FEATURES = [
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><path d="M21 2v6h-6"/></svg>`,
    title: 'AI Execution Tracing',
    desc: 'Powered by Gemini & Groq — understand every step of your code with intelligent agent-driven analysis.'
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    title: '17 Language Support',
    desc: 'From JavaScript to Bash, Rust to R — trace execution in every major language with zero config.'
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
    title: 'Step-by-Step Playback',
    desc: 'Replay execution line by line with play/pause, skip, and variable diff highlights at each step.'
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    title: 'Variable State Visualization',
    desc: 'Watch variables change in real-time with a live table of values, types, and scope context.'
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
    title: 'GitHub Integration',
    desc: 'Push traces directly to your repos, open PRs with trace annotations, and collaborate with your team.'
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    title: 'Export & Share',
    desc: 'Export traces as JSON, SVG, or embeddable snippets — share your execution story with anyone.'
  }
];

function buildHTML() {
  return `
    <div class="landing" id="landing-root">

      <!-- Background glows -->
      <div class="landing-glow landing-glow--cyan" aria-hidden="true"></div>
      <div class="landing-glow landing-glow--purple" aria-hidden="true"></div>

      <!-- ═══ Hero ═══ -->
      <section class="landing-hero">
        <div class="landing-hero-badge">
          <span class="landing-hero-badge-dot"></span>
          <span>AI-Powered Code Execution Visualizer</span>
        </div>

        <h1>
          See your code<br/>
          <span class="landing-hero-headline">come alive</span>
        </h1>

        <p class="landing-hero-sub">
          Paste any code, pick a language, and watch the AI trace every variable,
          call stack, and output — no runtime needed.
        </p>

        <button class="landing-hero-cta" id="landing-cta" aria-label="Start tracing for free">
          <span>Start Tracing — Free</span>
          <span class="landing-hero-cta-arrow" aria-hidden="true">→</span>
        </button>

        <div class="landing-hero-stats">
          <div class="landing-hero-stat">
            <div class="landing-hero-stat-value">17</div>
            <div class="landing-hero-stat-label">Languages</div>
          </div>
          <div class="landing-hero-stat">
            <div class="landing-hero-stat-value">99+</div>
            <div class="landing-hero-stat-label">Algorithms</div>
          </div>
          <div class="landing-hero-stat">
            <div class="landing-hero-stat-value">AI</div>
            <div class="landing-hero-stat-label">Powered</div>
          </div>
        </div>
      </section>

      <!-- ═══ Features ═══ -->
      <section class="landing-section landing-features" id="landing-features">
        <div class="landing-features-header">
          <span class="landing-section-label">Features</span>
          <h2 class="landing-section-title">Everything you need to<br/>understand execution</h2>
          <p class="landing-section-subtitle" style="margin: 0 auto;">
            Visualize, debug, and share how your code really runs — powered by cutting-edge AI models.
          </p>
        </div>

        <div class="landing-features-grid">
          ${FEATURES.map((f, i) => `
            <div class="landing-feature-card landing-animate-in" style="animation-delay: ${0.1 + i * 0.08}s">
              <div class="landing-feature-icon">${f.icon}</div>
              <div class="landing-feature-card-title">${f.title}</div>
              <div class="landing-feature-card-desc">${f.desc}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ═══ Languages ═══ -->
      <section class="landing-section landing-languages" id="landing-languages">
        <span class="landing-section-label">Languages</span>
        <h2 class="landing-section-title">17 languages, one trace engine</h2>
        <p class="landing-section-subtitle" style="margin: 0 auto;">
          From dynamic scripting to compiled systems — N-Trace speaks your language.
        </p>

        <div class="landing-languages-track">
          ${LANGUAGES_LIST.map(lang => `
            <span class="landing-language-pill">
              <span class="landing-language-pill-dot"></span>
              ${lang}
            </span>
          `).join('')}
        </div>
      </section>

      <!-- ═══ Live Demo ═══ -->
      <section class="landing-section landing-demo" id="landing-demo">
        <span class="landing-section-label">Live Demo</span>
        <h2 class="landing-section-title">See it in action</h2>
        <p class="landing-section-subtitle" style="margin: 0 auto;">
          A live trace of a Fibonacci function — step through variable updates and call flow.
        </p>

        <div class="landing-demo-window">
          <div class="landing-demo-titlebar">
            <span class="landing-demo-dot landing-demo-dot--red"></span>
            <span class="landing-demo-dot landing-demo-dot--yellow"></span>
            <span class="landing-demo-dot landing-demo-dot--green"></span>
            <span class="landing-demo-title">fibonacci.js — Trace</span>
          </div>

          <div class="landing-demo-body">
            <div class="landing-demo-code">
              <span class="landing-demo-line landing-demo-line--keyword" style="animation-delay: 0.1s"><span style="color:#c792ea">function</span> <span style="color:#82aaff">fibonacci</span>(n) {</span>
              <span class="landing-demo-line landing-demo-line--keyword landing-demo-line--dim" style="animation-delay: 0.2s">  <span style="color:#c792ea">if</span> (n &lt;= <span style="color:#f78c6c">1</span>) <span style="color:#c792ea">return</span> n;</span>
              <span class="landing-demo-line landing-demo-line--dim" style="animation-delay: 0.3s">  <span style="color:#c792ea">let</span> a = <span style="color:#f78c6c">0</span>, b = <span style="color:#f78c6c">1</span>;</span>
              <span class="landing-demo-line landing-demo-line--dim" style="animation-delay: 0.4s">  <span style="color:#c792ea">for</span> (<span style="color:#c792ea">let</span> i = <span style="color:#f78c6c">2</span>; i &lt;= n; i++) {</span>
              <span class="landing-demo-line landing-demo-line--dim" style="animation-delay: 0.5s">    <span style="color:#c792ea">let</span> temp = b;</span>
              <span class="landing-demo-line landing-demo-line--dim" style="animation-delay: 0.6s">    b = a + b;</span>
              <span class="landing-demo-line landing-demo-line--highlight" style="animation-delay: 0.7s">    a = temp;</span>
              <span class="landing-demo-line landing-demo-line--dim" style="animation-delay: 0.8s">  }</span>
              <span class="landing-demo-line landing-demo-line--dim" style="animation-delay: 0.9s">  <span style="color:#c792ea">return</span> b;</span>
              <span class="landing-demo-line" style="animation-delay: 1.0s">}</span>
            </div>

            <div class="landing-demo-traces">
              <div class="landing-demo-trace-step landing-demo-trace-step--current">
                <span class="landing-demo-trace-num">#5</span>
                <span class="landing-demo-trace-arrow">▸</span>
                <span class="landing-demo-trace-content">
                  <strong>Enter loop</strong> — i = <span class="landing-demo-trace-var">2</span>
                </span>
              </div>
              <div class="landing-demo-trace-step landing-demo-trace-step--done">
                <span class="landing-demo-trace-num">#4</span>
                <span class="landing-demo-trace-arrow">▸</span>
                <span class="landing-demo-trace-content">
                  <strong>Variables</strong> a = <span class="landing-demo-trace-var">0</span>, b = <span class="landing-demo-trace-var">1</span>
                </span>
              </div>
              <div class="landing-demo-trace-step landing-demo-trace-step--done">
                <span class="landing-demo-trace-num">#3</span>
                <span class="landing-demo-trace-arrow">▸</span>
                <span class="landing-demo-trace-content">
                  <strong>Initialize</strong> a = <span class="landing-demo-trace-var">0</span>, b = <span class="landing-demo-trace-var">1</span>
                </span>
              </div>
              <div class="landing-demo-trace-step landing-demo-trace-step--done">
                <span class="landing-demo-trace-num">#2</span>
                <span class="landing-demo-trace-arrow">▸</span>
                <span class="landing-demo-trace-content">
                  <strong>Check</strong> n = <span class="landing-demo-trace-var">6</span> &gt; 1, continue
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ Footer ═══ -->
      <footer class="landing-footer">
        <div class="landing-footer-links">
          <a href="https://github.com/nitinsingh2006/nitin-trace" target="_blank" rel="noopener noreferrer" class="landing-footer-link" aria-label="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>
          <a href="https://x.com/nitinsingh2006" target="_blank" rel="noopener noreferrer" class="landing-footer-link" aria-label="Twitter / X">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Twitter / X
          </a>
        </div>
        <div class="landing-footer-copy">
          &copy; ${new Date().getFullYear()} N-Trace. Built with AI.
        </div>
      </footer>

    </div>
  `;
}

export function initLandingPage(container) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildHTML();
  const root = wrapper.firstElementChild;
  container.appendChild(root);

  const animEls = root.querySelectorAll('.landing-animate-in');
  const ObserverImpl = window.IntersectionObserver;
  const observer = new ObserverImpl((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('landing-animate-in--visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animEls.forEach(el => observer.observe(el));

  // CTA button dispatches a custom event so the app can switch views
  const cta = root.querySelector('#landing-cta');
  const onCtaClick = () => {
    window.dispatchEvent(new window.CustomEvent('ntrace:start', { bubbles: true }));
  };
  cta?.addEventListener('click', onCtaClick);

  return {
    destroy() {
      observer.disconnect();
      cta?.removeEventListener('click', onCtaClick);
      root.remove();
    }
  };
}
