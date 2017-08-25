'use strict'

# Main script for webste
switchPage = (change) ->
  if global.pageNum > 1
    global.previous = Number(global.cookie "page")
    newPage = global.previous + change
    newPage = global.pageNum if newPage < 1 # To the last page
    newPage = 1 if newPage > global.pageNum # To the last page
    console.log "Switching to #{newPage}"
    global.cookie("page", newPage) # Update
    setPages global.timing / 2

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

setPages = (time) ->
  global.pageNum = $("#portfolio").find(".page").length
  $pages = $("#portfolio").find ".page"
  current = Number(global.cookie "page")
  target = $pages # All will be hidden
  target = $($pages[global.previous - 1]) if global.previous != null

  target.fadeOut  # Most are hidden
    duration: time
    easing: "swing"
    complete: -> # When completed
      $($pages[current - 1]).fadeIn # Show current
        duration: time
        easing: "swing"
        complete: ->
          status = "#{current}/#{global.pageNum}"
          $("#portfolio").find(".select span").text status

disable = ->
  # Decorator for disabling buttons
  return ->
    $(@).prop("disabled", true)
    # Enables after standard animation time
    global.timeouts.switch = setTimeout =>
      $(@).prop("disabled", false)
    , global.timing

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
  # Send data via ajax
  $.ajax
    url: '/send'
    data: data
    processData: false
    contentType: false
    type: 'POST'
  .done (response) ->
    if response == "error"
      success(false) # Something didn't work
    else
      success(true) # Everything worked
      # Mail sent, cookies can be reset
      global.cookie("name", "")
      global.cookie("email", "")
      global.cookie("message", "")
  .fail ->
    success(false) # Ajax request failed

global.admin = (password) ->
  # Login via ajax
  if password? # If it is given
    $.ajax
      url: "/auth"
      data: JSON.stringify(pass: password)
      processData: false
      contentType: "application/json"
      type: 'POST'
    .done (response) ->
      if response == "success"
        console.log "You are now an admin"
      else if response == "fail"
        console.log "Login failed"
    .fail ->
      console.warn "Ajax request didn't work"
  else
    console.log "No argument given"

$ ->
  ### Actions ###
  console.log "// DOM events loading..."

  # Sets information in the DOM
  setMap()
  setForm()
  setPages(0)

  # Prevents the flashing on of the about link on load
  setTimeout ->
    highLight() # Initial highlight at start of page
    $(window).scroll -> # Sets scroll event
      highLight() # Higlight correct link
  , global.timing * 2

  ### Events ###
  $(window).on "resize", ->
    $('*').addClass "notransition"
    clearTimeout(resize)
    global.timeouts.resize = setTimeout -> # Resizing has stopped
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
    scrollToLoc($(href)) # Scroll to element with id

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

  $("[tooltip]").hover(
    ->  # MouseIn
      $(@).find(".tooltip").off() # Doesn't respond to hover
      global.timeouts.hover = setTimeout => # After some time hovering
        $(@).find(".tooltip").fadeIn global.animation
      , 500
    -> # MouseOut
      clearTimeout(global.timeouts.hover) # Cancel if leave before 500 ms
      $(@).find(".tooltip").fadeOut global.animation
  )

  $("#portfolio").find(".backward").click ->
    switchPage -1
    disable() # Temporarily disables

  $("#portfolio").find(".forward").click ->
    switchPage 1
    disable() # Temporarily disables

  $("#portfolio").find(".sort a").click ->
    global.cookie("page", 1) # Back to page 1

  $("#contact").find(".show").click ->
    setMap(true) # Set map and change = true
    disable() # Temporarily disables

  $("#contact").find("form [type='text']").blur ->
    name = $(@).attr "name"
    global.cookie(name, $(@).val()) # Update in cookie

  $("[ripple]").click (event) ->
    # Edited from https://codepen.io/lehollandaisvolant/pen/dMQXYX
    if not $(@).prop("disabled")
      $("[ripple]").find(".ripple").remove() # Previous

      width = $(@).width()
      height =  $(@).height()

      ripple = $("<span></span>").addClass "ripple"
      $(@).prepend ripple

      if width >= height
        height = width
      else
        width = height

      x = event.pageX - $(@).offset().left - width / 2
      y = event.pageY - $(@).offset().top - height / 2

      $("[ripple]").find(".ripple").css(
        width: width
        height: height
        top: "#{y}px"
        left: "#{x}px"
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
