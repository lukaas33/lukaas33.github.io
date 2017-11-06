var cacheName = 'cached-files'
var urlsToCache = [
  'index.html',
  'manifest.json',
  'assets/javascript/home.js'
]

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('Opened cache')
      cache.addAll(urlsToCache)
    })
  )
})
