### Functions ###
sinceDate = (date) ->
  # Calculates time since date
  milli = 8.64e7 # Milliseconds in a day
  today = Date.now() # Right now in milliseconds since 1970-01-01
  offset = today - date.getTime()  # Difference with 1970-01-01

  days = offset / milli
  years = days / 365.2425

  # Returns as integer with unit
  if days < 2
    return "#{String(Math.floor days)} day"
  else if years < 1
    return "#{String(Math.floor days)} days"
  else if years < 2
    return "#{String(Math.floor years)} year"
  else
    return "#{String(Math.floor years)} years"

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

setProjects = ->
  # Divide projects into pages
  $portfolio = $("#portfolio .content")
  $content = $portfolio.find ".container"
  global.pageNum = Math.ceil $content.length / 9 # Sets number of pages
  for page in [1...(global.pageNum + 1)] # Range of number pages
    $page = $("<div></div>").addClass "page" # Create element
    $page.attr("num", page)
    last = 9 * page # For page one the last index will be 9, for page two 18

    for card in [(last - 9)..last] # Range of 9
      $page.append $content[card]
    $portfolio.append $page

setPages = (time) ->
  $pages = $("#portfolio").find ".page"
  current = parseInt(global.cookie "page")
  target = $pages
  target = $($pages[global.previous - 1]) if global.previous != null

  target.fadeOut  # Most are hidden
    duration: time
    easing: "swing"
    complete: -> # When completed
      $($pages[current - 1]).fadeIn # Show current
        duration: time
        easing: "swing"
        complete: ->
          $("#portfolio .select p").find("span").text current

setDoc = ->
  # Sets some values in the document TODO Use ejs for this
  for since in $(".since")
    $(since).html sinceDate new Date($(since).attr "date") # Sets all date spans
  setDate($("#experience .card").find ".date") # Set for all date classes

  setProjects() # Sets up page system
  setPages 0 # Sets the pages initial value

$ ->
  ### Actions ###
  console.log "// DOM setup via Js loading..."

  setDoc() # Set values

  if 'serviceWorker' of navigator
    # Enable the service worker
    navigator.serviceWorker.register(
      "serviceworker.js"
    ).then (registration) ->
      console.log "SW registration successfull"
    , (error) ->
      console.warn "SW registration failed: #{error}"
