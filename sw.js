// sw.js — ultra-simple offline cache for your PWA
const CACHE = "fishing-rules-v1"; // bump this to clear old cache when you ship updates

self.addEventListener("install", (event) => {
  // Pre-cache your entry points so offline works immediately after the first visit
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/", "/index.html"]).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clean up old caches when you update CACHE version
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for everything. If not cached yet, fetch and store it for next time.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Don’t try to cache non-GET requests
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Clone and store successful responses for future offline use
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          // If offline and asking for the app shell, fall back to index.html
          if (req.mode === "navigate") {
            const fallback = await caches.match("/index.html");
            if (fallback) return fallback;
          }
          throw new Error("Offline and not cached");
        });
    })
  );
});
