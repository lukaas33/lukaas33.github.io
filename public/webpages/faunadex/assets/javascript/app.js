window.addEventListener('load', function () {
  // Serviceworker register
  if ('serviceWorker' in navigator) { // If support
    navigator.serviceWorker.register('serviceworker.js').then(function () {
      console.log('Service Worker Registered')
    }, function (error) {
      console.log('Registration failed', error)
    })
  }

  // Setup local storage
  // TODO create code
})
