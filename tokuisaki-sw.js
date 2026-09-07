const CACHE_NAME = 'tokuisaki-kensaku-v5';
const FILES_TO_CACHE = [
  './tokuisaki-kensaku.html',
  './tokuisaki-manifest.json',
  './tokuisaki-icon-192.png',
  './tokuisaki-icon-256.png',
  './tokuisaki-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
