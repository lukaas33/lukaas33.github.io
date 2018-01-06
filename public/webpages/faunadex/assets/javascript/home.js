// Most pages have their own js file and shared functions are in a seperate file
// Code groups are under << >>
// Every function has a comment explaining it
// Sources are below the function comment and indented
// Expressions can have a comment next to it

(function() { // Global vars are local to this file
  'use strict'

// << Variables >>
const doc = {
  results: $('#results .box'),
  main: $('main'),
  loader: $('#loader')
}

const local = {
  results: shared.storage('results').reverse() // Can do this because data is entered in chronological order
}
local.results = local.results.slice(0, 4) // First 4

$(window).on('load', () => {
  // << Actions >>
  if (typeof(local.results) !== 'undefined') { // Exist
    for (let result of local.results) {
      let thumbnail = new EJS({url: 'views/partials/thumbnail.ejs'}).render({data: result})
      doc.results.append(thumbnail) // Add html to doc
    }
  }
  doc.loader.hide()
  doc.main.css({display: 'block'}) // Can't use show() for some reason
})

}).call(this)
