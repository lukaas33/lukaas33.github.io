//       _          _                 _   _  ___                 _
//      / \   _ __ (_)_ __ ___   __ _| | | |/ (_)_ __   __ _  __| | ___  _ __ ___
//     / _ \ | '_ \| | '_ ` _ \ / _` | | | ' /| | '_ \ / _` |/ _` |/ _ \| '_ ` _ \
//    / ___ \| | | | | | | | | | (_| | | | . \| | | | | (_| | (_| | (_) | | | | | |
//   /_/   \_\_| |_|_|_| |_| |_|\__,_|_| |_|\_\_|_| |_|\__, |\__,_|\___/|_| |_| |_|
//                                                     |___/
// A game by Anne du Croo de Jongh and Lucas van Osenbruggen
// Code blocks are attributed to the author using (A) and (L) respectively.


(function () { // Closure
'use strict' // Js strict mode

// __     __         _       _     _
// \ \   / /_ _ _ __(_) __ _| |__ | | ___  ___
//  \ \ / / _` | '__| |/ _` | '_ \| |/ _ \/ __|
//   \ V / (_| | |  | | (_| | |_) | |  __/\__ \
//    \_/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/

// Changing values related to setup
const settings = {
  started: false,
  startTime: null
}

// Fhysical constants, not changing
const constants = {
  scale: 32, // pixels in one meter
}

// Related to document, for example html elements
const doc = {
  canvas: document.getElementById('canvas'),
  startScreen: document.getElementById("begin"),
  startButton: document.getElementById("start")
}

// Related to the view and drawing
const view = {
    width: null,
    height: null,
    middle: null,
    screen: doc.canvas.getContext('2d'),
    fps: 40, // Frames per second
}

// The entire map
const map = {
  size: 100, // Meters wide and heigh
  populationDensity: 350, // 1 animal per x square meters
  growthDensity: 65, // 1 plant per x square meters
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
const store = { // TODO, use for saving of progress between sessions
  get: function (name) {
    const string = localStorage.getItem(name)
    try {
      return JSON.parse(string)
    } catch (e) { // Won't work if the data is only a string
      return string
    }
  },
  set: function (name, value) {
    const string = JSON.stringify(value)
    localStorage.setItem(name, string)
  }
}

// Random functions (L)
const random = {
  choose: function (options) {
    let total = Object.values(options).reduce((a, b) => a + b, 0) // Total of odds
    let odd = Math.random() * total // random number between 0 and total

    let cummulative = 0
    for (let option in options) {
      cummulative += options[option]
      if (odd < cummulative) { // Found random option
        return option
      }
    }
  }
}

// Set the canvas to the screen size, via css gives stretching effect (L)
view.sizes = function () {
  doc.canvas.width = view.width = view.screen.width = document.body.clientWidth
  doc.canvas.height = view.height = view.screen.height = document.body.clientHeight
  map.width = map.height = (map.size * constants.scale)
  view.middle = new Coord(map.width, map.height)
  view.middle.divide(2)
}

// Generate the map (L)
map.generate = function () {
  // Create 2D-array
  map.tiles = new Array(map.size)
  for (let a = 0; a < map.size; a++) {
    map.tiles[a] = new Array(map.size)
  }

  // Loop through 2D-array
  for (let y = 0; y < map.size; y++) {
    for (let x = 0; x < map.size; x++) {
      map.add(new Coord(x, y)) // Random texture
    }
  }
}

// Add a random texture to the map (L)
map.add = function (loc) {
  const place = new Coord(loc.x, loc.y)
  place.multiply(constants.scale) // Index to map coordinates

  if (map.tiles[loc.y][loc.x] === undefined) { // Spot still empty
    // Standard generation odds
    const options = {
      "grass": null,
      "water": 0.006,
      "tree": 0.020
    }

    // More adjecent water tiles makes water spawing more likely
    if (loc.x > 0 && loc.y > 0) {
      const near = [
        map.tiles[loc.y - 1][loc.x - 1],
        map.tiles[loc.y - 1][loc.x],
        map.tiles[loc.y][loc.x - 1]
      ]
      const nearby = near.filter((x) => x !== null && x.type === "water") // Number of nearby
      const factor = 64 // Increase odd of water spawning
      options["water"] += options["water"] * (nearby.length * factor)
    }
    options["grass"] = 1 - (options["tree"] + options["water"]) // Default

    const type = random.choose(options) // Choose random texture from options

    // Add texture to map
    switch (type) {
      case "grass":
        map.tiles[loc.y][loc.x] = new Grass(place)
        break
      case "water":
        map.tiles[loc.y][loc.x] = new Water(place)
        break
      case "tree":
        // Not at edge or too close to another tree
        if ((loc.y + 1) < map.size && (loc.x + 1) < map.size &&
            map.tiles[loc.y + 1][loc.x] !== null &&
            map.tiles[loc.y][loc.x + 1] !== null &&
            map.tiles[loc.y + 1][loc.x + 1] !== null) {

          // Clear other spots because a tree is 4 tiles big
          map.tiles[loc.y][loc.x] = new Tree(place)
          map.tiles[loc.y + 1][loc.x] = null
          map.tiles[loc.y][loc.x + 1] = null
          map.tiles[loc.y + 1][loc.x + 1] = null
          // Add tiles as background for the tree
          map.tiles[loc.y][loc.x].background = [
            new Grass(place),
            new Grass(new Coord(place.x + constants.scale, place.y)),
            new Grass(new Coord(place.x + constants.scale, place.y + constants.scale)),
            new Grass(new Coord(place.x, place.y + constants.scale)),
          ]
        } else { // At the edge
          map.add(loc)
        }
        break
    }
  }
}

// Animal and plants spawn on the map (L)
map.spawn = function () {
  // Rarity of different animals (smaller animals more common, carnivores rarer)
  map.animalConstructors = {
    "deer": Deer,
    "squirrel": Squirrel,
    "wolf": Wolf,
    "bass": Bass,
    "sparrow": Sparrow,
    "bear": Bear,
    "badger": Badger,
    "panda": Panda,
    "lion": Lion,
    "tiger": Tiger,
    "duck": Duck,
    "crow": Crow,
    "dove": Dove,
    "bison": Bison,
    "bull": Bull,
    "bunny": Bunny,
    "butterfly": Butterfly,
    "cat": Cat,
    "chicken": Chicken,
    "cobra": Cobra,
    "cheeta": Cheeta,
    "corgi": Corgi,
    "chinchilla": Chinchilla,
    "cow": Cow,
    "crab": Crab,
    "crocodile": Crocodile,
    "goose": Goose,
    "fox": Fox,
    "frog": Frog,
    "goat": Goat,
    "pig": Pig,
    "dog": Dog,
    "sheep": Sheep,
    "raccoon": Raccoon,
    "ferret": Ferret,
    "salmon": Salmon,
    "owl": Owl,
    "shark": Shark,
    "hippo": Hippo,
    "turtle": Turtle,
    "mole": Mole,
    "monkey": Monkey,
    "mouse": Mouse,
    "horse": Horse,
    "ostrich": Ostrich,
    "seagull": Seagull,
    "carp": Carp,
    "snake": Snake,
    "lizard": Lizard,
  }
  const animalSpecies = {
    "deer": 0.15,
    "squirrel": 0.3,
    "wolf": 0.1,
    "bass": 0.2,
    "sparrow": 0.3,
    "bear": 0.1,
    "badger": 0.25,
    "panda": 0.1,
    "lion": 0.1,
    "tiger": 0.1,
    "duck": 0.3,
    "crow": 0.3,
    "dove": 0.2,
    "bison": 0.15,
    "bull": 0.1,
    "bunny": 0.4,
    "butterfly": 0.2,
    "cat": 0.25,
    "chicken": 0.2,
    "cobra": 0.15,
    "cheeta": 0.1,
    "corgi": 0.2,
    "chinchilla": 0.4,
    "cow": 0.2,
    "crab": 0.3,
    "crocodile": 0.1,
    "goose": 0.4,
    "fox": 0.35,
    "frog": 0.45,
    "goat": 0.2,
    "pig": 0.2,
    "dog": 0.15,
    "sheep": 0.3,
    "raccoon": 0.1,
    "ferret": 0.5,
    "salmon": 0.4,
    "owl": 0.4,
    "shark": 0.05,
    "hippo": 0.05,
    "turtle": 0.15,
    "mole": 0.25,
    "monkey": 0.3,
    "mouse": 0.5,
    "horse": 0.1,
    "ostrich": 0.1,
    "seagull": 0.3,
    "carp": 0.35,
    "snake": 0.2,
    "lizard": 0.4,
  }

  // Add animals
  while (animals.length < (map.size**2) / map.populationDensity) { // Based on map size
    animals.push(new NPC(map.create(animalSpecies, map.animalConstructors)))
  }


  // Rarity of different plants
  map.plantConstructors = {
    "mushroom": Mushroom,
    "bush": Bush,
    "berry": Berry,
    "shrub": Shrub,
    "cactus": Cactus,
  }
  const plantSpecies = {
    "mushroom": 0.1,
    "bush": 0.2,
    "berry": 0.2,
    "shrub": 0.5,
    "cactus": 0.05,
  }

  // Add plants
  while (plants.length < (map.size**2) / map.growthDensity) {
    plants.push(map.create(plantSpecies, map.plantConstructors))
  }
}

// Create a random new animal or plant (L)
map.create = function (species, constructors) {
  // Check if position is legal
  const isLegal = function (loc, object) {
    // Must be outside view
    let inView = (loc.x < view.middle.x - view.width / 2 || loc.x > view.middle.x + view.width / 2)
    inView = inView || (loc.y < view.middle.y - view.height / 2 || loc.y > view.middle.y + view.height / 2)

    // Legal terrain for the object
    const row = Math.floor(loc.y / constants.scale)
    const col = Math.floor(loc.x / constants.scale)
    let area = map.tiles[row][col] === null ? "sky" : map.tiles[row][col].area // null value means tree
    return inView && area === object.traits.area
  }

  // Choose random based on rarity
  const name = random.choose(species)
  const creature = new constructors[name]

  // Choose random location
  let loc = null
  do {
    let x = Math.floor(Math.random() * (map.size * constants.scale))
    let y = Math.floor(Math.random() * (map.size * constants.scale))
    loc = new Coord(x, y)
  } while (!isLegal(loc, creature)) // Check condition after initialising loc

  return new creature.constructor(loc) // Call constructor again with location
}

// Godmode function, called via console (A)
window.godMode = function () {
  animals[0].health = 1000
  animals[0].hunger = 100
  animals[0].traits.maxSpeed = 30,
  animals[0].traits.acceleration = 1
  animals[0].traits.attack = 1
  animals[0].traits.hunger = 0
}

//   ____ _
//  / ___| | __ _ ___ ___  ___  ___
// | |   | |/ _` / __/ __|/ _ \/ __|
// | |___| | (_| \__ \__ \  __/\__ \
//  \____|_|\__,_|___/___/\___||___/

// Coordinates / vectors (L)
class Coord {
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  // Several vector math methods
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

  // Rotate the vector
  rotate (dir) {
    if (dir === "right") {
      [this.x, this.y] = [this.y, -this.x]
    } else if (dir === "left") {
      [this.x, this.y] = [-this.y, this.x]
    }
  }

  // Change the length of the vector
  set magnitude (value) {
    let vector = this.normalized
    vector.multiply(value)
    this.x = vector.x
    this.y = vector.y
  }

  // Distance to another coordinate
  distance (coord) {
    let other = new Coord(coord.x, coord.y)
    other.subtract(this)
    return other
  }

  // Calculate the length of the vector
  get magnitude () {
    return Math.sqrt(this.x**2 + this.y**2)
  }
  // Return the angle in radians
  get angle () {
    return Math.atan2(this.y, this.x)
  }
  // Return the unit vector
  get normalized () {
    let mag = this.magnitude
    if (mag > 0) {
      let norm = new Coord(this.x, this.y)
      norm.divide(mag)
      return norm
    } else {
      return new Coord() // Vector of 0
    }
  }
}

// Multiple sprites from a given name (L)
class Sprites {
  constructor (name, moving, changing) {
    this.dirs = ["right", "down", "left", "up"]
    this.moving = moving // Moves in all directions
    this.changing = changing // Changes over time
    this.frame = 0 // Frame displayed
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
        callback(sprites)
      } else {
        sprites.push(result)
        this.getImages(path, i+1, sprites, callback) // Next image - recurse
      }
    })
  }
}

