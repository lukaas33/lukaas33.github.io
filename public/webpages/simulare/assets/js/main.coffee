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

doc['$canvas'] = $("#screen")
doc['$start'] = $("#start")

# << Return functions >>
# Groups
Calc = {}
generate = {}
time = {}

# Creates unique id
generate.id = ->
  return "id"

time.now = ->

# << Constructors >>
# Constructor for scientific numbers
class SciNum
  # Values that need to be entered
  constructor: (@value, @quantity, @unit) ->

# Bacteria constructors
class Lucarium
  # Values that need to be entered
  constructor: (@diameter, @position, @generation, @birthTime) ->

  # Values that are initialised
  @id: generate.id()
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
# Groups
simulation = {}

# Creates instances of bacteria
simulation.createLife = ->
  global.bacteria[0] = new Viridis(1.0e-9, new Point(), 1, time.now())

# Sets up the document
simulation.setup = ->
  paper.install(window) # Don't have to acces objects via paper object
  paper.setup(doc['$canvas'][0]) # Make use of the paperscript library

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
  bottomLayer = new Path.Rectangle(new Point(0, 0), view.size)
  bottomLayer.fillColor = 'grey'

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

, 1)
