(function() { // Global vars are local to this file
  'use strict'
  // << Variables >>
  const doc = {
    overview: $('#overview'),
    result: $('#result')
  }

  const local = {
    results: shared.storage('results') // Get the results
  }

  // << Functions >>
  const showRes = function () {
    var id = location.href.split('id=')[1]
    for (let result of local.results) {
      if (result.id === id) {
        let card = new EJS({url: 'views/partials/result.ejs'}).render({data: result})
        doc.result.html(card)
        doc.overview.hide()
        doc.result.show()
      }
    }
  }

  // << Actions >>
  if (typeof(local.results) !== 'undefined') { // Exist
    for (let result of local.results) {
      let thumbnail = new EJS({url: 'views/partials/thumbnail.ejs'}).render({data: result})
      doc.overview.append(thumbnail) // Add html to doc
    }
  }
  if (location.href.indexOf('id=') !== -1) { // Parameter
    showRes() // Show
  }

  // << Events >>
  doc.display =  $('.thumbnail .display') // Add reference to created
  doc.display.click(function (event) {
    event.preventDefault() // No ordinary link
    location.assign(this.href) // Normal back behaviour

    // window.history.pushState('', '', this.href) // No redirect
    // showRes() // Show
  })
}).call(this)
