// Code for starting the game elements
// Uses the functions in the other scripts

// === Variables ===
const game = {
  visited: [], // IDs of visited location
  destination: null,
  destinationInfo: null, // Stores info about the destination
  chooseDestination () {
    const options = database.locations
    let id = null
    while (id in this.visited) {
      id = Math.ceil(Math.random() * options.length) // Random id, every entry has an id of 1 to n
    }

    id = 1 // Testing
    for (let option of options) {
      if (option.location_id === id) { // Found it
        navigation.destination = new Coord(option) // Store only the coordinate
        game.destination = option.location_id // Store the unique Id

        // Look for the data if this tree is not unique
        if (!option.double) { // Not a double entry
          this.destinationInfo = option
        } else { // Tree is a duplicate
          for (let other of options) {
            if (option.location_id !== other.location_id) { // Not itself
              if (option.tree_id === other.tree_id && !other.double) { // Found the original
                this.destinationInfo = other
              }
            }
          }
        }
        // Delete irrelevant values here
        delete this.destinationInfo.latitude
        delete this.destinationInfo.longitude
        delete this.destinationInfo.location_id
      }
    }
  }
}

const doc = {
  distance: document.querySelector(".tag .distance")
}

// === Functions ===
const displayData = function (directions) {
  doc.distance.innerHTML = directions.distance
}


// === Execute ===
// Async loading functions
// Start tracking
navigation.track((loc) => { // When location is retrieved the screen will update
  if (navigation.loc !== null && navigation.destination !== null) {
    const directions = navigation.directions()
    displayData(directions)
  }
})
// Get the data
database.getOnline((data) => {
  console.log(data)
  game.chooseDestination()
})

// Loop function for game
const wait = window.setInterval(() => {

}, 1000) // Refresh time
