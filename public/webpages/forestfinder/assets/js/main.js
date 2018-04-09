// Serviceworker register
if ('serviceWorker' in navigator) { // If support
  navigator.serviceWorker.register('serviceworker.js', {scope: './'}).then(function (registration) {
    console.log('Service Worker Registered at:', registration.scope)
  }, function (error) {
    console.log('Registration failed', error)
  })
}

(function () {
  'use strict'

// >> Functions
const getLocation = function (callback, err = () => {}) {
  const success = function (pos) { // Successfull get
    console.log(pos)
    if (pos.accuracy < 40) { // In meters
      callback(pos)
    }
   }

   const fail = function (error) { // Error in getting
     console.error(error)
     err() // Let caller know there is a problem

     switch(error.code) {
         case error.PERMISSION_DENIED:
             doc.status.innerText = "User denied the request for Geolocation."
             break
         case error.POSITION_UNAVAILABLE:
             doc.status.innerText = "Location information is unavailable."
             break
         case error.TIMEOUT:
             doc.status.innerText = "The request to get user location timed out."
             break
         case error.UNKNOWN_ERROR:
             doc.status.innerText = "An unknown error occurred."
             break
     }
   }

  // Track the location
  global.track = navigator.geolocation.watchPosition (success, fail, { // Options
    enableHighAccuracy: true,
    maximumAge: 5 * 60 * 1000,
    timeout: 1 * 60 * 1000
  })
}

const getTarget = function () {
  return location("51.466831, 5.559329")
}

const location = function (string, acc) {
  const parts = string.split(',')

  const coord = {
    latitude: parseFloat(parts[0]),
    longitude: parseFloat(parts[1]),
    accuracy: acc // In meters
  }

  return coord
}



// >> Classes


// >> Variables
const doc = {
  status: document.getElementById('status'),
  data: document.getElementById('data')
}

const global = {
  track: null
}

// >> Run
// Check available
if ("geolocation" in navigator) {
  doc.status.innerText = "Getting location"
  getLocation((pos) => {
    doc.status.innerText = JSON.stringify(pos.coords)
  })
} else {
  doc.status.innerText = "Location data not available on this device."
}


}.call(this))