// Objects, main displaying functionality
class Entity {
  constructor (loc, sprites) {
    this.loc = loc
    this.sprites = sprites
    this.sheltered = false // Hidden by terrain
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

      this.sprites.middle = new Coord(
        this.loc.x + this.sprites.size.width / 2,
        this.loc.y + this.sprites.size.height / 2
      )

      // Location from absolute (map) to relative (view)
      let x = Math.floor(this.loc.x - (view.middle.x - view.width / 2))
      let y = Math.floor(this.loc.y - (view.middle.y - view.height / 2))

      // Only draw when in view (with edges) for smoother rendering (drawing is intensive)
      let edge = 64
      if (-edge < x && x < view.width + edge && -edge < y && y < view.height + edge) {
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
    if (this.health <= 0) { // RIP
      this.health = 0
      this.die()
    }
    this.hunger = this.hunger > 100 ? 100 : this.hunger // Can't be higher than 100

    if (this.hunger > 75) { // Regenerate health
      this.health += (this.traits.maxHealth / 100) / view.fps // 1% per second
    } else if (this.hunger <= 0) {
      this.hunger = 0
      this.health -= (5 * this.traits.maxHealth / 100) / view.fps // 5% per second
    }
  }

  // Display health (L)
  update () {
    super.update()

    const height = 10
    const width = 50
    // Health bar at the center above the animal
    let x = this.loc.x + (this.sprites.size.width / 2) - (width / 2)
    let y = this.loc.y - (height * 4)
    // Convert map coords to view coords
    x = Math.floor(x - (view.middle.x - view.width / 2))
    y = Math.floor(y - (view.middle.y - view.height / 2))

    const health = (this.health / this.traits.maxHealth)
    if (health < 1) {
      // Display bar
      view.screen.fillStyle = '#eeeeee' // Grey
      view.screen.fillRect(x, y, width, height)
      if (health > 0) {
        view.screen.fillStyle = '#f44336' // Red
        view.screen.fillRect(x, y, (width * health), height)
      }
    }

    if (this.hunger) {
      if (this.hunger < 75) { // Only display after certain threshold
        y += height // Below healthbar
        view.screen.fillStyle = '#eeeeee' // Grey
        view.screen.fillRect(x, y, width, height)
        if (this.hunger > 0) {
          view.screen.fillStyle = '#ff9800' // Orange
          view.screen.fillRect(x, y, (width * (this.hunger / 100)), height)
        }
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
    // Starting position first draw
    this.direction = "down"
    this.angle = 0.5 * Math.PI
    // Can change the max speed
    this.speedFactor = 1
    this.terrainFactor = 1
  }

  // Additional functionality for moving creatures (L)
  live () {
    this.move() // Moving, not just displaying
    super.live()
  }

  // Change position (L)
  move () {
    // Add acceleration to speed
    if (this.acceleration.magnitude >= 0) {
      const maxSpeed = this.traits.maxSpeed * this.speedFactor * this.terrainFactor
      // this.speed.multiply(0.75) // Friction, increases influence of acceleration (decreases bouncing)
      this.speed.add(this.acceleration)
      // Correct if over
      if (this.speed.magnitude > maxSpeed) {
        this.speed.magnitude = maxSpeed
      }
    }

    // Add speed to location
    if (this.speed.magnitude > 0) {
      // From px/frame to m/second
      const speed = new Coord(this.speed.x, this.speed.y)
      speed.divide(view.fps)
      speed.multiply(constants.scale)
      this.loc.add(speed)

      // Get direction
      const angle = (this.speed.angle + 2 * Math.PI) % (2 * Math.PI) // 0 to 2PI
      const index = Math.round(2 * (angle / Math.PI)) % 4 // values 0, 1, 2, 3
      this.angle = angle
      this.direction = this.sprites.dirs[index] // Direction as text
    }

    // Check if legal
    this.borders()

    // Collide with animal (A)
    for (let animal of animals) {
      if (animal !== this) {
        if (this.collide(animal)) {
          this.block(animal, false)
        }
      }
    }

    // Collide with terrain (A)
    for (let y = 0; y < map.size; y++) {
      for (let x = 0; x < map.size; x++) {
        let object = map.tiles[y][x]
        if (object !== null) {
          if (object.area === "sky" && this.traits.area !== "sky") { // Animal meets a tree
            // Bigger animals and water animals can't go through tree
            if (this.collide(object)) {
              if (this.traits.mass > 10 || this.traits.area === "water") {
                this.block(object, true)
              }
            }
          }
          if (object.area === "land" && this.traits.area === "water") { // Water-animal meets land
            if (this.collide(object)) {
              this.block(object, true)
            }
          }
        }
      }
    }

    // Update on screen
    this.update()
  }

  // Stop moving completely
  stop () {
    this.speed.magnitude = 0
    this.acceleration.magnitude = 0
  }

  // Blocked from moving further (A)
  block (object, complete) {
    if (this.speed.magnitude > 0) {
      // Get component going in the direction of the object
      let distance = new Coord(object.loc.x - this.loc.x, object.loc.y - this.loc.y)
      if (distance.magnitude > 0) {
        if (Math.abs(distance.angle - this.speed.angle) < Math.PI / 2) { // Same direction
          let inproduct = this.speed.x * distance.x + this.speed.y * distance.y
          inproduct /= distance.magnitude
          distance.magnitude = inproduct

          // Remove component
          if (complete) { // Full stop
            this.loc.subtract(distance) // Undo movement
          } else {
            this.speed.subtract(distance) // Stop moving here
          }
        }
      }
    }
  }

  // check if colliding with another object (L)
  collide (obj) {
    return ((this.loc.x <= obj.loc.x + obj.sprites.size.width &&
      this.loc.x >= obj.loc.x) || // Left x between other left and right x
    (this.loc.x + this.sprites.size.width <= obj.loc.x + obj.sprites.size.width &&
      this.loc.x + this.sprites.size.width >= obj.loc.x)) // Right x between other left and right x
      && // Both x and y
    ((this.loc.y <= obj.loc.y + obj.sprites.size.height &&
      this.loc.y >= obj.loc.y) || // Left y between other left and right y
    (this.loc.y + this.sprites.size.height <= obj.loc.y + obj.sprites.size.height &&
      this.loc.y + this.sprites.size.height >= obj.loc.y)) // Right y between other left and right y

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
      acceleration: 0.5,
      area: "land", // Slower in water
      maxHealth: 3, // Start health
      mass: 0.6,
      diet: "herbivore",
      camouflage: 0.6, // More difficult to see
      perception: 0.8,
      aggressiveness: 0.1,
      attack: 0.2, // Attack removes health
      hunger: 0.4, // Hunger per second
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
      acceleration: 0.8,
      area: "land",
      maxHealth: 10,
      mass: 60,
      diet: "carnivore",
      camouflage: 0.6,
      perception: 0.7,
      aggressiveness: 0.7,
      attack: 1.2,
      hunger: 0.8,
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
      maxSpeed: 10,
      acceleration: 0.7,
      area: "land",
      maxHealth: 8,
      mass: 50,
      diet: "herbivore",
      camouflage: 0.7,
      perception: 0.7,
      aggressiveness: 0.2,
      attack: 0.4,
      hunger: 0.6,
      name: name
    }
  }
}
class Sparrow extends Animal {
  constructor (loc) {
    let name = "Sparrow"
    super(loc, name)
    this.traits = {
      maxSpeed: 9,
      acceleration: 0.9,
      area: "sky",
      maxHealth: 2,
      mass: 0.5,
      diet: "herbivore",
      camouflage: 0.8,
      perception: 0.9,
      aggressiveness: 0.1,
      attack: 0.2,
      hunger: 0.2,
      name: name
    }
  }
}
class Bass extends Animal {
  constructor (loc) {
    let name = "Bass"
    super(loc, name)
    this.traits = {
      maxSpeed: 10,
      acceleration: 0.6,
      area: "water",
      maxHealth: 2,
      mass: 5.5,
      diet: "herbivore",
      camouflage: 0.7,
      perception: 0.3,
      aggressiveness: 0.1,
      attack: 0.1,
      hunger: 0.3,
      name: name
    }
  }
}
class Bear extends Animal {
  constructor (loc) {
    let name = "Bear"
    super(loc, name)
    this.traits = {
      maxSpeed: 6,
      acceleration: 0.5,
      area: "land",
      maxHealth: 20,
      mass: 200,
      diet: "carnivore",
      camouflage: 0.5,
      perception: 0.5,
      aggressiveness: 0.6,
      attack: 2,
      hunger: 1,
      name: name
    }
  }
}
class Badger extends Animal {
  constructor (loc) {
    let name = "Badger"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 4,
      acceleration: 0.2,
      area: "land",
      maxHealth: 28,
      mass: 8.6,
      diet: "herbivore",
      camouflage: 0.3,
      perception: 0.4,
      aggressiveness: 0.85,
      attack: 0.9,
      hunger: 0.8,
      name: name
    }
  }
}
class Panda extends Animal {
  constructor (loc) {
    let name = "Panda"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 4,
      acceleration: 0.5,
      area: "land",
      maxHealth: 16,
      mass: 100,
      diet: "herbivore",
      camouflage: 0.2,
      perception: 0.2,
      aggressiveness: 0.1,
      attack: 0.5,
      hunger: 1,
      name: name
    }
  }
}
class Lion extends Animal {
  constructor (loc) {
    let name = "Lion"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 12,
      acceleration: 0.8,
      area: "land",
      maxHealth: 10,
      mass: 150,
      diet: "carnivore",
      camouflage: 0.85,
      perception: 0.7,
      aggressiveness: 0.8,
      attack: 1.4,
      hunger: 0.7,
      name: name
    }
  }
}
class Tiger extends Animal {
  constructor (loc) {
    let name = "Tiger"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 11,
      acceleration: 0.9,
      area: "land",
      maxHealth: 10,
      mass: 200,
      diet: "carnivore",
      camouflage: 0.8,
      perception: 0.9,
      aggressiveness: 0.75,
      attack: 1.5,
      hunger: 0.7,
      name: name
    }
  }
}
class Duck extends Animal {
  constructor (loc) {
    let name = "Duck"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 9,
      acceleration: 0.4,
      area: "land",
      maxHealth: 5,
      mass: 2,
      diet: "herbivore",
      camouflage: 0.4,
      perception: 0.6,
      aggressiveness: 0.3,
      attack: 0.3,
      hunger: 0.4,
      name: name
    }
  }
}
class Crow extends Animal {
  constructor (loc) {
    let name = "Crow"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 12,
      acceleration: 0.6,
      area: "sky",
      maxHealth: 2,
      mass: 0.5,
      diet: "herbivore",
      camouflage: 0.3,
      perception: 0.7,
      aggressiveness: 0.2,
      attack: 0.2,
      hunger: 0.3,
      name: name
    }
  }
}
class Dove extends Animal {
  constructor (loc) {
    let name = "Dove"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 10,
      acceleration: 0.4,
      area: "sky",
      maxHealth: 1.5,
      mass: 0.9,
      diet: "herbivore",
      camouflage: 0.2,
      perception: 0.5,
      aggressiveness: 0.1,
      attack: 0.2,
      hunger: 0.2,
      name: name
    }
  }
}
class Bison extends Animal {
  constructor (loc) {
    let name = "Bison"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 7,
      acceleration: 0.2,
      area: "land",
      maxHealth: 25,
      mass: 1600,
      diet: "herbivore",
      camouflage: 0.3,
      perception: 0.6,
      aggressiveness: 0.6,
      attack: 0.7,
      hunger: 0.8,
      name: name
    }
  }
}
class Bull extends Animal {
  constructor (loc) {
    let name = "Bull"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 8,
      acceleration: 0.3,
      area: "land",
      maxHealth: 22,
      mass: 1100,
      diet: "herbivore",
      camouflage: 0.2,
      perception: 0.6,
      aggressiveness: 0.65,
      attack: 0.85,
      hunger: 0.75,
      name: name
    }
  }
}
class Bunny extends Animal {
  constructor (loc) {
    let name = "Bunny"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 11,
      acceleration: 0.6,
      area: "land",
      maxHealth: 4,
      mass: 0.8,
      diet: "herbivore",
      camouflage: 0.7,
      perception: 0.8,
      aggressiveness: 0.1,
      attack: 0.1,
      hunger: 0.4,
      name: name
    }
  }
}
class Butterfly extends Animal {
  constructor (loc) {
    let name = "Buterfly"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 5,
      acceleration: 0.6,
      area: "sky",
      maxHealth: 0.1,
      mass: 0.05,
      diet: "herbivore",
      camouflage: 0.2,
      perception: 0.4,
      aggressiveness: 0,
      attack: 0,
      hunger: 0.1,
      name: name
    }
  }
}
class Cat extends Animal {
  constructor (loc) {
    let name = "Cat"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 12,
      acceleration: 0.4,
      area: "land",
      maxHealth: 6,
      mass: 4.5,
      diet: "carnivore",
      camouflage: 0.7,
      perception: 0.8,
      aggressiveness: 0.4,
      attack: 0.5,
      hunger: 0.3,
      name: name
    }
  }
}
class Chicken extends Animal {
  constructor (loc) {
    let name = "Chicken"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 7,
      acceleration: 0.4,
      area: "land",
      maxHealth: 3,
      mass: 2,
      diet: "herbivore",
      camouflage: 0.2,
      perception: 0.3,
      aggressiveness: 0.2,
      attack: 0.3,
      hunger: 0.2,
      name: name
    }
  }
}
class Cobra extends Animal {
  constructor (loc) {
    let name = "Cobra"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 4,
      acceleration: 0.2,
      area: "land",
      maxHealth: 4,
      mass: 6,
      diet: "carnivore",
      camouflage: 0.7,
      perception: 0.4,
      aggressiveness: 0.6,
      attack: 2,
      hunger: 0.2,
      name: name
    }
  }
}
class Cheeta extends Animal {
  constructor (loc) {
    let name = "Cheeta"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 22,
      acceleration: 2,
      area: "land",
      maxHealth: 8,
      mass: 50,
      diet: "carnivore",
      camouflage: 0.7,
      perception: 0.6,
      aggressiveness: 0.5,
      attack: 0.6,
      hunger: 0.5,
      name: name
    }
  }
}
class Corgi extends Animal {
  constructor (loc) {
    let name = "Corgi"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 6,
      acceleration: 0.4,
      area: "land",
      maxHealth: 5,
      mass: 10,
      diet: "carnivore",
      camouflage: 0.2,
      perception: 0.3,
      aggressiveness: 0.4,
      attack: 0.3,
      hunger: 0.2,
      name: name
    }
  }
}
class Chinchilla extends Animal {
  constructor (loc) {
    let name = "Chinchilla"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 10,
      acceleration: 0.6,
      area: "land",
      maxHealth: 2,
      mass: 0.4,
      diet: "herbivore",
      camouflage: 0.6,
      perception: 0.4,
      aggressiveness: 0.1,
      attack: 0.1,
      hunger: 0.3,
      name: name
    }
  }
}
class Cow extends Animal {
  constructor (loc) {
    let name = "Cow"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 6,
      acceleration: 0.3,
      area: "land",
      maxHealth: 10,
      mass: 1100,
      diet: "herbivore",
      camouflage: 0.2,
      perception: 0.4,
      aggressiveness: 0.4,
      attack: 0.6,
      hunger: 0.8,
      name: name
    }
  }
}
class Crab extends Animal {
  constructor (loc) {
    let name = "Crab"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 5,
      acceleration: 0.4,
      area: "water",
      maxHealth: 3,
      mass: 1.1,
      diet: "herbivore",
      camouflage: 0.4,
      perception: 0.5,
      aggressiveness: 0.3,
      attack: 0.2,
      hunger: 0.4,
      name: name
    }
  }
}
class Crocodile extends Animal {
  constructor (loc) {
    let name = "Crocodile"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 8,
      acceleration: 0.8,
      area: "land",
      maxHealth: 15,
      mass: 500,
      diet: "carnivore",
      camouflage: 0.75,
      perception: 0.2,
      aggressiveness: 0.8,
      attack: 1.8,
      hunger: 0.5,
      name: name
    }
  }
}
class Goose extends Animal {
  constructor (loc) {
    let name = "Goose"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 10,
      acceleration: 0.6,
      area: "land",
      maxHealth: 7,
      mass: 6,
      diet: "herbivore",
      camouflage: 0.5,
      perception: 0.3,
      aggressiveness: 0.75,
      attack: 0.3,
      hunger: 0.7,
      name: name
    }
  }
}
class Fox extends Animal {
  constructor (loc) {
    let name = "Fox"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 12,
      acceleration: 0.5,
      area: "land",
      maxHealth: 6,
      mass: 10,
      diet: "carnivore",
      camouflage: 0.4,
      perception: 0.5,
      aggressiveness: 0.3,
      attack: 0.5,
      hunger: 0.2,
      name: name
    }
  }
}
class Frog extends Animal {
  constructor (loc) {
    let name = "Frog"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 6,
      acceleration: 0.4,
      area: "land",
      maxHealth: 2,
      mass: 0.2,
      diet: "herbivore",
      camouflage: 0.6,
      perception: 0.3,
      aggressiveness: 0.1,
      attack: 0.1,
      hunger: 0.2,
      name: name
    }
  }
}
class Goat extends Animal {
  constructor (loc) {
    let name = "Goat"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 6,
      acceleration: 0.4,
      area: "land",
      maxHealth: 4,
      mass: 100,
      diet: "herbivore",
      camouflage: 0.4,
      perception: 0.5,
      aggressiveness: 0.3,
      attack: 0.6,
      hunger: 0.3,
      name: name
    }
  }
}
class Pig extends Animal {
  constructor (loc) {
    let name = "Pig"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 8,
      acceleration: 0.3,
      area: "land",
      maxHealth: 8,
      mass: 100,
      diet: "herbivore",
      camouflage: 0.2,
      perception: 0.2,
      aggressiveness: 0.4,
      attack: 0.6,
      hunger: 0.8,
      name: name
    }
  }
}
class Dog extends Animal {
  constructor (loc) {
    let name = "Dog"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 11,
      acceleration: 0.7,
      area: "land",
      maxHealth: 6,
      mass: 22,
      diet: "carnivore",
      camouflage: 0.5,
      perception: 0.8,
      aggressiveness: 0.4,
      attack: 0.8,
      hunger: 0.4,
      name: name
    }
  }
}
class Sheep extends Animal {
  constructor (loc) {
    let name = "Sheep"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 6,
      acceleration: 0.4,
      area: "land",
      maxHealth: 4,
      mass: 160,
      diet: "herbivore",
      camouflage: 0.2,
      perception: 0.2,
      aggressiveness: 0.1,
      attack: 0.4,
      hunger: 0.3,
      name: name
    }
  }
}
class Raccoon extends Animal {
  constructor (loc) {
    let name = "Raccoon"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 9,
      acceleration: 0.5,
      area: "land",
      maxHealth: 4,
      mass: 9,
      diet: "herbivore",
      camouflage: 0.6,
      perception: 0.8,
      aggressiveness: 0.3,
      attack: 0.4,
      hunger: 0.7,
      name: name
    }
  }
}
class Ferret extends Animal {
  constructor (loc) {
    let name = "Ferret"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 8,
      acceleration: 0.7,
      area: "land",
      maxHealth: 2,
      mass: 2,
      diet: "herbivore",
      camouflage: 0.6,
      perception: 0.6,
      aggressiveness: 0.3,
      attack: 0.2,
      hunger: 0.4,
      name: name
    }
  }
}
class Salmon extends Animal {
  constructor (loc) {
    let name = "Salmon"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 8,
      acceleration: 0.3,
      area: "water",
      maxHealth: 3,
      mass: 20,
      diet: "herbivore",
      camouflage: 0.2,
      perception: 0.5,
      aggressiveness: 0.1,
      attack: 0.1,
      hunger: 0.4,
      name: name
    }
  }
}
class Owl extends Animal {
  constructor (loc) {
    let name = "Owl"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 7,
      acceleration: 0.8,
      area: "sky",
      maxHealth: 4,
      mass: 0.6,
      diet: "carnivore",
      camouflage: 0.8,
      perception: 0.9,
      aggressiveness: 0.3,
      attack: 0.7,
      hunger: 0.3,
      name: name
    }
  }
}
class Shark extends Animal {
  constructor (loc) {
    let name = "Shark"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 12,
      acceleration: 0.8,
      area: "water",
      maxHealth: 20,
      mass: 1100,
      diet: "carnivore",
      camouflage: 0.6,
      perception: 0.8,
      aggressiveness: 0.8,
      attack: 1.5,
      hunger: 1,
      name: name
    }
  }
}
class Hippo extends Animal {
  constructor (loc) {
    let name = "Hippo"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 4,
      acceleration: 0.6,
      area: "land",
      maxHealth: 30,
      mass: 1800,
      diet: "herbivore",
      camouflage: 0.3,
      perception: 0.4,
      aggressiveness: 0.9,
      attack: 1.4,
      hunger: 2,
      name: name
    }
  }
}
class Turtle extends Animal {
  constructor (loc) {
    let name = "Turtle"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 2,
      acceleration: 0.4,
      area: "land",
      maxHealth: 30,
      mass: 0.7,
      diet: "herbivore",
      camouflage: 0.6,
      perception: 0.2,
      aggressiveness: 0.1,
      attack: 0.1,
      hunger: 0.1,
      name: name
    }
  }
}
class Mole extends Animal {
  constructor (loc) {
    let name = "Mole"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 4,
      acceleration: 0.6,
      area: "land",
      maxHealth: 3,
      mass: 0.09,
      diet: "herbivore",
      camouflage: 0.5,
      perception: 0.1,
      aggressiveness: 0.1,
      attack: 0.2,
      hunger: 0.3,
      name: name
    }
  }
}
class Monkey extends Animal {
  constructor (loc) {
    let name = "Monkey"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 10,
      acceleration: 0.5,
      area: "land",
      maxHealth: 4,
      mass: 10,
      diet: "herbivore",
      camouflage: 0.5,
      perception: 0.8,
      aggressiveness: 0.2,
      attack: 0.7,
      hunger: 0.4,
      name: name
    }
  }
}
class Mouse extends Animal {
  constructor (loc) {
    let name = "Mouse"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 12,
      acceleration: 0.4,
      area: "land",
      maxHealth: 2,
      mass: 0.02,
      diet: "herbivore",
      camouflage: 0.5,
      perception: 0.5,
      aggressiveness: 0.1,
      attack: 0.3,
      hunger: 0.4,
      name: name
    }
  }
}
class Horse extends Animal {
  constructor (loc) {
    let name = "Horse"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 14,
      acceleration: 1,
      area: "land",
      maxHealth: 7,
      mass: 1000,
      diet: "herbivore",
      camouflage: 0.4,
      perception: 0.5,
      aggressiveness: 0.2,
      attack: 0.8,
      hunger: 0.5,
      name: name
    }
  }
}
class Ostrich extends Animal {
  constructor (loc) {
    let name = "Ostrich"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 11,
      acceleration: 0.5,
      area: "land",
      maxHealth: 10,
      mass: 120,
      diet: "herbivore",
      camouflage: 0.5,
      perception: 0.4,
      aggressiveness: 0.6,
      attack: 1,
      hunger: 0.5,
      name: name
    }
  }
}
class Seagull extends Animal {
  constructor (loc) {
    let name = "Seagull"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 10,
      acceleration: 0.5,
      area: "sky",
      maxHealth: 2,
      mass: 1.5,
      diet: "herbivore",
      camouflage: 0.3,
      perception: 0.7,
      aggressiveness: 0.3,
      attack: 0.25,
      hunger: 0.6,
      name: name
    }
  }
}
class Carp extends Animal {
  constructor (loc) {
    let name = "Carp"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 8,
      acceleration: 0.4,
      area: "water",
      maxHealth: 4,
      mass: 14,
      diet: "herbivore",
      camouflage: 0.6,
      perception: 0.3,
      aggressiveness: 0.1,
      attack: 0.1,
      hunger: 0.3,
      name: name
    }
  }
}
class Snake extends Animal {
  constructor (loc) {
    let name = "Snake"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 4,
      acceleration: 0.2,
      area: "land",
      maxHealth: 2,
      mass: 0.8,
      diet: "carnivore",
      camouflage: 0.9,
      perception: 0.3,
      aggressiveness: 0.4,
      attack: 1,
      hunger: 0.3,
      name: name
    }
  }
}
class Lizard extends Animal {
  constructor (loc) {
    let name = "Lizard"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 8,
      acceleration: 0.4,
      area: "land",
      maxHealth: 2,
      mass: 0.5,
      diet: "herbivore",
      camouflage: 0.8,
      perception: 0.3,
      aggressiveness: 0.1,
      attack: 0.2,
      hunger: 0.2,
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
    // The plant's traits in SI units (A)
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
    // The plant's traits in SI units (L)
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
    // The plant's traits in SI units (L)
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
    // The plant's traits in SI units (L)
    this.traits = {
      nutrition: 0.1,
      area: "water",
      maxHealth: 0.5
    }
    this.health = this.traits.maxHealth
  }
}
class Bush extends Plant {
  constructor (loc) {
    let name = "Bush"
    super(loc, name)
    // The plant's traits in SI units (L)
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
    super(loc, new Sprites(name, false, true))
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
    this.background = null // Stores tiles beneath it
  }
}


