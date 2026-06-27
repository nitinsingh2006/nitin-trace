/**
 * NitinTrace — Onboarding Tour (5-step tooltip overlay)
 *
 * First-visit guided tour pointing to key UI landmarks.
 * Persists completion via localStorage.
 */
import './onboarding.css';

const STEPS = [
  {
    target: '.panel-editor',
    title: 'Write code here',
    text: 'Type or paste your source code into the editor panel to get started.',
    placement: 'bottom'
  },
  {
    target: '#language-select',
    title: 'Pick a language',
    text: 'Select the programming language of your code for accurate execution tracing.',
    placement: 'bottom'
  },
  {
    target: '#btn-trace',
    title: 'Click Trace',
    text: 'Hit the Trace button to simulate execution and visualize each step.',
    placement: 'top'
  },
  {
    target: '.panel-visualizer',
    title: 'See your trace',
    text: 'Watch your code execute step-by-step with variable states, call stacks, and more.',
    placement: 'left'
  },
  {
    target: '#btn-settings',
    title: 'Change settings',
    text: 'Configure your AI provider, API keys, themes, and other preferences here.',
    placement: 'bottom'
  }
];

const STORAGE_KEY = 'nitintrace_onboarding_done';

function hasCompletedOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markOnboardingComplete() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function initOnboarding() {
  if (hasCompletedOnboarding()) return;

  let currentStep = 0;
  let backdrop = null;
  let tooltip = null;

  function createBackdrop() {
    backdrop = document.createElement('div');
    backdrop.className = 'onboarding-backdrop';
    document.body.appendChild(backdrop);
  }

  function removeBackdrop() {
    if (backdrop && backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
    backdrop = null;
  }

  function createTooltip(stepIndex) {
    if (tooltip && tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }

    const step = STEPS[stepIndex];
    const targetEl = document.querySelector(step.target);
    if (!targetEl) {
      endTour();
      return;
    }

    const isLast = stepIndex === STEPS.length - 1;

    tooltip = document.createElement('div');
    tooltip.className = `onboarding-tooltip onboarding-${step.placement}`;

    tooltip.innerHTML = `
      <div class="onboarding-step-indicator">${stepIndex + 1} / ${STEPS.length}</div>
      <div class="onboarding-tooltip-title">${step.title}</div>
      <div class="onboarding-tooltip-text">${step.text}</div>
      <div class="onboarding-tooltip-actions">
        <button class="onboarding-skip-btn">Skip</button>
        <button class="onboarding-next-btn">${isLast ? 'Got it!' : 'Next'}</button>
      </div>
    `;

    document.body.appendChild(tooltip);

    positionTooltip(tooltip, targetEl, step.placement);

    const nextBtn = tooltip.querySelector('.onboarding-next-btn');
    const skipBtn = tooltip.querySelector('.onboarding-skip-btn');

    nextBtn.addEventListener('click', () => {
      if (isLast) {
        markOnboardingComplete();
        endTour();
      } else {
        currentStep++;
        createTooltip(currentStep);
      }
    });

    skipBtn.addEventListener('click', () => {
      markOnboardingComplete();
      endTour();
    });
  }

  function positionTooltip(el, target, placement) {
    const targetRect = target.getBoundingClientRect();
    const gap = 12;
    let top, left;

    switch (placement) {
      case 'top':
        top = targetRect.top - gap - el.offsetHeight;
        left = targetRect.left + targetRect.width / 2 - el.offsetWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + targetRect.width / 2 - el.offsetWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - el.offsetHeight / 2;
        left = targetRect.left - gap - el.offsetWidth;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - el.offsetHeight / 2;
        left = targetRect.right + gap;
        break;
      default:
        top = targetRect.bottom + gap;
        left = targetRect.left + targetRect.width / 2 - el.offsetWidth / 2;
    }

    top = Math.max(gap, Math.min(top, window.innerHeight - el.offsetHeight - gap));
    left = Math.max(gap, Math.min(left, window.innerWidth - el.offsetWidth - gap));
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  }

  function onResize() {
    if (tooltip && currentStep < STEPS.length) {
      const step = STEPS[currentStep];
      const targetEl = document.querySelector(step.target);
      if (targetEl) {
        positionTooltip(tooltip, targetEl, step.placement);
      }
    }
  }

  function endTour() {
    removeBackdrop();
    if (tooltip && tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }
    tooltip = null;
    window.removeEventListener('resize', onResize);
  }

  window.addEventListener('resize', onResize);
  createBackdrop();
  createTooltip(0);
}
