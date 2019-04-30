// Files to store
const cacheName = 'cached-files'
const urlsToCache = [
  ".",
  "herbarium/",
  "opties/",
  "manifest.json",
  "index.html",
  "herbarium/index.html",
  "opties/index.html",

  "assets/elements/menu.html",
  "assets/elements/export.html",

  "assets/js/database.js",
  "assets/js/game.js",
  "assets/js/menu.js",
  "assets/js/navigation.js",
  "assets/js/quiz.js",
  "assets/js/herbarium.js",
  "assets/js/export.js",
  "assets/js/opties.js",

  "assets/style/export.css",
  "assets/style/home.css",
  "assets/style/opties.css",
  "assets/style/herbarium.css",

  "assets/images/clear.svg",
  "assets/images/logo.svg",
  "assets/images/nature.svg",
  "assets/images/score.svg",
  "assets/images/date.svg",
  "assets/images/flag.svg",
  "assets/images/navigation.svg",
  "assets/images/settings.svg",
  "assets/images/delete.svg",
  "assets/images/forward.svg",
  "assets/images/mail.svg",
  "assets/images/placeholder.svg",
  "assets/images/skip.svg",
  "assets/images/download.svg",
  "assets/images/game-over.jpg",
  "assets/images/menu.svg",
  "assets/images/refresh.svg",

  "assets/images/favicon/android-chrome-192x192.png",
  "assets/images/favicon/browserconfig.xml",
  "assets/images/favicon/favicon.ico",
  "assets/images/favicon/android-chrome-512x512.png",
  "assets/images/favicon/favicon-16x16.png",
  "assets/images/favicon/mstile-150x150.png",
  "assets/images/favicon/apple-touch-icon.png",
  "assets/images/favicon/favicon-32x32.png",
  "assets/images/favicon/safari-pinned-tab.svg",

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

// Get data from cache
// https://developers.google.com/web/fundamentals/primers/service-workers/
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Cache hit - return response
      if (response) {
        return response
      }

      return fetch(event.request).then(
        function(response) {
          // Check if we received a valid response
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          let responseToCache = response.clone()

          caches.open(cacheName).then(function (cache) {
            cache.put(event.request, responseToCache)
          })

          return response
        }
      )
    })
  )
})

// Activate cache management
self.addEventListener('activate', function (event) {

  const cacheWhitelist = [cacheName]

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
