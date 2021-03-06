// Global scope
const global = {
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
  pages: {
    pageNum: 0, // Will store the number of pages in portfolio
    previous: null // Will track the previous page
  },
  sort: {
    current: 0, // Stores the current sorting option
    next: 1 // Stores next option
  },
  cookie: undefined, // Will store cookie function
  fallback: {}, // Will store variables if cookies are not enabled
  timeouts: {} // Will store timeouts
};

// Local scope
(function () {
  'use strict'

  global.cookie = function (name, value) {
    if (navigator.cookieEnabled && window.location.protocol === 'https:') { // Cookies can be used safely
      // Cookie function
      var cookies = document.cookie.split(';')
      if (typeof value === 'undefined') { // Need to get
        for (let value of cookies) {
          let current = value.split('=') // Name and value pair
          if (current[0].trim() === name) {
            let result = current[1].trim()
            try {
              result = JSON.parse(result) // Will parse strings to numbers, booleans, etc.
              return result
            } catch (error) {
              if (error.name === 'SyntaxError') { // Tried to parse a string value
                return result // Just return the string
              }
            }
          }
        }
      } else { // Need to set
        console.log(`set cookie: ${name} to ${value}`)
        document.cookie = `${name}=${value};secure;` // Set value
      }
    } else { // Use variables instead of cookies
      if (typeof value === 'undefined') {
        return global.fallback[name] // Get value
      } else {
        console.log(`Set fallback variable: ${name} to ${value}`)
        global.fallback[name] = value // Set value
      }
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

  if (typeof global.cookie('map') === 'undefined') {
    global.cookie('map', false)
  }
  if (typeof global.cookie('page') === 'undefined') {
    global.cookie('page', 1)
  }
  if (typeof global.cookie('name') === 'undefined') {
    global.cookie('name', null)
  }
  if (typeof global.cookie('email') === 'undefined') {
    global.cookie('email', null)
  }
  if (typeof global.cookie('message') === 'undefined') {
    global.cookie('message', null)
  }

  loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', function () {
    console.log('# Jquery loaded')
    loadScript('assets/javascript/main.js', function () {
      console.log('# Main script loaded')
    })
  })
}).call(this) // Has own scope
