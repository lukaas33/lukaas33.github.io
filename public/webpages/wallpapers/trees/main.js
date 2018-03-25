(function() {
'use strict'

// setup
paper.setup(document.getElementById('canvas'))
paper.install(window)

// > Variables


// > Functions
const tree = function (pos, height, angle) {
  const rad = (angle * -1) * (Math.PI / 180)
  const dir = new Point(Math.cos(rad), Math.sin(rad)) // Relative point

  const newHeight = Math.ceil(height / 2) // Decrease
  const end = pos.add(dir.normalize(newHeight))

  const branch = new Path.Line(pos, end)
  branch.style = {
    strokeColor: '#4e342e', // Brown
    strokeWidth:  Math.ceil(height / 100) // Thicker when height is bigger
  }

  if (newHeight > 5) { // Stop making branches
    const branches = Math.ceil(Math.random() * 6)
    for (let i = 0; i < branches; i++) {
      const newAngle = angle + (Math.floor(Math.random() * 151) - 75) // -x until x
      tree(end, newHeight, newAngle)
    }
  } else { // Draw leaves
    const leave = new Shape.Circle(end, 3)
    leave.style = {
      fillColor: '#388e3c',
    }
  }
}

// > Setup
const middle = new Point(Math.round(view.viewSize.width / 2), view.viewSize.height)
tree(middle, view.viewSize.height, 90)

// > Events
view.onFrame = function (event) { // Every frame

}

view.onResize = function (event) { // When the screen resizes

}
}).call(this)
