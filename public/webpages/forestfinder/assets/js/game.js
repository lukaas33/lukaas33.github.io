// Code for starting the game elements
// Uses the functions in the other scripts

// === Variables ===
const game = {
  // IDs of visited location
  get visited () {
    let visited = database.getCookie("visited")
    if (visited === undefined) { // Need to init
      visited = []
    }
    return visited
  },
  set visited (value) {
    let visited = this.visited
    visited.push(value) // Add instead of overwrite
    database.setCookie("visited", visited)
  },
  // ID of the destination
  get route () {
    let res = database.getCookie("route")
    if (res === undefined) {
      res = []
    }
    return res
  },
  set route (id) {
    database.setCookie("route", id)
  },

  waiting: null,
  destinationInfo: null, // Stores info about the destination

  // Generates complete route
  generateRoute() {
    const options = database.locations
    const points = []
    const trees = []
    const doubles = []

    for (let i = 0; i < options.length; i++) {
      // Random id
      let id = Math.ceil(Math.random() * options.length) // Every entry has an id of 1 to n-1
      let tree_id = options[id - 1].tree_id

      if (trees.indexOf(tree_id) === -1) { // Not already one of these trees in the route
        trees.push(tree_id) // Future checking
        points.push(id) // Add to the route
      } else {
        doubles.push(id) // Add to the end
      }
    }

    this.route = points.concat(doubles) // All points in the route
  },
  // Selects destination and gets the info
  chooseDestination (id) {
    const options = database.locations

    for (let option of options) {
      if (option.location_id === id) { // Found it
        navigation.destination = new Coord(option) // Store only the coordinate here
      }
    }
    this.destinationInfo = this.getInfo(id, options)
    // Display
    if (navigation.loc !== null) {
      const directions = navigation.directions()
      refresh(directions) // Run the sceen refresh
    }
    display()
  },
  // Look for the data if this tree is not unique
  getInfo (id, options) {
    let destinationInfo = null

    for (let option of options) {
      if (option.location_id === id) { // Found it
        if (!option.double) { // Not a double entry
          destinationInfo = option
        } else { // Tree is a duplicate
          for (let other of options) {
            if (option.location_id !== other.location_id) { // Not itself
              if (option.tree_id === other.tree_id && !other.double) { // Found the original
                destinationInfo = other
              }
            }
          }
        }
      }
    }
    // Delete irrelevant values here
    delete destinationInfo.latitude
    delete destinationInfo.longitude
    delete destinationInfo.location_id
    // Return elsewhere
    return destinationInfo
  },
  // Check if arrived
  check (directions) {
    // Within x meters of an object will be considered the same location
    if (directions.distance < navigation.loc.accuracy) { // Uses GPS accuracy
      if (game.waiting !== null) {
        game.waiting = window.setTimeout(() => { // Must be 2.5 seconds in the area
          // TODO start a quiz
          game.arrived()
        }, 5000)
      }
    } else {
      clearTimeout(game.waiting) // Cancel game.arrived
      game.waiting = null
    }
  },
  arrived () {
    database.progress = { // Add data
      time: (new Date()).getTime(), // Datetime as milliseconds since epoch
      tree: this.destinationInfo.tree_id,
      loc: navigation.loc
    }

    this.visited = this.route[0] // Add
    this.route = this.route.slice(1) // Remove first from route
    if (this.route.length > 0) {
      this.chooseDestination(this.route[0]) // Choose the destination
    } else {
      this.end() // Game is done
    }
  },
  start () {
    if (database.startTime === null) { // First time
      database.getUserData(() => { // Get data then execute other code
        this.generateRoute()
        this.chooseDestination(this.route[0]) // Choose the destination
        database.startTime = (new Date()).getTime() // Game starts
      })
    } else { // Continue
      this.chooseDestination(this.route[0]) // Call with chosen destination
    }
  },
  end() {

  }
}

const doc = {
  distance: document.querySelector(".tag .distance"),
  arrow: document.querySelector("#arrow"),
  image: document.querySelector("#image img"),
  name: document.querySelector("header h2"),
}

// === Functions ===
const display = function () { // Displays info of the tree to visit
  doc.image.src = game.destinationInfo.image
  doc.name.textContent = game.destinationInfo.name
}

const refresh = function (directions) { // The screen refresh
  doc.distance.innerHTML = directions.distance
  if (directions.angle !== null) { // Relative to orientation
    doc.arrow.style.transform = `rotate(${Math.floor(directions.angle)}deg)`
  } else { // Relative to north
    doc.arrow.style.transform = `rotate(${Math.floor(directions.bearing)}deg)`
  }
}

// === Execute ===
// Async loading of different information
// Start tracking location
navigation.track(() => { // When location is retrieved, main loop runs
  if (navigation.loc !== null && navigation.destination !== null) { // Two points available
    // navigation.loc = new Coord({latitude: 51.448009, longitude: 5.508001, acuraccy: 1}) // TEST
    const directions = navigation.directions()
    refresh(directions) // Run the sceen refresh
    game.check(directions) // Check if arrived
  }
})

// Get the data, online if needed
if (database.locations === null) { // Available offline
// if (true) { // Always refresh for testing
  database.getOnline((data) => { // Get the data online
    console.log(data)
    game.start()
  })
} else {
  // database.checkCachedImages(database.locations) // Cached images may have been overwritten
  game.start()

}

// Serviceworker register
if ('serviceWorker' in window.navigator) { // If support
  window.navigator.serviceWorker.register('serviceworker.js', {scope: '.'}).then((registration) => {
    console.log('Service Worker Registered at:', registration.scope)
  }, (error) => {
    alert('Registration failed', error)
  })
}
