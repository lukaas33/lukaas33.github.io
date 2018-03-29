// z = z2 + c.

// >> Variables
const can = document.getElementById("canvas")
const ctx = can.getContext("2d")

ctx.imageSmoothingEnabled= false

const width = can.offsetWidth
const height = can.offsetHeight




// Classes
class Coord {
    constructor (x = 0, y = 0) {
        this.x = x
        this.y = y
    }
}

class Color {
  constructor (r = 0, g = 0, b = 0, a = 0) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }
}


// >> Functions
const pixel = function (loc, col) {
  let pixel = ctx.createImageData(1, 1)
  let data = pixel.data
  data[0] = col.r
  data[1] = col.g
  data[2] = col.b
  data[3] = col.a
  ctx.putImageData(pixel, loc.x, loc.y)
}

const all = function (width, height, execute) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            execute(new Coord(x, y))
        }
    }
}

// >> Execute
all(width, height, (coord) => {
  // Source: https://en.wikipedia.org/wiki/Mandelbrot_set
  //
  // For each pixel (Px, Py) on the screen, do:
  // {
  //   x0 = scaled x coordinate of pixel (scaled to lie in the Mandelbrot X scale (-2.5, 1))
  //   y0 = scaled y coordinate of pixel (scaled to lie in the Mandelbrot Y scale (-1, 1))
  //   x = 0.0
  //   y = 0.0
  //   iteration = 0
  //   max_iteration = 1000
  //   while (x*x + y*y < 2*2  AND  iteration < max_iteration) {
  //     xtemp = x*x - y*y + x0
  //     y = 2*x*y + y0
  //     x = xtemp
  //     iteration = iteration + 1
  //   }
  //   color = palette[iteration]
  //   plot(Px, Py, color)
  // }

  let x0 = ((coord.x / width) * 3.5) - 2.5
  let y0 = ((coord.y / height) * 2) - 1
  let x = 0
  let y = 0

  let iterations = 1000 // Avoid infinity

  let i = 0
  while (i < iterations) {
    i += 1

    if (x ** 2 + y ** 2 < 2 * 2) {
      let xt = x ** 2 - y ** 2 + x0 // Temp
      y = 2 * x * y + y0
      x = xt
    } else {
      break
    }
  }

  if (i === 1000) {
    let col = new Color(0, 0, 0, 255)
    pixel(coord, col)
  }
})
