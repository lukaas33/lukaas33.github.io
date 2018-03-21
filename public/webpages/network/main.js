(function() {
'use strict'

// setup
paper.setup(document.getElementById('canvas'))
paper.install(window)

// > Variables
const local = {
  num: 75,
  dots: [],
  size: view.viewSize
}

const draw = {}

// > Functions
draw.background = function () {
  const origin = new Point(0, 0)
  const end = new Point(view.viewSize.width, view.viewSize.height)
  const color = '#212121'

  draw.bottom = new Shape.Rectangle(origin, end)
  draw.bottom.fillColor = color
}

// > Classes
class Dot {
  static get size () { // Size range
    return {top: 25, low: 10}
  }
  static get dist () { // Max connection distance
    return 115
  }
  static get speed () { // Speed in pixel per frame
    const px = 15
    return px / 30
  }

  constructor (loc, dir) { // initialise
    let unique = false
    while (!unique) {
      this.id = Math.floor(Math.random() * 1000)
      unique = true
      if (local.dots.length > 1) {
        for (let dot of local.dots) {
          if (dot.id === this.id) {
            unique = false
          }
        }
      }
    }

    this.conns = {}
    this.loc = new Point(loc)
    this.loc.floor()
    this.dir = new Point(Math.cos(dir), Math.sin(dir))
    this.size = Math.floor(Math.random() * (Dot.size.top - Dot.size.low) + Dot.size.low)
  }

  connect () {
    for (let dot of local.dots) {
      let distance = Math.floor(Math.hypot(dot.loc.x - this.loc.x, dot.loc.y - this.loc.y))
      if (distance > 0 && distance < Dot.dist) {
        if (dot.id in this.conns) {
          this.conns[dot.id].segments[0].point = this.loc
          this.conns[dot.id].segments[1].point = dot.loc
        } else {
          this.conns[dot.id] = new Path.Line(this.loc, dot.loc)
          this.conns[dot.id].style = {
            strokeWidth: 2,
            strokeColor: new Color(1, 1, 1, 0.75)
          }
        }
      } else {
        if (dot.id in this.conns) {
          this.conns[dot.id].remove()
          delete this.conns[dot.id]
        }
      }
    }
  }

  display () {
    this.body = new Shape.Circle(this.loc, this.size / 2)
    this.body.style = {
      fillColor: new Color(1, 1, 1, 1)
    }
  }

  update () {
    this.loc = this.loc.add(this.dir.normalize(Dot.speed)) // Relative point added per frame
    this.body.position = this.loc.floor() // Update

    if (this.loc.x < 0) {
      this.loc.x = view.viewSize.width
    } else if (this.loc.x > view.viewSize.width) {
      this.loc.x = 0
    }
    if (this.loc.y < 0) {
      this.loc.y = view.viewSize.height
    } else if (this.loc.y > view.viewSize.height) {
      this.loc.y
    }
  }

}

// > Execute
draw.background()

// Add the dots
while (local.dots.length < local.num) {
  const loc = new Point({
    x: Math.floor(Math.random() * view.viewSize.width),
    y: Math.floor(Math.random() * view.viewSize.height)
  })
  const direction = Math.floor(Math.random() * 360)
  const dot = new Dot(loc, direction * (Math.PI / 180))
  dot.display()
  local.dots.push(dot)
}

// > Events
view.onFrame = function (event) {
  for (let dot of local.dots) {
    dot.update()
    dot.connect()
  }
}

view.onResize = function (event) {
  // Resize all

  local.size = view.viewSize
}
}).call(this)
