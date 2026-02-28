/**
 * Generates sw.js with pre-cache URLs extracted from the built index.html and dist folder.
 * Run after: expo export -p web
 * This ensures the service worker pre-caches the JS/CSS bundles for offline use.
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');
const swPath = path.join(distDir, 'sw.js');

const CACHE = 'fishing-rules-v3'; // bump when you change cache strategy

const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Extract URLs from index.html: href, src attributes
const urls = ['/', '/index.html'];
const hrefRegex = /href="([^"]+)"/g;
const srcRegex = /src="([^"]+)"/g;
let m;
while ((m = hrefRegex.exec(indexHtml)) !== null) {
  const url = m[1].startsWith('/') ? m[1] : '/' + m[1];
  if (!urls.includes(url)) urls.push(url);
}
while ((m = srcRegex.exec(indexHtml)) !== null) {
  const url = m[1].startsWith('/') ? m[1] : '/' + m[1];
  if (!urls.includes(url)) urls.push(url);
}

// Also add all files from dist (assets, etc.) for full offline support
function addDistFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.join(base, e.name).replace(/\\/g, '/');
    const url = '/' + rel;
    if (e.isDirectory()) {
      addDistFiles(full, rel);
    } else if (!url.endsWith('.map') && !url.endsWith('metadata.json')) {
      if (!urls.includes(url)) urls.push(url);
    }
  }
}
addDistFiles(distDir);

const swContent = `// sw.js — offline cache for Fishing Rules PWA (generated)
const CACHE = "${CACHE}";

const PRECACHE_URLS = ${JSON.stringify(urls)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {})
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
`;

fs.writeFileSync(swPath, swContent);
console.log('Generated sw.js with pre-cache URLs:', urls);
