/**
 * N-Trace — Footer Component
 *
 * Features:
 * - GitHub CTA section with Star & Source buttons
 * - Social links (GitHub, LinkedIn, Email, Phone)
 * - Copyright with dynamic year
 * - Branding + "Built with ❤️ by Nitin Singh"
 * - Fully responsive (mobile-stacked / desktop multi-column)
 * - Accessible with aria-labels & keyboard navigation
 */

// ── Constants ──────────────────────────────────────────────────────────────
const GITHUB_REPO_URL  = 'https://github.com/nitinsingh2006/nitin-trace';
const GITHUB_PROFILE   = 'https://github.com/nitinsingh2006';
const LINKEDIN_URL     = 'https://www.linkedin.com/in/nitin-singh-657089339/';
const EMAIL            = 'nsingh987610@gmail.com';
const PHONE            = '+918085149264';          // tel: format (no spaces)
const PHONE_DISPLAY    = '+91 8085149264';

// ── SVG Icon helpers ────────────────────────────────────────────────────────
const icons = {
  github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57
      0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695
      -.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99
      .105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225
      -.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405
      c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225
      0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3
      0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>`,

  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136
      1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85
      3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065
      2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771
      C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227
      24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>`,

  mail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>`,

  phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1
      4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72
      12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27
      a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>`,

  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
    aria-hidden="true" focusable="false">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14
      2 9.27l6.91-1.01L12 2z"/>
  </svg>`,

  externalLink: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false" width="13" height="13">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>`,

  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
    aria-hidden="true" focusable="false" width="14" height="14">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78
      7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>`,
};

// ── Footer HTML builder ─────────────────────────────────────────────────────
function buildFooterHTML() {
  const year = new Date().getFullYear();

  return `
  <footer class="app-footer" id="app-footer" role="contentinfo">

    <!-- ═══════════════ GitHub CTA Card ═══════════════ -->
    <div class="footer-github-cta" aria-label="GitHub repository promotion">
      <div class="footer-cta-inner">
        <div class="footer-cta-content">
          <div class="footer-cta-icon" aria-hidden="true">
            <span class="footer-cta-icon-svg">${icons.github}</span>
          </div>
          <div class="footer-cta-text">
            <h2 class="footer-cta-heading">Enjoying N-Trace?</h2>
            <p class="footer-cta-desc">
              Support the project by starring it on GitHub — it really helps!
            </p>
          </div>
        </div>
        <div class="footer-cta-actions">
          <a
            href="${GITHUB_REPO_URL}"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-btn footer-btn-star"
            id="btn-footer-star"
            aria-label="Star N-Trace on GitHub"
            title="Star N-Trace on GitHub"
          >
            <span class="footer-btn-star-icon">${icons.star}</span>
            <span>Star on GitHub</span>
          </a>
          <a
            href="${GITHUB_REPO_URL}"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-btn footer-btn-source"
            id="btn-footer-source"
            aria-label="View source code on GitHub"
            title="View source code on GitHub"
          >
            <span>${icons.externalLink}</span>
            <span>View Source Code</span>
          </a>
        </div>
      </div>
    </div>

    <!-- ═══════════════ Main Footer Grid ═══════════════ -->
    <div class="footer-main">

      <!-- Brand column -->
      <div class="footer-col footer-brand-col">
        <div class="footer-logo" aria-label="N-Trace brand">
          <span class="footer-logo-icon" aria-hidden="true">⟐</span>
          <span class="footer-logo-text">N-<span class="footer-logo-accent">Trace</span></span>
        </div>
        <p class="footer-tagline">
          See your code think.<br/>
          AI-powered execution visualizer — no runtime needed.
        </p>
        <div class="footer-social-links" role="list" aria-label="Social media and contact links">
          <a
            href="${GITHUB_PROFILE}"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-social-btn"
            role="listitem"
            aria-label="Visit Nitin Singh's GitHub profile"
            title="GitHub Profile"
          >
            <span class="footer-social-icon">${icons.github}</span>
          </a>
          <a
            href="${LINKEDIN_URL}"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-social-btn footer-social-btn--linkedin"
            role="listitem"
            aria-label="Visit Nitin Singh's LinkedIn profile"
            title="LinkedIn Profile"
          >
            <span class="footer-social-icon">${icons.linkedin}</span>
          </a>
          <a
            href="mailto:${EMAIL}"
            class="footer-social-btn footer-social-btn--email"
            role="listitem"
            aria-label="Send email to ${EMAIL}"
            title="Send Email"
          >
            <span class="footer-social-icon">${icons.mail}</span>
          </a>
          <a
            href="tel:${PHONE}"
            class="footer-social-btn footer-social-btn--phone"
            role="listitem"
            aria-label="Call ${PHONE_DISPLAY}"
            title="Call"
          >
            <span class="footer-social-icon">${icons.phone}</span>
          </a>
        </div>
      </div>

      <!-- Project column -->
      <div class="footer-col">
        <h3 class="footer-col-title">Project</h3>
        <ul class="footer-links" role="list">
          <li role="listitem">
            <a href="${GITHUB_REPO_URL}" target="_blank" rel="noopener noreferrer"
               class="footer-link" aria-label="View N-Trace repository on GitHub">
              Repository ${icons.externalLink}
            </a>
          </li>
          <li role="listitem">
            <a href="${GITHUB_REPO_URL}/stargazers" target="_blank" rel="noopener noreferrer"
               class="footer-link" aria-label="Star N-Trace on GitHub">
              ⭐ Star the Project ${icons.externalLink}
            </a>
          </li>
          <li role="listitem">
            <a href="${GITHUB_REPO_URL}/issues" target="_blank" rel="noopener noreferrer"
               class="footer-link" aria-label="Report an issue on GitHub">
              🐛 Report an Issue ${icons.externalLink}
            </a>
          </li>
          <li role="listitem">
            <a href="${GITHUB_REPO_URL}/blob/main/ROADMAP.md" target="_blank" rel="noopener noreferrer"
               class="footer-link" aria-label="View project roadmap">
              🗺️ Roadmap ${icons.externalLink}
            </a>
          </li>
        </ul>
      </div>

      <!-- Contact column -->
      <div class="footer-col">
        <h3 class="footer-col-title">Contact</h3>
        <ul class="footer-links" role="list">
          <li role="listitem">
            <a href="${GITHUB_PROFILE}" target="_blank" rel="noopener noreferrer"
               class="footer-link footer-contact-link" aria-label="GitHub profile">
              <span class="footer-contact-icon">${icons.github}</span>
              <span>nitinsingh2006</span>
            </a>
          </li>
          <li role="listitem">
            <a href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer"
               class="footer-link footer-contact-link" aria-label="LinkedIn profile">
              <span class="footer-contact-icon">${icons.linkedin}</span>
              <span>Nitin Singh</span>
            </a>
          </li>
          <li role="listitem">
            <a href="mailto:${EMAIL}"
               class="footer-link footer-contact-link" aria-label="Send email">
              <span class="footer-contact-icon">${icons.mail}</span>
              <span>${EMAIL}</span>
            </a>
          </li>
          <li role="listitem">
            <a href="tel:${PHONE}"
               class="footer-link footer-contact-link" aria-label="Call Nitin Singh">
              <span class="footer-contact-icon">${icons.phone}</span>
              <span>${PHONE_DISPLAY}</span>
            </a>
          </li>
        </ul>
      </div>

    </div><!-- /.footer-main -->

    <!-- ═══════════════ Bottom Bar ═══════════════ -->
    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <p class="footer-copyright">
          &copy; ${year} N-Trace. All rights reserved.
        </p>
        <p class="footer-built-with">
          Built with
          <span class="footer-heart" aria-label="love">${icons.heart}</span>
          by&nbsp;<a
            href="${GITHUB_PROFILE}"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-author-link"
            aria-label="Nitin Singh's GitHub profile"
          >Nitin Singh</a>
        </p>
      </div>
    </div>

  </footer>`;
}

// ── Star button pulse animation trigger ────────────────────────────────────
function initFooterInteractions() {
  const starBtn = document.getElementById('btn-footer-star');
  if (!starBtn) return;

  // Add a staggered star pulse on hover
  starBtn.addEventListener('mouseenter', () => {
    starBtn.classList.add('footer-btn-star--pulse');
  });
  starBtn.addEventListener('mouseleave', () => {
    starBtn.classList.remove('footer-btn-star--pulse');
  });
  starBtn.addEventListener('animationend', () => {
    starBtn.classList.remove('footer-btn-star--pulse');
  });
}

// ── Public API ──────────────────────────────────────────────────────────────
/**
 * Renders the footer into the given container element and wires interactions.
 * @param {HTMLElement} container - Element to append the footer into.
 */
export function initFooter(container) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildFooterHTML();
  const footerEl = wrapper.firstElementChild;
  container.appendChild(footerEl);
  initFooterInteractions();
}
