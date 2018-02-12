'use strict'

// Available everywhere
const global = {
  step: 10,
  timeFactor: 1,
  steps: 100
};

(function () {
// >> Functions
const distance = function (points) {
  const dx = (points[0].x - points[1].x) ** 2
  const dy = (points[0].y - points[1].y) ** 2

  const dist = Math.sqrt(dx + dy)
  return dist
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
  static get nucleotides() {
    return [['A', 'T'], ['C', 'G']]
  }

  static get maxLength() {
    return global.steps
  }

  static get mutationRate() {
    return 0.05
  }

  // >> Methods
}

class Walker {
  // Create instance
  constructor (start = [0, 0], parents = null) {
    this.location = new Point(start)

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
  get step() {
    return global.at // Same for all walkers
  }

  // >> Methods
  move () {

  }
}



// >> Variables
const population = []
let generation = 1
let at = 0 // Step of walker

// Export references
global.vars = {
  get generation () { // Will get the local variable via this object
    return generation
  },
  get population () {
    return population
  },
  get at () {
    return at
  }
}

// initialise population




// >> Execution
global.loop = function () {

}

}).call(this)
