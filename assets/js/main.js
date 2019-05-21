//       _          _                 _   _  ___                 _
//      / \   _ __ (_)_ __ ___   __ _| | | |/ (_)_ __   __ _  __| | ___  _ __ ___
//     / _ \ | '_ \| | '_ ` _ \ / _` | | | ' /| | '_ \ / _` |/ _` |/ _ \| '_ ` _ \
//    / ___ \| | | | | | | | | | (_| | | | . \| | | | | (_| | (_| | (_) | | | | | |
//   /_/   \_\_| |_|_|_| |_| |_|\__,_|_| |_|\_\_|_| |_|\__, |\__,_|\___/|_| |_| |_|
//                                                     |___/
// A game by Anne du Croo de Jongh and Lucas van Osenbruggen
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
  scale: 32, // pixels in one meter
}

// Related to document, for example html elements
const doc = {
  canvas: document.getElementById('canvas'),
  startButton: document.getElementById("startButton")
}

// Related to the view and drawing
const view = {
    width: null,
    height: null,
    middle: null,
    screen: doc.canvas.getContext('2d'),
    fps: 30, // Frames per second
}

// The entire map
const map = {
  size: 100, // Meters wide and heigh
  populationDensity: 500, // 1 animal per x square meters
  growthDensity: 100, // 1 plant per x square meters
  width: null,
  height: null,
  tiles: null
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
    const string = JSON.stringify(value) // Convert value
    localStorage.setItem(name, string)
  }
}

// Random functions (L)
const random = {
  choose: function (options) {
    let cummulative = 0
    let total = Object.values(options).reduce((a, b) => a + b, 0)
    let odd = Math.random() * total // random number between 0 and max
    for (let dir in options) {
      cummulative += options[dir]
      if (odd < cummulative) { // Found
        return dir
      }
    }
  }
}

// Generate the map (L)
map.generate = function () {
  // Create 2D-array of sizexsize
  map.tiles = new Array(map.size)
  for (let a = 0; a < map.size; a++) {
    map.tiles[a] = new Array(map.size)
  }

  // Loop through all
  for (let y = 0; y < map.size; y++) {
    for (let x = 0; x < map.size; x++) {
      map.add(new Coord(x, y))
    }
  }
}

// Add a random texture to the map (L)
map.add = function (loc) {
  if (map.tiles[loc.y][loc.x] === undefined) { // Spot still empty
    // Standard generation odds
    const options = {
      "grass": 1, // Depends on other odds
      "water": 0.006,
      "tree": 0.024
    }

    // Check nearby for water tiles
    if (loc.x > 0 && loc.y > 0) {
      const near = [map.tiles[loc.y - 1][loc.x - 1], map.tiles[loc.y - 1][loc.x], map.tiles[loc.y][loc.x - 1]]
      const nearby = near.filter((x) => x !== null && x.type === "water").length // Number of nearby water tiles
      // More adjecent tiles makes water spawing more likely
      const factor = 60
      options["water"] += options["water"] * (nearby * factor)
    }
    options["grass"] -= options["tree"] + options["water"]

    // Choose random texture from options
    const type = random.choose(options)

    // Add location and add to map
    const place = new Coord(loc.x, loc.y)
    place.multiply(constants.scale)
    switch (type) {
      case "grass":
        map.tiles[loc.y][loc.x] = new Grass(place)
        break
      case "water":
        map.tiles[loc.y][loc.x] = new Water(place)
        break
      case "tree":
        if ((loc.y + 1) < map.size && (loc.x + 1) < map.size) { // Not at edge
          map.tiles[loc.y][loc.x] = new Tree(place)
          // Clear other spots because a tree is 4 tiles big
          map.tiles[loc.y + 1][loc.x] = null
          map.tiles[loc.y][loc.x + 1] = null
          map.tiles[loc.y + 1][loc.x + 1] = null
        } else {
          map.add(loc) // Try again
        }
        break
    }
  }
}

