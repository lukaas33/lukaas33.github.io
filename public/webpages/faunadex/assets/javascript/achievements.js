(function() { // Global vars are local to this file
'use strict'

  // << Variables >>
  const doc = {
    specific: $('#specific ul'),
    number: $('#number ul'),
    other: $('#other ul'),
    page: $('.page main')
  }
  const local = {
    results: shared.storage('achievements') // Get the results
  }

  // << Functions >>
  // Highlight selected
  const highlightAchievement = function () {
    var id = location.href.split('id=')[1]
    doc.page.find('.selected').removeClass('selected') // Remove old selected
    doc.page.find(`[data-id=${id}]`).addClass('selected')
  }

  // << Actions >>
  // Display all
  for (let result of local.results) {
    let achieve = new EJS({url: 'views/partials/achievement.ejs'}).render({data: result})
    doc[result.category].append(achieve)
  }
  if (location.href.indexOf('id=') !== -1) { // Parameter
    highlightAchievement() // Show
  }

}).call(this)
