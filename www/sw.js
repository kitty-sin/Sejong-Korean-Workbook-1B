const CACHE_NAME = 'sejong-workbook-1b-v1.0.2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './src/css/pastel.css',
  './src/css/reader.css',
  './src/css/overlay.css',
  './src/js/app.js',
  './src/js/kitty-voice.js',
  './src/js/reader-engine.js',
  './src/js/study-engine.js',
  './src/data/book_meta.json',
  './src/data/hotspots.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return fetchResponse;
      });
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});
