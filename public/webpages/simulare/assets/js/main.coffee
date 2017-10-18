# The Js for the main page is made for readibility
# Comments explaining a block are above the code block
# Comments explaining lines are next to the expression

# Constructor for scientific numbers
class SciNum
  constructor: (@value, @quantity, @unit) ->

# Starts simulation
start = ->
  console.log "Loaded completely"

  $start = $("#start")
  # Add events to elements
  $start.find(".continue:first").click ->
    $start.find(".screen:first").hide() # Hide first screen
  $start.find(".continue:last").click ->
    $start.hide() # Hide complete screen

  $input = $start.find(".slider")
  $input.each( ->
    # Initial value
    global.enviroment[@name] = new SciNum(@value, @name, @dataset.unit)
    # Update the variables on change
    $(@).change ->
      global.enviroment[@name] = new SciNum(@value, @name, @dataset.unit)
  )

  $("#loading").hide() # Hide loading screen




# Checks if loading is done
isLoaded = setInterval ->
  if global.interaction.loaded
    start()
    clearInterval(isLoaded)
, 1
