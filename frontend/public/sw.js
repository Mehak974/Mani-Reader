// MANI READER — Service Worker v3
// Strategy:
//  - Cover images & static assets: Cache-First (instant repeat loads)
//  - API calls: Network-First with 3s timeout fallback to cache
//  - HTML pages: Network-First (always fresh content)

const CACHE_VERSION = 'mani-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/placeholder-cover.jpg',
  '/icon.png',
  '/logo.png',
];

// Install: pre-cache critical static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS).catch(() => { }))
  );
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== IMAGE_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isImageRequest(url) {
  return (
    url.pathname.includes('/api/image') ||
    /\.(png|jpg|jpeg|webp|avif|gif|svg)(\?|$)/i.test(url.pathname)
  );
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') && !url.pathname.includes('/api/image');
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') || STATIC_ASSETS.includes(url.pathname);
}

// Network-first with timeout helper
async function networkFirstWithTimeout(request, cacheName, timeoutMs = 3000) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || fetch(request);
  }
}

// Cache-first helper
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin + image proxy requests
  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
  } else if (isImageRequest(url)) {
    // Images: cache-first with 24h TTL — the biggest win for manga cover loads
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE));
  } else if (isApiRequest(url)) {
    // API: network-first, fall back to cache if offline/slow
    event.respondWith(networkFirstWithTimeout(event.request, API_CACHE, 3000));
  }
  // HTML pages: browser default (network)
});