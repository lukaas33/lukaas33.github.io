// Files to store
const cacheName = 'cached-files'
const urlsToCache = [
  // ".", // Self
  // "manifest.json",
  // "index.html",
  // "herbarium/index.html",
  // "opties/index.html",
  // "assets/elements/menu.html",
  // "assets/js/database.js",
  // "assets/js/game.js",
  // "assets/js/menu.js",
  // "assets/js/navigation.js",
  // "assets/js/quiz.js",
  // "assets/js/plant.js",
  // "assets/style/home.css",
  // "assets/style/opties.css",
  // "assets/style/herbarium.css",
  "https://cdn.jsdelivr.net/npm/geolib@2.0.24/dist/geolib.min.js"
]


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
    caches.match(event.request).then((response) => {
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
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          return caches.delete(key) // Delete old file
        }
      }))
    })
  )
  return self.clients.claim()
})
