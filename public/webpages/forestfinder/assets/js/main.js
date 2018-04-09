(function () {
  'use strict'

  // >> Functions
  const getLocation = function (callback = ()=>{}, err = ()=>{}) {
    // Track the location
    navigator.geolocation.watchPosition ((pos)  => { // Sucess
      if (pos.accuracy < 40) { // In meters
        callback(pos)
      }
     }, (error) => { // Error
      err() // Let know there is a problem

      switch(error.code) {
          case error.PERMISSION_DENIED:
              alert("User denied the request for Geolocation.")
              break
          case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.")
              break
          case error.TIMEOUT:
              alert("The request to get user location timed out.")
              break
          case error.UNKNOWN_ERROR:
              alert("An unknown error occurred.")
              break
      }
    }, { // Options
      enableHighAccuracy: true,
      maximumAge: 5 * 60 * 1000
    })
  }

  const getTarget = function () {
    return location("51.466831, 5.559329")
  }

  const location = function (string) {
    const parts = string.split(',')

    const coord = {
      latitude: parseFloat(parts[0]),
      longitude: parseFloat(parts[1]),
    }

    return coord
  }



  // >> Classes


  // >> Variables
  const doc = {
    status: document.getElementById('status'),
    data: document.getElementById('data')
  }

  // >> Run
  // Check available
  if ("geolocation" in navigator) {
    getLocation((pos) => {
      alert(JSON.stringify(pos.coords))
    })
  } else {
    alert("Location data not available on this device.")
  }


}).call(this)
