//       _          _                 _   _  ___                 _
//      / \   _ __ (_)_ __ ___   __ _| | | |/ (_)_ __   __ _  __| | ___  _ __ ___
//     / _ \ | '_ \| | '_ ` _ \ / _` | | | ' /| | '_ \ / _` |/ _` |/ _ \| '_ ` _ \
//    / ___ \| | | | | | | | | | (_| | | | . \| | | | | (_| | (_| | (_) | | | | | |
//   /_/   \_\_| |_|_|_| |_| |_|\__,_|_| |_|\_\_|_| |_|\__, |\__,_|\___/|_| |_| |_|
//                                                     |___/
// A game by Anne du Croo de Jong and Lucas van Osenbruggen
// Code blocks are attributed to the author using (A) and (L) respectively.
//

(function () { // Closure for scope limited to browser
  'use strict' // Js strict mode

})()


// __     __         _       _     _
// \ \   / /_ _ _ __(_) __ _| |__ | | ___  ___
//  \ \ / / _` | '__| |/ _` | '_ \| |/ _ \/ __|
//   \ V / (_| | |  | | (_| | |_) | |  __/\__ \
//    \_/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/

// Changing values related to setup
const settings = {
  started: false
}

// Fhysical constants, not changing
const constants = {

}

// Related to document, for example html elements
const doc = {
  canvas: document.getElementById('canvas'),
}

// Related to the view and drawing
const view = {
    width: null,
    height: null,
    screen: doc.canvas.getContext('2d'),
    fps: 20
}

// The entire map
const map = {
  size: 0,
  width: null,
  height: null,
  get tiles () {
    store.get("map")
  },
  set tiles (value) {
    store.set("map", value)
  }
}

// Store all instances
const animals = []
const plants = []


 //  _____                 _   _
 // |  ___|   _ _ __   ___| |_(_) ___  _ __  ___
 // | |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
 // |  _|| |_| | | | | (__| |_| | (_) | | | \__ \
 // |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/

 // Functions for storing data in localStorage (L)
const store = {
  get: function (name) {
    const string = localStorage.getItem(name)
    try { // Won't work if the data is only a string
      return JSON.parse(string) // Return converted value
    } catch (e) {
      return string
    }
  },
  set: function (name, value) {
    const string = JSON.stringify(value)
    localStorage.setItem(name, string)
  }
}

//   ____ _
//  / ___| | __ _ ___ ___  ___  ___
// | |   | |/ _` / __/ __|/ _ \/ __|
// | |___| | (_| \__ \__ \  __/\__ \
//  \____|_|\__,_|___/___/\___||___/

// Coordinates
class Coord {
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  // Several vector math functions (L)
  add (coord) {
    this.x += coord.x
    this.y += coord.y
  }
  substract (coord) {
    this.x -= coord.x
    this.y -= coord.y
  }
  divide (value) {
    this.x /= value
    this.y /= value
  }
  multiply (value) {
    this.x *= value
    this.y *= value
  }

  get magnitude () { // Calculate the size
    return Math.sqrt(this.x**2 + this.y**2)
  }
  set magnitude (value) { // Change the size
    let vector = this.normalized
    vector.multiply(value)
    this.x = vector.x
    this.y = vector.y
  }

  get angle () { // Return the angle in radians
    return Math.atan2(this.y, this.x)
  }
  get normalized () { // Return the unit vector
    let mag = this.magnitude
    if (mag > 0) {
      let norm = new Coord(this.x, this.y)
      norm.divide(mag)
      return norm
    } else {
      return new Coord()
    }
  }
}

// Multiple sprites from a name (L)
class Sprites {
  dirs = ["right", "down", "left", "up"]

  constructor (name, moving, changing) {
    this.moving = moving // Moves in all directions
    this.changing = changing // Changes over time
    this.frame = 0 // Track frame displayed
    this.size = 32 // Default value

    // Get the different sprites (L)
    let path = `assets/sprites/${name.toLowerCase()}`
    if (moving) {
      for (let dir of this.dirs) { // All directions of movement
        this.getImages(`${path}/${dir}`, 1, [], (result) => {
          this[dir] = result
        })
      }
    } else if (changing) {
      this.getImages(`${path}/sprite`, 1, [], (result) => { // Changing over time
        this.sprite = result
      })
    } else {
      this.getImage(`${path}/sprite.png`, (result) => { // Static
        this.sprite = result
      })
    }
  }

  // Preload image and verify it exists (async) (L)
  getImage (path, callback) {
      let image = new Image()
      image.onload = () => {
        callback(image) // Return
      }
      image.onerror = () => {
        callback(null) // End
      }
      image.validate = 'always' // Store in cache for quick loading
      image.src = path
  }

  // Recursive function for getting multiple images (async) (L)
  getImages (path, i, sprites, callback) {
    const file = `${path}-${i}.png`
    this.getImage(file, (result) => {
      if (result === null) {
        callback(sprites) // Return
      } else {
        sprites.push(result)
        this.getImages(path, i+1, sprites, callback) // Next image, recurse
      }
    })
  }
}

// Objects, main displaying functionality
class Entity {
  constructor (loc, sprites) {
    this.loc = loc
    this.sprites = sprites // Store locations of image
  }

