var global = {
  // Has global scope

}

(function () {
  'use strict'
  // Has local scope

  var load = function (url, callback) {
    // Loads scrips asynchronously
    var script = document.createElement('script')

    script.onload = function () {
      callback()
    }
    script.src = url
    script.async = true
    document.getElementsByTagName('head')[0].appendChild(script)
  }
})
