//       _          _                 _   _  ___                 _
//      / \   _ __ (_)_ __ ___   __ _| | | |/ (_)_ __   __ _  __| | ___  _ __ ___
//     / _ \ | '_ \| | '_ ` _ \ / _` | | | ' /| | '_ \ / _` |/ _` |/ _ \| '_ ` _ \
//    / ___ \| | | | | | | | | | (_| | | | . \| | | | | (_| | (_| | (_) | | | | | |
//   /_/   \_\_| |_|_|_| |_| |_|\__,_|_| |_|\_\_|_| |_|\__, |\__,_|\___/|_| |_| |_|
//                                                     |___/
// A game by Anne du Croo de Jongh and Lucas van Osenbruggen
// Code blocks are attributed to the author using (A) and (L) respectively.


'use strict' // Js strict mode

// __     __         _       _     _
// \ \   / /_ _ _ __(_) __ _| |__ | | ___  ___
//  \ \ / / _` | '__| |/ _` | '_ \| |/ _ \/ __|
//   \ V / (_| | |  | | (_| | |_) | |  __/\__ \
//    \_/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/

// Changing values related to setup, are stored between sessions (L)
const settings = {
  get started () {
    let value = store.get("started")
    return value !== null ? value : false // Default
  },
  set started (value) {
    store.set("started", value)
  },
  run: false, // Sequence of true in control flow: started/interacted, run, loaded
  loaded: false,
  interacted: false,
  _menu: false,
  _intervals: {},
  _overview: false,
  get overview () {
    return this._overview
  },
  set overview (value) {
    this._overview = value
    if (value) {
      doc.overview.style.display = 'initial'
      settings.paused = true
      this._click = document.addEventListener('mousedown', (event) => {
        let elements = event.target !== doc.gridOverview && event.target !== doc.showOverview && event.target !== doc.showOverview.children[0]
        if (elements && settings.overview) {
          settings.overview = false
          document.removeEventListener('click', settings._click)
        }
      })
    } else {
      doc.overview.style.display = 'none'
      settings.paused = false
    }
  },
  get menu () {
    return this._menu
  },
  set menu (value) {
    this._menu = value
    if (value) {
      doc.menuItems.style.height = "auto"
    } else {
      doc.menuItems.style.height = 0
    }
  },
  get startTime () {
    return store.get("startTime")
  },
  set startTime (value) {
    store.set("startTime", value)
  },
  get facts () {
    return store.get("facts")
  },
  set facts (value) {
    store.set("facts", value)
    if (value) {
      doc.facts.children[0].style.display = "none"
      doc.facts.children[1].style.display = "block"
      doc.info.style.display = 'none'
    } else {
      doc.facts.children[0].style.display = "block"
      doc.facts.children[1].style.display = "none"
      doc.info.style.display = 'initial'
    }
  },
  get paused () {
    return store.get("paused")
  },
  set paused (value) {
    this.backup()
    store.set("paused", value)
    if (value) {
      settings.run = false
      doc.pause.children[0].style.display = "none"
      doc.pause.children[1].style.display = "block"
    } else {
      settings.run = true
      doc.pause.children[0].style.display = "block"
      doc.pause.children[1].style.display = "none"
    }
  },
  get music () {
    return store.get("music")
  },
  set music (value) {
    // Sound control
    if (value) {
      if (settings.interacted) {
        clearTimeout(settings._wait)
        doc.sound.play()
        doc.sound.currentTime = store.get("musicTime")
        doc.music.children[0].style.display = "block"
        doc.music.children[1].style.display = "none"
      } else { // Try again
        settings._wait = window.setTimeout((value) => {
          settings.music = value
        }, 100, value)
        return
      }
    } else {
      doc.sound.pause()
      doc.music.children[0].style.display = "none"
      doc.music.children[1].style.display = "block"
    }
    store.set("music", value)
  },
}

// Related to document, for example html elements
const doc = {
  canvas: document.getElementById('canvas'),
  startScreen: document.getElementById("begin"),
  startButton: document.getElementById("start"),
  sound: document.getElementById("soundtrack"),
  loading: document.getElementById("loading"),
  menu: document.querySelector("button[name=menu]"),
  music: document.querySelector("button[name=music]"),
  delete: document.querySelector("button[name=delete]"),
  pause: document.querySelector("button[name=pause]"),
  facts: document.querySelector("button[name=facts]"),
  menuItems: document.querySelector("#menu .items"),
  overview: document.querySelector("#overview .animals"),
  gridOverview: document.querySelector("#overview .animals div"),
  showOverview: document.querySelector("button[name=overview]"),
  infoCard: document.querySelector("#info .card"),
  info: document.querySelector("#info"),
}

// Related to the view and drawing
const view = {
  width: null,
  height: null,
  middle: null,
  now: Date.now(),
  prev: Date.now(),
  screen: doc.canvas.getContext('2d', {alpha: false}),
  fps: 25, // Frames per second
  frameTime: null,
  scale: 32, // pixels in one meter
  sprites: {} // Store sprite references
}

// The entire map
const map = {
  size: 400, // Meters wide and heigh
  populationDensity: 750, // 1 animal per x square meters
  growthDensity: 200, // 1 plant per x square meters
  width: null,
  height: null,
  textures: null,
  tiles: null,
}

// Store all instances
let animals = []
let plants = []


