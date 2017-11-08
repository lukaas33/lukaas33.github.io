// This file uses [Js standard](https://standardjs.com/) as code style
// Comments explaining blocks are above the block
// This file is optimised for speed, as it initialises the loading screen. That's why I only use the JS DOM here

// Has global scope
var global = {
  theory: undefined,
  interaction: {
    time: 400, // Standard animation time
    loaded: false,
    pauzed: true,
    music: true,
    selected: null // Selected instance
  },
  enviroment: { // Enviroment variables
    temperature: null,
    acidity: null,
    toxicity: null,
    energy: null
  },
  constants: { // TODO add more values
    scaleFactor: 1.5e6 // Scale of the animation, 1 cm : this cm
  },
  bacteria: [], // Contains bacteria instances
  food: [] // Contains food instances
};

// Has local scope
(function () {
  // Loads files asynchronously
  var load = function (url, type, callback) {
    if (type === 'css') {
      var link = document.createElement('link')
      link.onload = function () {
        callback()
      }
      link.href = url
      link.media = 'screen'
      link.rel = 'stylesheet'

      // Insert into dom at correct placc
      document.getElementsByTagName('link')[0].insertAdjacentElement('afterend', link)
    } else {
      var script = document.createElement('script')
      script.async = true // Will load asynchronously
      script.src = url
      script.onload = function () {
        callback()
      }

      // Insert into dom at correct place
      document.getElementsByTagName('script')[0].insertAdjacentElement('afterend', script)
    }
  }

  // Tracks loaded files
  var total = 9
  var toLoad = total // Initial value
  // Updates loaded files
  var loaded = function (file) {
    toLoad -= 1

    var percentage = Math.round((total - toLoad) / total * 100) // Total loaded files
    progressBar(percentage)

    console.log('Loaded:', file)
    if (toLoad === 0) {
      setTimeout(function () {
        global.interaction.loaded = true
      }, 400) // Let's animation end when done
    }
  }

  // Changes progressbar on screen
  var progressBar = function (percentage) {
    var $pie = document.getElementById('loading').getElementsByClassName('pie')[0]
    var total = Math.round(Math.PI * 100) // Circumference of circle
    var number = (percentage * total) / 100 // Part of the circle
    $pie.style.strokeDasharray = number + '%, ' + total + '%'
  }

  // When the loading page loads
  window.onload = function () {
    loaded('self')
    // Load the jquery library
    load('https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js', 'js', function () {
      loaded('jquery')
      // Load data into global variable
      $.getJSON('storage/theory.json', function (data) {
        global.theory = data.content
        loaded('theory')
      })
      // Load html into an element, will be hidden
      $('#home').load('storage/main.html', function () {
        loaded('html')
      })
      // Load the Paper.js library
      load('https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.22/paper.min.js', 'js', function () {
        loaded('paper.js')
        // Load the main javascript
        $.getScript('assets/js/main.js', function () {
          loaded('js')
        })
      })
    })
    // Load the Showdown library
    load('https://cdnjs.cloudflare.com/ajax/libs/showdown/1.7.6/showdown.min.js', 'js', function () {
      loaded('showdown')
    })
    // Load the css normaliser
    load('https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css', 'css', function () {
      loaded('normalize css')
    })
    // Load the main css
    load('assets/css/main.css', 'css', function () {
      loaded('css')
    })
  }
}).call(this)
