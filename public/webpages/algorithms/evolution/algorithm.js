(function () {
'use strict'

// >> Variables
const populationSize = 250
const steps = 150 // Steps before end
const parentAmount = 5 // How many parents make one child

const step = 10 // Pixels per step
const maxIterations = Infinity

let population = []
let generation = 0
let at = 0 // Step of walker

const ids = [] // Track all


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
  started: false,
  work: false,
  timeFactor: 25 // Speed higher or lower
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

  return result
}

const genId = function (len = 16) {
  while (true) {
    let id = Math.floor(Math.random() * (10 ** len))
    if (!ids.includes(id)) { // Is unique
      ids.push(id)
      return id
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
      const code = []

      while (code.length < DNA.maxLength) {
        code.push(DNA.random)
      }

      this.code = code // property of instance
    } else { // Recombination
      const code = []

      if (true) { // Use system 1
        while (code.length < DNA.maxLength) {
          let chance = Math.random()

          if (chance < DNA.mutationRate) { // Mutation of this position
            code.push(DNA.random)
          } else {
            let parent = Math.floor(Math.random() * 2)
            code.push(inherited[parent][code.length]) // inherited this position
          }
        }
      } else { // Use system 2
        const length = Math.floor(DNA.maxLength / inherited.length) // DNA part length
        const parts = Math.floor(DNA.maxLength / length)

        let at = 0
        let i = 0
        for (let parent of inherited) {
          let part
          if (at == parts - 1) { // Last
            part = parent.slice(i, parent.length)
          } else {
            part = parent.slice(i, i + length)
          }

          for (let nuc of part) {
            let chance = Math.random()

            if (chance < DNA.mutationRate) { // Mutation of this position
              code.push(DNA.random)
            } else {
              code.push(nuc)
            }
          }

          at += 1
          i = at * length
        }
      }

      this.code = code
    }
  }

  // >> Properties
  static get nucleotides () {
    return [['A', 'T'], ['C', 'G']]
  }

  static get random () {
    const options = [].concat.apply(...DNA.nucleotides) // Flatten
    const nuc = options[Math.floor(Math.random() * options.length)]
    return nuc
  }

  static get maxLength () {
    return steps // One nucleotide is one step
  }

  static get mutationRate () {
    return 0.015
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
    this.speed = null

    this.id = genId()

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
    if (Number.isInteger(this.loc)) { // The valid indices
      let use = this.dna.code[this.loc] // Use the position

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
  }

  update () {
      this.checkEnd()
      this.body.position = this.location
  }

  display () {
    this.body = new Shape.Circle(this.location, 10)
    let colors = [0, 0, 0, 0] // Based on DNA
    const options = [].concat.apply(...DNA.nucleotides) // Flatten
    for (let nuc of this.dna.code) {
      for (let index in options) {
        if (options[index] === nuc) { // Found one
          colors[index] += 1
        }
      }
    }

    for (let index in colors) {
      colors[index] = colors[index] / DNA.maxLength // Normalize
    }
    console.log(colors)

    this.body.fillColor = new Color(...colors)
    global.layer.addChildren(this.body)
  }

  calcFitness () {
    let fitness = this.distance ** -1 // High for low distances
    if (this.speed !== null) {
      fitness += (this.speed * 5) ** -1 // High for low amount of steps
    }

    this.fitness = fitness
    return fitness
  }

  normalizeFitness (total) {
    this.fitness = this.fitness / total
  }

  checkEnd () {
    this.distance = distance([this.location, global.target])
    if (this.distance < 30) { // Inside target
      this.started = false
      this.speed = this.loc // Total steps
      // global.vars.work = false // Stop all movement
    }
  }

  checkEdge () {
    if (global.space.contains(this.body.bounds)) { // In page

    } else {
      for (let index in population) {
        if (population[index].id === this.id) { // Find
          population.splice(index, 1) // Don't track
          this.end()
        }
      }
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
  generation += 1


  let check = setInterval(() => {
    if (at >= steps) {

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
          console.log(walker)
        }
        walker.normalizeFitness(total) // Normalize values
      }

      console.log(generation)
      console.log(population)

      let newPopulation = []
      while (newPopulation.length < populationSize) {
        let parents = chooseParents(parentAmount, population)
        let child = new Walker(global.start, parents)
        newPopulation.push(child)
      }

      for (let walker of population) {
        walker.end()
      }
      population = newPopulation

      if (generation < maxIterations) {
        at = 0
        global.loop() // New iteration
      }
    }
  }, 5)
}

}).call(this)
