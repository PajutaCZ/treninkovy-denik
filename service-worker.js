const CACHE = 'treninkovy-denik-v4';
const FILES = [
  './',
  './index.html',
  './style.css?v=4',
  './version.js?v=4',
  './manifest.json',
  './icon.svg?v=2',
  './version.json',
  './assets/bench-press.png',
  './assets/overhead-triceps-extension.png',
  './assets/push-up-knees.png',
  './assets/push-up-male.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (new URL(event.request.url).pathname.endsWith('/version.json')) return;
  event.respondWith(caches.match(event.request)
    .then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html'))));
});

