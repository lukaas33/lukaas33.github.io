// Files to store
const cacheName = 'cached-files'
const urlsToCache = [
  ".",
  "herbarium/",
  "herbarium/?id=",
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

  "https://cdn.jsdelivr.net/npm/geolib@3.0.4/lib/index.min.js",
  "https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js"
]


// Perform install steps
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Get data from cache
// https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        return response
      }
      return fetch(event.request)

      .then(response => {
        return caches.open(cacheName).then(cache => {
          cache.put(event.request.url, response.clone())
          return response;
        })
      })

    }).catch(error => {
      console.warn(error)
      let url = event.request.url
      if (url.indexOf('.png') !== -1 || url.indexOf('.jpg') !== -1 || url.indexOf('.svg') !== -1 ) {
        return fetch("assets/images/placeholder.svg") // Return the placeholder
      } else {
        let response = new Response(new Blob(), {"status": 404})
        return response
      }
    })
  )
})

// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request).then(function (response) {
//       // Cache hit - return response
//       if (response) {
//         return response
//       }
//
//       return fetch(event.request).then(
//         function (response) {
//           // Check if we received a valid response
//           if (response.ok || response.type === 'opaque') {
//             return response
//           } else if (response.status === 404) {
//             return fetch("assets/images/placeholder.svg")
//           }
//
//           let responseToCache = response.clone()
//
//           caches.open(cacheName).then(function (cache) {
//             cache.put(event.request, responseToCache)
//           })
//
//           return response
//         }
//       )
//     }).catch(
//       function (error) {
//         return fetch("assets/images/placeholder.svg") // Return the placeholder
//       }
//     )
//   )
// })

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