  // Display a sprite on the screen (L)
  update () {
    let sprite = null

    if (this.sprites.moving) { // Moving object
      sprite = this.sprites[this.direction]
      if (this.speed.magnitude > 0) {
        this.sprites.frame = (this.sprites.frame + 1) % (sprite.length) // New frame
      }
      sprite = sprite[this.sprites.frame]
    } else if (this.sprites.changing) { // Changing object
      sprite = this.sprites.sprite
      this.sprites.frame = (this.sprites.frame + 1) % (sprite.length) // New frame
      sprite = sprites[this.sprites.frame]
    } else { // Static object
      sprite = this.sprites.sprite
    }

    view.screen.drawImage(sprite, this.loc.x, this.loc.y, this.sprites.size, this.sprites.size)
  }
}

// Objects, main movement functionality
class Obj extends Entity {
  constructor (loc, sprites) {
    super(loc, sprites)
    this.speed = new Coord()
    this.acceleration = new Coord()
    this.direction = "down" // Starting position first draw
  }

  // Change position (L)
  move () {
    // Add to speed
    if (this.acceleration.magnitude >= 0) {
      if (this.speed.magnitude < this.traits.maxSpeed) { // Accelerating
        this.speed.add(this.acceleration)
      } else { // At max speed
        this.speed.magnitude = this.traits.maxSpeed // Set to max to correct if over
        this.acceleration.magnitude = 0
      }
    }

    // Add to location
    if (this.speed.magnitude > 0) {
      this.loc.add(this.speed) // Change in location per frame

      // Get direction
      let angle = (this.speed.angle + 2 * Math.PI) % (2 * Math.PI) // Angle from 0 to 2 * Pi
      let index = Math.floor(2 * angle / Math.PI) // Angle to values 0, 1, 2, 3
      this.direction = this.sprites.dirs[index] // Direction in text form
    }

    // Update on screen
    this.borders()
    this.update()
  }

  // Stops objects from moving past borders (L)
  // TODO switch with map values
  borders () {
    const stop = () => {
      this.speed.magnitude = 0
      this.acceleration.magnitude = 0
    }

    if (this.direction === 'right' || this.direction === 'left') {
      if (this.loc.x + this.sprites.size >= view.width) { // Right
        this.loc.x = view.width - this.sprites.size
        stop()
      } else if (this.loc.x < 0) { // Left
        this.loc.x = 0
        stop()
      }
    }
    if (this.direction === 'up' || this.direction === 'down') {
      if (this.loc.y + this.sprites.size >= view.height) { // Bottom
        this.loc.y = view.height - this.sprites.size
        stop()
      } else if (this.loc.y <= 0) { // Top
        this.loc.y = 0
        stop()
      }
    }
  }
}

class Animal extends Obj {
  constructor (loc, name) {
    super(loc, new Sprites(name, true, false))
    this.name = name
  }
}

class Squirrel extends Animal {
  constructor (loc) {
    let name = "Squirrel"
    super(loc, name)
    this.traits = {
      maxSpeed: 20,
      acceleration: 0.5, // px/frame TODO make into SI units
      name: name
    }
  }
}

class Plant {
  constructor () {

  }
}

class Texture {
  constructor () {

  }
}

class Player extends Obj {
  constructor (animal) {
    super(animal.loc, animal.sprites)
    this.traits = animal.traits
  }

  // Control function, called on key press
  control (key) {
    if (key === false) { // Stop moving
      this.acceleration.magnitude = 0
      this.speed.magnitude = 0
    } else { // Start moving
      let movement = null
      switch (key) {
        case 37: // Left
          movement = new Coord(-1, 0)
          break
        case 38: // Up
          movement = new Coord(0, -1)
          break
        case 39: // Right
          movement = new Coord(1, 0)
          break
        case 40: // Down
          movement = new Coord(0, 1)
          break
      }
      if (movement !== null) {
        movement.magnitude = this.traits.acceleration
        this.acceleration = movement // Set the acceleration
      }
    }
  }
}

//  ____       _
// / ___|  ___| |_ _   _ _ __
// \___ \ / _ \ __| | | | '_ \
//  ___) |  __/ |_| |_| | |_) |
// |____/ \___|\__|\__,_| .__/
//                      |_|

// Set the canvas to the screen size, via css gives stretching effect (L)
doc.canvas.width = view.width = view.screen.width = document.body.clientWidth
doc.canvas.height = view.height = view.screen.height = document.body.clientHeight

let squirrel = new Squirrel(new Coord(50, 50)) // TEST
const PC = new Player(squirrel)

//  _____                 _
// | ____|_   _____ _ __ | |_ ___
// |  _| \ \ / / _ \ '_ \| __/ __|
// | |___ \ V /  __/ | | | |_\__ \
// |_____| \_/ \___|_| |_|\__|___/

// Main drawing function
view.refresh = window.setInterval(() => {
 if (settings.started) {
   // Draw background
   view.screen.fillStyle = '#eeeeee'
   view.screen.fillRect(0, 0, view.screen.width, view.screen.height)

   // Draw plants

   // Draw animals
   PC.move()
 }
}, Math.ceil(1000 / view.fps)) // Executes a certain amount of times per second

// Setup keyboard controls
document.addEventListener('keydown', (event) => {
  PC.control(event.keyCode)
})

document.addEventListener('keyup', (event) => {
  PC.control(false) // Stop signal
})

// Everything loaded
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    settings.started = true
  }
}
