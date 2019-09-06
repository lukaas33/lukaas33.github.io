// Code for starting the game elements
// Uses the functions in the other scripts

// === Variables ===
const game = {
  // IDs of visited location
  get visited () {
    let visited = database.getStorage("visited")
    if (visited === null) { // Need to init
      visited = []
    }
    return visited
  },
  set visited (value) {
    let visited = this.visited
    visited.push(value) // Add instead of overwrite
    database.setStorage("visited", visited)
  },
  // ID of the destination
  get route () {
    let res = database.getStorage("route")
    if (res === null) {
      res = []
    }
    return res
  },
  set route (id) {
    database.setStorage("route", id)
  },
  get ended () {
    return database.getStorage("ended") // Boolean value
  },
  set ended (value) {
    database.setStorage("ended", value)
  },
  get started () {
    return database.getStorage("started")
  },
  set started (value) {
    database.setStorage("started", value)
  },

  waiting: null,
  destinationInfo: null, // Stores info about the destination

  // Generates complete route
  generateRoute() {
    const options = database.locations
    const points = []
    const doubles = []
    const trees = []

    for (let i = 0; i < options.length; i++) {
      // Random id
      let id = i + 1 // Every entry has an id of 1 to n-1
      let tree_id = options[id - 1].tree_id

      if (trees.indexOf(tree_id) === -1) { // Not already one of these trees in the route and from required route
        trees.push(tree_id)
        if (points[id].required) {
          points.push(id) // Add to the route
        } else {
          doubles.push(id) // Add to the end
        }
      } else {
        doubles.push(id) // Add to the end
      }
    }

    points = shuffle(points)
    doubles = shuffle(points)

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

    if (this.started === null) {
      this.started = (new Date()).getTime()
    }
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
  // NOT USED Check if arrived with two checks
  check () {
    // Within x meters of an object will be considered the same location
    if (navigation.arrived()) {
      if (game.waiting !== null) {
        const x = 5000
        game.waiting = window.setTimeout(() => { // Must be x seconds in the area
          game.arrived()
        }, x)
      }
    } else {
      clearTimeout(game.waiting) // Cancel game.arrived
      game.waiting = null
    }
  },
  arrived () {
    let dur = this.started ? (new Date()).getTime() - this.started : null
    const progress = { // Add data
      time: (new Date()).getTime(), // Datetime as milliseconds since epoch
      tree: this.destinationInfo.tree_id,
      loc: navigation.loc,
      duration: dur,
    }

    alert(`Gefeliciteerd, je hebt de ${this.destinationInfo.name} gevonden!`)

    if (this.destinationInfo.required) { // Has a quiz
      quiz.start(this.destinationInfo, progress)
    } else {
      database.progress = progress // Add to database
      doc.cards.innerHTML = ''
      herbarium.recents() // Display recents
    }

    this.visited = this.route[0] // Add
    this.route = this.route.slice(1) // Remove first from route
    this.started = null
    if (this.route.length > 0) {
      this.chooseDestination(this.route[0]) // Choose the destination
    } else {
      this.end() // Game is done
    }
  },
  skip () {
    this.visited = this.route[0] // Add current destination
    this.route = this.route.slice(1) // Remove first from route
    this.started = null
    if (this.route.length > 0) {
      this.chooseDestination(this.route[0]) // Choose the destination
    } else {
      this.end() // Game is done
    }
  },
  start () {
    if (this.ended === true) { // Game already ended
      this.end()
    } else {
      if (database.startTime === null) { // First time start
        database.getUserData(() => { // Get data then execute other code
          this.generateRoute()
          this.chooseDestination(this.route[0]) // Choose the destination
          database.startTime = (new Date()).getTime() // Game starts
        })
      } else { // Continue
        this.chooseDestination(this.route[0]) // Call with chosen destination
      }
      // Start the timer for a skipping of the current tree
      this.skipTimer = window.setInterval(() => {
        if (this.started) {
          if (this.ended) {
            window.clearInterval(this.skipTimer)
            this.started = null
          } else {
            let diff = ((new Date()).getTime() - this.started) / (60 * 1000)
            if (diff >= 5) {
              doc.skip.style.display = 'inline-block'
            }
          }
        }
      }, 2500)
    }
  },
  end () {
    this.ended = true
    navigation.track = () => {} // No actions on new gps data
    database.startTime = (new Date()).getTime() - (database.duration * 1000) // Clock will be 0
    doc.skip.style.display = 'none'
    document.querySelector(".tag").style.display = 'none'
    document.querySelector('#history h4').textContent = "overzicht"
    herbarium.recents()
    doc.name.textContent = 'Game over'
    doc.nav.innerHTML = `<h4>Punten</h4>
      <div class="tag">${quiz.points}</div>
      <p>Begin opnieuw op de <a href="opties#reset">optiepagina</a>.</p>`
    doc.image.setAttribute('data-img', "assets/images/game-over.jpg")
    doc.image.src = "assets/images/game-over.jpg"
    doc.image.setAttribute("alt", "Game over image")
  }
}

const doc = {
  distance: document.querySelector(".tag .distance"),
  arrow: document.querySelector("#arrow"),
  image: document.querySelector("#image img"),
  name: document.querySelector("header h2"),
  cards: document.querySelector("#overview-page"),
  nav: document.querySelector("#navigator"),
  skip: document.querySelector("button[name=skip]"),
  headings: document.getElementsByClassName("heading"),
  direction: document.querySelector(".direction"),
}

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
const shuffle = function (a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// === Functions ===
const display = function () { // Displays info of the tree to visit
  doc.image.src = "assets/images/placeholder.svg" // Load placeholder first
  doc.image.setAttribute('data-img', game.destinationInfo.image)

  doc.image.onload = function () {
    const replace = new Image()
    replace.onload = () => {
      this.src = this.getAttribute('data-img') // Load regular image
      this.setAttribute('data-img', '')
      this.setAttribute('alt', "Afbeelding van een " + game.destinationInfo.name)
    }
    replace.src = this.getAttribute('data-img')
  }
  doc.name.textContent = game.destinationInfo.name
}

const refresh = function (directions) { // The screen refresh
  doc.distance.innerHTML = directions.distance
  if (directions.angle !== null) { // Relative to orientation
    for (let heading of doc.headings) {
      heading.style.display = 'none'
    }
    doc.direction.style.display = 'initial'
    doc.arrow.style.transform = `rotate(${Math.floor(directions.angle)}deg)`
  } else { // Relative to north
    for (let heading of doc.headings) {
      heading.style.display = 'initial'
    }
    doc.direction.style.display = 'none'
    doc.arrow.style.transform = `rotate(${Math.floor(directions.bearing)}deg)`
  }
}


// === Execute ===
// Async loading of different information
// Start tracking location
navigation.track(() => { // When location is retrieved, this runs:
  if (navigation.loc !== null && navigation.destination !== null) { // Two points available
    const directions = navigation.directions()
    refresh(directions) // Run the sceen refresh
    // Check if arrived
    if (navigation.arrived()) {
      game.arrived()
    }
  }
})

// Get the data, online if needed
if (database.locations === null || database.locations.length === 0) {
// if (true) { // Always refresh for testing
  database.getOnline((data) => { // Get the data online
    if (data) {
      game.start()
    }
  })
} else { // Available offline
  database.checkCachedImages(database.locations) // Cached images may have been overwritten
  game.start()
}

// === Events ===
doc.skip.addEventListener('click', (event) => {
  game.skip()
  doc.skip.style.display = 'none'
})
