const menu = {
  nav: document.querySelector('nav'),
  open: document.querySelector('button[name=menu]'),
  insert () {
    // Insert menu in page
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          menu.nav.innerHTML = this.responseText // Include in html
        }
      }
    }
    xhttp.open("GET", 'assets/elements/menu.html', true)
    xhttp.send()
  },
  clock () {
    // Display clock
    const elapsed = Math.floor(((new Date()).getTime() - database.startTime) / 1000) // Time elapsed since start
    const timeLeft = database.duration - elapsed
    let min = Math.floor(timeLeft / 60)
    let sec = min != 0 ? timeLeft % (min * 60) : elapsed // If min == 0 the mod operator will return NaN

    if (min <= 0) { // End of game
      game.end()
    }

    if (min < 10) {
      min = '0' + min // 08, 09, 10, 11
    }
    if (sec < 10) {
      sec = '0' + sec // This is allowed in js
    }
    document.querySelector('.clock').innerHTML = `${min}:${sec}`
  }
}


// Run
menu.insert()

if (database.startTime === null) { // Game not started
  window.setTimeout(() => {
    location.href = '' // Home
  }, 1000)
}

// Events
menu.open.addEventListener('click', (event) => {
  menu.nav.style.display = 'inline-block'
})

// Time loop function for game
const wait = window.setInterval(() => {
  menu.clock()
}, 750) // Refresh time less than 1 sec for smooth display
