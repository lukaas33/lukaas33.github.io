(function () { // Closed scope
// >> Variables
const doc = {
  body: document.body,
  popup: document.querySelector('.popup'),
  status: document.querySelector('.status'),
  canvas: document.getElementById('canvas')
}

const local = {
  started: false
}



// >> Functions
const update = function () {
  local.width = doc.body.offsetWidth
  local.height = doc.body.offsetHeight
  local.center = new Point(local.width / 2, local.height / 2)

  global.start = local.center
  doc.canvas.width = local.width
  doc.canvas.height = local.height
}

const drawField = function () {
  console.log(local)
  const clearZone = new Shape.Circle(local.center, local.height / 10)
  clearZone.strokeWidth = 6
  clearZone.strokeColor = '#9e9e9e'
  clearZone.fillColor = '#ffffff'
}

const getLocation = function (callback) {
  doc.popup.textContent = 'Select a target on the screen outside the center circle.'
  doc.popup.style.display = 'block'

  doc.canvas.addEventListener('click', (event) => {  // The location to go to
    if (!local.started) {
      const click = new Point(event.pageX, event.pageY)
      console.log(click)

      if (global.funct.distance([click, local.center]) > local.height / 10) { // Outside circle
        doc.popup.style.display = 'none'
        const marker = new Shape.Circle(click, local.height / 50)
        marker.fillColor = '#bdbdbd'

        console.log('User picked location')
        callback()
      }
    }
  })
}



// >> Actions
// Start
paper.setup(document.getElementById('canvas'))
paper.install(window) // Global scope for properties

update()

drawField()

getLocation(() => {
  local.started = true // Start evolving
  doc.status.style.display = 'block'
})



// >> Events
window.addEventListener('resize', (event) => {
  update()
})

view.onframe = (event) => {
  if (local.started) {
    if (global.population.length > 0) { // There is a population
      for (let instance of global.population) {
        instance.move() // Let all walkers move
      }
    }
  }
}

setInterval(() => { // Update values
  if (local.started) {
    // Update values in statusbar
    doc.status.textContent = `
    Generation: ${global.vars.generation}
    At step: ${global.vars.at}
    `
  }
}, 500)


doc.body.style.opacity = 1 // Display screen
}).call(this)
