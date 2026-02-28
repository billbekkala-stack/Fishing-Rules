// sw.js — offline cache for Fishing Rules PWA
const CACHE = "fishing-rules-v2"; // bump this to clear old cache when you ship updates

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/", "/index.html"]).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          if (req.mode === "navigate") {
            const fallback = await caches.match("/index.html");
            if (fallback) return fallback;
          }
          throw new Error("Offline and not cached");
        });
    })
  );
});
