self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('weather').then((cache) => cache.addAll([
      '/prototypes/weather/',
      '/prototypes/weather/index.html',
      '/prototypes/weather/script.js',
     
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});