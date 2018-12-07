// Functionality for geocoordinates and navigation to a point
// Functionality for retrieving the location
// Uses the libary GeoLib

// === Classes ===
class Coord {
  constructor (loc) { // Initialise
    this.latitude = loc.latitude
    this.longitude = loc.longitude
    // Get other data if available
    for (let name of ["altitude", "heading", "speed", "acuraccy"]) {
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
  options: {
    enableHighAccuracy: true,
    maximumAge: 5 * 1000 // Minimum location refresh time
  },
  track (callback) {
    trackLocation(this.options, (loc) => {
      this.loc = loc
      callback()
    })
  },
  directions () {
    const dist = geolib.getDistance(this.loc, this.destination)
    const bearing = geolib.getBearing(this.loc, this.destination) // N,E,S,W 0,90,180,270 direction
    // const angle = (bearing / 180) * Math.PI // In Radians

    const direction = {distance: dist, angle: bearing}
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
      console.error("Get location error")
    }, options)
  } else {
    // geolocation IS NOT available
  }
}
