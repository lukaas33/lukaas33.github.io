var global = {
  // Variable with a global scope
  timing: 400, // Standard animation time
  animation: { // Standard animation object
    duration: 400,
    easing: 'swing'
  },
  state: { // Tracks state of cards
    'experience': null,
    'skills': null
  },
  pageNum: 0, // Will store the number of pages in portfolio
  previous: null, // Will track the previous page
  cookie: undefined, // Will store cookie function
  timeouts: {} // Will store timeouts
};

(function () {
  'use strict'

  global.cookie = function (name, value) {
    // Cookie function
    var cookies = document.cookie.split(';')
    if (value === void 0) {
      for (var i = 0; i < cookies.length; i++) {
        value = cookies[i]
        var current = value.split('=') // Name and value pair
        if (current[0].trim() === name) {
          return current[1] // Can be undefined
        }
      }
    } else {
      console.log('Set cookie ' + name + ' to ' + value)
      document.cookie = name + '=' + value + '; secure;'
    }
  }

  var loadScript = function (url, callback) {
    // Loads scrips asynchronously
    var script = document.createElement('script')

    script.onload = function () {
      callback()
    }
    script.src = url
    script.async = true
    document.getElementsByTagName('head')[0].appendChild(script)
  }

  if (global.cookie('map') === void 0) {
    global.cookie('map', false)
  }
  if (global.cookie('page') === void 0) {
    global.cookie('page', 1)
  }
  if (global.cookie('name') === void 0) {
    global.cookie('name', '')
  }
  if (global.cookie('email') === void 0) {
    global.cookie('email', '')
  }
  if (global.cookie('message') === void 0) {
    global.cookie('message', '')
  }

  loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', function () {
    console.log('// Jquery loaded')
    loadScript('assets/javascript/main.js', function () {
      console.log('// Main script loaded')
    })
  })
}).call(this)
