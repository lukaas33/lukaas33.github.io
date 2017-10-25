# The Js for the main page is made for readibility
# Comments explaining a codeblock are above the block
# Comments explaining lines are next to the expression
# Code groups are distinguised by << >>
# Objects are used to group functions
'use strict'

# TODO The styling of the bacteria here

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
  DPC = 72 / 2.54 # From px/inch to px/cm, asuming 72 dpi

  if needed == "scaled"
    size = value * global.constants.scaleFactor # Get the scaled value in cm
    size = size * DPC # Total size
    return size
  else if needed == "real"
    size = value / DPC # Scaled value in cm
    size = size / global.constants.scaleFactor # Real value
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

# Constructor for food
class Food
  # Values that need to be entered
  constructor: (@energy, @position) ->

# Bacteria constructors
class Lucarium
  # Values that need to be entered
  constructor: (@diameter, @energy, @position, @generation) ->
    # Values that are initialised
    @id = generate.id()
    @family = "Lucarium"

  # << Methods >>
  # Divide itself
  divide: =>

  # Creates a body
  display: =>
    # Body at instance's location
    @body = new Path.Circle(@position, Calc.scale(@diameter.value / 2))
    @body.fillColor = @color

  # Updates it's body
  update: =>
    @body.position = @position

  # Gets energy
  eat: =>

  # Changes the location
  move: =>

# Constructors that inherit code
class Viridis extends Lucarium
  constructor: ->
    # Values that are initialised
    @species = "Viridis"
    @color = '#4caf50'
    super # Call parent constructor

class Rubrum extends Lucarium
  constructor: ->
    # Values that are initialised
    @species = "Rubrum"
    @color = '#f44336'
    super # Call parent constructor

class Caeruleus extends Lucarium
  constructor: ->
    # Values that are initialised
    @species = "Caeruleus"
    @color = '#2196f3'
    super # Call parent constructor

# << Document functions >>
# Groups
simulation = {}

# Creates instances of bacteria
simulation.createLife = ->
  console.log("Creating life")
  size = new SciNum(1.0e-6, 'length', 'metre')
  energy = new SciNum(3.9e9, 'energy', 'joule')

  global.bacteria[0] = new Viridis(size, energy, new Point(view.center), 1)

# Sets up the document
simulation.setup = ->
  paper.install(window) # Don't have to acces objects via paper object
  paper.setup($('#screen')[0]) # Make use of the paperscript library

  draw.background()
  simulation.createLife()
  draw.bacteria()

# Starts simulation
simulation.start = ->
  console.log "Loaded completely"
  simulation.setup()

  # Add events to elements
  doc['$start'].find("button[name=continue]").click ->
    doc['$start'].find(".screen:first").hide() # Hide first screen
  doc['$start'].find("button[name=start]").click ->
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

# Runs simulation
simulation.run = ->

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
        bacterium.update() # Call method
, 1)
