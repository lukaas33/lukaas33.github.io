'use strict'

# Main script for webste
setForm = ->
  $form = $("#contact").find "form"
  $form.find("input[name='name']").val(global.cookie "name")
  $form.find("input[name='email']").val(global.cookie "email")
  $form.find("textarea").val(global.cookie "message")

setPages = (time) ->
  $pages = $("#portfolio").find ".page"
  global.pageNum = $pages.length
  current = Number(global.cookie "page")
  if global.previous == null
    target = $pages # All will be hidden
  else
    target = $($pages[global.previous - 1]) # Last one will be hidden

  target.fadeOut  # Most are hidden
    duration: time
    easing: "swing"
    complete: -> # When completed
      $($pages[current - 1]).fadeIn # Show current
        duration: time
        easing: "swing"
        complete: ->
          status = "#{current}/#{global.pageNum}"
          $("#portfolio").find(".select p span").text status

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

  # Actions based on map's current value and if it should be changed
  if global.cookie("map")
    if change then setOff(global.timing / 2) else setOn(0)
  else
    if change then setOn(global.timing / 2) else setOff(0)

disable = ->
  $(@).prop("disabled", true)
  # Enables after standard animation time
  setTimeout =>
    $(@).prop("disabled", false)
  , global.timing

switchPage = (change) ->
  if global.pageNum > 1
    global.previous = Number(global.cookie "page")
    newPage = global.previous + change # Adds or subtracks one
    if newPage < 1
      newPage = global.pageNum # To the last page
    else if newPage > global.pageNum
      newPage = 1  # To the first page
    console.log "Switching to #{newPage}"

    global.cookie("page", newPage) # Update
    setPages global.timing / 2

highLight = ->
  # Highlights items in the menu bar
  $li = $("nav ul li")
  $li.removeClass "focus" # Removes the focus each time
  $li.next().removeClass "show"
  position = $(window).scrollTop() # Current scroll position
  calcTop = (element) ->
    # Adds margin to the scroll position
    top = Math.round element.offset().top + element.height()
    location = top - parseInt(element.css "margin-bottom") - $("nav").height()
    return  location # When fully visible

  # Higlights navitem based on position in screen
  if position <= calcTop $("#about")
    $($li[0]).addClass "focus"
    $($li[1]).addClass "show"
  else if position <= calcTop $("#experience")
    $($li[1]).addClass "focus"
    $($li[2]).addClass "show"
  else if position <= calcTop $("#skills")
    $($li[2]).addClass "focus"
    $($li[3]).addClass "show"
  else if position <= calcTop $("#portfolio")
    $($li[3]).addClass "focus"
    $($li[4]).addClass "show"
  else if position <= calcTop $("#contact")
    $($li[4]).addClass "focus"

scrollToLoc = (section) ->
  # Scrolls to a section
  bottom = Math.round section.offset().top # Is at the bottom of the element
  location = bottom - parseInt(section.css "margin-top")  - $("nav").height()
  $("html, body").animate(
    scrollTop: location, # Fully visible
      duration: global.timing * 2 # Double the standard time
      easing: "swing" # Animate with swing easing
  )

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
      global.cookie("name", null)
      global.cookie("email", null)
      global.cookie("message", null)
  .fail ->
    success(false) # Ajax request failed

$ ->
  ### Actions ###
  console.log "// DOM value setup loading..."
  # Sets information in the DOM
  setMap(false)
  setForm()
  setPages(0)
  $("body").css(visibility: 'initial') # Shows page

  console.log "// DOM events loading..."
  # Prevents the flashing on of the about link on load
  setTimeout ->
    highLight() # Initial highlight at start of page

    $(window).scroll -> # Sets scroll event
      highLight() # Higlight correct link

  , (global.timing * 2)

  ### Events ###
  $(window).on "resize", ->
    if $(@).width() >= 1200
      console.log "Breakpoint: desktop-up"
    else if $(@).width() >= 900
      console.log "Breakpoint: tablet-landscape-up"
    else if $(@).width() >= 600
      console.log "Breakpoint: tablet-portrait-up"
    else if $(@).width() <= 599
      console.log "Breakpoint: phone-only"

    $('*').addClass "notransition" # Animation time for this class is 0
    clearTimeout(global.timeouts.resize)
    global.timeouts.resize = setTimeout -> # Resizing has stopped
      $('*').removeClass "notransition"
    , 250 # Takes some time

  $("nav ul").find("a").click (event) ->
    # Go to section
    event.preventDefault() # Default behaviour disabled
    href = $(@).attr "href"
    scrollToLoc($(href)) # Scroll to element with id

  $("#experience").find(".head").click -> # Only click on the top
    toggle($(@).parents(".card"), "experience")

  $("#skills").find(".head").click -> # Only click on the top
    toggle($(@).parents(".card"), "skills")

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
    scrollToLoc $("#portfolio") # Scroll into view
    disable.apply(@) # Temporarily disables button

  $("#portfolio").find(".forward").click ->
    switchPage 1
    scrollToLoc $("#portfolio") # Scroll into view
    disable.apply(@) # Temporarily disables button

  $("#portfolio").find(".sort a").click ->
    global.cookie("page", 1) # Back to page 1

  $("#contact").find(".show").click ->
    setMap(true) # Set map and change = true
    disable.apply(@) # Temporarily disables button

  $("#contact").find("form [type='text']").blur ->
    name = $(@).attr "name"
    global.cookie(name, $(@).val()) # Update in cookie

  $("[ripple]").click (event) ->
    # Edited from https://codepen.io/lehollandaisvolant/pen/dMQXYX
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

      # Regex for email checking
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
      # Check with value
      if not regex.test $(@).find("[name='email']").val()
        throw new Error "Email incorrect"

      # If no errors have been thrown
      formdata = new FormData(@) # Store form
      console.log "Sending..."
      sendMail formdata, ((success) ->
        # Reacts to ajax callback value
        if success
          $(@).trigger "reset" # Empties form
          $(@).find(".error").html "Email was successfully sent"
          .fadeIn global.animation
        else
          $(@).find(".error").html "An error has occured while sending"
          .fadeIn global.animation
      ).bind @ # Will keep this in another scope

    catch error
      console.warn error
      # Error has been thrown
      if error.message == "Input empty"
        $(@).find(".error").html "Please fill out all fields"
        .fadeIn global.animation
      else if error.message == "Email incorrect"
        $(@).find(".error").html "The email entered is invalid"
        .fadeIn global.animation
      else
        $(@).find(".error").html "An unknown error occured"
        .fadeIn global.animation
