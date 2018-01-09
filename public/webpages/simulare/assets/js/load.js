// This file uses [Js standard](https://standardjs.com/) as code style
// Comments explaining blocks are above the block
// This file is optimised for speed, as it initialises the loading screen. That's why I only use the JS DOM here

// Has global scope
const global = {
  theory: undefined,
  interaction: {
    time: 400, // Standard animation time
    loaded: false,
    pauzed: true,
    sound: true,
    cards: true,
    selected: null, // Selected instance
    audio: null
  },
  enviroment: { // Enviroment variables, are filled via input elements
    temperature: null,
    acidity: null, // 5.5 - 8.5
    concentration: null,
    energy: null,
    ranges: { // Min and max
      temperature: [0, 40],
      acidity: [5.5, 8.5],
      concentration: [0, 15.6],
      energy: [6e7, 1.58e8],
    }
  },
  constants: {},
  bacteria: [], // Contains bacteria instances
  dead: [], // Stores values from dead bacteria
  data: {
    ratio: [],
    divisionTime: []
  }, // Stores the data at different times over the simulation
  food: [] // Contains food instances
};

// Has local scope
(function () {
  "use strict"
  // Loads files asynchronously
  const load = function (url, type, callback) {
    if (type === 'css') {
      let link = document.createElement('link')
      link.onload = () => {
        callback()
      }
      link.href = url
      link.media = 'screen'
      link.rel = 'stylesheet'

      // Insert into dom at correct placc
      document.getElementsByTagName('link')[0].insertAdjacentElement('afterend', link)
    } else {
      let script = document.createElement('script')
      script.async = true // Will load asynchronously
      script.src = url
      script.onload = () => {
        callback()
      }

      // Insert into dom at correct place
      document.getElementsByTagName('script')[0].insertAdjacentElement('afterend', script)
    }
  }

  // Tracks loaded files
  var total = 10
  var toLoad = total // Initial value
  // Updates loaded files
  const loaded = function (file) {
    toLoad -= 1

    var percentage = Math.round((total - toLoad) / total * 100) // Total loaded files
    progressBar(percentage)

    console.log('Loaded:', file)
    if (toLoad === 0) {
      setTimeout(() => {
        global.interaction.loaded = true
      }, 400) // Let's animation end when done
    }
  }

  // Changes progressbar on screen
  const progressBar = function (percentage) {
    // TODO maybe make this work in firefox
    var $pie = document.getElementById('loading').getElementsByClassName('pie')[0]
    var total = Math.round(Math.PI * 100) // Circumference of circle
    var number = (percentage * total) / 100 // Part of the circle
    $pie.style.strokeDasharray = `${number}%, ${total}%`
  }

  // When the loading page loads
  window.onload = function () {
    loaded('self')
    // Load the jquery library
    load('https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js', 'js', () => {
      loaded('jquery')
      // Load data into global variable
      $.getJSON('storage/theory.json', (data) => {
        global.theory = data.content
        loaded('theory')
      })
      // Load html into an element, will be hidden
      $('#home').load('storage/main.html', () => {
        loaded('html')
      })
      // Load the Paper.js library
      load('https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.22/paper.min.js', 'js', () => {
        loaded('paper.js')
        // Load the main javascript
        // $.getScript('assets/js/main.js', () => {
        //   loaded('js')
        // })
        load('assets/js/main.js', 'js', () => {
          loaded('js')
        })
      })
    })
    // Load the Showdown library
    load('https://cdnjs.cloudflare.com/ajax/libs/showdown/1.7.6/showdown.min.js', 'js', () => {
      loaded('showdown')
    })
    // Load the css normaliser
    load('https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css', 'css', () => {
      loaded('normalize css')
    })
    // Load the main css
    load('assets/css/main.css', 'css', () => {
      loaded('css')
    })

    // Load the background music
    global.interaction.audio = document.createElement('audio')
    global.interaction.audio.setAttribute('src', 'storage/music-gas.mp3') // Source: https://youtu.be/NvG-jqGsWSk
    // global.interaction.audio.setAttribute('src', 'storage/music-cell.mp3') // Source: https://youtu.be/cyfpt4LpNAA
    global.interaction.audio.loop = true
    global.interaction.audio.load()

    global.interaction.audio.addEventListener('canplaythrough', () => { // Done
      loaded('music')
    }, true)
  }
}).call(this)
