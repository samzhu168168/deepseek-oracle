/** Service Worker for Elemental Bond PWA */
const CACHE_NAME = "elemental-bond-v1";

const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/og-image.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install: precache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }),
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// Fetch: network-first for pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network only (no cache)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Static assets: cache-first
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/og-image.png"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    );
    return;
  }

  // Navigation / pages: network-first, fallback to cache, then offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for future offline use
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match("/offline.html");
        });
      }),
  );
});
