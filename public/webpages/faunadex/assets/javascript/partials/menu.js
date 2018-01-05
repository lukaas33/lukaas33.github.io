(function() { // Global vars are local to this file
  'use strict'

  var menu = $('#menu')
  var indicator = menu.find('button[name=menu]')

  var changeState = function (target) {
    if (target) {
      menu.attr('data-state', 'extended')
    } else {
      menu.attr('data-state', 'collapsed')
    }
    indicator.prop('disabled', true)
    setTimeout(() => {
      indicator.prop('disabled', false)
      if (target) {
        indicator.find('img').attr('src', 'assets/images/icons/close.svg')
      } else {
        indicator.find('img').attr('src', 'assets/images/other/logo-color.svg')
      }
    }, shared.var.time)
  }

  indicator.click(function (event) {
    if (menu.attr('data-state') === 'extended') {
      changeState(false)
    } else {
      changeState(true)
    }
  })

  menu.find('.overlay').click(function (event) {
    changeState(false)
  })

  menu.find('.menuItem a').click(function (event) {
    if (this.href === window.location.href) { // Redirect to self
      event.preventDefault()
      changeState(false)
    }
  })
}).call(this)