// Animal and plants spawn on the map (L)
map.spawn = function () {
  // Rarity of different animals
  const animalSpecies = {
    "deer": 0.2,
    "squirrel": 0.4,
    "wolf": 0.1
  }
  const animalConstructors = {
    "deer": Deer,
    "squirrel": Squirrel,
    "wolf": Wolf
  }

  // Add animals
  while (animals.length < (map.size**2) / map.populationDensity) { // Based on map size
    animals.push(new NPC(map.create(animalSpecies, animalConstructors)))
  }

  // Rarity of different plants
  const plantSpecies = {
    "mushroom": 0.1,
    "bush": 0.2,
    "berry": 0.2,
    "shrub": 0.5,
    "cactus": 0.05,
  }
  const plantConstructors = {
    "mushroom": Mushroom,
    "bush": Bush,
    "berry": Berry,
    "shrub": Shrub,
    "cactus": Cactus,
  }

  // Add plants
  while (plants.length < (map.size**2) / map.growthDensity) {
    plants.push(map.create(plantSpecies, plantConstructors))
  }
}

// Create a new animal or plant
map.create = function (species, constructors) {
  const isLegal = function (loc, object) {
    // Must be outside view
    let inView = (loc.x < view.middle.x - view.width / 2 || loc.x > view.middle.x + view.width / 2)
    inView = inView || (loc.y < view.middle.y - view.height / 2 || loc.y > view.middle.y + view.height / 2)

    // Legal terrain
    let habitat = false
    let row = Math.floor(loc.y / constants.scale)
    let col = Math.floor(loc.x / constants.scale)
    if (map.tiles[row][col]) {
      habitat = map.tiles[row][col].area === object.traits.area
    }
    return inView && habitat
  }

  // Choose random based on rarity
  const name = random.choose(species)
  const creature = new constructors[name]

  // Choose random location
  let loc = null
  do {
    // Two random values on the map
    let x = Math.floor(Math.random() * (map.size * constants.scale))
    let y = Math.floor(Math.random() * (map.size * constants.scale))
    loc = new Coord(x, y)
  } while (!isLegal(loc, creature)) // Check condition after initialising

  return new creature.constructor(loc)
}

// Godmode function, called via console (A)
const godMode = function () {
  PC.traits.health = Math.infinity,
  PC.traits.maxSpeed = 35,
  PC.traits.acceleration = 1
  PC.traits.attack = 1
}

// const button = function () {

