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
    fps: 25, // Frames per second
}

// The entire map
const map = {
  size: 100, // Meters wide and heigh
  populationDensity: 1000, // 1 animal per x square meters
  growthDensity: 50, // 1 plant per x square meters
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

// Animal and plants spawn on the map, add species to make them spawn (L)
map.spawn = function () {
  // Rarity of different animals
  const animalSpecies = {
    "deer": 0.25,
    "squirrel": 0.35,
    "wolf": 0.15
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
  PC.health = 1000,
  PC.traits.maxSpeed = 35,
  PC.traits.acceleration = 1
  PC.traits.attack = 1
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

  distance (coord) {
    let other = new Coord(coord.x, coord.y)
    other.subtract(this)
    return other
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
    this.middle = null
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
      if (sprite) { // Loaded
        if (this.speed.magnitude > 0) {
          this.sprites.frame += 1 // New frame
        }
        sprite = sprite[Math.floor(this.sprites.frame / switchRate) % (sprite.length)]
      }
    } else if (this.sprites.changing) { // Changing object
      sprite = this.sprites.sprite
      if (sprite) {
        this.sprites.frame += 1
        sprite = sprite[Math.floor(this.sprites.frame / switchRate) % (sprite.length)]
      }
    } else { // Static object
      sprite = this.sprites.sprite
    }

    if (sprite) { // Loaded
      // Store important variables
      this.sprites.size.width = sprite.width
      this.sprites.size.height = sprite.height

      this.sprites.middle = new Coord(this.loc.x + this.sprites.size.width / 2, this.loc.y + this.sprites.size.height / 2)

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
}

// Plant and animals share properties and methods
class Living extends Entity {
  constructor (loc, sprites) {
    super(loc, sprites)
  }

  // Living being's general actions (L)
  live () {
    if (this.health <= 0) {
      this.die()
    }

    // TODO implement hunger
  }

  // Display health (L)
  update () {
    super.update()

    const health = (this.health / this.traits.maxHealth)
    if (health < 1) {
      const height = 10 // height of health bar
      const width = 50 // width of health bar
      // Health bar at the center above the animal
      let x = this.loc.x + (this.sprites.size.width / 2) - (width / 2)
      let y = this.loc.y - (height * 3)
      // Convert map coords to view coords
      x = Math.floor(x - (view.middle.x - view.width/2))
      y = Math.floor(y - (view.middle.y - view.height/2))

      // Display background
      view.screen.fillStyle = '#eeeeee'
      view.screen.fillRect(x, y, width, height)
      if (health > 0) {
        // Display health
        view.screen.fillStyle = '#f44336'
        view.screen.fillRect(x, y, (width * health), height)
      }
    }
  }
}

// Objects, main movement functionality
class Obj extends Living {
  constructor (loc, sprites) {
    super(loc, sprites)
    this.speed = new Coord()
    this.acceleration = new Coord()
    this.direction = "down" // Starting position first draw
    this.speedFactor = 1 // Can change the max speed
  }

  // Additional functionality for moving creatures (L)
  live () {
    this.move() // Moving, not just displaying
    super.live()
  }

  // Change position (L)
  move () {
    // Add to speed
    if (this.acceleration.magnitude >= 0) {
      if (this.speed.magnitude < this.traits.maxSpeed * this.speedFactor) { // Accelerating
        this.acceleration.divide(view.fps) // From px/frame to px/second
        this.acceleration.multiply(constants.scale) // From px/seond to m/s
        this.speed.add(this.acceleration)
      } else { // At max speed
        this.speed.magnitude = this.traits.maxSpeed * this.speedFactor // Set to max to correct if over
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
    if (this.loc.x + this.sprites.size.width >= map.width) { // Right
      this.loc.x = map.width - this.sprites.size.width
      atBorder = true
    } else if (this.loc.x <= 0) { // Left
      this.loc.x = 0
      atBorder = true
    }

    if (this.loc.y + this.sprites.size.height >= map.height) { // Bottom
      this.loc.y = map.height - this.sprites.size.height
      atBorder = true
    } else if (this.loc.y <= 0) { // Top
      this.loc.y = 0
      atBorder = true
    }

    return atBorder
  }
}

// Parent class for all animals (L)
class Animal extends Obj {
  constructor (loc, name) {
    super(loc, new Sprites(name, true, false))
    this.name = name
  }

  // Additional functionality for animal lives (L)
  live () {
    // TODO implement hunger
    super.live()
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
      maxHealth: 3,
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
      maxHealth: 15,
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
      maxHealth: 8,
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

// Parent class for all plant objects, food for the animals
class Plant extends Living {
  constructor (loc, name) {
    super(loc, new Sprites(name, false, false))
    this.name = name
  }

  // Functionality for plant lives (L)
  live () {
    this.update()
    super.live()
  }

  // Plant dies (L)
  die () {
    for (let i = 0; i < plants.length; i++) {
      if (plants[i] === this) {
        plants.splice(i, 1)
      }
    }
  }
}

// All plant classes
class Mushroom extends Plant {
  constructor (loc) {
    let name = "Mushroom"
    super(loc, name)
    this.traits = {
      nutrition: 0.3,
      area: "land",
      maxHealth: 0.2
    }
    this.health = this.traits.maxHealth
  }
}

class Berry extends Plant {
  constructor (loc) {
    let name = "Berry"
    super(loc, name)
    this.traits = {
      nutrition: 0.5,
      area: "land",
      maxHealth: 0.3
    }
    this.health = this.traits.maxHealth
  }
}

class Cactus extends Plant {
  constructor (loc) {
    let name = "Cactus"
    super(loc, name)
    this.traits = {
      nutrition: 0.2,
      area: "land",
      maxHealth: 0.5
    }
    this.health = this.traits.maxHealth
  }
}

class Shrub extends Plant {
  constructor (loc) {
    let name = "Shrub"
    super(loc, name)
    this.traits = {
      nutrition: 0.1,
      area: "land",
      maxHealth: 0.5
    }
    this.health = this.traits.maxHealth
  }
}

class Bush extends Plant {
  constructor (loc) {
    let name = "Bush"
    super(loc, name)
    this.traits = {
      nutrition: 0.1,
      area: "land",
      maxHealth: 0.6
    }
    this.health = this.traits.maxHealth
  }
}

// Background texture objects (A)
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


// Functionality for NPC and PC
class Creature extends Obj {
  constructor (animal) {
    super(animal.loc, animal.sprites)
    this.target = null // Target when hunting
    this.hunter = null // Is hunting you
    this.traits = animal.traits
    this.health = this.traits.maxHealth
  }

  // Animal dies (L)
  die () {
    for (let i = 0; i < animals.length; i++) {
      if (animals[i] === this) {
        animals.splice(i, 1)
      }
    }
  }

  // Sucesfull hit on another object or animal (L)
  hit (object) {
    object.health -= this.traits.attack
    this.cooldown = true
    window.setTimeout((object) => {
      object.cooldown = false // Cooldown over
    }, 400, this)
  }

  // Attack another animal or plant (L)
  attack (object) {
    if (!this.cooldown) { // Wait until attack again
      if (object !== this && object) { // Not self and exists
        // Distance to object
        let distance = this.sprites.middle.distance(object.sprites.middle)

        if (distance.magnitude <= (constants.scale * 2)) { // Max x meter range for attack
          if (this.speed.magnitude > 0) {
            let difference = Math.abs(distance.angle - this.speed.angle) // Difference in angles
            if (difference < (Math.PI / 3)) { // Difference in angle of attack lower than x degrees
              this.hit(object)
              return true
            }
          } else { // Standing still
            this.hit(object)
            return true
          }
        }
      }
    }
  }
}

// Player class, will have one instance
class Player extends Creature {
  constructor (animal) {
    super(animal)
    this.moving = false // Move key
    this.attacking = false // Attack key
    this.speedFactor = 0.65 // Not at max speed
  }

  // Different behaviour when dying
  die () {
    // TODO implement end of game
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
      case 32: // Spacebar
        if (!this.attacking) { // Not already on
          if (action) { // Key pressed
            this.attacking = true
            for (let animal of animals) {
              if (this.attack(animal)) { // Hit
                this.target = animal
                return // One at the times
              }
             }
            for (let plant of plants) {
              if (this.attack(plant)) { // Hit
                this.target = plant
                return
              }
            }
          }
        } else { // already on
          if (!action) { // Key release
            this.attacking = false
          }
        }
        break
      case 16: // Shift
        if (action) {
          this.speedFactor = 1 // Sprint
        } else if (!action){
          this.speedFactor = 0.65
        }
        break
    }

    if (movement !== null) { // Key for moving
      if (!this.moving) { // Not already on
        if (action) { // Key pressed
          this.moving = true
          movement.magnitude = this.traits.acceleration
          this.acceleration = movement // Set the acceleration
        }
      } else { // Already on
        if (!action) { // Key release
          this.moving = false
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


class NPC extends Creature {
  constructor (animal) {
    super(animal)
    this.currentBehaviour = "wandering" // Start bevaviour
    this.previousBehaviour = null
    this.state = "stop" // Start state
    this.step = 0
    this.speedFactor = 0.65 // Not at max speed
    // Sight based on perception trait, from 1 to x m
    let x = 40
    this.sightRadius = (1 + ((x - 1) * constants.scale * (this.traits.perception)) )

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

  // Store previous when setting a behaviour (L)
  set behaviour (value) {
    if (value) {
      if (this.currentBehaviour !== value) {
        this.previousBehaviour = this.currentBehaviour
        this.currentBehaviour = value
      }
    }
  }

  get behaviour () {
    return this.currentBehaviour
  }

  // Additional functionality for live - determines behaviour (L)
  live () {
    if (this.behaviour === "wandering") {
      this.speedFactor = 0.65 // Not at max speed

      this.step += 1
      if (this.step >= 2 * view.fps) { // Reduces the number of decisions in direction (x per second)
        this.chooseDirection() // Choose on new direction
        this.step = 0
      }

      this.look() // Look around - can change behaviour
    } else if (this.behaviour === "hunting") {
      if (this.target && animals.includes(this.target) && this.target.health > 0) { // Exists
        this.speedFactor = 1

        let distance = this.sprites.middle.distance(this.target.sprites.middle)

        // Check if still in range
        let range = this.sightRadius * (1 - this.target.traits.camouflage)
        if (distance.magnitude >= range) {
          this.behaviour = "wandering"
          this.target = null
        }

        // Follow prey
        if (Math.abs(distance.angle - this.speed.angle) < Math.PI / 6) { // Roughly the same direction
          // Use component going in the direction of the animal
          let inproduct = this.speed.x * distance.x + this.speed.y * distance.y
          distance.magnitude = inproduct
          this.speed.add(distance) // Move toward
        } else {
          // Start moving
          this.stop()
          distance.magnitude = this.traits.acceleration
          this.acceleration = distance
        }
        // Try to attack
        this.attack(this.target)
      } else {
        this.behaviour = "wandering"
        this.target = null
      }
    } else if (this.behaviour === "fleeing") {
      if (this.hunter.target === this && animals.includes(this.hunter) && this.hunter.health > 0) { // Exists
        this.speedFactor = 1
        
        let distance = this.sprites.middle.distance(this.hunter.sprites.middle)
        // Check if still close
        let range = this.sightRadius * (1 - this.hunter.traits.camouflage)
        if (distance.magnitude >= range) {
          this.behaviour = "wandering"
          this.hunter = null
        }

        // Go in the reverse direction
        distance.rotate("right")
        distance.rotate("right")
        if (this.speed.magnitude > 0) {
          distance.magnitude = this.speed.magnitude
          this.speed.add(distance) // Move away
        } else {
          distance.magnitude = this.traits.acceleration
          this.acceleration = distance
        }
      } else {
        this.behaviour = "wandering"
        this.hunter = null
      }
    } else if (this.behaviour === "eating") {
      // TODO implement eat
    } else if (this.behaviour === "hiding") {
      // TODO implement hide
    }

    // TODO implement obstacle avoidance

    super.live() // Normal actions
  }

  // Respond to another animal (L)
  found (animal) {
    if (this.traits.diet === "carnivore") { // Can attack first
      if (this.traits.name !== animal.traits.name) { // No canibalism
        // Will attack odd based on agression
        let odds = {
          "true": this.traits.aggressiveness,
          "false": 1 - this.traits.aggressiveness
        }

        if (random.choose(odds) === "true") {
          // Hunt the animal
          this.behaviour = "hunting"
          this.target = animal
        }
      }
    }

    if (animal.target === this) { // NPC is being hunted
      this.behaviour = "fleeing"
      this.hunter = animal
    }
  }

  // Check if predators or prey close (L)
  look () {
    for (let animal of animals) {
      if (animal !== this) {
        if (this.sprites.middle && animal.sprites.middle) { // For first iteration
          let distance = this.sprites.middle.distance(animal.sprites.middle)
          // Animal is within sight radius, depends on camo trait
          let range = this.sightRadius * (1 - animal.traits.camouflage)
          if (distance.magnitude <= range) {
            this.found(animal)
          }
        }
      }
    }
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
       plant.live()
     }
   }

   // Draw animals
   for (let animal of animals) {
     if (animal) {
       animal.live()
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
