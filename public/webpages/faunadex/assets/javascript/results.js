(function() { // Global vars are local to this file
'use strict'
// << Variables >>
const doc = {
  overview: $('#overview'),
  result: $('#result'),
  back: $('#result button[name=back]'),
  menu: $('#menu'),
  loader: $('#loader')
}

const local = {
  results: shared.storage('results').reverse() // Can do this because data is entered in chronological order
  // results: shared.storage('results').sort(shared.sort('date')) // Get the results in sorted order
}

// << Functions >>
const showRes = function () {
  var id = location.href.split('?id=')[1]
  for (let result of local.results) {
    if (result.id === id) {
      let card = new EJS({url: 'views/partials/result.ejs'}).render({data: result})
      $('#result').find('.box').html(card)
      break
    }
  }
}

$(window).on('load', () => {
  // << Actions >>
  console.log(location.href)
  if (location.href.indexOf('?id=') !== -1) { // Parameter
    showRes() // Show
    doc.loader.hide()
    doc.result.show()
  } else {
    if (typeof(local.results) !== 'undefined') { // Exist
      if (local.results.length > 0) {
        for (let result of local.results) {
          let thumbnail = new EJS({url: 'views/partials/thumbnail.ejs'}).render({data: result})
          doc.overview.find('.box').append(thumbnail) // Add html to doc
        }
      } else {
        doc.overview.find('.box').text("No results yet")
      }
    } else {
      doc.overview.find('.box').text("No results yet")
    }
    doc.loader.hide()
    doc.overview.css({display: 'block'}) // Can't use show() for some reason
  }

  // << Events >>
  doc.display =  $('.thumbnail .display') // Add reference to created
  doc.display.click(function (event) {
    event.preventDefault() // No ordinary link
    location.href = this.href // Normal behaviour

    // window.history.pushState('', '', this.href) // No redirect
    // showRes() // Show
  })

  // TODO add the sorting option

  // TODO add the text to speech

  doc.back.click(function (event) {
    location.href = location.href.split('?id=')[0] // overview
    // window.history.back() // Previous page
  })
})
}).call(this)
