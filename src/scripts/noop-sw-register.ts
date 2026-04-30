/**
 * Registers the no-op service worker that evicts the legacy Angular SW.
 * Imported from BaseLayout.astro <head> as an inline <script>.
 *
 * Design decision: register on window.load (idle) to avoid LCP penalty.
 * One stale render for the first returning visit is acceptable.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/ngsw-worker.js', { updateViaCache: 'none' })
      .then((reg) => {
        // If a brand-new SW just took control, we don't need to reload.
        if (reg.active && !navigator.serviceWorker.controller) {
          return;
        }
        void reg;
      })
      .catch(() => {
        // Ignore SW registration failures — the site works without it.
      });

    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloaded) {
        reloaded = true;
        window.location.reload();
      }
    });
  });
}
