window.addEventListener('load', function () {
  // Serviceworker register
  if ('serviceWorker' in navigator) { // If support
    navigator.serviceWorker.register('serviceworker.js', {scope: './'}).then(function (registration) {
      console.log('Service Worker Registered at:', registration.scope)
    }, function (error) {
      console.log('Registration failed', error)
    })
  }

  // TODO Setup local storage
})
