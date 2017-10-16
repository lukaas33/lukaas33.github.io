// This file uses [Js standard](https://standardjs.com/) as code style
// Comments explaining blocks are inside the block

// Has global scope
var global = {
  theory: undefined
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
      script.onload = function () {
        callback()
      }
      script.async = true // Will load asynchronously
      script.src = url
      // Add additional attributes to it
      if (type === 'paper') {
        script.type = 'text/paperscript'
        script.canvas = 'screen'
      }

      document.getElementsByTagName('head')[0].appendChild(script)
      document.getElementsByTagName('script')[0].insertAdjacentElement('afterend', script)
    }
  }

  // Tracks loaded files and starts app
  var toLoad = 8
  var loaded = function (file) {
    toLoad -= 1
    console.log('Loaded', file)

    if (toLoad === 0) {
      start()
    }
  }

  var start = function () {
    console.log('Fully loaded')
  }

  // Load the jquery library
  load('https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js', 'js', function () {
    loaded('jquery')
    // Load data into global variable
    $.getJSON('storage/theory.json', function (data) {
      global.theory = data.content
      loaded('theory')
    })
    // Load html into page
    $('#home').load('storage/page.html', function () {
      console.log('Loaded html')
    })
  })
  // Load the Paper.js library
  load('https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.22/paper.min.js', 'js', function () {
    loaded('paper.js')
  })
  // Load the MathJax library
  load('https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js', 'js', function () {
    loaded('mathjax')
  })
  // Load the Showdown library
  load('https://cdnjs.cloudflare.com/ajax/libs/showdown/1.7.6/showdown.min.js', 'js', function () {
    loaded('showdown')
  })
  // Load the main javascript
  load('assets/js/main.js', 'paper', function () {
    loaded('paper')
  })
  // Load the main css
  load('assets/css/main.css', 'css', function () {
    loaded('css')
  })
}).call(this)
