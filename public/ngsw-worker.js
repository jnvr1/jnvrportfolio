// public/ngsw-worker.js
// No-op service worker that evicts the legacy Angular @angular/service-worker.
// Same path (/ngsw-worker.js) so returning visitors auto-pick this up.

self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      // Clear ALL caches (Angular SW namespaces: ngsw:*, assets:*, etc.)
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch (_e) {
      // Best-effort. Even if deletion fails, unregister still wins.
    }

    // Take over any open tabs immediately so they stop using the old SW.
    if (self.clients && typeof self.clients.claim === 'function') {
      await self.clients.claim();
    }

    // Self-destruct: future page loads will not re-register.
    if (self.registration && typeof self.registration.unregister === 'function') {
      await self.registration.unregister();
    }
  })());
});

// Pass-through fetch (do NOT serve from the dead Angular caches).
self.addEventListener('fetch', () => {});
