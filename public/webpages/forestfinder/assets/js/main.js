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

  let heading = null
  if (position.heading) { // Not null
    heading = targetAngle - rad(position.heading) // Return relative to the heading direction
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

// Gets the target location from a 'database'
const getTarget = function (callback) {
  if (false) { // Exists in storage

  } else { // Need to get
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText)

        const lines = this.responseText.split('\n')
        const names = lines[0].split(',')

        for (let i = 1; i < lines.length; i++) {
          let line = lines[i].split(',')
          let object = {}
          for (let j in line) {
            let val = line[j]
            // Convert to numbers if possible
            if (!isNaN(parseFloat(val))) {
              val = parseFloat(val)
            }

            object[names[j]] = val
          }

          global.data.push(object)
        }

        console.log(global.data)
        callback()
      }
    }
    xhttp.open("GET", constants.database, true)
    xhttp.send()
  }
}


// >> Classes


// >> Variables
const doc = {
  status: document.getElementById('status'),
  data: document.getElementById('data'),
  distance: document.getElementById('distance'),
  dir: document.getElementById('dir'),
  compass: document.getElementById('compass')
}

const global = {
  track: null,
  data: [],
  at: null
}

const constants = {
  radius: 6.371e6, // Of Earth
  database: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKWPQTIs8YZoVGNTRzE1iMiAmEWIsqs9xv0aBzTWIisn338KClhoAA0nuA4-8CS0b6CBjA433s2VIe/pub?gid=0&single=true&output=csv"
}

// >> Run
// Check available
if ("geolocation" in navigator) {
  doc.status.innerText = "Getting location"
  // First get the target
  getTarget(() => {
    // Start getting the location
    getLocation((pos) => {
      doc.status.innerText = "" // Empty

      const dir = directions(pos.coords, global.data[global.at])
      doc.distance.innerText = dir.distance + ' meter'

      if (dir.heading) {
        doc.dir.setAttribute('transform', `rotate(${dir.heading * 180 / Math.PI} ${doc.compass.cx.baseVal.value} ${doc.compass.cy.baseVal.value})`)
      }

    }, () => {
      doc.status.innerText = "Something went wrong."
    })
  })
} else {
  doc.status.innerText = "Location data not available on this device."
}


}.call(this))
