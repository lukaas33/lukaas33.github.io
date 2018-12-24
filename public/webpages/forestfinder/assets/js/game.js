// Code for starting the game elements
// Uses the functions in the other scripts

// === Variables ===
const game = { // TODO store some values in cookies
  visited: [], // IDs of visited location
  destination: null, // ID of the destination
  destinationInfo: null, // Stores info about the destination
  startTime: null,
  duration: 40 * 60,

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
    this.destinationInfo = this.getInfo(this.destination, options)
    // Display
    if (navigation.loc !== null) {
      const directions = navigation.directions()
      refresh(directions) // Run the sceen refresh
    }
    display()
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
  start () {
    this.chooseDestination() // Choose the destination TEST with 1
    this.startTime = (new Date()).getTime()
  },
  end() {

  }
}

const doc = {
  distance: document.querySelector(".tag .distance"),
  arrow: document.querySelector("#arrow"),
  image: document.querySelector("#image img"),
  name: document.querySelector("header h2"),
  clock: document.querySelector(".clock")
}

// === Functions ===
const clock = function() {
  // Display clock
  const elapsed = Math.floor(((new Date()).getTime() - game.startTime) / 1000) // Time elapsed since start
  const timeLeft = game.duration - elapsed
  let min = Math.floor(timeLeft / 60)
  let sec = min != 0 ? timeLeft % (min * 60) : elapsed // If min == 0 the mod operator will return NaN

  if (min <= 0) { // End of game
    game.end()
  }

  if (min < 10) {
    min = '0' + min // 08, 09, 10, 11
  }
  if (sec < 10) {
    sec = '0' + sec // This is allowed in js
  }
  doc.clock.innerHTML = `${min}:${sec}`
}

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
// Async loading functions
// Start tracking
navigation.track(() => { // When location is retrieved, main loop runs
  if (navigation.loc !== null && navigation.destination !== null) { // Two points available
    // navigation.loc = new Coord({latitude: 51.448009, longitude: 5.508001, acuraccy: 1}) // TEST
    const directions = navigation.directions()
    refresh(directions) // Run the sceen refresh
    game.check(directions) // Check if arrived
  }
})

// Get the data
if (database.locations === null) { // Available offline
// if (true) { // Always refresh for testing
  database.getOnline((data) => { // Get the data online
    console.log(data)
    if (game.destination === null) { // Not already in progress
      game.start()
    }
  })
} else {
  // database.checkCachedImages(database.locations) // Cached images may have been overwritten
  if (game.destination === null) { // Not already in progress
    game.start()
  }
}

// Serviceworker register
if ('serviceWorker' in window.navigator) { // If support
  window.navigator.serviceWorker.register('serviceworker.js', {scope: '.'}).then((registration) => {
    console.log('Service Worker Registered at:', registration.scope)
  }, (error) => {
    alert('Registration failed', error)
  })
}

// Time loop function for game
const wait = window.setInterval(() => {
  clock()
}, 750) // Refresh time less than 1 sec for smooth display