//}

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

  // Several vector math methods (L)
  add (coord) {
    this.x += coord.x
    this.y += coord.y
  }
  subtract (coord) {
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

  rotate (dir) { // Rotate the vector
    if (dir === "right") {
      [this.x, this.y] = [this.y, -this.x]
    } else if (dir === "left") {
      [this.x, this.y] = [-this.y, this.x]
    }
  }

  get magnitude () { // Calculate the length of the vector
    return Math.sqrt(this.x**2 + this.y**2)
  }
  set magnitude (value) { // Change the length of the vector
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
      return new Coord() // 0-vector
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
    this.size = {
      width: null,
      height: null
    }

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
    let switchRate = 5 // Switch sprite every x frames
    let sprite = null

    if (this.sprites.moving) { // Moving object
      sprite = this.sprites[this.direction]
      if (this.speed.magnitude > 0) {
        this.sprites.frame += 1 // New frame
      }
      sprite = sprite[Math.floor(this.sprites.frame / switchRate) % (sprite.length)]
    } else if (this.sprites.changing) { // Changing object
      sprite = this.sprites.sprite
      this.sprites.frame += 1
      sprite = sprite[Math.floor(this.sprites.frame / switchRate) % (sprite.length)]
    } else { // Static object
      sprite = this.sprites.sprite
    }

    this.sprites.size.width = sprite.width
    this.sprites.size.height = sprite.height

    // Location from absolute (map) to relative (view)
    let x = Math.floor(this.loc.x - (view.middle.x - view.width/2))
    let y = Math.floor(this.loc.y - (view.middle.y - view.height/2))

    // Only draw when in view, with edges for smoother loading
    let edge = 64
    if (-edge < x && x < view.width + edge && -edge < y && y < view.height + edge) {
      // performance: drawing is an intensive task
      view.screen.drawImage(sprite, x, y)
    }
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
        this.acceleration.divide(view.fps) // From px/frame to px/second
        this.acceleration.multiply(constants.scale) // From px/seond to m/s
        this.speed.add(this.acceleration)
      } else { // At max speed
        this.speed.magnitude = this.traits.maxSpeed // Set to max to correct if over
      }
    }

    // Add to location
    if (this.speed.magnitude > 0) {
      this.loc.add(this.speed) // Change in location per frame

      // Get direction
      let angle = (this.speed.angle + 2 * Math.PI) % (2 * Math.PI) // Angle from 0 to 2 * Pi
      let index = Math.round(2 * (angle / Math.PI)) % 4 // Angle to values 0, 1, 2, 3
      this.direction = this.sprites.dirs[index] // Direction in text form
    }

    // Check if legal
    this.borders()
    for (let animal of animals) { // Collide with animal
      if (animal !== this) {
        if (this.collide(animal)) {
          // Get component going in the direction of the animal
          let distance = new Coord(animal.loc.x - this.loc.x, animal.loc.y - this.loc.y)
          let inproduct = this.speed.x * distance.x + this.speed.y * distance.y
          distance.magnitude = inproduct
          distance.divide(view.fps)
          // Subtract from speed
          this.speed.subtract(distance)
        }
      }
    }

    // Update on screen
    this.update()
  }

  // Stop moving
  stop () {
    this.speed.magnitude = 0
    this.acceleration.magnitude = 0
  }

  // check if colliding with another object (L)
  collide (obj) {
    let collideX = this.loc.x <= obj.loc.x + obj.sprites.size.width && this.loc.x >= obj.loc.x
    collideX = collideX || this.loc.x + this.sprites.size.width <= obj.loc.x + obj.sprites.size.width && this.loc.x + this.sprites.size.width >= obj.loc.x
    let collideY = this.loc.y <= obj.loc.y + obj.sprites.size.height && this.loc.y >= obj.loc.y
    collideY = collideY || this.loc.y + this.sprites.size.height <= obj.loc.y + obj.sprites.size.height && this.loc.y + this.sprites.size.height >= obj.loc.y
    return collideX && collideY
  }

  // Checks and stops object if objects moving past borders (L)
  borders () {
    let atBorder = false
    if (this.direction === 'right' || this.direction === 'left') {
      if (this.loc.x + this.sprites.size.width >= map.width) { // Right
        this.loc.x = map.width - this.sprites.size.width
        atBorder = true
      } else if (this.loc.x <= 0) { // Left
        this.loc.x = 0
        atBorder = true
      }
    }
    if (this.direction === 'up' || this.direction === 'down') {
      if (this.loc.y + this.sprites.size.height >= map.height) { // Bottom
        this.loc.y = map.height - this.sprites.size.height
        atBorder = true
      } else if (this.loc.y <= 0) { // Top
        this.loc.y = 0
        atBorder = true
      }
    }

    return atBorder
  }
}

// Parent class for all animals
class Animal extends Obj {
  constructor (loc, name) {
    super(loc, new Sprites(name, true, false))
    this.name = name
  }
}

// All animal classes
class Squirrel extends Animal {
  constructor (loc) {
    let name = "Squirrel"
    super(loc, name)
    // The animal's traits, in SI units (A)
    this.traits = {
      maxSpeed: 15,
      acceleration: 0.05,
      area: "land",
      health: 25,
      mass: 0.3,
      diet: "herbivore",
      camouflage: 0.6,
      perception: 0.8,
      aggressiveness: 0.1,
      attack: 0.2,
      name: name
    }
  }
}

