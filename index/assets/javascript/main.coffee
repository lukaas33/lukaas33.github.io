### Don't edit js file, edit coffeescript and upload created Js file ###

cookie = (name, value) ->
  # Gets and sets cookies
  cookies = document.cookie.split ';'
  if value == undefined
    for value in cookies
      current = value.split '='
      if  current[0].trim() == name # Checks if this is the target
        return current[1]
  else
    console.log "Set cookie #{name} to #{value}"
    document.cookie = "#{name}=#{value}; path=/"

### Variables ###
# Cookies have to be initialised
cookie("map", off) if cookie("map") == undefined
cookie("page", 1) if cookie("page") == undefined
cookie("name", "") if cookie("name") == undefined
cookie("email", "") if cookie("email") == undefined
cookie("message", "") if cookie("message") == undefined

state = # Not a cookie because it's an object
  "experience": null
  "skills": null
timing = 400 # Default time for animations
timeout = null # Tracks timeout in tooltip
num = 0 # Tracks number of pages
previous = null # Tracks previous page index

### Functions ###
highLight = () ->
  # Highlights items in the menu bar
  $li = $("nav ul li").find "a"
  $li.removeClass "focus" # Removes the focus each time
  position = $(window).scrollTop()
  calcTop = (element) ->
    # Adds margin to the scroll position
    top = Math.round element.offset().top + element.height()
    location = top - parseInt(element.css "margin-bottom") - $("nav").height()
    return  location # When fully visible

  # Higlights navitem based on position in screen
  if position <= calcTop $("#about")
    $($li[0]).addClass "focus"
  else if position < calcTop $("#experience")
    $($li[1]).addClass "focus"
  else if position < calcTop $("#skills")
    $($li[2]).addClass "focus"
  else if position < calcTop $("#portfolio")
    $($li[3]).addClass "focus"
  else if position < calcTop $("#contact")
    $($li[4]).addClass "focus"

scrollToLoc = (section) ->
  # Scrolls to a section
  top = Math.round section.offset().top
  location = top - parseInt(section.css "margin-top")  - $("nav").height()
  $("html, body").animate
    scrollTop: location # Fully visible
    {
      duration: timing * 2 # Double the standard time
      easing: "swing" # Animate with swing easing
    }

toggle = (card, active) ->
  # Collapses and extends cards
  animate = (card) ->
    $collapse = $(card).find ".collapse"
    $collapse.slideToggle
      duration: timing
      easing: "swing" # Animate with swing easing

  # If this card isn't selected
  if state[active] != card or state[active] == null
    animate state[active] # Toggle previous
    state[active] = card # Update
    animate card # Toggle new

  # If already selected
  else if state[active] == card
    animate state[active] # Toggle previous
    state[active] = null

sinceDate = (date) ->
  # Calculates time since date
  milli = 86400000 # Milliseconds in a day
  today = Date.now() # Right now in milliseconds since 1970-01-01
  offset = today - date.getTime()  # Difference with 1970-01-01

  days = offset / milli
  years = days / 365.25

  # Returns as integer with unit
  if days < 2
    return String(Math.floor days) + " day"
  else if years < 1
    return String(Math.floor days) + " days"
  else if years < 2
    return String(Math.floor years) + " year"
  else
    return String(Math.floor years) + " years"

setDate = (dates) ->
  # Sets the date elements
  for date in dates
    date = $(date)
    begin = date.find(".begin").attr "date" # Get string date
    end = date.find(".end").attr "date" # Get string

    begin = new Date begin # Convert to date format
    date.find(".begin").text begin.getFullYear() # Set text to the year

    if end != "now" # If the string is not "current" convert to date
      end = new Date end
      date.find(".end").text end.getFullYear() # Set text to the year
      date.find(".tooltip").html "ended #{sinceDate begin} ago"
    else
      date.find(".end").text end # Set text to the string
      date.find(".tooltip").html "started #{sinceDate begin} ago"

setBox = () ->
  # Creates borders for all elements Called by console
  $('*').css border: "1px solid grey"

setMap = (change) ->
  # Toggles and initialises map
  $map = $("#contact .card").find ".map"
  $data = $("#contact .card:nth-child(1)").find ".text"
  $button = $("#contact .card").find ".show"

  setOff = (time) ->
    # Sets map to off
    console.log "Map hidden"
    $map.fadeOut
      duration: time
      easing: "swing"
      complete: -> # After complete
        $button.text "Show map"
        $data.fadeIn duration: time, easing: "swing"
        cookie("map", off)

  setOn = (time) ->
    # Sets map to on
    console.log "Map shown"
    $data.fadeOut
      duration: time
      easing: "swing"
      complete: -> # After complete
        $button.text "Hide map"
        $map.fadeIn duration: time, easing: "swing"
        cookie("map", on)

  # Actions based on map cookie and if the cookie should be changed
  if cookie("map") == "true"
    if change
      setOff(timing / 2) # When clicked
    else
      setOn(0) # Before page is loaded
  else if cookie("map") == "false"
    if change
      setOn(timing / 2) # When clicked
    else
      setOff(0) # Before page is loaded

