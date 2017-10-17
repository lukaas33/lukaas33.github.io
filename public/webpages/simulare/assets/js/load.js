// This file uses [Js standard](https://standardjs.com/) as code style
// Comments explaining blocks are above the block

// Has global scope
var global = {
  theory: undefined,
  interaction: {
    time: 400 // Standard time
  }
};

// Has local scope
(function () {
  'use strict'

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

      document.getElementsByTagName('head')[0].appendChild(link)
    } else {
      var script = document.createElement('script')
      script.async = true // Will load asynchronously
      script.src = url
      // Add additional attributes to it
      if (type === 'paper') {
        script.type = 'text/paperscript'
        script.setAttribute('canvas', 'screen') // Paper.js requirement
        callback() // Can't check  the loading of this
      } else {
        script.onload = function () {
          callback()
        }
      }

      document.getElementsByTagName('script')[0].insertAdjacentElement('afterend', script)
    }
  }

  // Tracks loaded files
  var toLoad = 8
  var loaded = function (file) {
    toLoad -= 1

    var percentage = Math.round((8 - toLoad) / 8 * 100) // Total loaded files
    progressBar(percentage)

    console.log('Loaded:', file)
    if (toLoad === 0) {
      setTimeout(start, 400) // Let's animation end
    }
  }

  // Changes progressbar on screen
  var progressBar = function (percentage) {
    var pie = document.getElementById('loading').getElementsByClassName('pie')[0]
    var total = Math.round(Math.PI * 100) // Circumference of circle
    var number = (percentage * total) / 100 // Part of the circle
    pie.style.strokeDasharray = number + '%, ' + total + '%'
  }

  // Starts the program
  var start = function () {
    console.log('Fully loaded')
  }

  // When the loading page loads
  window.onload = function () {
    // Load the jquery library
    load('https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js', 'js', function () {
      loaded('jquery')
      // Load data into global variable
      $.getJSON('storage/theory.json', function (data) {
        global.theory = data.content
        loaded('theory')
      })
      // Load html into an element, will be hidden
      $('#home').load('storage/page.html', function () {
        loaded('html')
      })

      // Load the main css
      load('assets/css/main.css', 'css', function () {
        loaded('css')
      })
    })
    // Load the Paper.js library
    load('https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.22/paper.min.js', 'js', function () {
      loaded('paper.js')
      // Load the main javascript
      load('assets/js/main.js', 'paper', function () {
        loaded('js')
      })
    })
    // Load the MathJax library
    load('https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js', 'js', function () {
      loaded('mathjax')
    })
    // Load the Showdown library
    load('https://cdnjs.cloudflare.com/ajax/libs/showdown/1.7.6/showdown.min.js', 'js', function () {
      loaded('showdown')
    })
  }
}).call(this)
