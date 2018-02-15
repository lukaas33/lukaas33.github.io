(function () {
'use strict'

// >> Variables
const populationSize = 10
const steps = 1500
const timeFactor = 1
const parentAmount = 2

const step = 10
const maxIterations = 3

const population = []
let generation = 0
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
const distance = function (points) {
  const dx = (points[0].x - points[1].x) ** 2
  const dy = (points[0].y - points[1].y) ** 2

  const dist = Math.sqrt(dx + dy)
  return dist
}

const chooseParents = function (num, pool) {
  const result = []

  while (result.length < num) {
    let rand = Math.random()
    let cumulative = 0 // Use cumulative value

    for (let walker of pool) {
       cumulative += walker.fitness
       if (rand < cumulative) { // Choice based on probabilit, 0.4 better than 0.1
         result.push(walker)
         break
       }
    }
  }
}

// Export once
global.funct = {distance: distance}



// >> Classes
class DNA {
  // Create instance
  constructor (inherited = []) {
    if (inherited.length === 0) { // First generation
      const options = [].concat.apply(...DNA.nucleotides) // Flatten
      const code = []

      while (code.length < DNA.maxLength) {
        let i = Math.floor(Math.random() * options.length)
        code.push(options[i])
      }

      this.code = code // property of instance
    } else { // Combination
      const code = []

      const length = Math.floor(steps / inherited.length) // Length of dna
      const extra = steps % length
      let at = 0

      for (let dna of inherited) {
        let codeLength = length
        if (at + length + extra === steps) { // Final part
          codeLength += extra // If length = 33 and steps = 100, this one will be 34
        }

        let part = code.slice(at, codeLength)
        for (let nuc of part) {
          code.push(nuc)
        }
        at += codeLength
      }

      this.code = code
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
    this.distance = null
    this.fitness = null

    if (parents === null) { // Random
      this.dna = new DNA()
    } else { // Combine dna
      const dna = []
      for (let parent of parents) {
        dna.push(parent.dna.code) // Store only parent dna
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
    let every = 30 // Every 30 frames
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
    global.layer.addChildren(this.body)
  }

  calcFitness () {
    let fitness = this.distance ** -1 // High for low distances
    fitness = fitness ** 100 // Increase influence
    this.fitness = fitness
    return this.fitness
  }

  normalizeFitness (total) {
    this.fitness = this.fitness / total
  }

  checkEnd () {
    this.distance = distance([this.location, global.target])
    if (this.distance < step) { // Inside target
        global.vars.work = false // Stop movement
    }
  }

  end () {
    this.body.remove() // From field
  }
}



// >> Execution
global.loop = function () { // Will be executed once per frame
  if (population.length === 0) { // No population
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
  global.vars.work = true


  let check = setInterval(() => {
    if (at >= steps * 30) {
      generation += 1

      global.vars.work = false // Stop movement
      clearInterval(check) // No double checking on recursion

      let fitnesses = []
      for (let walker of population) {
        fitnesses.push(walker.calcFitness()) // Add to the list
      }
      let total = fitnesses.reduce((a, b) => a + b)
      let max = Math.max(...fitnesses)

      for (let walker of population) {
        if (walker.fitness === max) {
          console.log('Best', walker.distance, walker.dna)
        }
        walker.normalizeFitness(total) // Normalize values
      }

      console.log(generation, population)

      let newPopulation = []
      while (newPopulation.length < populationSize) {
        let parents = chooseParents(parentAmount, population)
        newPopulation.push(new Walker(global.start, parents))
      }

      for (let i = 0; i < population.length; i++) {
        population[i].end() // Remove
        population[i] = newPopulation[i] // Replace
      }

      if (generation < maxIterations) {
        console.log('New iteration')
        at = 0
        global.loop() // New iteration
      }
    }
  }, 5)
}

}).call(this)