//  _____                 _   _
// |  ___|   _ _ __   ___| |_(_) ___  _ __  ___
// | |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
// |  _|| |_| | | | | (__| |_| | (_) | | | \__ \
// |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/

// Functions for storing data in localStorage (L)
const store = {
  get: function (name) {
    const string = localStorage.getItem(name)
    try {
      return JSON.parse(string)
    } catch (e) { // Won't work if the data is a string
      return string
    }
  },
  set: function (name, value) {
    try {
      const string = JSON.stringify(value)
      localStorage.setItem(name, string)
    } catch (e) {

    }
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
  map.width = map.height = (map.size * view.scale)
  if (view.middle === null) {
    view.middle = new Coord(map.width, map.height)
    view.middle.divide(2)
  } else {

  }
}

// Location from absolute (map) to relative (view) (L)
view.relative = function (loc) {
  const x = Math.floor(loc.x - (view.middle.x - view.width / 2))
  const y = Math.floor(loc.y - (view.middle.y - view.height / 2))
  return new Coord(x, y)
}

// Check if location in view, with edges included (L)
view.inside = function (loc, edge) {
  const pos = view.relative(loc)
  return (-edge < pos.x && pos.x < view.width + edge && -edge < pos.y && pos.y < view.height + edge)
}

// Generate the map (L)
map.generate = function () {
  map.textures = {
    'g': new Grass(),
    'w': new Water(),
    't': new Tree()
  }

  if (store.get("tiles")) {
    map.tiles = store.get("tiles")
  } else {
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

    store.set("tiles", map.tiles)
  }
}

// Add a random texture to the map (L)
map.add = function (loc) {
  const place = new Coord(loc.x, loc.y)
  place.multiply(view.scale) // Index to map coordinates

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
      const nearby = near.filter((x) => x === 'w') // Number of nearby
      const factor = 60 // Increase odd of water spawning
      options["water"] += options["water"] * (nearby.length * factor)
    }
    options["grass"] = 1 - (options["tree"] + options["water"]) // Default

    const type = random.choose(options) // Choose random texture from options

    // Add texture to map
    switch (type) {
      case "grass":
        map.tiles[loc.y][loc.x] = 'g'
        break
      case "water":
        map.tiles[loc.y][loc.x] = 'w'
        break
      case "tree":
        // Not at edge or too close to another tree
        if ((loc.y + 1) < map.size && (loc.x + 1) < map.size &&
            map.tiles[loc.y + 1][loc.x] !== null &&
            map.tiles[loc.y][loc.x + 1] !== null &&
            map.tiles[loc.y + 1][loc.x + 1] !== null) {

          // Clear other spots because a tree is 4 tiles big
          map.tiles[loc.y][loc.x] = 't'
          map.tiles[loc.y + 1][loc.x] = null
          map.tiles[loc.y][loc.x + 1] = null
          map.tiles[loc.y + 1][loc.x + 1] = null
        } else { // At the edge
          map.add(loc)
        }
        break
    }
  }
}

// Animal and plants spawn on the map (L)
map.spawn = function () {
  // Relative rarity of different animals (smaller animals more common, carnivores rarer)
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
    "seagull": 0.2,
    "carp": 0.35,
    "snake": 0.2,
    "lizard": 0.4,
    "beaver": 0.3,
    "boar": 0.25,
    "pinguin": 0.1
  }

  // Add animals
  while (animals.length < (map.size**2) / map.populationDensity) { // Based on map size
    animals.push(new NPC(map.create(animalSpecies, map.animalConstructors, false)))
  }

  // Relative rarity of different plants
  const plantSpecies = {
    "botelus": 0.1,
    "maple": 0.2,
    "berry": 0.2,
    "seaweed": 0.8,
    "cactus": 0.05,
    "tulip": 0.1,
    "clematis": 0.1,
    "daisy": 0.1,
    "geranium": 0.1,
    "lavender": 0.1,
    "daffodil": 0.1,
    "vine": 0.15,
    "perennial": 0.2,
    "sapling": 0.35,
    "rice": 0.3,
    "magnolia": 0.3,
    "reed": 0.6,
    "setaria": 0.2,
    "lily": 0.3,
    "agaric": 0.15,
    "fern": 0.4,
  }

  // Add plants
  while (plants.length < (map.size**2) / map.growthDensity) {
    plants.push(map.create(plantSpecies, map.plantConstructors, true))
  }
}

// Create a random new animal or plant (L)
map.create = function (species, constructors, inScreen) {
  // Check if position is legal
  const isLegal = function (loc, object) {
    // Must be outside view
    let inView = !view.inside(loc, 0)

    // Legal terrain for the object
    const row = Math.floor(loc.y / view.scale)
    const col = Math.floor(loc.x / view.scale)
    let area = map.tiles[row][col] === null ? "sky" : map.textures[map.tiles[row][col]].area // null value means tree
    return (inView || inScreen) && area === object.traits.area
  }

  // Choose random based on rarity
  const name = random.choose(species)
  const creature = new constructors[name]

  // Choose random location
  let loc = null
  do {
    let x = Math.floor(Math.random() * (map.size * view.scale))
    let y = Math.floor(Math.random() * (map.size * view.scale))
    loc = new Coord(x, y)
  } while (!isLegal(loc, creature)) // Check condition after initialising loc

  return new creature.constructor(loc) // Call constructor again with location
}

