// __     __         _       _     _
// \ \   / /_ _ _ __(_) __ _| |__ | | ___  ___
//  \ \ / / _` | '__| |/ _` | '_ \| |/ _ \/ __|
//   \ V / (_| | |  | | (_| | |_) | |  __/\__ \
//    \_/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/
//
const doc = {
  canvas: document.getElementById('canvas'),
}

const view = {
    screen: doc.canvas.getContext('2d')
}


 //  _____                 _   _
 // |  ___|   _ _ __   ___| |_(_) ___  _ __  ___
 // | |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
 // |  _|| |_| | | | | (__| |_| | (_) | | | \__ \
 // |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
 //


//   ____ _
//  / ___| | __ _ ___ ___  ___  ___
// | |   | |/ _` / __/ __|/ _ \/ __|
// | |___| | (_| \__ \__ \  __/\__ \
//  \____|_|\__,_|___/___/\___||___/
//

class Obj {
  constructor (x, y, name) {
    this.x = x
    this.y = y
    this.sprites = `assets/sprites/${name}`
  }

  display () {
    let img = new Image()
    img.onload = () => {
      view.screen.drawImage(img, this.x, this.y, 32, 32)
    }
    img.src = this.sprites + "/down-1" + ".png"
  }
}

//  ____       _
// / ___|  ___| |_ _   _ _ __
// \___ \ / _ \ __| | | | '_ \
//  ___) |  __/ |_| |_| | |_) |
// |____/ \___|\__|\__,_| .__/
//                      |_|

// Set the canvas to the screen size, via css gives stretching effect
doc.canvas.width = window.innerWidth
doc.canvas.height = window.innerHeight
view.screen.width = window.innerWidth
view.screen.height = window.innerHeight

//   _____                     _
//  | ____|_  _____  ___ _   _| |_ ___
//  |  _| \ \/ / _ \/ __| | | | __/ _ \
//  | |___ >  <  __/ (__| |_| | ||  __/
//  |_____/_/\_\___|\___|\__,_|\__\___|
//

let squirrel = new Obj(50, 50, 'squirrel')
squirrel.display()
