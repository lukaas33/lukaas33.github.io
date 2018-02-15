(function () { // Closed scope
'use strict'

// >> Variables
const doc = {
  body: document.body,
  popup: document.querySelector('.popup'),
  status: document.querySelector('.status'),
  canvas: document.getElementById('canvas')
}

const local = {}



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
  const background = new Path.Rectangle([0, 0], [local.width, local.height])
  background.fillColor = '#eeeeee'

  const clearZone = new Shape.Circle(local.center, global.vars.step * 10)
  clearZone.fillColor = '#ffffff'

  local.background = new Layer([background, clearZone])
  local.background.activate()
}

const getLocation = function (callback) {
  doc.popup.textContent = 'Select a target on the screen outside the center circle.'
  doc.popup.style.display = 'block'

  doc.canvas.addEventListener('click', (event) => {  // The location to go to
    if (!global.vars.started) {
      const click = new Point(event.pageX, event.pageY)
      console.log(click)

      if (global.funct.distance([click, local.center]) > global.vars.step * 10) { // Outside circle
        doc.popup.style.display = 'none'
        global.target = click // Store
        const marker = new Shape.Circle(click, global.vars.step * 2)
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

global.layer = new Layer()
global.layer.activate()

getLocation(() => {
  global.vars.started = true // Start evolving
  doc.status.style.display = 'block'
  global.loop() // Start algorithm
})



// >> Events
window.addEventListener('resize', (event) => {
  update()
})

view.onFrame = (event) => {
  if (global.vars.started && global.vars.work) {
    for (let walker of global.vars.population) {
      if (walker.started) {
        walker.move()
      }
    }
    global.vars.at += 1 * global.vars.timeFactor
  }
}

setInterval(() => { // Update values
  if (global.vars.started) {
    // Update values in statusbar
    doc.status.textContent = `
    Generation: ${global.vars.generation}
    At step: ${Math.ceil(global.vars.at / 30)}
    `
  }
}, 250)


doc.body.style.opacity = 1 // Display screen
}).call(this)