// Functionality for NPC and PC
class Creature extends Obj {
  constructor (animal) {
    super(animal.loc, animal.sprites)
    this.target = null // Target when hunting
    this.hunter = null // Is hunting you
    this.hitted = false // Just hit you
    this.traits = animal.traits
    this.health = this.traits.maxHealth
    this.hunger = 100 // Percentage, the same value for every animal
  }

  // Animal gets hungry (L)
  live () {
    this.hunger -= (this.traits.hunger / view.fps) // Remove per second
    super.live()
  }

  // Animal dies (L)
  die () {
    for (let i = 0; i < animals.length; i++) {
      if (animals[i] === this) {
        animals.splice(i, 1)
      }
    }
  }

  // Terrain modifies maximum speed (L)
  move () {
    // Current tile
    let x = Math.floor(this.loc.x / constants.scale)
    let y = Math.floor(this.loc.y / constants.scale)
    // Fix illegal positions
    x = x < map.size ? x : map.size - 1
    x = x > 0 ? x : 0
    y = y < map.size ? y : map.size - 1
    y = y > 0 ? y : 0
    let terrain = map.tiles[y][x]
    // Current area
    let area = (terrain === null || terrain === undefined) ? "sky" : terrain.area // Null value is a tree

    // Terrain influences speed
    if (this.traits.area === "land") {
      if (area === "water") {
        this.terrainFactor = 0.65
      } else if (area === "sky") { // Beneath tree
        this.terrainFactor = 0.8
      } else {
        this.terrainFactor = 1
      }
    }
    super.move()
  }

