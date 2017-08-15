var cacheUrls = [
  "index.html",
  "manifest.json",
  "assets/css/main.css",
  "assets/javascript/setup.js",
  "assets/javascript/main.js",
  "assets/javascript/scripts.js"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("site-cache-v1").then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(cacheUrls);
    })
  );
});
