// Made by Lucas --> (L)
// Made by Anne --> (A)

(function () { // Closure
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
    fps: 15
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
    let norm = new Coord(this.x, this.y)
    norm.divide(mag)
    return norm
  }
}

// Multiple sprites from a name (L)
class Sprites {
  dirs = ["right", "down", "left", "up"]

  constructor (name, moving, changing) {
    this.moving = moving
    this.changing = changing
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
        callback(path) // Return
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
class Obj {
  constructor (loc, sprites) {
    this.loc = loc
    this.sprites = sprites
    this.speed = new Coord()
    this.acceleration = new Coord()
    this.direction = "down" // Starting position first draw
  }

  // Display a sprite on the screen (L)
  display (sprite) {
    let img = new Image()
    img.onload = () => { // Draw in canvas
      view.screen.drawImage(img, this.loc.x, this.loc.y, this.sprites.size, this.sprites.size)
    }
    img.src = sprite
  }

  // Update coordinates and sprites (L)
  update () {
    const sprites = this.sprites[this.direction]
    const frame = this.sprites.frame
    if (this.sprites.moving && this.speed.magnitude > 0) { // Moving object
      this.sprites.frame = (frame + 1) % (sprites.length)
    }
    this.display(sprites[frame])
  }

  // Change position (L)
  move () {
    if (this.acceleration.magnitude > 0) {
      if (this.speed.magnitude < this.maxSpeed) { // Accelerating
        this.speed.add(this.acceleration)
      } else { // At max speed
        this.speed.magnitude = this.maxSpeed // Set to max to correct if over
        this.acceleration = new Coord()
      }
    }

    if (this.speed.magnitude > 0) {
      this.loc.add(this.speed) // Change in location per frame

      // Get direction
      let index = Math.floor(2 * this.speed.angle / Math.PI) // Angle to values 0, 1, 2, 3
      this.direction = this.sprites.dirs[index] // Direction in text form
    }

    // Update on screen
    this.borders()
    this.update()
  }

  // Stops objects from moving past borders (L)
  // TODO switch with map values
  borders () {
    if (this.loc.x + this.sprites.size >= view.width) { // Right
      this.loc.x = view.width - this.sprites.size
      this.speed = new Coord()
    } else if (this.loc.x <= 0) { // Left
      this.loc.x = 0
      this.speed = new Coord()
    }

    if (this.loc.y + this.sprites.size >= view.height) { // Bottom
      this.loc.y = view.height - this.sprites.size
      this.speed = new Coord()
    } else if (this.loc.y <= 0) { // Top
      this.loc.y = 0
      this.speed = new Coord()
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
  name = "Squirrel"

  constructor (loc) {
    super(loc, Squirrel.name)
    this.maxSpeed = 10
  }
}

class Plant extends Obj {
  constructor () {

  }
}

class Texture extends Obj {
  constructor () {

  }
}

//  ____       _
// / ___|  ___| |_ _   _ _ __
// \___ \ / _ \ __| | | | '_ \
//  ___) |  __/ |_| |_| | |_) |
// |____/ \___|\__|\__,_| .__/
//                      |_|

// Set the canvas to the screen size, via css gives stretching effect (L)
doc.canvas.width = view.width = view.screen.width = window.innerWidth
doc.canvas.height = view.height = view.screen.height = window.innerHeight

let squirrel = new Squirrel(new Coord(50, 50)) // TEST
squirrel.acceleration = new Coord(0.1, 0)

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
   squirrel.move() // TEST
 }
}, Math.ceil(1000 / view.fps)) // Executes a certain amount of times per second

// Everything loaded
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    settings.started = true
    squirrel.display(squirrel.sprites.down[0]) // TEST
  }
}
