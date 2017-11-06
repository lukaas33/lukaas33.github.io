// Serviceworker code from https://developers.google.com/web/fundamentals/primers/service-workers/
var cacheName = 'cached-files'
var urlsToCache = [
  'index.html',
  'manifest.json',
  'assets/javascript/home.js',
  'assets/javascript/libraries/jquery.js',
  'assets/javascript/libraries/ejs.js',
  // 'assets/css/home.css'
  // 'assets/images/other/logo-white.svg',
  // 'assets/images/other/preview.jpg',
]

// Perform install steps
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    })
  )
})

// Return cached data
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // Cache hit - return response
        if (response) {
          return response
        }
        return fetch(event.request)
      }
    )
  )
})