setForm = () ->
  $form = $("#contact form")
  $form.find("input[name='name']").val(cookie "name")
  $form.find("input[name='email']").val(cookie "email")
  $form.find("textarea").val(cookie "message")

setProjects = () ->
  # Divide projects into pages
  $portfolio = $("#portfolio .content")
  $content = $portfolio.find ".container"
  num = Math.ceil $content.length / 9 # Sets num
  for page in [1...(num + 1)] # Range of number pages
    $page = $("<div></div>").addClass "page"
    $page.attr("num", page)
    last = 9 * page # For page one the last index will be 9, for page two 18
    for card in [(last - 9)..last] # Range of 9
      $page.append $content[card]
    $portfolio.append $page

setPages = (time) ->
  $pages = $("#portfolio").find ".page"
  current = parseInt(cookie "page")
  target = $pages
  if previous != null # There has been clicked before
    target = $($pages[previous - 1])

  target.fadeOut  # Most are hidden
    duration: time
    easing: "swing"
    complete: -> # When completed
      $($pages[current - 1]).fadeIn # Show current
        duration: time
        easing: "swing"
        complete: ->
          $("#portfolio .select p").find("span").text current

switchPage = (change) ->
  previous = parseInt(cookie "page")
  newPage = previous + change
  newPage = num if newPage < 1 # To the last page
  newPage = 1 if newPage > num # To the last page
  console.log "Switching to #{newPage}"
  cookie("page", newPage) # Update
  setPages timing

setDoc = () ->
  # Sets some values in the document
  for since in $(".since")
    $(since).html sinceDate new Date($(since).attr "date") # Sets all date spans
  setDate($("#experience .card").find ".date") # Set for all date classes

  setMap false # Initial value of map
  setForm() # Set previous value saved in cookie
  setProjects() # Sets up page system
  setPages 0 # Sets the pages initial value

$ ->
  # When document is ready
  ### Events ###
  $("nav ul li").find("a").click (event) ->
    # Go to section
    event.preventDefault() # Default behaviour disabled
    href = $(this).attr "href"
    scrollToLoc($(href) ) # Scroll to element with id

  $(".tooltip").parent().hover(
    ->  # MouseIn
      $(this).find(".tooltip").off() # Doesn't respond to hover
      timeout = setTimeout => # After some time hovering
        $(this).find(".tooltip").fadeIn duration: timing, easing: "swing"
      , 500
    -> # MouseOut
      clearTimeout(timeout) # Cancel if leave before 500 ms
      $(this).find(".tooltip").fadeOut duration: timing, easing: "swing"
  )

  $("#experience .card").find(".head").click -> # Only click on the top
    toggle($(this).closest(".card")[0], "experience")

  $("#skills .card").find(".head").click -> # Only click on the top
    toggle($(this).closest(".card")[0], "skills")

  $("#portfolio .preview").hover(
    -> # MouseIn
      $(this).find(".tags").fadeIn duration: timing, easing: "swing"
    -> #MouseOut
      $(this).find(".tags").fadeOut duration: timing, easing: "swing"
  )

  $("#portfolio .select").find(".backward").click ->
    switchPage -1 # - 1

  $("#portfolio .select").find(".forward").click ->
    switchPage 1 # + 1

  $("#portfolio .sort").find("a").click ->
    cookie("page", 1) # Back to page 1

  $("#contact form").find("input[type='text']").blur ->
    name = $(this).attr "name"
    cookie(name, $(this).val()) # Update in cookie

  $("#contact form").find("textarea").blur ->
    name = $(this).attr "name"
    cookie(name, $(this).val()) # Update in cookie

  $("#contact form").find("input[type='submit']").click ->
    # Message has been sent, cookies should be emptied
    cookie("name", "")
    cookie("email", "")
    cookie("message", "")

  $("#contact .card").find(".show").click ->
    setMap(true) # Set map and change = true

  ###Actions ###
  setTimeout -> # Prevents the flashing on of the about link on load
    highLight() # Initial highlight at start of page
    $(window).scroll -> # Sets scroll event
      highLight() #Higlight correct link
  , timing * 2
  setDoc() # Set values
  $("body").show() # After all actions are completed body is shown