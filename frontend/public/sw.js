// MANI READER - SERVICE WORKER (SELF-DESTRUCT MODE 🛡️)
// This version clears all caches and stops intercepting JS/CSS to resolve ReferenceErrors.

const CACHE_NAME = 'mani-reader-v2-flush';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
  console.log('🛡️ Service Worker: Cache Flushed and Disabled');
});

// Pass-through everything to the network
self.addEventListener('fetch', (event) => {
  return; // Do nothing, let network handle it
});
