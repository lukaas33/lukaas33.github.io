var cacheUrls = [];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("site-cache-v1").then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(cacheUrls);
    })
  );
});
