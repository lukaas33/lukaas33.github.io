(function() {
'use strict'

// setup
paper.setup(document.getElementById('canvas'))
paper.install(window)

// > Variables
const dots = {
  props: {
    dark: {color: '#3949ab', scale: 3},
    light: {color: '#5c6bc0', scale: 1.5},
    main: {color: '#ffffff', scale: 1},
  },
  group: {
    dark: [],
    light: [],
    main: [],
  }
}
const local = {
  num: Math.ceil(view.viewSize.width / 25 / 3), // Based on screen size
  size: view.viewSize,
  timeFactor: 1,
  pressing: null,
  mouse: null
}

const draw = {}

// > Classes
class Dot {
  // Class props
  static get size () { // Size range
    return {low: 20, top: 55}
  }
  static get stroke () { // Size range
    return {low: 2, top: 6}
  }
  static get speed () { // Speed in pixel per frame
    return {low: 5, top: 40}
  }
  static get dist () { // Max connection distance
    return 200
  }

  constructor (loc, dir, group) { // initialise
    this.groupname = group
    this.loc = new Point(loc).floor()
    this.dir = new Point(Math.cos(dir), Math.sin(dir)) // Get relative point from angle

    this.scale = dots.props[this.groupname].scale
    const size = Math.floor(Math.random() * (Dot.size.top - Dot.size.low) + Dot.size.low) // Random size in range
    this.size = size * this.scale
    const speed = Dot.speed.top - ((Dot.speed.top - Dot.speed.low) * (this.size / (Dot.size.top * this.scale))) // Speed higher for small ones
    this.speed = (speed * local.timeFactor) / 30 // To speed per second
    this.dist = Dot.dist * (this.size / Dot.size.top)
    this.body = null
    this.conns = {}
  }

  get group () {
    return dots.group[this.groupname] // Reference to the array
  }

  get color () {
    return dots.props[this.groupname].color
  }

  idGen () {
    let unique = false
    while (!unique) {
      this.id = Math.floor(Math.random() * 1000) // Random ID
      unique = true
      if (this.group.length > 1) {
        for (let dot of this.group) {
          if (dot.id === this.id) {
            unique = false // Try again
          }
        }
      }
    }
  }

  connect () { // Make lines
    for (let dot of this.group) {
      let distance = Math.floor(Math.hypot(dot.loc.x - this.loc.x, dot.loc.y - this.loc.y)) // Calculate with points

      if (distance > 0 && distance < this.dist) { // Make
        let factor = distance / this.dist // Distance changes appearance
        let stroke = Math.ceil(Dot.stroke.top - (Dot.stroke.top - Dot.stroke.low) * factor)
        stroke *= this.scale

        if (dot.id in this.conns) { // Change
          this.conns[dot.id].segments[0].point = this.loc
          this.conns[dot.id].segments[1].point = dot.loc
          this.conns[dot.id].opacity = 1 - factor // More visible closer
          this.conns[dot.id].style = {
            strokeWidth: stroke, // Thicker when closer
          }
        } else { // First draw
          this.conns[dot.id] = new Path.Line(this.loc, dot.loc)
          this.conns[dot.id].opacity = 1 - factor // More visible closer
          this.conns[dot.id].style = {
            strokeWidth: stroke,
            strokeColor: new Color(this.color)
          }
          dots.props[this.groupname].layer.addChild(this.conns[dot.id])
        }
      } else { // Remove
        if (dot.id in this.conns) {
          this.conns[dot.id].remove()
          delete this.conns[dot.id]
        }
      }
    }


  }

  update () { // Change pos
    if (this.body === null) { // First draw
      this.body = new Shape.Circle(this.loc, this.size / 2)
      this.body.style = {
        fillColor: new Color(this.color)
      }
      dots.props[this.groupname].layer.addChild(this.body)
    } else { // Change
      this.loc = this.loc.add(this.dir.normalize(this.speed)) // Relative point added per frame
      this.body.position = this.loc // Update

      // Check edges
      const se = this.size / 2
      if (this.loc.x < 0 - se) { // left
        this.loc.x = view.viewSize.width - se
      } else if (this.loc.x > view.viewSize.width + se) { // right
        this.loc.x = 0 + se
      }
      if (this.loc.y < 0 - se) { // top
        this.loc.y = view.viewSize.height - se
      } else if (this.loc.y > view.viewSize.height + se) { // bottom
        this.loc.y + se
      }
    }
  }
}

// > Setup
// Background
draw.bottom = new Shape.Rectangle(new Point(0, 0), new Point(view.viewSize.width, view.viewSize.height))
draw.bottom.fillColor = '#3f51b5'
draw.layer = new Layer(draw.bottom)
draw.layer.activate()

// Add the dots
for (let group in dots.group) {
  dots.props[group].layer = new Layer()
  while (dots.group[group].length < local.num) {
    const loc = new Point({
      x: Math.floor(Math.random() * view.viewSize.width),
      y: Math.floor(Math.random() * view.viewSize.height)
    })
    const direction = Math.floor(Math.random() * 360)
    const dot = new Dot(loc, direction * (Math.PI / 180), group)
    dot.idGen()
    dots.props[group].layer.addChild(dot.body)
    dots.group[group].push(dot)
  }
  dots.props[group].layer.activate()
}

// > Events
window.addEventListener('mousemove', function (event) { // Update location when dragging
  local.mouse = event
})

window.addEventListener('mousedown', function (event) { // Add dots on click
  const spawn = function () {
    // Remove first created
    dots.group.main[0].body.remove()
    for (let id in dots.group.main[0].conns) { // Remove own conns
      dots.group.main[0].conns[id].remove()
    }
    for (let index in dots.group.main) { // Remove conns with other
      if (dots.group.main[0].id in dots.group.main[index].conns) {
        dots.group.main[index].conns[dots.group.main[0].id].remove()
      }
    }
    dots.group.main.splice(0, 1)

    const loc = new Point(local.mouse.pageX, local.mouse.pageY)
    const direction = Math.floor(Math.random() * 360)
    // Add new
    const dot = new Dot(loc, direction * (Math.PI / 180), 'main')
    dot.idGen()
    dot.connect()
    dots.props.main.layer.addChild(dot.body)
    dots.group.main.push(dot)
  }

  spawn()
  local.pressing = setInterval(() => { // Spawn until mouse up
    spawn()
  }, 250)
})

window.addEventListener('mouseup', function (event) {
  window.clearInterval(local.pressing)
})

view.onFrame = function (event) { // Every frame
  for (let group in dots.group) {
    for (let dot of dots.group[group]) {
      dot.update()
      dot.connect()
    }
  }
}

view.onResize = function (event) { // When the screen resizes
  // Resize all
  const previous = local.size
  local.size = view.viewSize
  console.log(local.size.width / previous.width, local.size.height / previous.height)

  draw.bottom.scale(2 * local.size.width / previous.width, 2 * local.size.height / previous.height)

  for (let group in dots.group) {
    for (let dot of dots.group[group]) {
      dot.loc = new Point({
        x: (dot.loc.x / previous.width) * local.size.width,
        y: (dot.loc.y / previous.height) * local.size.height
      });
    }
  }
}
}).call(this)
