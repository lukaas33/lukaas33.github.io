// >> Variables
const can = document.getElementById("canvas")
const ctx = can.getContext("2d")

const width = can.offsetWidth
const height = can.offsetHeight


// Classes
class Coord {
    constructor (x, y) {
        this.x = x
        this.y = y
    }
}


// >> Functions
const pixel = function (loc, col) {
    ctx.fillStyle = col
    ctx.fillRect(loc.x, loc.y, 1, 1)
}

const all = function (width, height, execute) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < width; y++) {
            execute(x, y)
        }
    }
}

all(width, height, (x, y) => {
    if (x % 5 === 0 && y % 5 === 0) {
        let loc = new Coord(x, y)

        let c = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`

        pixel(loc, c)
    }
})
