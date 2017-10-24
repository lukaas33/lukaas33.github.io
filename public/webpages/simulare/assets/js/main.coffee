# The Js for the main page is made for readibility
# Comments explaining a codeblock are above the block
# Comments explaining lines are next to the expression
# Code groups are distinguised by << >>
# Objects are used to group functions
'use strict'

# TODO use css styling rules here, like colors

# << Variables >>
# Group
doc = {}
local = {}

doc['$start'] = $("#start")

# << Return functions >>
# Groups
Calc = {}
generate = {}
time = {}

# Returns the value according to a scale
Calc.scale = (value, needed = 'scaled') ->
  if needed == "scaled"
    size = value * global.constants.scaleFactor # Get the scaled value
    return "#{size}cm" # Return the value in cm
  else if needed == "real"
    value = parseInt(value) # Get value in cm without unit
    size = value / global.constants.scaleFactor # Real value
    return size

# Creates unique id
generate.id = ->
  return "id"

# Returns the time that the animation has been running
time.now = ->
  return 'time'

# << Constructors >>
# Constructor for scientific numbers
class SciNum
  # Values that need to be entered
  constructor: (@value, @quantity, @unit) ->

# Bacteria constructors
class Lucarium
  # Values that need to be entered
  constructor: (@diameter, @position, @generation) ->

  # Values that are initialised
  @id: generate.id()
  @family: "Lucarium"

# Constructors that inherit code
class Viridis extends Lucarium
  # Values that are initialised
  @species: "Viridis"
  @color: '#4caf50'

class Rubrum extends Lucarium
  # Values that are initialised
  @species: "Rubrum"
  @color: '#f44336'

class Caeruleus extends Lucarium
  # Values that are initialised
  @species: "Caeruleus"
  @color: '#2196f3'

# << Methods >>
# Constructor methods
Lucarium::divide = ->

Lucarium::display = ->
  # Body at instance's location
  @body = new Path.Circle(@position, Calc.scale(@diameter / 2))
  @body.fillColor = @color

Lucarium::update = ->


Lucarium::move = ->

Lucarium::eat = ->

# << Document functions >>
# Groups
simulation = {}

# Creates instances of bacteria
simulation.createLife = ->
  console.log("Creating life")
  global.bacteria[0] = new Viridis(1.0e-6, view.center, 1)

# Sets up the document
simulation.setup = ->
  paper.install(window) # Don't have to acces objects via paper object
  paper.setup($('#screen')[0]) # Make use of the paperscript library

  draw.background()
  simulation.createLife()

# Starts simulation
simulation.start = ->
  console.log "Loaded completely"
  simulation.setup()

  # Add events to elements
  doc['$start'].find(".continue button[name=continue]").click ->
    doc['$start'].find(".screen:first").hide() # Hide first screen
  doc['$start'].find(".continue button[name=start]").click ->
    doc['$start'].hide() # Hide complete screen

  $input = doc['$start'].find(".slider")
  $input.each( ->
    # Initial value
    global.enviroment[@name] = new SciNum(@value, @name, @dataset.unit)
    # Update the variables on change
    $(@).change ->
      global.enviroment[@name] = new SciNum(@value, @name, @dataset.unit)
  )

  $("#loading").hide() # Hide loading screen

# << Simulation functions >>
# Groups
draw = {}

# Draws the background
draw.background = ->
  bottomLayer = new Path.Rectangle(new Point(0, 0), view.viewSize)
  bottomLayer.fillColor = 'grey'

draw.bacteria = ->
  for bacterium in global.bacteria
    bacterium.display()

# Checks if loading is done
isLoaded = setInterval( ->
  if global.interaction.loaded
    # << Actions >>
    simulation.start()
    clearInterval(isLoaded)

    # << Events >>
    # When canvas is resized
    view.onResize = (event) ->
      console.log "Resized canvas"

    # Every frame of the canvas
    view.onFrame = (event) ->
      # Loop through the bacteria
      for bacterium in global.bacteria
        bacterium.update() # Call display method
, 1)