class Wolf extends Animal {
  constructor (loc) {
    let name = "Wolf"
    super(loc, name)
    // The animal's traits, in SI units (A)
    this.traits = {
      maxSpeed: 10,
      acceleration: 0.01,
      area: "land",
      health: 100,
      mass: 60.0,
      diet: "carnivore",
      camouflage: 0.6,
      perception: 0.6,
      aggressiveness: 0.7,
      attack: 0.8,
      name: name
    }
  }
}

class Deer extends Animal {
  constructor (loc) {
    let name = "Deer"
    super(loc, name)
    // the animal's traits, in SI units (A)
    this.traits = {
      maxSpeed: 7,
      acceleration: 0.07,
      area: "land",
      health: 70,
      mass: 50,
      diet: "herbivore",
      camouflage: 0.7,
      perception: 0.7,
      aggressiveness: 0.2,
      attack: 0.3,
      name: name
    }
  }
}

// Plant objects, food for the animals (A)
class Plant extends Entity {
  constructor (loc, name) {
    super(loc, new Sprites(name, false, false))
    this.name = name
  }
}

// All plant classes
class Mushroom extends Plant {
  constructor (loc) {
    let name = "Mushroom"
    super(loc, name)
    this.traits = {
      nutrition: 0.3,
      area: "land"
    }
  }
}

class Berry extends Plant {
  constructor (loc) {
    let name = "Berry"
    super(loc, name)
    this.traits = {
      nutrition: 0.5,
      area: "land"
    }
  }
}

class Cactus extends Plant {
  constructor (loc) {
    let name = "Cactus"
    super(loc, name)
    this.traits = {
      nutrition: 0.2,
      area: "land"
    }
  }
}

class Shrub extends Plant {
  constructor (loc) {
    let name = "Shrub"
    super(loc, name)
    this.traits = {
      nutrition: 0.1,
      area: "land"
    }
  }
}

class Bush extends Plant {
  constructor (loc) {
    let name = "Bush"
    super(loc, name)
    this.traits = {
      nutrition: 0.1,
      area: "land"
    }
  }
}

// Background texture objects
class Water extends Entity {
  constructor (loc) {
    let name = "water"
    super(loc, new Sprites(name, false, false)) // TODO make changing
    this.type = name
    this.area = "water"
  }
}

class Grass extends Entity {
  constructor (loc) {
    let name = "grass"
    super(loc, new Sprites(name, false, false))
    this.type = name
    this.area = "land"
  }
}

class Tree extends Entity {
  constructor (loc) {
    let name = "tree"
    super(loc, new Sprites(name, false, false))
    this.type = name
    this.area = "sky"
  }
}

// Player class, will have one instance
class Player extends Obj {
  constructor (animal) {
    super(animal.loc, animal.sprites)
    this.traits = animal.traits
    this.pressed = false // Key is being pressed
  }

  // Control function, called on key press (L)
  control (key, action) {
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
      if (!this.pressed) {
        if (action) {
          this.pressed = true // No two at the same time
          movement.magnitude = this.traits.acceleration
          this.acceleration = movement // Set the acceleration
        }
      } else {
        if (!action) {
          this.pressed = false
          this.stop()
        }
      }
    }
  }

  // View adapts when you get close to the edge, not in the center (L)
  move () {
    super.move()

    // Near the edge
    let xZero = (view.width / 2)
    let xTop = (map.width - view.width / 2)
    let yZero = (view.height / 2)
    let yTop = (map.height - view.height / 2)

    if (this.loc.x <= xZero || this.loc.x >= xTop || this.loc.y <= yZero || this.loc.y >= yTop) {
      // View not complely following PC
      if (this.loc === view.middle) {
        this.loc = new Coord(this.loc.x, this.loc.y) // Use value instead of reference
      }

      // View follows on one axis
      if (this.loc.x <= xZero && !(this.loc.y <= yZero || this.loc.y >= yTop)) {
        view.middle.x = xZero
        view.middle.y = this.loc.y
      } else if (this.loc.x >= xTop && !(this.loc.y <= yZero || this.loc.y >= yTop)) {
        view.middle.x = xTop
        view.middle.y = this.loc.y
      }
      if (this.loc.y <= yZero  && !(this.loc.x <= xZero || this.loc.x >= xTop)) {
        view.middle.y = yZero
        view.middle.x = this.loc.x
      } else if (this.loc.y >= yTop  && !(this.loc.x <= xZero || this.loc.x >= xTop)) {
        view.middle.y = yTop
        view.middle.x = this.loc.x
      }

    } else {
      this.loc = view.middle // Use reference
    }
  }
}


