const menu = {
  nav: document.querySelector('nav'),
  timeLeftWarning: false,

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

    if (min <= 0 && sec <= 0) { // End of game
      clearInterval(wait)
      min = 0
      sec = 0

      if (database.getStorage('ended') !== true) {
        if (typeof(game) !== 'undefined') { // At the home page
          game.end()
        } else {
          window.setTimeout(() => {
            location.href = '' // Home
          }, 1000)
        }
      }
    } else if (min == 5 && sec <= 0 && !this.timeLeftWarning) {
      confirm("Pas op. Je hebt nog 5 minuten tot het einde van de speurtocht.")
      this.timeLeftWarning = true
    }

    if (min < 10) {
      min = '0' + min // 08, 09, 10, 11
    }
    if (sec < 10) {
      sec = '0' + sec // This is allowed in js
    }
    let clock = document.querySelector('.clock')
    if (clock) {
      clock.innerHTML = `${min}:${sec}`
    }
  }
}


// Run
menu.insert()

if (database.startTime === null && database.getStorage("ended") !== true) { // Game not started
  window.setTimeout(() => {
    location.href = '' // Home
  }, 1000)
}

// Events
document.querySelector('button[name=menu]').addEventListener('click', (event) => {
  menu.nav.style.display = 'inline-block'

  // Set the reverse
  document.querySelector('button[name=close]').addEventListener('click', (event) => {
    menu.nav.style.display = 'none'
  })
})


// Time loop function for game
const wait = window.setInterval(() => {
  menu.clock()
}, 750) // Refresh time less than 1 sec for smooth display

// Remove loader from screen after first page load
const loading = window.setInterval(() => {
  if (document.readyState === "interactive" || document.readyState === "complete") {
    document.getElementById("loading").style.display = 'none'
    window.clearInterval(loading)
  }
}, 5)
