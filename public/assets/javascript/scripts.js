var global = {
  // Variables with a global scope
  timing: 400,
  animation: {
    duration: 400,
    easing: 'swing'
  },
  state: {
    'experience': null,
    'skills': null
  },
  timeout: null,
  pageNum: 0,
  previous: null
};

(function () {
  global.cookie = function (name, value) {
    // Cookie function
    var cookies = document.cookie.split(';')
    if (value === void 0) {
      for (var i = 0; i < cookies.length; i++) {
        value = cookies[i]
        var current = value.split('=')
        if (current[0].trim() === name) {
          return current[1]
        }
      }
    } else {
      console.log('Set cookie ' + name + ' to ' + value)
      document.cookie = name + '=' + value + '; path=/'
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
    loadScript('assets/javascript/setup.js', function () {
      console.log('// Setup script loaded')
    })
  })
}).call(this)