// Gets Animals and plants from storage (L)
map.getCreatures = function () {
  // Creates NPC from properties
  const recreate = function (object, instance, name) {
    for (let property in object) {
      if (["acceleration", "speed", "loc", "middle"].indexOf(property) !== -1) { // Coord objects
        let pos = object[property]
        instance[property] = new Coord(pos.x, pos.y)
      } else if (property === "sprites") { // Sprites object
        let spr = object[property]
        instance[property] = new Sprites(name, spr.moving, spr.changing)
      } else if (property !== "cooldown") {
        instance[property] = object[property]
      }
    }
    return instance
  }

  let value = store.get("animals")
  if (value !== null || value.length === 0) {
    for (let object of value) {
      // Reconstruct from saved data
      let name = object.traits.name.toLowerCase()
      let instance = new map.animalConstructors[name]
      let creature = object.identity === "PC" ? new Player(instance) : new NPC(instance)
      animals.push(recreate(object, creature, object.traits.name, name))
      if (object.identity === "PC") {
        view.middle = animals[animals.length - 1].loc // Update reference
      }
    }
  }
  value = store.get("plants")
  if (value !== null || value.length === 0) {
    for (let object of value) {
      // Reconstruct from saved data
      let name = object.name.toLowerCase()
      let instance = new map.plantConstructors[name]
      plants.push(recreate(object, instance, name))
    }
  }
}

// Godmode function, called via console (A)
window.godMode = function () {
  animals[0].health = 100
  animals[0].traits.maxHealth = 100
  animals[0].hunger = 100
  animals[0].traits.hunger = 0
  animals[0].traits.maxSpeed = 30
  animals[0].traits.acceleration = 1
  animals[0].traits.attack = 1
}

settings.displayAnimals = function () {
  doc.gridOverview.innerHTML = ''
  for (let animal of animals[0].spirits) {
    let button = document.createElement('button')
    button.name = animal
    button.onclick = () => {
      animals[0].transform(button.name)
      settings.overview = false
    }
    let spr = new Sprites(animal.toLowerCase(), true, false)
    // Wait until loaded
    settings._intervals[animal] = setInterval((spr, name) => {
      if (spr.loaded) {
        button.appendChild(spr["down"][0])
        let text = document.createElement("span")
        text.textContent = name
        button.appendChild(text)
        doc.gridOverview.appendChild(button)
        clearInterval(settings._intervals[name])
        delete settings._intervals[name]
      }
    }, 100, spr, animal)
  }
}

settings.closeCard = function () {
  let cards = document.querySelectorAll("#info .card")
  let card = cards[cards.length - 1]
  card.remove()
}

settings.addCard = function (text) {
  let card = doc.infoCard.cloneNode(true)
  card.children[1].innerHTML = text
  card.style.display = 'inital'
  doc.info.appendChild(card)
}

settings.backup = function () {
  store.set("animals", animals)
  store.set("plants", plants)
  store.set("musicTime", doc.sound.currentTime)
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

  // Round to ints
  round () {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)
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
    if (view.sprites.hasOwnProperty(name)) { // Already created
      return view.sprites[name] // Return instead of recreating
    } else {
      this.dirs = ["right", "down", "left", "up"]
      this.moving = moving // Moves in all directions
      this.changing = changing // Changes over time
      this.loaded = false
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
            if (this.dirs.every(d => d in this)) { // last
              this.loaded = true
            }
          })
        }
      } else if (changing) {
        this.getImages(`${path}/sprite`, 1, [], (result) => { // Changing over time
          this.sprite = result
          this.loaded = true
        })
      } else {
        this.getImage(`${path}/sprite.png`, (result) => { // Static
          this.sprite = result
          this.loaded = true
        })
      }

      view.sprites[name] = this // Store reference
    }
  }

  // Preload image and verify it exists (async) (L)
  getImage (path, callback) {
      let image = new Image()
      image.onload = () => {
        this.size.width = image.width
        this.size.height = image.height
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
        this.getImages(path, i + 1, sprites, callback) // Next image - recurse
      }
    })
  }
}

// Objects, main displaying functionality
class Entity {
  constructor (loc, sprites) {
    this.loc = loc
    this.sprites = sprites
    this.frame = 0
  }

