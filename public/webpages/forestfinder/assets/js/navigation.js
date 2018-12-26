// Functionality for geocoordinates and navigation to a point
// Functionality for retrieving the location
// Uses the libary GeoLib

// === Classes ===
class Coord {
  constructor (loc) { // Initialise
    this.latitude = loc.latitude
    this.longitude = loc.longitude
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
    maximumAge: 5 * 1000 // Minimum location refresh time
  },

  track (callback) {
    trackOrientation()
    trackLocation(this.options, (loc) => { // Execute when called
      this.loc = loc
      callback()
    })
  },
  directions () {
    const dist = geolib.getDistance(this.loc, this.destination)
    const bearing = geolib.getBearing(this.loc, this.destination) // N,E,S,W 0,90,180,270 direction, relative to north
    let angle = null
    if (navigation.orientation) { // Value available
      // Make direction to go relative to user orientation instead of relative to north
      angle = this.orientation - bearing
      angle = (360 + angle) % 360 // Remove < 0 or > 360
    }

    const direction = {distance: dist, angle: angle, bearing: bearing}
    return direction
  }
}

// === Functions ===
// Tracks the location
const trackLocation = function (options, callback) {
  if ("geolocation" in navigator) {
    // geolocation is available
    // Continualy track the user location
    navigation.trackId = navigator.geolocation.watchPosition((position) => {
      let loc = new Coord(position.coords) // Pass coords object directly
      callback(loc) // Return value somewhere else and continue
    }, () => {
      // Error
      alert("Location error")
    }, options)
  } else {
    // geolocation IS NOT available
    alert("No GPS available")
  }
}

const trackOrientation = function () {
  if(window.DeviceOrientationEvent) { // Available
    window.addEventListener("deviceorientationabsolute", (event) => {
      navigation.orientation = event.alpha
    }, true)
  } else {

  }
}
