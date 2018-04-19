// Global scope
const global = {
  track: null,
  dir: null,
  fallback: {} // If no cookies
}

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
// General
const rad = (deg) => deg * Math.PI / 180
const deg = (rad) => rad * 180 / Math.PI


const store = function (name, value = null, expire = 8) {
  let time = new Date()
  time.setTime(time.getTime() + (expire * 60 * 60 * 1000)) // Time until expired

  if (navigator.cookieEnabled && window.location.protocol === 'https:') { // Cookies can be used safely
  // if (true) {

    if (value === null) { // Need to get
      const cookies = document.cookie.split(';')
      for (let value of cookies) {
        let current = value.split('=') // Name and value pair
        if (current[0].trim() === name) { // Found

          let result = current[1].trim()
          try {
            result = JSON.parse(result) // Will parse strings to numbers, booleans, etc.
            return result
          } catch (error) {
            if (error.name === 'SyntaxError') { // Tried to parse a string value
              return result // Just return the string
            }
          }
        }
      }
      return undefined
    } else { // Need to set
      value = JSON.stringify(value)
      document.cookie = `${name}=${value}; expires=${time.toUTCString()}; secure;` // Set value
      console.log(`set cookie ${name} to ${value}`)
    }

  } else if (window.localStorage) { // Use session storage

    if (value === null) {
      let result = localStorage.getItem(name)
      if (result) {
        result = JSON.parse(result) // Will parse strings to numbers, booleans, etc.
        if ((new Date()).getTime() > result.expire) { // Expired
          return undefined
        } else {
          return result.data
        }
      } else {
        return undefined
      }
    } else {
      value = {expire: time.getTime(), data: value} // Add time to be deleted
      value = JSON.stringify(value)
      localStorage.setItem(name, value)
      console.log(`set local storage ${name} to ${value}`)
    }

  } else { // Use variables

    if (value === null) {
      return global.fallback[name] // Get value
    } else {
      global.fallback[name] = value // Set value
      console.log(`set fallback variable ${name} to ${value}`)
    }

  }
}


// Returns distance and the direction
// https://www.movable-type.co.uk/scripts/latlong.html
const directions = function (position, target) {
  const lat1 = rad(position.latitude)
  const lat2 = rad(target.latitude)
  const lon1 = rad(position.longitude)
  const lon2 = rad(target.longitude)

  const dlat = rad(target.latitude - position.latitude)
  const dlon = rad(target.longitude - position.longitude)

  const ha =  (Math.sin(dlat / 2) ** 2) + (Math.cos(lat1) * Math.cos(lat2)) * (Math.sin(dlon / 2) ** 2)
  const c = 2 * Math.atan2(Math.sqrt(ha), Math.sqrt(1 - ha))
  const dist = c * constants.radius // Distance between points

  const y = Math.sin(lon2- lon1) * Math.cos(lat2)
  const x = (Math.cos(lat1) * Math.sin(lat2)) - (Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1))
  const bearing = Math.atan2(y, x) // Angle between user and target
  const angle = deg(bearing)

  return {
    distance: dist,
    angle: angle
  }
}

// Gets the user location
const getLocation = function (callback, err) {
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

// Gets the target locations
const getTarget = function (callback) {
  const getData = function (callback) {
    if (navigator.onLine) { // Internet connection
      const xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          console.log("Text:", this.responseText)

          const lines = this.responseText.split('\r')
          const names = lines[0].split(',')
          const data = []

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

            data.push(object)
          }

          callback(data)
        }
      }
      xhttp.open("GET", constants.database, true)
      xhttp.send()
    } else {
      alert("Could not get data online.")
    }
  }

  if (!store('at')) { // Doesn't exist yet
    store('at', 0)
  }

  const data = store('data')
  if (data) { // Exists in storage
     callback(data)
  } else { // Need to get data online
    getData((data) => {
      store('data', data, 24 * 3)
      // Return
      callback(data)
    })
  }
}

// Run every time location is updated
const loop = function (pos) {
  if (store('working')) {
    // Get the current distance and direction
    const data = store('data')
    const target = data[store('at')]
    global.dir = directions(pos.coords, target)

    // Display distance
    doc.status.innerText = Math.ceil(global.dir.distance) + ' meter'

    // Check if target is reached
    if (global.dir.distance < target.accuracy + pos.coords.accuracy) { // User circle inside target circle
      newTarget(target)
    }
  } else { // Done
    sendData()
  }
}

// Choose a new target from the list
const newTarget = function (current) {
  alert("Target is reached.")

  // Save progress
  let result = store('results')
  if (result) { // Already exists
    result.push({
      point: current,
      time: new Date()
    })
    store('results', result, 8) // Update
  } else {
    result = []
    store('results', result, 8)
  }


  const data = store('data')
  if (result.length === data.length) { // End
    alert("Found all targets.")
    store('working', false, 4)
    sendData()
  } else {
    let at = store('at')
    at += 1
    at %= data.length
    store('at', at, 8)
  }
}

// Sends the data gathered
const sendData = function () {
  const post = function (data, callback) {
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        	callback()
      }
    }
    xhttp.open("POST", constants.mail, true)
    xhttp.setRequestHeader('Content-Type', 'application/json') // Server will expect format
    data = {
      text: JSON.stringify(data),
      to: 'lukaas9000@gmail.com',
      subject: 'ForestFinder'
    }
    xhttp.send(JSON.stringify(data))
  }

  const result = store('results')
  if (result) {
    if (navigator.onLine) { // Internet connection
      post(result, () => {
        alert("Data was sent")
      })
    } else {
      window.setInterval(() => { // Wait
        post(result, () => {
          alert("Data was sent")
        })
      }, 2500)
    }
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

const constants = {
  radius: 6.371e6, // Of Earth
  database: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKWPQTIs8YZoVGNTRzE1iMiAmEWIsqs9xv0aBzTWIisn338KClhoAA0nuA4-8CS0b6CBjA433s2VIe/pub?gid=0&single=true&output=csv",
  // mail: "https://general-server.herokuapp.com/mail"
  mail: "http://localhost:5000/mail"
}

// >> Run
// Check available
if ("geolocation" in navigator) {
  doc.status.innerText = "Getting location"
  // First get the target location from online
  getTarget((data) => {
    console.log('got:', data)
    if (store('working')) {
      store('working', true, 4)
    }
    // Start getting the location, will repeat itself
    getLocation(loop, () => {
      doc.status.innerText = "Something went wrong."
    })

    // >> Events
    // Get the direction of the device
    console.log()
    window.addEventListener("deviceorientation", (event) => {
      console.log("Orientation:", event)
      if (global.dir) {
        let orientation = event.alpha

        // Use angle between points to calculate relative distance
        const angle = (orientation - global.dir.angle) - 90 // The target is north on the compass

        console.log("Angle between points:", global.dir.angle)
        console.log("Orientation angle:", orientation)
        console.log("Angle to go to:", angle)

        // Display angle to go to
        doc.dir.style.transform = `rotate(${Math.floor(angle)}deg)`
      }
    }, false)
  })
} else {
  doc.status.innerText = "Location data not available on this device."
}
}.call(this))
