// The apps serviceworker
    // Serviceworker code from https://developers.google.com/web/fundamentals/primers/service-workers/

// Files to cache for quick loading TODO divide cache
const cacheName = 'cached-files'
const urlsToCache = [
  ".", // Self
  "index.html",
  "results/index.html",
  "scan/index.html",
  "manifest.json",
  'assets/storage/achievements.json',
  "assets/images/icons/internet.svg",
  "assets/images/icons/location.svg",
  "assets/images/icons/menu.svg",
  "assets/images/icons/search.svg",
  "assets/images/icons/sort.svg",
  "assets/images/icons/store.svg",
  "assets/images/icons/unchecked.svg",
  "assets/images/icons/back.svg",
  "assets/images/icons/camera.svg",
  "assets/images/icons/checked.svg",
  "assets/images/icons/close.svg",
  "assets/images/icons/date.svg",
  "assets/images/icons/done.svg",
  "assets/images/icons/gallery.svg",
  "assets/images/favicon/safari-pinned-tab.svg",
  "assets/images/favicon/android-chrome-192x192.png",
  "assets/images/favicon/android-chrome-512x512.png",
  "assets/images/favicon/apple-touch-icon.png",
  "assets/images/favicon/browserconfig.xml",
  "assets/images/favicon/favicon.ico",
  "assets/images/favicon/favicon-16x16.png",
  "assets/images/favicon/favicon-32x32.png",
  "assets/images/favicon/mstile-70x70.png",
  "assets/images/favicon/mstile-144x144.png",
  "assets/images/favicon/mstile-150x150.png",
  "assets/images/favicon/mstile-310x150.png",
  "assets/images/favicon/mstile-310x310.png",
  "assets/images/other/logo-color.svg",
  "assets/images/other/preview.jpg",
  "assets/css/home.css",
  "assets/css/scan.css",
  "assets/css/results.css",
  "assets/css/result.css",
  "assets/javascript/app.js",
  "assets/javascript/home.js",
  "assets/javascript/results.js",
  "assets/javascript/scan.js",
  "assets/javascript/partials/menu.js",
  "assets/javascript/partials/shared.js",
  "assets/javascript/libraries/clarifai.min.js",
  "assets/javascript/libraries/ejs.js",
  "assets/javascript/libraries/lz-string.min.js",
  "assets/javascript/libraries/jquery.js",
  "assets/storage/achievements.json",
  "assets/storage/animal-names.json"
]


// TODO notifications and defered actions

// Perform install steps
self.addEventListener('install', function (event) {
  debugger // Use the debugger
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
