'use strict'

# Main script for webste
switchPage = (change) ->
  if global.pageNum > 1
    global.previous = parseInt(global.cookie "page")
    newPage = global.previous + change
    newPage = global.pageNum if newPage < 1 # To the last page
    newPage = 1 if newPage > global.pageNum # To the last page
    console.log "Switching to #{newPage}"
    global.cookie("page", newPage) # Update
    setPages global.timing

highLight = ->
  # Highlights items in the menu bar
  $li = $("nav ul li")
  $li.removeClass "focus" # Removes the focus each time
  $li.next().removeClass "show"
  position = $(window).scrollTop()
  calcTop = (element) ->
    # Adds margin to the scroll position
    top = Math.round element.offset().top + element.height()
    location = top - parseInt(element.css "margin-bottom") - $("nav").height()
    return  location # When fully visible

  # Higlights navitem based on position in screen
  if position <= calcTop $("#about")
    $($li[0]).addClass "focus"
    $($li[1]).addClass "show"
  else if position < calcTop $("#experience")
    $($li[1]).addClass "focus"
    $($li[2]).addClass "show"
  else if position < calcTop $("#skills")
    $($li[2]).addClass "focus"
    $($li[3]).addClass "show"
  else if position < calcTop $("#portfolio")
    $($li[3]).addClass "focus"
    $($li[4]).addClass "show"
  else if position < calcTop $("#contact")
    $($li[4]).addClass "focus"

scrollToLoc = (section) ->
  # Scrolls to a section
  top = Math.round section.offset().top
  location = top - parseInt(section.css "margin-top")  - $("nav").height()
  $("html, body").animate
    scrollTop: location # Fully visible
    {
      duration: global.timing * 2 # Double the standard time
      easing: "swing" # Animate with swing easing
    }

toggle = (card, active) ->
  # Collapses and extends cards
  animate = (card) ->
    $collapse = $(card).find ".collapse"
    $collapse.slideToggle
      duration: global.timing
      easing: "swing" # Animate with swing easing

  # If this card isn't selected
  if global.state[active] != card or global.state[active] == null
    animate global.state[active] # Toggle previous
    global.state[active] = card # Update
    animate card # Toggle new

  # If already selected
  else if global.state[active] == card
    animate global.state[active] # Toggle previous
    global.state[active] = null

setForm = ->
  $form = $("#contact").find "form"
  $form.find("input[name='name']").val(global.cookie "name")
  $form.find("input[name='email']").val(global.cookie "email")
  $form.find("textarea").val(global.cookie "message")

setMap = (change) ->
  # Toggles and initialises map
  $map = $("#contact").find ".map"
  $data = $("#contact").find ".card:nth-child(1) .text"
  $button = $("#contact").find ".show"

  setOff = (time) ->
    # Sets map to off
    console.log "Map hidden"
    $map.fadeOut
      duration: time
      easing: "swing"
      complete: -> # After complete
        $button.find('p').text "Show map"
        $data.fadeIn duration: time, easing: "swing"
        global.cookie("map", off)

  setOn = (time) ->
    # Sets map to on
    console.log "Map shown"
    $data.fadeOut
      duration: time
      easing: "swing"
      complete: -> # After complete
        $button.find('p').text "Hide map"
        $map.fadeIn duration: time, easing: "swing"
        global.cookie("map", on)

  # Actions based on map cookie and if the cookie should be changed
  if global.cookie("map") == "true"
    if change
      setOff(global.timing / 2) # When clicked
    else
      setOn(0) # Before page is loaded
  else if global.cookie("map") == "false"
    if change
      setOn(global.timing / 2) # When clicked
    else
      setOff(0) # Before page is loaded

sendMail = (data, success) ->
  $.ajax
    url: '/send'
    data: data
    processData: false
    contentType: false
    type: 'POST'
    success: ->
      success(true)
      # Mail sent, cookies can be reset
      global.cookie("name", "")
      global.cookie("email", "")
      global.cookie("message", "")
    error: ->
      success(false)

