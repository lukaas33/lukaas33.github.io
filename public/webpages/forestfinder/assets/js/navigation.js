// Functionality for geocoordinates and navigation to a point
// Functionality for retrieving the location
// Uses the libary GeoLib

// === Classes ===
class Coord {
  constructor (loc) { // Initialise
    this.latitude = loc.latitude
    this.longitude = loc.longitude
    this.time = (new Date()).getTime()
    // Get other data if available
    for (let name of ["altitude", "heading", "speed", "accuracy"]) {
      if (name in loc) { // Property is in object
        this[name] = loc[name]
      } else {
        this[name] = null
      }
    }
  }
}

// === Variables ===
const navigation = {
  loc: null, // Current user location
  destination: null, // Stores destination coordinate
  orientation: null,
  options: {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  },
  humanSpeed: 1.508333, // Walking speed (m/s) for humans (number found at https://en.wikipedia.org/wiki/Walking)

  track (callback) {
    trackLocation(this.options, (loc) => { // Execute when called
      if (this.loc !== null) {
        const speed = geolib.getSpeed(this.loc, loc)

        if (speed < this.humanSpeed * 1.25) { // Valid measurement
          this.loc = loc // Update
        }
      } else {
        this.loc = loc // Init
      }

      callback() // Display
    })
  },
  dist (loc) {
    return geolib.getPreciseDistance(loc, this.destination)
  },
  arrived () {
    const threshold = 10 // Within 10 m
    return geolib.isPointWithinRadius(this.loc, this.destination, threshold)
  },
  directions () {
    const dist = this.dist(this.loc)
    const bearing = geolib.getGreatCircleBearing(this.loc, this.destination) // N,E,S,W 0,90,180,270 direction, relative to north
    let angle = null
    if (navigation.orientation) { // Value available
      // Make direction to go relative to user orientation instead of relative to north
      angle = bearing + this.orientation
      angle = (360 + angle) % 360 // Remove <0 or >360
    }

    const direction = {distance: dist, angle: angle, bearing: bearing}
    return direction
  }
}

// === Functions ===
// Tracks the location
const trackLocation = function (options, callback) {
  if ("geolocation" in navigator) {
    // Continualy track the user location
    navigation.trackId = navigator.geolocation.watchPosition((position) => {
      let loc = new Coord(position.coords) // Pass coords object directly

      // // TEST
      // let end = document.querySelector("main")
      // let t = document.createElement('p')
      // t.textContent = `${loc.latitude}, ${loc.longitude}`
      // end.appendChild(t)

      callback(loc) // Return value somewhere else and continue
    }, (error) => {
      // Error
      game.end()
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert("Je hebt geen toestemming gegeven voor je locatie.\nDe app werkt niet zonder GPS.")
          break
        case error.POSITION_UNAVAILABLE:
          alert("De locatie kan niet worden opgehaald.\nHerlaad de app.")
          break
        case error.TIMEOUT:
          alert("Het ophalen van de locatie duurde te lang.\nHerlaad de app.")
          break
        case error.UNKNOWN_ERROR:
          alert("Er heeft een onbekende fout opgetreden.\nHerlaad de app.")
          break
      }
    }, options)
  } else {
    game.end()
    alert("Er is geen GPS beschikbaar.")
  }
}

// Get absolute direction (angle with north 0)
window.addEventListener("deviceorientationabsolute", (event) => {
  navigation.orientation = event.alpha
}, true)
