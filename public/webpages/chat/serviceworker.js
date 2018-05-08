// The apps serviceworker
    // Serviceworker code from https://developers.google.com/web/fundamentals/primers/service-workers/

// Files to cache for quick loading TODO divide cache
const cacheName = 'cached-files'
const urlsToCache = [
  ".", // Self
  "index.html",
  "manifest.json",
  "assets/css/main.css",
  "assets/js/main.js",
  "assets/icons/logo.svg",
  "assets/icons/send.svg",
  "assets/icons/favicon/android-chrome-192x192.png",
  "assets/icons/favicon/android-chrome-512x512.png",
  "assets/icons/favicon/apple-touch-icon.png",
  "assets/icons/favicon/browserconfig.xml",
  "assets/icons/favicon/favicon-16x16.png",
  "assets/icons/favicon/favicon-32x32.png",
  "assets/icons/favicon/favicon.ico",
  "assets/icons/favicon/mstile-144x144.png",
  "assets/icons/favicon/mstile-150x150.png",
  "assets/icons/favicon/mstile-310x150.png",
  "assets/icons/favicon/mstile-310x310.png",
  "assets/icons/favicon/mstile-70x70.png",
  "assets/icons/favicon/safari-pinned-tab.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/big-integer/1.6.28/BigInteger.min.js"
]

// Notification
self.addEventListener('push', function(event) {
  console.log(`Push had this data: "${event.data.text()}"`)

  const title = 'Chat';
  const options = {
    body: 'Yay it works.',
    icon: 'assets/icons/favicon/favicon-16x16.png',
    badge: 'assets/icons/favicon/android-chrom-192x192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options))
})

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
