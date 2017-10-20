// TODO work out the fullscreen button
// TODO work out the slideshow for collections
// TODO work out loading of content
// TODO work out navbar

// var $ = 0

$(document).ready(function () {
  // Actions
  $('body').show()

  $('.fullscreen').click(function () {
    var $box = $('#project').find('.box')
    if ($box.hasClass('normal')) {
      // Set state to fullscreen
      $box.removeClass('normal')
      $box.addClass('fill')
      $('nav').hide() // Can't use css for it
    } else {
      // Set state to normal
      $box.removeClass('fill')
      $box.addClass('normal')
      $('nav').show() // Can't use css for it
    }
  })
})
