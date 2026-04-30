/**
 * Scroll reveal via IntersectionObserver.
 * Used by ScrollReveal.astro — applies data-reveal attribute to trigger CSS transitions.
 *
 * Respects prefers-reduced-motion: when reduced motion is requested, elements
 * skip the animation and appear in their final visible state immediately.
 */

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initScrollReveal(): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-scroll-reveal]');

  if (prefersReducedMotion) {
    // Skip animation — show everything in final state immediately
    elements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.removeAttribute('data-scroll-reveal');
    });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    // Fallback for very old browsers
    elements.forEach((el) => el.setAttribute('data-revealed', ''));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', '');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -32px 0px' },
  );

  elements.forEach((el) => observer.observe(el));
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
  initScrollReveal();
}
