// The apps serviceworker
    // Serviceworker code from https://developers.google.com/web/fundamentals/primers/service-workers/

// Files to cache for offline loading
const cacheName = 'cached-files'
const urlsToCache = [
  ".", // Self
  "index.html",
  "assets/css/main.css",
  "assets/js/main.js"
]


// TODO defered actions

// Perform install steps
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    })
  )
})

// Return cached data
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Cache hit - return response
      if (response) {
        return response
      }
      return fetch(event.request)
    })
  )
})

// On startup
self.addEventListener('activate', function (event) {
  console.log('Activated')
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          return caches.delete(key) // Delete old file
        }
      }))
    })
  )
  return self.clients.claim()
})
