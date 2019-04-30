// Files to store
const cacheName = 'cached-files'
const urlsToCache = [
  // ".",
  // "herbarium/",
  // "opties/",
  // "serviceworker.js",
  // "manifest.json",
  // "index.html",
  // "herbarium/index.html",
  // "opties/index.html",
  //
  // "assets/elements/menu.html",
  // "assets/elements/export.html",
  //
  // "assets/js/database.js",
  // "assets/js/game.js",
  // "assets/js/menu.js",
  // "assets/js/navigation.js",
  // "assets/js/quiz.js",
  // "assets/js/herbarium.js",
  // "assets/js/export.js",
  // "assets/js/opties.js",
  //
  // "assets/style/export.css",
  // "assets/style/home.css",
  // "assets/style/opties.css",
  // "assets/style/herbarium.css",
  //
  // "assets/images/clear.svg",
  // "assets/images/logo.svg",
  // "assets/images/nature.svg",
  // "assets/images/score.svg",
  // "assets/images/date.svg",
  // "assets/images/flag.svg",
  // "assets/images/Logo.svg",
  // "assets/images/navigation.svg",
  // "assets/images/settings.svg",
  // "assets/images/delete.svg",
  // "assets/images/forward.svg",
  // "assets/images/mail.svg",
  // "assets/images/placeholder.svg", // TODO minify this image
  // "assets/images/skip.svg",
  // "assets/images/download.svg",
  // "assets/images/game-over.jpg",
  // "assets/images/menu.svg",
  // "assets/images/refresh.svg",
  //
  // "assets/images/favicon/android-chrome-192x192.png",
  // "assets/images/favicon/browserconfig.xml",
  // "assets/images/favicon/favicon.ico",
  // "assets/images/favicon/android-chrome-512x512.png",
  // "assets/images/favicon/favicon-16x16.png",
  // "assets/images/favicon/mstile-150x150.png",
  // "assets/images/favicon/apple-touch-icon.png",
  // "assets/images/favicon/favicon-32x32.png",
  // "assets/images/favicon/safari-pinned-tab.svg",
  //
  // "https://cdn.jsdelivr.net/npm/geolib@2.0.24/dist/geolib.min.js"
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
// https://developers.google.com/web/ilt/pwa/offline-quickstart
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      return response || fetchAndCache(event.request);
    })
  );
});

function fetchAndCache(url) {
  return fetch(url)
  .then(function(response) {
    // Check if we received a valid response
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return caches.open(CACHE_NAME)
    .then(function(cache) {
      cache.put(url, response.clone());
      return response;
    });
  })
  .catch(function(error) {
    console.log('Request failed:', error);
    // You could return a custom offline 404 page here
  });
}
