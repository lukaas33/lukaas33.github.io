// Serviceworker register
if ('serviceWorker' in navigator) { // If support
  navigator.serviceWorker.register('serviceworker.js', {scope: './'}).then(function (registration) {
    console.log('Service Worker Registered at:', registration.scope)
  }, function (error) {
    console.log('Registration failed', error)
  })
}

// TODO add data entry option
// TODO store tree data for limited time
// TODO generate sequence of trees to be unique per user
// TODO make sure all exceptions are handled
// TODO add fallbacks for other devices and browsers
// TODO design
// TODO dutch language support

// TODO continue with new one after first one is found

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
  let targetAngle = Math.atan2(dy, dx) // Angle between user and target
  targetAngle = (targetAngle + 1.5 * Math.PI) % (2 * Math.PI) // 0 is north

  return {
    distance: dist,
    angle: targetAngle
  }
}

// Gets the user location
const getLocation = function (callback, err = () => { }) {
  const success = function (pos) { // Successfull get
    console.log("Position:", pos)
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
    timeout:  15 * 1000
  })
}

const storage = function () {

}

// Gets the target locations
const getTarget = function (callback) {
  const getData = function (callback) {
    if (navigator.onLine) {
      const xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          console.log("Text:", this.responseText)

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

          console.log("Parsed:", global.data)
          callback()
        }
      }
      xhttp.open("GET", constants.database, true)
      xhttp.send()
    } else {
      alert("Could not get data online.")
    }
  }


  if (false) { // Exists in storage
    if (false) { // Data needs to be renewed
      getData((data) => {
        // TODO Store data

        // Return
        callback(data)
      })
    } else {
      // TODO Return from storage

    }

  } else { // Need to get data online
    getData((data) => {
      // TODO Store data

      // Return
      callback(data)
    })
  }
}

// Run every time location is updated
const loop = function (pos) {
  // Get the current distance and direction
  const target = global.data[global.at]
  global.dir = directions(pos.coords, target)

  // Display distance
  doc.status.innerText = Math.ceil(global.dir.distance) + ' meter'

  // Check if target is reached
  let biggest = Math.max(pos.coords.accuracy, target.accuracy)
  if (target.accuracy === biggest) { // Target circle bigger
    if (global.dir.distance < target.accuracy - pos.coords.accuracy) { // User circle inside target circle
      newTarget()
    }
  } else { //
    if (global.dir.distance < pos.coords.accuracy - target.accuracy) { // Target circle inside user circle
      newTarget()
    }
  }

}

// Choose a new target from the list
const newTarget = function () {
  alert("Target is reached.")
  global.result.push({
    time: new Date()
  })
  if (global.result.length === global.data.length) { // End
    alert("Found all targets.")
  } else {
    global.at += 1
    global.at %= global.data.length
  }
}


// >> Classes


// >> Variables
const doc = {
  status: document.getElementById('status'),
  data: document.getElementById('data'),
  dir: document.getElementById('dir'),
  compass: document.getElementById('compass')
}

const global = {
  track: null,
  data: [],
  at: 0,
  dir: null,
  result: []
}

const constants = {
  radius: 6.371e6, // Of Earth
  database: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKWPQTIs8YZoVGNTRzE1iMiAmEWIsqs9xv0aBzTWIisn338KClhoAA0nuA4-8CS0b6CBjA433s2VIe/pub?gid=0&single=true&output=csv"
}

// >> Run
// Check available
if ("geolocation" in navigator) {
  doc.status.innerText = "Getting location"
  // First get the target location from online
  getTarget(() => {
    // Start getting the location, will repeat itself
    getLocation(loop, () => {
      doc.status.innerText = "Something went wrong."
    })
  })

  // >> Events
  // Get the direction of the device
  console.log()
  window.addEventListener("deviceorientation", (event) => {
    console.log("Orientation:", event)
    if (global.dir) {
      let orientation = null
      if (Math.abs(event.beta) < 30) { // Device is held flat
        orientation = event.alpha
      } else { // Device is held straight
        orientation = event.gamma
      }


      // Use angle between points to calculate relative distance
      const deg = (rad) => rad * 180 / Math.PI

      const angle = orientation - deg(global.dir.angle) // The target is north on the compass

      console.log("Angle between points:", deg(global.dir.angle))
      // console.log("Orientation angle:", orientation)
      // console.log("Angle to go to:", angle)

      // Display angle to go to
      doc.dir.style.transform = `rotate(${Math.floor(angle)}deg)`
    }
  }, false)
} else {
  doc.status.innerText = "Location data not available on this device."
}
}.call(this))
