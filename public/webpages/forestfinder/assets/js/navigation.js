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
  loc: new Coord({latitude: 51.448009, longitude: 5.508001, acuraccy: 1}), // Current user location
  destination: null, // Stores destination coordinate
  options: {
    enableHighAccuracy: true,
    maximumAge: 5 * 1000 // Minimum location refresh time
  },
  track (callback) {
    trackLocation(this.options, (loc) => {
      this.loc = loc
      callback(loc)
    })
  },
  directions () {
    const dist = geolib.getDistance(this.loc, this.destination)

    const direction = {distance: dist}
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