  // Display a sprite on the screen (L)
  update () {
    if (this.sprites.loaded) { // Loaded
      const switchRate = 5 // Switch sprite every x frames
      let sprite = null

      if (this.sprites.moving) { // Moving object
        sprite = this.sprites[this.direction]
        if (this.speed.magnitude > 0) {
          this.frame += 1 // New frame
        }
        sprite = sprite[Math.floor(this.frame / switchRate) % (sprite.length)]
      } else if (this.sprites.changing) { // Changing object, frame updated elswhere
        sprite = this.sprites.sprite
        sprite = sprite[Math.floor(this.frame / switchRate) % (sprite.length)]
      } else { // Static object
        sprite = this.sprites.sprite
      }

      this.middle = new Coord(
        this.loc.x + this.sprites.size.width / 2,
        this.loc.y + this.sprites.size.height / 2
      )

      let loc = view.relative(this.loc)
      loc.round()
      if (this.opacity < 1) { // Display as dead (flip and fade)
        view.screen.save()
        view.screen.translate(loc.x, loc.y)
        view.screen.rotate(Math.PI)
        view.screen.globalAlpha = this.opacity
        view.screen.drawImage(sprite, -this.sprites.size.width, -this.sprites.size.height)
        view.screen.restore()
      } else { // Normal
        view.screen.drawImage(sprite, loc.x, loc.y)
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
      this.dead = true
      this.health = this.traits.maxHealth // To be eaten
      this.hunger = 100
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

    // if (settings.names) {
    //   if (this.traits.name) {
    //     view.screen.font = "10px sans"
    //     view.screen.fillStyle = "#ffffff"
    //     view.screen.textAlign = "center"
    //     y += 2 * height // below hunger bar
    //     // x += this.sprites.size.width / 2
    //     view.screen.fillText(this.traits.name, x, y)
    //   }
    // }
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
  move () { // TODO make more efficient
    // Add acceleration to speed
    if (this.acceleration.magnitude >= 0) {
      const maxSpeed = this.traits.maxSpeed * this.speedFactor * this.terrainFactor
      // this.speed.multiply(0.75) // Friction, increases influence of acceleration (decreases bouncing)
      this.speed.add(this.acceleration)
      // Correct if over
      if (this.speed.magnitude > maxSpeed) {
        this.speed.magnitude = maxSpeed
      }

      // Add speed to location
      if (this.speed.magnitude > 0) {
        // From px/frame to m/second
        const speed = new Coord(this.speed.x, this.speed.y)
        speed.divide(view.fps)
        speed.multiply(view.scale)
        this.loc.add(speed)

        // Get direction
        const angle = (this.speed.angle + 2 * Math.PI) % (2 * Math.PI) // 0 to 2PI
        const index = Math.round(2 * (angle / Math.PI)) % 4 // values 0, 1, 2, 3
        this.angle = angle
        this.direction = this.sprites.dirs[index] // Direction as text
      }
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
        let symbol = map.tiles[y][x]
        if (symbol !== null) {
          // Get values of texture object
          let area = map.textures[symbol].area
          let object = {
            loc: new Coord(x * view.scale, y * view.scale),
            sprites: map.textures[symbol].sprites
          }
          if (area === "sky" && this.traits.area !== "sky") { // Animal meets a tree
            // Bigger animals and water animals can't go through tree
            if (this.collide(object)) {
              if (this.traits.mass > 10 || this.traits.area === "water") {
                this.block(object, true)
              }
            }
          }
          if (area === "land" && this.traits.area === "water") { // Water-animal meets land
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
      maxSpeed: 18,
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
    let name = "Butterfly"
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
      maxSpeed: 18,
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
      maxSpeed: 7,
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
      maxSpeed: 14,
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
      hunger: 1,
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
      attack: 0.1,
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
      maxSpeed: 16,
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
class Pinguin extends Animal {
  constructor (loc) {
    let name = "Pinguin"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 4,
      acceleration: 0.5,
      area: "land",
      maxHealth: 4,
      mass: 24,
      diet: "carnivore",
      camouflage: 0.3,
      perception: 0.3,
      aggressiveness: 0.2,
      attack: 0.4,
      hunger: 0.2,
      name: name
    }
  }
}
class Boar extends Animal {
  constructor (loc) {
    let name = "Boar"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 7,
      acceleration: 0.8,
      area: "land",
      maxHealth:15,
      mass: 75,
      diet: "herbivore",
      camouflage: 0.65,
      perception: 0.4,
      aggressiveness: 0.6,
      attack: 1,
      hunger: 0.5,
      name: name
    }
  }
}
class Beaver extends Animal {
  constructor (loc) {
    let name = "Beaver"
    super(loc, name)
    // The animal's traits, in SI units (L)
    this.traits = {
      maxSpeed: 6,
      acceleration: 0.4,
      area: "land",
      maxHealth: 8,
      mass: 30,
      diet: "herbivore",
      camouflage: 0.85,
      perception: 0.5,
      aggressiveness: 0.2,
      attack: 0.8,
      hunger: 0.2,
      name: name
    }
  }
}

// All constructors of animals
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
  "beaver": Beaver,
  "boar": Boar,
  "pinguin": Pinguin
}

// Parent class for all plant objects, food for the animals
class Plant extends Living {
  constructor (loc, name) {
    super(loc, new Sprites(name, false, false))
    this.name = name
  }

  // Functionality for plant lives (L)
  live () {
    if (this.dead) {
      this.die()
    } else {
      this.update()
      super.live()
    }
  }

  // Plant dies and disapears when completely eaten (L)
  die () {
    for (let i = 0; i < plants.length; i++) {
      if (plants[i] === this) {
        plants.splice(i, 1)
      }
    }
  }
}

// All plant classes
class Botelus extends Plant {
  constructor (loc) {
    let name = "Botelus"
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
      maxHealth: 1
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
      maxHealth: 2
    }
    this.health = this.traits.maxHealth
  }
}
class Seaweed extends Plant {
  constructor (loc) {
    let name = "Seaweed"
    super(loc, name)
    // The plant's traits in SI units (L)
    this.traits = {
      nutrition: 0.2,
      area: "water",
      maxHealth: 1
    }
    this.health = this.traits.maxHealth
  }
}
class Maple extends Plant {
  constructor (loc) {
    let name = "Maple"
    super(loc, name)
    // The plant's traits in SI units (L)
    this.traits = {
      nutrition: 0.1,
      area: "land",
      maxHealth: 1.5
    }
    this.health = this.traits.maxHealth
  }
}
class Fern extends Plant {
  constructor (loc) {
    let name = "Fern"
    super(loc, name)
    // The plant's traits in SI units (L)
    this.traits = {
      nutrition: 0.2,
      area: "land",
      maxHealth: 1
    }
    this.health = this.traits.maxHealth
  }
}
class Agaric extends Plant {
  constructor (loc) {
    let name = "Agaric"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.4,
      area: "land",
      maxHealth: 0.3
    }
    this.health = this.traits.maxHealth
  }
}
class Lily extends Plant {
  constructor (loc) {
    let name = "Lily"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.3,
      area: "water",
      maxHealth: 0.2
    }
    this.health = this.traits.maxHealth
  }
}
class Setaria extends Plant {
  constructor (loc) {
    let name = "Setaria"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.2,
      area: "land",
      maxHealth: 0.6
    }
    this.health = this.traits.maxHealth
  }
}
class Reed extends Plant {
  constructor (loc) {
    let name = "Reed"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.1,
      area: "water",
      maxHealth: 0.5
    }
    this.health = this.traits.maxHealth
  }
}
class Magnolia extends Plant {
  constructor (loc) {
    let name = "Magnolia"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.1,
      area: "land",
      maxHealth: 1
    }
    this.health = this.traits.maxHealth
  }
}
class Rice extends Plant {
  constructor (loc) {
    let name = "Rice"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.5,
      area: "land",
      maxHealth: 1
    }
    this.health = this.traits.maxHealth
  }
}
class Sapling extends Plant {
  constructor (loc) {
    let name = "Sapling"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.2,
      area: "land",
      maxHealth: 0.3
    }
    this.health = this.traits.maxHealth
  }
}
class Perennial extends Plant {
  constructor (loc) {
    let name = "Perennial"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.1,
      area: "land",
      maxHealth: 0.4
    }
    this.health = this.traits.maxHealth
  }
}
class Vine extends Plant {
  constructor (loc) {
    let name = "Vine"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.2,
      area: "land",
      maxHealth: 1
    }
    this.health = this.traits.maxHealth
  }
}
class Daffodil extends Plant {
  constructor (loc) {
    let name = "Daffodil"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.2,
      area: "land",
      maxHealth: 0.2
    }
    this.health = this.traits.maxHealth
  }
}
class Lavender extends Plant {
  constructor (loc) {
    let name = "Lavender"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.2,
      area: "land",
      maxHealth: 0.8
    }
    this.health = this.traits.maxHealth
  }
}
class Geranium extends Plant {
  constructor (loc) {
    let name = "Geranium"
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
class Daisy extends Plant {
  constructor (loc) {
    let name = "Daisy"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.1,
      area: "land",
      maxHealth: 0.2
    }
    this.health = this.traits.maxHealth
  }
}
class Clematis extends Plant {
  constructor (loc) {
    let name = "Clematis"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.2,
      area: "land",
      maxHealth: 1.2
    }
    this.health = this.traits.maxHealth
  }
}
class Tulip extends Plant {
  constructor (loc) {
    let name = "Tulip"
    super(loc, name)
    // The plant's traits in SI units (A)
    this.traits = {
      nutrition: 0.2,
      area: "land",
      maxHealth: 0.6
    }
    this.health = this.traits.maxHealth
  }
}

