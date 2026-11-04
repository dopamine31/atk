const CACHE = 'kasir-atk-v3';
const ASSETS = [
  './', './index.html', './manifest.json',
  './assets/icons/icon.svg',
  './css/base.css', './css/components.css', './css/print.css',
  './js/utils.js', './js/state.js', './js/ui.js', './js/cart.js',
  './js/logo.js', './js/receipt.js', './js/escpos.js',
  './js/printer.js', './js/printer-serial.js', './js/printer-ble.js',
  './js/products.js', './js/history.js', './js/settings.js',
  './js/backup.js', './js/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: selalu ambil versi terbaru, pakai cache jika offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});