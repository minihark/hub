/**
 * Harkco Hub Service Worker
 * High-craft offline caching & instant launch engine
 */

const CACHE_NAME = 'harkco-hub-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// Install: precache app shell and take over immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: purge stale cache versions and claim all open clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: specialized routing for Navigation, Assets, and Fleet API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or browser extension schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML Documents)
  // Network-first with instant fallback to cached app shell (index.html)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          return fallback || new Response('Offline — Harkco Hub', { status: 200, headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS bundles, fonts, icons)
  // Cache-first with stale-while-revalidate update
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icon') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. API Telemetry & Changelog Endpoints
  // Network-first with fallback to cached telemetry for offline review
  if (url.pathname === '/api/fleet' || url.pathname === '/api/changelog') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ offline: true, error: 'Network unavailable' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // 4. Default: fetch with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Message listener for manual client actions (e.g. skipWaiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
