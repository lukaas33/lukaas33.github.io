'use strict'

### Functions ###
sinceDate = (date) ->
  # Calculates time since date
  milli = 8.64e7 # Milliseconds in a day
  today = new Date Date.now() # Right now as object
  date = new Date date.toUTCString() # Convert to UTC
  today = new Date today.toUTCString() # Convert to UTC
  offset = today.getTime() - date.getTime()  # Difference with 1970-01-01 in UTC
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
      date.find(".tooltip").html "Ended #{sinceDate begin} ago"
    else
      date.find(".end").text end # Set text to the string
      date.find(".tooltip").html "Started #{sinceDate begin} ago"

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
    $wrapper = $("<div></div>").addClass "wrapper"
    $wrapper.append $page
    $portfolio.append $wrapper

setPages = (time) ->
  $pages = $("#portfolio").find ".page"
  current = Number(global.cookie "page")
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
          $("#portfolio .select").find("span").text current

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
