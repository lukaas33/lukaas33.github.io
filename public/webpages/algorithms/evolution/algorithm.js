(function () {
'use strict'

// >> Variables
const step = 10
const timeFactor = 3
const steps = 100
const populationSize = 2
const population = []
let generation = 1
let at = 0 // Step of walker


// Export references to variables
global.vars = {
  get generation () { // Will get the local variable via this object
    return generation
  },
  get population () {
    return population
  },
  get at () {
    return at
  },
  set at (val) { // Update from main on frame
    at = val
  },
  get step () {
    return step
  },
  get timeFactor () {
    return timeFactor
  },
  started: false,
  work: false
}



// >> Functions
const normalize = function (fitnessArray) {
  const total = fitnessArray.reduce((a, b) => a + b, 0)

  for (let i = 0; i < fitnessArray.length; i++) {
    fitnessArray[i] /= total
  }
  return fitnessArray
}

const distance = function (points) {
  const dx = (points[0].x - points[1].x) ** 2
  const dy = (points[0].y - points[1].y) ** 2

  const dist = Math.sqrt(dx + dy)
  return dist
}

const chooseParents = function (num, pool) {
  const result = []

  while (result.length < num) {
    let rand = Math.
  }
}

// Export once
global.funct = {distance: distance}



// >> Classes
class DNA {
  // Create instance
  constructor (inherited = null) {
    if (inherited === null) { // First generation
      const options = [].concat.apply(...DNA.nucleotides) // Flatten
      const code = []

      while (code.length < DNA.maxLength) {
        let i = Math.floor(Math.random() * options.length)
        code.push(options[i])
      }

      this.code = code // property of instance
    }
  }

  // >> Properties
  static get nucleotides () {
    return [['A', 'T'], ['C', 'G']]
  }

  static get maxLength () {
    return steps // One nucleotide is one step
  }

  static get mutationRate () {
    return 0.05
  }

  // >> Methods

}

class Walker {
  // Create instance
  constructor (start = [0, 0], parents = null) {
    this.location = new Point(start)
    this.started = false

    if (parents === null) { // Random
      this.dna = new DNA()
    } else { // Combination
      const dna = []
      for (let parent of parents) {
        dna.push(parent.dna.code) // Store parent dna
      }
      this.dna = new DNA(dna)
    }
  }

  // >> Properties
  get loc () {
    return at // Same for all walkers
  }

  // >> Methods
  move () {
    let every = 30 // Every 30 frames, changed to be sped up or slowed down
    let i = this.loc / every

    if (Number.isInteger(i)) { // The valid indices
      let use = this.dna.code[i] // Use the position

      switch (use) {
        case 'A':
          this.location.x += step
        break
        case 'T':
          this.location.x -= step
        break
        case 'C':
          this.location.y += step
        break
        case 'G':
          this.location.y -= step
        break
      }
    }

    this.checkEnd()
    this.body.position = this.location
  }

  display () {
    this.body = new Shape.Circle(this.location, step)
    this.body.fillColor = '#e0e0e0'
  }

  calcFitness () {
    this.fitness = this.distance ** -1 // High for low distances
    return this.fitness
  }

  checkEnd () {
    this.distance = distance([this.location, global.target])
    if (this.distance < step * 2) { // Inside target
        at = steps * 30 // Let the check end all movement
    }
  }
}



// >> Execution
global.loop = function () { // Will be executed once per frame
  if (population.length === 0) {
    // initialise population
    while (population.length < populationSize) {
      population.push(new Walker(global.start))
    }
  }

  // Start population
  for (let walker of population) {
    walker.display()
    walker.started = true // Will start moving
  }
  global.vars.work = true // Stop

  let check = setInterval(() => {
    if (at >= steps * 30) {
      global.vars.work = false // Stop movement
      clearInterval(check)

      let fitnesses = []
      for (let walker of population) {
        fitnesses.push(walker.calcFitness()) // Add to the list
      }

      fitnesses = normalize(fitnesses) // normalize values
      console.log(fitnesses)
    }
  }, 5)
}

}).call(this)
