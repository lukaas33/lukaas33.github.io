// Functionality setup used by all pages

// Serviceworker register
if ('serviceWorker' in navigator) { // If support
  navigator.serviceWorker.register('serviceworker.js', {scope: './'}).then(function (registration) {
    console.log('Service Worker Registered at:', registration.scope)
  }, function (error) {
    console.log('Registration failed', error)
  })
}

// Setup local storage
if (typeof(Storage) !== 'undefined') {
  if (localStorage.getItem('achievements') === null) {
    $.getJSON('assets/storage/achievements.json', (data) => {
      // Add the data if it doesn't exist
      localStorage.setItem('achievements', JSON.stringify(data))
      console.log('Stored the achievements')
    })
  }
  if (localStorage.getItem('results') === null) {
    // Add empty object to be filled
    localStorage.setItem('results', JSON.stringify({content: []}))
    console.log('Added local storage object')
  }
} else {
  // TODO use alternative
  console.log('No support for local storage')
}