  // Sucesfull hit on another object or animal (L)
  hit (object) {
    // Can't hit for a cooldown period
    this.cooldown = true
    window.setTimeout((self) => {
      self.cooldown = false
    }, 400, this)

    object.health -= this.traits.attack
    object.hitted = true

    // TODO implement eating mode to replace next lines
    if (object.traits.nutrition) { // Plant
      this.hunger += object.traits.nutrition * 20
    } else { // Animal
      this.hunger += object.traits.mass * this.traits.attack * 10
    }
  }

  // Attack another animal or plant (L)
  attack (object) {
    if (!this.cooldown) { // Wait until attack again
      if (object && object !== this) { // Not self and object exists
        if (this.sprites.middle && object.sprites.middle) {
          // Distance to object
          let distance = this.sprites.middle.distance(object.sprites.middle)
          if (distance.magnitude <= (constants.scale * 2.5)) { // Minimaly x meter range for attack
            this.hit(object)
            return true // Hit sucessful
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
    this.moving = false // Move key being pressed
    this.attacking = false // Attack key begin pressed
    this.speedFactor = 0.65 // Starts at slow walking pace
    this.targeting = null // Currently targeting animal
    this.spirits = [animal.name.toLowerCase()] // Animals to change into
  }

  // Game over
  die () {
    // TODO add styled screen
    if (!this.notification) {
      let alive = Math.round(((new Date()) - settings.startTime) / 1000)
      alert(`
        You were killed as a(n) ${this.traits.name}.
        You were alive for ${Math.floor(alive / 60)} minutes and ${alive % 60} seconds.
        Game will automatically restart.
        `
      )
      this.notification = true
      location.reload()
    }
  }


  // PC hit animal (L)
  hit (object) {
    super.hit(object)
    if (object.health < 0 && !object.traits.nutrition) { // Just killed an animal
      let name = object.traits.name.toLowerCase()
      if (!this.spirits.includes(name)) { // Not killed before
        this.spirits.push(name)
      }

      // TODO make option menu for this
      let change = new map.animalConstructors[name]
      change = new change.constructor(this.loc) // Call the animal constructor with location
      animals[animals.indexOf(this)] = new this.constructor(change) // Replace with new version of self
    }
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
        this.attackButton(action)
        break
      case 16: // Shift
        if (action) {
          this.speedFactor = 1 // Sprint
        } else if (!action) {
          this.speedFactor = 0.65 // Walk
        }
        break
    }

    if (movement) {
      movement.magnitude = this.traits.acceleration
      if (action) { // Press key
        if (this.moving) {
          this.acceleration.add(movement)
          this.acceleration.magnitude = this.traits.acceleration
        } else {
          this.acceleration = movement
          this.moving = true
        }
      } else { // Release key
        if (this.moving) {
          this.stop()
          this.moving = false
        }
      }
      this.acceleration.magnitude = this.traits.acceleration
    }
  }

  // Player tries to attack NPC's will respond (L)
  attackButton (action) {
    if (action) { // Key pressed
      if (!this.attacking) { // Have to release and press again
        this.attacking = true
        for (let animal of animals) {
          if (this.attack(animal)) { // Hit
            if (!this.targeting) { // Not hunting an animal
              this.target = animal
              // Remove as target after some time (NPC will forget being hunted)
              this.targeting = window.setInterval(() => {
                let distance = this.sprites.middle.distance(this.target.sprites.middle)
                // Check if still in range
                let range = animal.sightRadius * (1 - this.traits.camouflage)
                if (distance.magnitude >= range) {
                  clearInterval(this.targeting)
                  this.targeting = null
                  this.target = null
                }
              }, 500)
            } else { // Is hunting animal
              if (animal !== this.target) { // Attack different animal
                this.target = animal
                window.clearInterval(this.targeting)
              }
            }
            return // Attack one at the time
          }
         }
        for (let plant of plants) {
          if (this.attack(plant)) { // Hit
            return // Attack one at the time
          }
        }
      }
    } else { // already on
      this.attacking = false
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
    this.state = "stop" // Start state
    this.currentBehaviour = "wandering" // Startbevaviour
    this.previousBehaviour = null
    this.step = 0
    this.speedFactor = 0.65 // Not at max speed
    // Sight based on perception trait, from 1 to x m
    const x = 70
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

  // Store previous when setting the behaviour (L)
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

  // Additional functionality for live, determines NPC behaviour (L)
  live () {
    if (this.behaviour === "wandering") {
      this.look() // Look around, can change behaviour
      this.wander()
    } else if (this.behaviour === "hunting") {
      this.hunt()
    } else if (this.behaviour === "fleeing" || this.behaviour === "defending") {
      this.look() // Look around, can change behaviour
      this.fightFlight()
    } else if (this.behaviour === "eating") {
      // TODO implement eat
    } else if (this.behaviour === "hiding") {
      // TODO implement hide
    }

    // TODO implement obstacle avoidance

    super.live()
  }

  // Wandering behaviour (L)
  wander () {
    this.speedFactor = 0.65 // Not at max speed
    this.step += 1
    if (this.step >= 3 * view.fps) { // Reduces the number of decisions in direction (x per second)
      this.chooseDirection()
      this.step = 0
    }
  }

  // Hunts another creature (L)
  hunt () {
    // If exists
    if (this.target && (animals.includes(this.target) || plants.includes(this.target)) && this.target.health > 0) {
      let distance = this.sprites.middle.distance(this.target.sprites.middle)

      // Check if still in range
      let range = this.sightRadius * (1 - this.target.traits.camouflage)
      if (distance.magnitude >= range) { // Lost target
        this.behaviour = "wandering"
        this.target = null
        this.hitted = false
        this.chooseDirection()
      }

      // Follow prey
      if (Math.abs(distance.angle - this.speed.angle) < Math.PI / 3) { // Roughly the same direction
        if (this.target && distance.magnitude > 2 * constants.scale) { // Prevents animal shaking on contact
          // Use component going in the direction of the animal
          let inproduct = this.speed.x * distance.x + this.speed.y * distance.y
          distance.magnitude = inproduct
          this.speed.add(distance) // Move toward
        } else {
          this.speed.magnitude = 0
        }
      } else {
        // Start moving
        this.stop()
        distance.magnitude = this.traits.acceleration
        this.acceleration = distance
      }
      // Try to attack
      this.attack(this.target)
    } else { // Lost target
      this.behaviour = "wandering"
      this.target = null
      this.hitted = false
      this.chooseDirection()
    }
  }

  // Fight or flight response (L)
  fightFlight () {
    // If exists
    if (this.hunter.target === this && animals.includes(this.hunter) && this.hunter.health > 0) {
      let distance = this.sprites.middle.distance(this.hunter.sprites.middle)

      // Check if still close
      let range = this.sightRadius * (1 - this.hunter.traits.camouflage)
      if (distance.magnitude >= range) { // Lost hunter
        this.behaviour = "wandering"
        this.hunter = null
        this.hitted = false
        this.chooseDirection()
      }

      // Self defense based on agression
      if (this.hitted) { // Got hit
        let odds = {
          "true": this.traits.aggressiveness,
          "false": 1 - this.traits.aggressiveness
        }
        if (random.choose(odds) === "true") { // Defend
          this.speedFactor = 1
          this.behaviour = "hunting"
          this.target = this.hunter
          return // Don't run
        } else { // Keep running
          this.hitted = false
        }
      }

      // Go in the reverse direction
      distance.rotate("right")
      distance.rotate("right")
      if (this.speed.magnitude > 0) {
        distance.magnitude = this.speed.magnitude
        this.speed.add(distance) // Move away
        this.speedFactor = 1
      } else {
        distance.magnitude = this.traits.acceleration
        this.acceleration = distance
      }
    } else { // Lost hunter
      this.behaviour = "wandering"
      this.hunter = null
      this.hitted = false
      this.chooseDirection()
    }
  }

  // Respond to another animal (L)
  found (animal) {
    let odds = {
      "true": this.traits.aggressiveness,
      "false": 1 - this.traits.aggressiveness
    }

    if (animal.target === this) { // NPC is being hunted
      // Will run or fight back based on agression
      if (random.choose(odds) === "true") {
        this.behaviour = "fleeing"
        this.hunter = animal
      } else {
        this.behaviour = "defending"
        this.hunter = animal
      }
      return true// No other actions
    }

    if (this.traits.name !== animal.traits.name) { // No canibalism
      if (this.traits.diet === "carnivore") { // Can attack first
        if (this.hunger < 75) { // Is hungry enough
          // Will attack odd based on agression
          if (random.choose(odds) === "true") {
            // Hunt the animal
            this.behaviour = "hunting"
            this.speedFactor = 1
            this.target = animal
          }
        }
      }

      if (animal.traits.diet === "carnivore") { // spots a meat eater
        // Will run odd based on agression
        if (random.choose(odds) === "true") {
          this.behaviour = "fleeing"
          this.hunter = animal
        }
      }
    }
  }

  // Check if predators or prey close / look for plants (L)
  look () {
    for (let animal of animals) {
      if (animal !== this) { // Not self
        if (this.sprites.middle && animal.sprites.middle) { // Exist
          let distance = this.sprites.middle.distance(animal.sprites.middle)
          // Animal is within sight radius, depends on camouflage trait
          let range = this.sightRadius * (1 - animal.traits.camouflage)
          if (distance.magnitude <= range) {
            if (this.found(animal)) { // React to different kinds of animals
              return // No other actions if being hunted
            }
          }
        }
      }
    }

    // Herbivores look at plants when hungry
    if (this.traits.diet === "herbivore" && this.hunger < 75) {
      const close = []
      const distances = []
      for (let plant of plants) {
        if (this.sprites.middle && plant.sprites.middle) { // Exist
          if (!(this.traits.area === "water" && plant.traits.area !== "water")) { // Water animals can't eat land plants
            let distance = this.sprites.middle.distance(plant.sprites.middle)
            if (distance.magnitude <= this.sightRadius / 10) { // In close view
              close.push(plant)
              distances.push(distance.magnitude)
            }
          }
        }
      }
      // React to closest
      if (close.length > 0) {
        const min = Math.min(...distances)
        const plant = close[distances.indexOf(min)] // Closest plant
        this.target = plant
        this.behaviour = "hunting"
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

//  _____                 _
// | ____|_   _____ _ __ | |_ ___
// |  _| \ \ / / _ \ '_ \| __/ __|
// | |___ \ V /  __/ | | | |_\__ \
// |_____| \_/ \___|_| |_|\__|___/

// Main drawing function
view.refresh = window.setInterval(() => {
 if (settings.started) {
   // Draw the map (L)
   for (let y = 0; y < map.size; y++) {
     for (let x = 0; x < map.size; x++) {
       let object = map.tiles[y][x]
       if (object) {
         // Trees have a background
         if (object.type === "tree") {
           for (let tile of object.background) {
             tile.update()
           }
         } else {
           object.update()
         }
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
   // Draw trees over other objects.
   for (let y = 0; y < map.size; y++) {
     for (let x = 0; x < map.size; x++) {
       let object = map.tiles[y][x]
       if (object) {
         if (object.type === "tree") {
           object.update()
         }
       }
     }
   }

   // Spawn new creatures when below the max
   map.spawn()
 }
}, Math.ceil(1000 / view.fps)) // Executes a certain amount of times per second

// Resize window
window.onresize = function (event) {
  view.sizes()
}

// Setup keyboard controls
document.addEventListener('keydown', (event) => {
  if (animals[0]) {
    animals[0].control(event.keyCode, true)
  }
})

document.addEventListener('keyup', () => {
  if (animals[0]) {
    animals[0].control(event.keyCode, false) // Stop signal
  }
})

// Everything loaded
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    // Start game (A)
    doc.startButton.addEventListener("click", function () {
      // Screen sizes
      view.sizes()
      // View.middle reference passed so when the player location is updated the player view is as well
      animals[0] =  new Player(new Squirrel(view.middle))
      // Generate map and initial animals/plants
      map.generate()
      map.spawn()
      // Start game
      settings.started = true
      settings.startTime = new Date()
      doc.startScreen.style.display = "none" // Hide
    })
  }
}

})() // Enclosed