// All constructors of plants
map.plantConstructors = {
  "botelus": Botelus,
  "maple": Maple,
  "berry": Berry,
  "seaweed": Seaweed,
  "cactus": Cactus,
  "tulip": Tulip,
  "clematis": Clematis,
  "daisy": Daisy,
  "geranium": Geranium,
  "lavender": Lavender,
  "daffodil": Daffodil,
  "vine": Vine,
  "perennial": Perennial,
  "sapling": Sapling,
  "rice": Rice,
  "magnolia": Magnolia,
  "reed": Reed,
  "setaria": Setaria,
  "lily": Lily,
  "agaric": Agaric,
  "fern": Fern,
}

// Background texture objects
class Texture extends Entity {
  constructor (sprite) {
    super(null, sprite)
  }
}

class Water extends Texture {
  constructor () {
    let name = "water"
    super(new Sprites(name, false, true))
    this.type = name
    this.area = "water"
  }
}
class Grass extends Texture {
  constructor () {
    let name = "grass"
    super(new Sprites(name, false, false))
    this.type = name
    this.area = "land"
  }
}
class Tree extends Texture {
  constructor () {
    let name = "tree"
    super(new Sprites(name, false, false))
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
    this.sheltered = false // Hidden by terrain
    this.cooldown = false
    this.traits = animal.traits
    this.health = this.traits.maxHealth
    this.hunger = 100 // Percentage, the same value for every animal
    // Sight based on perception trait, from 1 to x meters
    const x = 70
    this.sightRadius = (1 + ((x - 1) * view.scale * (this.traits.perception)))
    this.dead = false
    this.opacity = 1
  }

  // Animals get hungry (L)
  live () {
    if (this.dead) {
      this.die()
    } else {
      this.hunger -= (this.traits.hunger / view.fps) // Remove per second
      this.hunger = this.hunger > 100 ? 100 : this.hunger // Can't be higher than 100

      if (this.hunger > 75) { // Regenerate health
        let max = this.traits.maxHealth
        this.health += (max / 100) / view.fps // 1% per second
        this.health = this.health > max ? max : this.health
      } else if (this.hunger <= 0) {
        this.hunger = 0
        this.health -= (5 * this.traits.maxHealth / 100) / view.fps // 5% per second
      }

      super.live()
    }
  }

