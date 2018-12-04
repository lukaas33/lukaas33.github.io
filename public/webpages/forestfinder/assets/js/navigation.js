// Functionality for geocoordinates and navigation to a point
// Functionality for retrieving the location
// Uses the libary GeoLib

class Coord {
  constructor (location) {
    this.lat = location.latitude
    this.long = location.longitude
    // Get other data if available
    for (name in ["altitude"]) {
      
    }
  }
}

const navigation = {
  location: Coord({latitude: 51.448009, longitude: 5.508001}), // Current user location
  options: {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
  }
}

const trackLocation = function (callback) {
  if ("geolocation" in navigator) {
    // geolocation is available
    // Continualy track the user location
    const id = navigator.geolocation.watchPosition((position) => {
      let loc = Coord(position.coords) // Pass coords object directly
      navigation.location = loc
    }, () => {
      // Error
      console.error("Get location error")
    }, navigation.options)
  } else {
    // geolocation IS NOT available
  }
}
