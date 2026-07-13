/**
 * Registers the no-op service worker that evicts the legacy Angular SW.
 * Imported from BaseLayout.astro <head> as an inline <script>.
 *
 * Design decision: register on window.load (idle) to avoid LCP penalty.
 * One stale render for the first returning visit is acceptable.
 */
if ('serviceWorker' in navigator) {
  // Snapshot at load: only a RETURNING visitor has an existing controller (the
  // legacy Angular SW). First-time visitors have none — the no-op SW's
  // clients.claim() fires controllerchange on its first takeover, which must
  // NOT trigger a reload (otherwise every new visitor eats a full-page reload).
  const hadController = !!navigator.serviceWorker.controller;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/ngsw-worker.js', { updateViaCache: 'none' })
      .catch(() => {
        // Ignore SW registration failures — the site works without it.
      });

    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload only when an OLD controller is being REPLACED (Angular SW
      // eviction for returning visitors), never on first takeover.
      if (hadController && !reloaded) {
        reloaded = true;
        window.location.reload();
      }
    });
  });
}