  // Animal disappears slowly after dying (L)
  die () {
    if (this.health > 0) {
      // Animal will fade out in x seconds
      this.opacity -= 1 / (30 * view.fps)
      this.frame = 0
      this.update()
    } else {
      this.opacity = 0
    }
    // Disappear
    if (this.opacity <= 0.25) {
      for (let i = 0; i < animals.length; i++) {
        if (animals[i] === this) {
          animals.splice(i, 1)
        }
      }
    }
  }

  // Terrain modifies maximum speed (L)
  move () {
    // Current tile
    let x = Math.floor(this.loc.x / view.scale)
    let y = Math.floor(this.loc.y / view.scale)
    // Fix illegal positions
    x = x < map.size ? x : map.size - 1
    x = x > 0 ? x : 0
    y = y < map.size ? y : map.size - 1
    y = y > 0 ? y : 0
    // Current area
    let terrain = map.tiles[y][x]
    let area = (terrain === null || terrain === undefined) ? "sky" : map.textures[terrain].area // Null value is a tree

    // Terrain influences speed
    if (this.traits.area === "land") {
      if (area === "water") {
        this.terrainFactor = 0.65
      } else if (area === "sky") { // Beneath tree
        this.terrainFactor = 0.8
      } else {
        this.terrainFactor = 1
      }
    } else if (this.traits.area === "water") {
      if (area === "water") {
        this.terrainFactor = 1
      } else {
        this.terrainFactor = 0.65
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

    if (object.traits.nutrition && this.traits.diet !== "carnivore") { // Plant can be eaten alive
      this.hunger += object.traits.nutrition * 100
    } else if (object.dead) { // Animal can be eaten when dead
      this.hunger += 100 * ((object.traits.mass) / this.traits.mass)
    } else { // Animal alive
      if (object.health < 0) { // Just killed it
        // target will change into dead-mode, can be eaten now
        if (this.identity === "NPC") {
          this.behaviour = "eating" // Eat the animal
        }
      }
    }
  }

  // Attack another animal or plant (L)
  attack (object) {
    if (!this.cooldown) { // Wait until attack again
      if (object && object !== this) { // Not self and object exists
        if (this.middle && object.middle) {
          // Distance to object
          let distance = this.middle.distance(object.middle)
          if (distance.magnitude <= (view.scale * 2.5)) { // Minimaly x meter range for attack
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
    this.identity = "PC"
    this.moving = false // Move key being pressed
    this.speedFactor = 0.65 // Starts at slow walking pace
    this.spirits = [animal.name] // Animals to change into
  }

  // Game over
  die () {
    // TODO add styled screen
    if (!this.notification) {
      let alive = Math.round(((new Date()) - new Date(settings.startTime)) / 1000)
      alert(`
        You were killed as a(n) ${this.traits.name}.
        You were alive for ${Math.floor(alive / 60)} minutes and ${alive % 60} seconds.
        You obtained ${this.spirits.length - 1} animals.
        Game will automatically restart.
        `
      )
      this.notification = true
      // Reset
      settings.started = false
      store.set("tiles", null)
      store.set("animals", null)
      store.set("plants", null)
      location.reload()
    }
  }

  // PC hit actions (L)
  hit (object) {
    super.hit(object)

    // Collect animal spirits
    if (object.health < 0 && object.identity === "NPC") { // Just killed an animal
      let name = object.traits.name
      if (!this.spirits.includes(name)) { // Not killed before
        this.spirits.push(name)
        settings.displayAnimals() // Display
      }
    }
  }

  // Transform into another animal (L)
  transform (name) {
    if (this.spirits.indexOf(name) !== -1 && name !== this.traits.name) {
      let change = new map.animalConstructors[name.toLowerCase()]
      change = new change.constructor(this.loc) // Call the animal constructor with location
      change = new this.constructor(change)
      for (let prop of ["hunger", "spirits", "hunter", "target"]) {
        change[prop] = this[prop]
      }
      change.health = (this.health / this.traits.maxHealth) * change.traits.maxHealth
      animals[0] = change
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
        this.attack()
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

  // Different actions for attack method (L)
  attack () {
    // Select target
    if (!this.target) {
      let distances = []
      let close = []

      for (let animal of animals) {
        if (animal.middle && this.middle && animal !== this) {
          let range = animal.sightRadius * (1 - animal.traits.camouflage)
          let distance = this.middle.distance(animal.middle)
          if (distance.magnitude <= range) {
            distances.push(distance.magnitude)
            close.push(animal)
          }
        }
      }

      if (this.traits.diet !== "carnivore") {
        for (let plant of plants) {
          if (plant.middle && this.middle) {
            let distance = this.middle.distance(plant.middle)
            distances.push(distance.magnitude)
            close.push(plant)
          }
        }
      }

      if (close.length > 0) {
        const min = Math.min(...distances)
        this.target = close[distances.indexOf(min)] // Closest
      }
    }

    // Attack and add the prey to target (will flee or fight back)
    if (this.target) {
      super.attack(this.target)

      // Check if target still close enough
      this._check = window.setInterval(() => {
        if (this.target) {
          if (this.target.dead) {
            this.target = null
            window.clearInterval(this._check)
          } else if (this.target.identity === "NPC") { // Animals
            if (!view.inside(this.target.loc, -view.scale * 4)) { // Not in the center
              this.target = null
              window.clearInterval(this._check)
            } else if (this.speed.magnitude === 0 && !this.target.hitted) { // Not moving and haven't hit within x seconds
              window.setTimeout(() => {
                if (this.target && this.speed.magnitude === 0 && !this.target.hitted) {
                  this.target = null
                  window.clearInterval(this._check)
                }
              }, 2500)
            }
          } else { // Plants
            let distance = this.middle.distance(this.target.middle)
            if (distance.magnitude >= (4 * view.scale)) { // Out of range
              this.target = null
              window.clearInterval(this._check)
            }
          }
        } else {
          window.clearInterval(this._check)
        }
      }, 1000)
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
    this.identity = "NPC"
    this.state = "stop" // Start state
    this._currentBehaviour = "wandering" // Startbevaviour
    this._previousBehaviour = null
    this.step = 0
    this.speedFactor = 0.65 // Not at max speed

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
        "continue": 0.45,
        "stop": 0.1,
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
      if (this._currentBehaviour !== value) {
        this._previousBehaviour = this._currentBehaviour
        this._currentBehaviour = value
      }
    }
  }
  get behaviour () {
    return this._currentBehaviour
  }

  // Additional functionality for live, determines NPC behaviour (L)
  live () {
    if (!this.dead) {
      if (this.behaviour === "wandering") {
        this.look() // Look around, can change behaviour
        this.wander()
      } else if (this.behaviour === "hunting") {
        this.hunt()
      } else if (this.behaviour === "fleeing" || this.behaviour === "defending") {
        this.look() // Look around, can change behaviour
        this.fightFlight()
      } else if (this.behaviour === "eating") {
        this.look() // Look around, can change behaviour
        this.hunt() // 'Attack' the dead animal to eat it
      } else if (this.behaviour === "hiding") {
        // TODO implement hide
      }

      // TODO implement obstacle avoidance
    }
    super.live()
  }

  // Wandering behaviour (L)
  wander () {
    this.speedFactor = 0.65 // Not at max speed
    this.step += 1
    if (this.step >= 10 * view.fps) { // Reduces the number of decisions in direction (x per second)
      this.chooseDirection()
      this.step = 0
    }
  }


  // Hunts another creature (L)
  hunt () {
    const cancel = () => {
      this.behaviour = "wandering"
      this.target = null
      this.hitted = false
      this.chooseDirection()
    }

    // If exists
    if (this.target && (animals.includes(this.target) || plants.includes(this.target)) && this.target.health > 0) {
      let distance = this.middle.distance(this.target.middle)

      // Check if still in range
      let range = this.sightRadius * (1 - this.target.traits.camouflage)
      if (distance.magnitude >= range) { // Lost target
        cancel()
      }

      // Follow prey
      if (Math.abs(distance.angle - this.speed.angle) < Math.PI / 2) { // Roughly the same direction
        if (this.target && distance.magnitude > 2 * view.scale) { // Prevents animal shaking on contact
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
      cancel()
    }
  }

  // Fight or flight response (L)
  fightFlight () {
    const cancel = () => {
      this.behaviour = "wandering"
      this.hunter = null
      this.hitted = false
      this.chooseDirection()
    }

    // If exists
    if (this.hunter.target === this && animals.includes(this.hunter) && this.hunter.health > 0) {
      let distance = this.middle.distance(this.hunter.middle)

      // Check if still close
      let range = this.sightRadius * (1 - this.hunter.traits.camouflage)
      if (distance.magnitude >= range) { // Lost hunter
        cancel()
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
      cancel()
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
      return true // No other actions
    }


    if (this.traits.name !== animal.traits.name) { // No canibalism
      if (this.traits.diet === "carnivore") { // Can attack first
        if (this.behaviour !== "eating" && this.hunger < 75) { // Already eating and hungry
          // Will attack odd based on agression
          if (random.choose(odds) === "true") {
            // Hunt the animal
            this.behaviour = "hunting"
            this.speedFactor = 1
            this.target = animal
            return false
          }
        }
      }

      if (animal.traits.diet === "carnivore") { // spots a meat eater
        if (this.behaviour === "eating") { // Defend prey
          if (animal.target === this.target && animal.traits.name !== this.traits.name) {
            if (random.choose(odds) === "true") {
              this.behaviour = "hunting"
              this.target = animal
            }
          }
        } else {
          // Will run odd based on agression
          if (random.choose(odds) === "true") {
            this.behaviour = "fleeing"
            this.hunter = animal
          }
        }
      }
    }
  }

  // Check if predators or prey close / look for plants (L)
  look () {
    for (let animal of animals) {
      if (animal !== this) { // Not self
        if (this.middle && animal.middle) { // Exist
          let distance = this.middle.distance(animal.middle)
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
        if (this.middle && plant.middle) { // Exist
          if (!(this.traits.area === "water" && plant.traits.area !== "water")) { // Water animals can't eat land plants
            let distance = this.middle.distance(plant.middle)
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
// TODO use offscreencanvas https://developers.google.com/web/updates/2018/08/offscreen-canvas
view.refresh = function () {
 if (settings.run && settings.loaded) {
   // Draw if new frame
   view.now = Date.now()
   if ((view.now - view.prev) > view.frameTime) {
     view.prev = view.now
     // Draw the map (L)
     let wait = [] // Draw over animals

     let loc = new Coord(0, 0)
     for (let name in map.textures) {
       map.textures[name].loc = loc // Reference
     }
     for (let y = 0; y < map.size; y++) {
       for (let x = 0; x < map.size; x++) {
         if (view.inside(loc, 96)) { // Only draw in view
           let symbol = map.tiles[y][x]
           if (symbol) {
             if (symbol === 't') {
               // trees have a background
               map.textures['g'].update()
               loc.x += view.scale
               map.textures['g'].update()
               loc.y += view.scale
               map.textures['g'].update()
               loc.x -= view.scale
               map.textures['g'].update()
               loc.y -= view.scale
               wait.push({x: loc.x, y: loc.y})
             } else {
               map.textures[symbol].update()
             }
           }
         }
         loc.x += view.scale
       }
       loc.x = 0
       loc.y += view.scale
     }
     map.textures['w'].frame += 1

     // Animals and plants only live close to the view to improve performance
     const edge = 32 * 20
     // Draw plants
     for (let plant of plants) {
       if (plant) {
         if (view.inside(plant.loc, edge)) {
           plant.live()
         }
       }
     }
     // Draw animals
     for (let animal of animals) {
       if (animal) {
         if (view.inside(animal.loc, edge)) {
           animal.live()
         }
       }
     }

     // Draw trees over other objects
     for (let coord of wait) {
       map.textures['t'].loc.x = coord.x
       map.textures['t'].loc.y = coord.y
       map.textures['t'].update()
     }

     // Spawn new creatures when below the max
     map.spawn()
   }
 }
 requestAnimationFrame(view.refresh) // Run again (when available, more efficient)
}


// Store creatures every x seconds (also on pause or on quit) (L)
window.setTimeout(() => {
  settings.backup()
}, 60 * 1000)

// Save before exiting (doesn't always work) (L)
window.onbeforeunload = () => {
  settings.backup()
  return
}

// Resize window
window.onresize = () => {
  view.sizes()
}

// Window not in focus
window.onblur = () => {
  if (!settings.paused) {
    settings.paused = true
    settings._unfocus = true
  }
}

// Window back in focus, start again if paused by blur
window.onfocus = () => {
  if (settings._unfocus) {
    settings.paused = false
    settings._unfocus = false
  }
}

// Setup keyboard controls
document.addEventListener('keydown', (event) => {
  switch (event.keyCode) {
    case 70: // F
      settings.menu = true
      settings.facts = !settings.facts
      break
    case 77: // M
      settings.menu = !settings.menu
      break
    case 83: // S
      settings.menu = true
      settings.music = !settings.music
      break
    case 80: // P
      settings.menu = true
      settings.paused = !settings.paused
      break
    case 79: // O
      settings.overview = !settings.overview
      break
    case 88: // X
      settings.closeCard()
      break
  }

  if (animals[0] && settings.run ) {
    animals[0].control(event.keyCode, true)
  }
})

document.addEventListener('keyup', () => {
  if (animals[0] && settings.run ) {
    animals[0].control(event.keyCode, false) // Stop signal
  }
})

// Setup menu events (L)
doc.menu.addEventListener('click', () => {
  settings.menu = !settings.menu
})
doc.music.addEventListener('click', () => {
  settings.music = !settings.music
})
doc.facts.addEventListener('click', () => {
  settings.facts = !settings.facts
})
doc.pause.addEventListener('click', () => {
  settings.paused = !settings.paused
})
doc.delete.addEventListener('click', () => {
  if (animals[0]) {
    if (window.confirm("Are you sure? You will lose all progress!")) {
      animals[0].die()
    }
  }
})
doc.showOverview.addEventListener('click', () => {
  settings.overview = !settings.overview
})

// Everything loaded
document.onreadystatechange = function () {
  // Start game (A)
  const start = function () {
    view.sizes()
    map.generate()
    view.frameTime = Math.round(1000 / view.fps)
    settings.run = true
    doc.startScreen.style.display = "none" // Hide

    // Wait until loaded
    settings._load = setInterval(() => {
      let animalSprites = animals.every(animal => animal.sprites.loaded)
      let plantSprites = plants.every(plants => plants.sprites.loaded)
      let textureSprites = map.textures['g'].sprites.loaded && map.textures['w'].sprites.loaded && map.textures['t'].sprites.loaded

      if (animalSprites && plantSprites && textureSprites) {
        settings.loaded = true
        settings.displayAnimals()
        doc.loading.style.display = "none"
        doc.showOverview.style.display = 'initial'
        view.refresh() // First draw
        clearInterval(settings._load)
      }
    }, 10)
  }

  // Initialise or continue (L)
  if (document.readyState === 'complete') {
    if (settings.started) {
      // settings.getStorage()
      start()
      map.getCreatures()
      // Execute settings actions
      settings.music = settings.music
      settings.facts = settings.facts
      settings.paused = false
    } else {
      doc.startButton.addEventListener("click", function () {
        // Init settings
        settings.started = true
        settings.startTime = new Date()
        settings.paused = false
        settings.facts = settings.facts === null ? false : settings.facts
        settings.music = settings.music === null ? true : settings.music
        // Initialise the game
        start()
        animals[0] = new Player(new Squirrel(view.middle))
        map.spawn()
        store.set("animals", animals)
        store.set("plants", plants)
      })
    }
  }

  const key = document.addEventListener("keydown", () => {
    settings.interacted = true
    document.removeEventListener('keydown', key) // Remove self
  })
  const click = document.addEventListener("click", () => {
    settings.interacted = true
    document.removeEventListener('click', click)
  })
}
