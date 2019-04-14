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
    screen: doc.canvas.getContext('2d'),
    fps: 30
}

// The entire map
const map = {
  size: 0,
  tiles: []
}

// Store all instances
const animals = []
const plants = []


 //  _____                 _   _
 // |  ___|   _ _ __   ___| |_(_) ___  _ __  ___
 // | |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
 // |  _|| |_| | | | | (__| |_| | (_) | | | \__ \
 // |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/



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
}

// Multiple sprites from a name
class Sprites {
  dirs = ["up", "right", "down", "left"]

  constructor (name, moving, changing) {
    this.moving = moving
    this.changing = changing

    // Get the different sprites
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

  // Preload image and verify it exists (asychronnous)
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

  // Recursive function for getting multiple images (asynchronous)
  getImages (path, i, sprites, callback) {
    const file = `${path}-${i}.png`
    this.getImage(file, (res) => {
      if (res === null) {
        callback(sprites) // Return
      } else {
        sprites.push(res)
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

  display (sprite) {
    let img = new Image()
    img.onload = () => {
      view.screen.drawImage(img, this.loc.x, this.loc.y)
    }
    img.src = sprite
  }

  update () {

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
    super(loc, "Squirrel")
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

// Set the canvas to the screen size, via css gives stretching effect
doc.canvas.width = window.innerWidth
doc.canvas.height = window.innerHeight
view.screen.width = window.innerWidth
view.screen.height = window.innerHeight

let squirrel = new Squirrel(new Coord(50, 50)) // TEST

//  _____                 _
// | ____|_   _____ _ __ | |_ ___
// |  _| \ \ / / _ \ '_ \| __/ __|
// | |___ \ V /  __/ | | | |_\__ \
// |_____| \_/ \___|_| |_|\__|___/

// Main drawing function
view.refresh = window.setInterval(() => {
 if (settings.started) {

 }
}, Math.round(1000 / view.fps))

// Everything loaded
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    settings.started = true
    squirrel.display(squirrel.sprites.down[0]) // TEST
  }
}
