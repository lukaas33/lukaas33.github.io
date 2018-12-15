// Code for starting the game elements
// Uses the functions in the other scripts

// === Variables ===
const game = { // TODO store some values in cookies
  visited: [], // IDs of visited location
  destination: null, // ID of the destination
  destinationInfo: null, // Stores info about the destination
  
  chooseDestination (choice) { // Selects next destination
    const options = database.locations

    // Random approach
    let id = choice // if no argument it will use an algoritm to choose
    while (id in this.visited || id === undefined) {
      id = Math.ceil(Math.random() * options.length) // Every entry has an id of 1 to n
    }

    for (let option of options) {
      if (option.location_id === id) { // Found it
        navigation.destination = new Coord(option) // Store only the coordinate here
        this.destination = option.location_id // Store the unique Id
      }
    }
    this.destinationInfo = this.getInfo(option.location_id, options)
    // Display
    this.display()
  },
  getInfo (id, options) {
    // Look for the data if this tree is not unique
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
  refresh (directions) { // The screen refresh
    doc.distance.innerHTML = directions.distance
    if (directions.angle !== null) { // Relative to orientation
      doc.arrow.style.transform = `rotate(${Math.floor(directions.angle)}deg)`
    } else { // Relative to north
      doc.arrow.style.transform = `rotate(${Math.floor(directions.bearing)}deg)`
    }
  },
  check (directions) {
    if (directions.distance < navigation.accuracy) {
      // TODO start a quiz
      database.progess = { // Add data
        time: (new Date()).getTime(), // Datetime as milliseconds since epoch
        loc: navigation.destination,
        data: this.destinationInfo
      }
      game.arrived()
    }
  },
  arrived () {
    this.visited.push(this.destination)
    this.chooseDestination() // Choose the destination TEST with 1
  },
  display () { // Displays info of the tree to visit
    doc.image.src = this.destinationInfo.image
    doc.name.textContent = this.destinationInfo.name
  }
}

const doc = {
  distance: document.querySelector(".tag .distance"),
  arrow: document.querySelector("#arrow"),
  image: document.querySelector("#image img"),
  name: document.querySelector("header h2")
}

// === Functions ===


// === Execute ===
// Async loading functions
// Start tracking
navigation.track(() => { // When location is retrieved, main loop runs
  if (navigation.loc !== null && navigation.destination !== null) { // Two points available
    // navigation.loc = new Coord({latitude: 51.448009, longitude: 5.508001, acuraccy: 1}) // TEST
    const directions = navigation.directions()
    game.refresh(directions) // Run the sceen refresh
    game.check(directions) // Check if arrived
  }
})

// Get the data
if (database.locations === null) { // Available offline
// if (true) { // Always refresh for testing
  database.getOnline((data) => { // Get the data online
    console.log(data)
    game.chooseDestination() // Choose the destination TEST with 1
  })
} else {
  // database.checkCachedImages(database.locations) // Cached data may be overwritten
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

// // Time loop function for game
// const wait = window.setInterval(() => {
//
// }, 1000) // Refresh time