$ ->
  ### Actions ###
  console.log "// DOM events loading..."

  setMap()
  setForm()

  setTimeout -> # Prevents the flashing on of the about link on load
    highLight() # Initial highlight at start of page
    $(window).scroll -> # Sets scroll event
      highLight() # Higlight correct link
  , global.timing * 2

  ### Events ###
  $(window).on "resize", ->
    $('*').addClass "notransition"
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout -> # Resizing has stopped
      $('*').removeClass "notransition"

      if $(@).width() >= 1200
        console.log "Breakpoint: desktop-up"
      else if $(@).width() >= 900
        console.log "Breakpoint: tablet-landscape-up"
      else if $(@).width() >= 600
        console.log "Breakpoint: tablet-portrait-up"
      else if $(@).width() <= 599
        console.log "Breakpoint: phone-only"
    , 250

  $("nav ul").find("a").click (event) ->
    # Go to section
    event.preventDefault() # Default behaviour disabled
    href = $(@).attr "href"
    scrollToLoc($(href) ) # Scroll to element with id

  $("[tooltip]").hover(
    ->  # MouseIn
      $(@).find(".tooltip").off() # Doesn't respond to hover
      global.timeout = setTimeout => # After some time hovering
        $(@).find(".tooltip").fadeIn global.animation
      , 500
    -> # MouseOut
      clearTimeout(global.timeout) # Cancel if leave before 500 ms
      $(@).find(".tooltip").fadeOut global.animation
  )

  $("#experience").find(".head").click -> # Only click on the top
    toggle($(@).closest(".card")[0], "experience")

  $("#skills").find(".head").click -> # Only click on the top
    toggle($(@).closest(".card")[0], "skills")

  $("#portfolio").find(".preview").hover(
    -> # MouseIn
      $(@).find(".tags").fadeTo(global.timing, 1)
    -> # MouseOut
      $(@).find(".tags").fadeTo(global.timing, 0)
  )

  $("#portfolio").find(".backward").click ->
    switchPage -1 # - 1

  $("#portfolio").find(".forward").click ->
    switchPage 1 # + 1

  $("#portfolio").find(".sort a").click ->
    global.cookie("page", 1) # Back to page 1

  $("#contact").find(".show").click ->
    setMap(true) # Set map and change = true

  $("#contact").find("form [type='text']").blur ->
    name = $(@).attr "name"
    global.cookie(name, $(@).val()) # Update in cookie

  $("[ripple]").click (event) ->
    # Edited from https://codepen.io/lehollandaisvolant/pen/dMQXYX
    $("[ripple]").find(".ripple").remove()

    posX = $(@).offset().left
    posY = $(@).offset().top
    buttonWidth = $(@).width()
    buttonHeight =  $(@).height()

    ripple = $("<span></span>").addClass "ripple"
    $(@).prepend ripple

    if buttonWidth >= buttonHeight
      buttonHeight = buttonWidth
    else
      buttonWidth = buttonHeight

    x = event.pageX - posX - buttonWidth / 2
    y = event.pageY - posY - buttonHeight / 2

    $("[ripple]").find(".ripple").css(
      width: buttonWidth
      height: buttonHeight
      top: y + 'px'
      left: x + 'px'
    ).addClass "effect"

  $("#contact").find("form").submit (event) ->
    # Handles form
    event.preventDefault() # No reloading
    $(@).find(".error").hide()

    try
      console.log "Testing input..."
      $(@).children("fieldset").find("[type='text']").each ->
        if $(@).val() == ''
          throw new Error "Input empty"

      regex = /// ^ (
        (
          [^<>()[\]\\.,;:\s@\"]+
          (\.[^<>()[\]\\.,;:\s@\"]+)*
        )
        | (\".+\")
        ) @
        (
          ( \[
            [0-9]{1,3}\.
            [0-9]{1,3}\.
            [0-9]{1,3}\.
            [0-9]{1,3}\
          ]
        )
        | (
          ([a-zA-Z\-0-9]+\.)+
          [a-zA-Z]{2,}
        )
      )$ ///

      if not regex.test $(@).find("[name='email']").val()
        throw new Error "Email incorrect"

      # If no errors have been thrown
      formdata = new FormData(@)
      console.log "Sending..."
      sendMail formdata, ((success) ->
        if success
          $(@).trigger "reset" # Empties form
          $(@).find(".error").html "Email was successfully sent"
          $(@).find(".error").fadeIn global.animation
        else
          $(@).find(".error").html "An error has occured while sending"
          $(@).find(".error").fadeIn global.animation
      ).bind @ # Will keep this in another scope

    catch error
      console.warn error
      # Error has been thrown
      if error.message == "Input empty"
        $(@).find(".error").html "Please fill out all fields"
        $(@).find(".error").fadeIn global.animation
      else if error.message == "Email incorrect"
        $(@).find(".error").html "The email entered is invalid"
        $(@).find(".error").fadeIn global.animation
      else
        $(@).find(".error").html "An unknown error occured"
        $(@).find(".error").fadeIn global.animation