class NPC extends Obj {
  constructor (animal) {
    super(animal.loc, animal.sprites)
    this.traits = animal.traits
    this.state = "stop" // Start state
    this.step = 0

    // Movement matrix (L)
    this.movement = {
      "continue": { // Moving
        "continue": 0.7,
        "stop": 0.05,
        "left": 0.1,
        "right": 0.1,
        "back": 0.05,
      },
      "stop": { // Not moving
        "continue": 0.3,
        "stop": 0.25,
        "left": 0.2,
        "right": 0.2,
        "back": 0.05,
      }
    }

    this.chooseDirection() // Start moving
  }

  // Choose a direction at random from the decision matrix (L)
  chooseDirection () {
    // Choose random with different chances
    const options = this.movement[this.state]
    const option = random.choose(options)

    // Change the direction
    if (option === "stop") {
      this.stop()
    } else {
      if (this.acceleration.magnitude === 0) { // Not moving
        this.acceleration = new Coord(0, 1)
      }
      this.acceleration.magnitude = this.traits.acceleration
      switch (option) {
        case "continue":
          break
        case "left":
          this.acceleration.rotate("left")
          break
        case "right":
          this.acceleration.rotate("right")
          break
        case "back":
          this.acceleration.rotate("left")
          this.acceleration.rotate("left")
          break
      }
    }
  }

  // Main movement function, overwrites parent method (L)
  move () {
    this.step += 1
    if (this.step >= view.fps) { // Reduces the number of decisions in direction (1 per second)
      this.chooseDirection()
      this.step = 0
    }

    super.move() // Call parent method
  }


  // Different behaviour when colliding (L)
  borders () {
    if (super.borders()) { // Call parent method
      this.chooseDirection()
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
map.width = map.height = map.size * constants.scale
view.middle = new Coord(map.width, map.height)
view.middle.divide(2)




// Create player
// View.middle reference passed so when the player location is updated the player view is as well
const PC = new Player(new Squirrel(view.middle))
animals[0] = PC

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
   view.screen.fillRect(0, 0, view.screen.width, view.screen.height) // TEST

   // Draw the map
   for (let y = 0; y < map.size; y++) {
     for (let x = 0; x < map.size; x++) {
       if (map.tiles[y][x]) { // Not null, not undefined
         map.tiles[y][x].update()
       }
     }
   }

   // Draw plants
   for (let plant of plants) {
     if (plant) {
       plant.update()
     }
   }

   // Draw animals
   for (let animal of animals) {
     if (animal) {
       animal.move()
     }
   }

   // Spawn new creatures when below the max
   map.spawn()
 }
}, Math.ceil(1000 / view.fps)) // Executes a certain amount of times per second

// Setup keyboard controls
document.addEventListener('keydown', (event) => {
  PC.control(event.keyCode, true)
})

document.addEventListener('keyup', () => {
  PC.control(event.keyCode, false) // Stop signal
})



// Everything loaded
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    // Start game (A)
    doc.startButton.addEventListener("click", function () {
      // Generate map and initial animals/plants
      map.generate()
      map.spawn()
      settings.started = true
      doc.startButton.style.display = "none"
    })
  }
}
