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
// Returns distance and the direction
const directions = function (position, target) {
  const rad = (deg) => deg * Math.PI / 180

  // https://www.movable-type.co.uk/scripts/latlong.html
  const lat1 = rad(position.latitude)
  const lat2 = rad(target.latitude)
  const dlat = rad(target.latitude - position.latitude)
  const dlon = rad(target.longitude - position.longitude)

  const ha =  (Math.sin(dlat / 2) ** 2) + (Math.cos(lat1) * Math.cos(lat2)) * (Math.sin(dlon / 2) ** 2)
  const c = 2 * Math.atan2(Math.sqrt(ha), Math.sqrt(1 - ha))
  const dist = c * constants.radius // Distance between points

  // https://stackoverflow.com/questions/3809179/angle-between-2-gps-coordinates
  const dy = target.latitude - position.latitude
  const dx = Math.cos(rad(position.latitude)) * (target.longitude - position.longitude)
  const targetAngle = Math.atan2(dy, dx) // Angle between user and target

  if (position.heading) { // Not null
    const heading = targetAngle - position.heading // Return relative to the heading direction
  } else {
    const heading = null
  }

  return {
    distance: dist,
    heading: heading
  }
}

// Gets the user location
const getLocation = function (callback, err = () => { }) {
  const success = function (pos) { // Successfull get
    console.log(pos)
    if (pos.coords.accuracy < 20) { // In meters
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

// Gets the target location
const getTarget = function () { // TODO get this from a database
  const coord = {
    latitude: 51.465891,
    longitude: 5.558564,
    accuracy: 5 // In meters
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
  track: null,
  loc: {
    now: null,
    last: null
  }
}

const constants = {
  radius: 6.371e6 // Of Earth
}

// >> Run
// Check available
if ("geolocation" in navigator) {
  doc.status.innerText = "Getting location"
  // First get the target
  const target = getTarget()
  // Start getting the location
  getLocation((pos) => {
    global.loc.last = global.loc.now
    global.loc.now = pos.coords

    doc.status.innerText = JSON.stringify(pos.coords)
    console.log(JSON.stringify(directions(pos.coords, target)))
  }, () => {
    doc.status.innerText = "Something went wrong."
  })
} else {
  doc.status.innerText = "Location data not available on this device."
}


}.call(this))
