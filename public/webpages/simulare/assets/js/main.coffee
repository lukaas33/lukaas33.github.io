# The Js for the main page is made for readibility
# Comments explaining a codeblock are above the block
# Comments explaining lines are next to the expression
# Code groups are distinguised by << >>

# << Variables >>

# << Return functions >>
generateId = ->
  return "id"

# << Constructors >>
# Constructor for scientific numbers
class SciNum
  # Values that need to be entered
  constructor: (@value, @quantity, @unit) ->

# Bacteria constructors
class Lucarium
  # Values that need to be entered
  constructor: (@mass, @position) ->

  # Values that are initialised
  @id: generateId()
  @family: "Lucarium"

# Constructors that inherit code
class Viridis extends Lucarium
  # Values that are initialised
  @species: "Viridis"

class Rubrum extends Lucarium
  # Values that are initialised
  @species: "Rubrum"

class Caeruleus extends Lucarium
  # Values that are initialised
  @species: "Caeruleus"

# << Methods >>
# Constructor methods
Lucarium::divide = ->

Lucarium::display = ->

Lucarium::move = ->

Lucarium::eat = ->

# << Document functions >>
# Starts simulation
start = ->
  console.log "Loaded completely"

  $start = $("#start")
  # Add events to elements
  $start.find(".continue button[name=continue]").click ->
    $start.find(".screen:first").hide() # Hide first screen
  $start.find(".continue button[name=start]").click ->
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

# << Simulation functions >>

# << Actions >>
# Checks if loading is done
isLoaded = setInterval ->
  if global.interaction.loaded
    start()
    clearInterval(isLoaded)
, 1
