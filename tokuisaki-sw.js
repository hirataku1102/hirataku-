// 得意先検索 PWA 用サービスワーカー
// 画面の「見た目のファイル」だけをキャッシュします。
// 得意先データはFirestoreから取得するため、ここには一切保存されません。
const CACHE_NAME = 'tokuisaki-kensaku-v6';
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

// 同じ場所にあるファイルだけを扱う。
// まずネットワークを見に行き、取れたらキャッシュも更新する（更新がすぐ反映される）。
// 圏外のときだけキャッシュを使う。
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // Firebase等は素通し

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./tokuisaki-kensaku.html')))
  );
});
