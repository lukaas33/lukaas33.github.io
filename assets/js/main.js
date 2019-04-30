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
  constructor (x, y) {
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

  get length () {
    return Math.sqrt(this.x**2 + this.y**2)
  }
}

// Multiple sprites from a name (L)
class Sprites {
  dirs = ["up", "right", "down", "left"]

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
  }

  // Display a sprite on the screen (L)
  display (sprite) {
    let img = new Image()
    img.onload = () => {
      view.screen.drawImage(img, this.loc.x, this.loc.y, this.sprites.size, this.sprites.size)
    }
    img.src = sprite
  }

  // Update coordinates and sprites (L)
  update () {
    const sprites = this.sprites[this.direction]
    const frame = this.sprites.frame
    if (this.sprites.moving && this.speed.length > 0) { // Moving object
      this.sprites.frame = (frame + 1) % (sprites.length)
    }
    this.display(sprites[frame])
  }

  // Update position (L)
  move () {
    // this.speed.add(this.acceleration)
    this.loc.add(this.speed)
    this.direction = "down"
    this.borders()
    this.update()
  }

  // Stops objects from moving past borders (L)
  borders () {
    if (this.loc.x >= view.width) { // TODO switch with map values
      this.loc.x = view.width - this.sprites.size
      this.speed = new Coord(0, 0)
    } else if (this.loc.x <= 0) {
      this.loc.x = 0
      this.speed = new Coord(0, 0)
    }

    if (this.loc.y >= view.height) {
      this.loc.y = view.height - this.sprites.size
      this.speed = new Coord(0, 0)
    } else if (this.loc.y <= 0) {
      this.loc.y = 0
      this.speed = new Coord(0, 0)
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
squirrel.speed = new Coord(0, 5)

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
   squirrel.move()
 }
}, Math.round(1000 / view.fps))

// Everything loaded
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    settings.started = true
    squirrel.display(squirrel.sprites.down[0]) // TEST
  }
}
