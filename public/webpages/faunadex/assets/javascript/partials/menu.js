(function() { // Global vars are local to this file
  'use strict'

  $('button[name=menu]').click(function() {
    var menu = $('#menu')
    if (menu.attr('data-state') === 'extended') {
      menu.attr('data-state', 'collapsed')
    } else {
      menu.attr('data-state', 'extended')
    }
  })
}).call(this)
