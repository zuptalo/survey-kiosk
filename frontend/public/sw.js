// Service Worker for Dream Dose Survey Kiosk
// Cache version - updated automatically on build
const CACHE_VERSION = '__CACHE_VERSION__';
const CACHE_NAME = `survey-kiosk-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log(`Service Worker: Installing version ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting and activate immediately');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`Service Worker: Activating version ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Service Worker: Deleting old cache ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  // Skip API requests - always fetch from network
  if (event.request.url.includes('/api/')) {
    return;
  }

  const url = new URL(event.request.url);

  // Network-first strategy for HTML files and navigation requests
  // This ensures users always get the latest app version
  if (event.request.mode === 'navigate' ||
      event.request.destination === 'document' ||
      url.pathname.endsWith('.html') ||
      url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update cache with fresh response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails (offline)
          return caches.match(event.request)
            .then((response) => response || caches.match('/index.html'));
        })
    );
    return;
  }

  // Cache-first strategy for static assets (CSS, JS, images)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((fetchResponse) => {
            // Cache new resources
            return caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache GET requests
                if (event.request.method === 'GET') {
                  cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
              });
          });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/index.html');
      })
  );
});
