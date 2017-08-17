var cacheName = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  'index.html',
  'Manifest.json'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(cacheName)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});
