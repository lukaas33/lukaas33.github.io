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

# Get elements with these id's
for id in ['start', 'screen', 'field']
  doc[id] = $("##{id}")

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
    @maxSpeed = 0
    @acceleration = 0

  # << Methods >>
  # Creates a body
  display: =>
    # Body at instance's location
    @body = new Path.Circle(@position.round(), Calc.scale(@diameter.value / 2))
    @body.fillColor = @color

  # Updates its body
  update: =>
    @body.position = @position.round()

  # Starts moving
  # move: =>
  #   # Pseudocode:
  #   # speedvector + accelerationvector
  #   # location + speedvector
  #   # accelerationvector = 0 if speedvector = maxSpeed

  # # Divide itself
  # divide: =>

  # # Dies
  # die: =>

  # # Gets energy
  # eat: =>


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
html = {}

# Sets the size variables
html.setSize = ->
  width = doc.field.width()
  height = doc.field.height()
  # Local variables
  local.width = width
  local.height = height
  local.center = new Point(width / 2, height / 2)
  local.size = new Size(width, height)
  local.origin = new Point(0, 0)

# Creates instances of bacteria
simulation.createLife = ->
  console.log("Creating life")
  size = new SciNum(1.0e-6, 'length', 'metre')
  energy = new SciNum(3.9e9, 'energy', 'joule')

  global.bacteria[0] = new Viridis(size, energy, local.center, 1)

# Sets up the document
simulation.setup = ->
  paper.install(window) # Don't have to acces objects via paper object
  paper.setup(doc.screen[0]) # Make use of the paperscript library
  html.setSize() # Initial value

  draw.background()
  simulation.createLife()
  draw.bacteria()

# Starts simulation
simulation.start = ->
  console.log "Loaded completely"
  simulation.setup()

  # Add events to elements
  doc.start.find("button[name=continue]").click ->
    doc.start.find(".screen:first").hide() # Hide first screen
  doc.start.find("button[name=start]").click ->
    doc.start.hide() # Hide complete screen

  input = doc.start.find(".slider")
  input.each( ->
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
  draw.bottom = new Path.Rectangle(local.origin, local.size)
  draw.bottom.fillColor = 'grey'
  draw.bubbles = []
  bubbleValues = [ # Stores info for the bubbles
    {position: [350, 200], size: 30}
    {position: [100, 300], size: 50}
  ]

  for value, index in bubbleValues # Every value
    draw.bubbles[index] = new Path.Circle(value.position, value.size / 2)
    draw.bubbles[index].fillColor = 'darkgrey'

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
    # Every frame of the canvas
    view.onFrame = (event) ->
      # Loop through the bacteria
      for bacterium in global.bacteria
        bacterium.update() # Call method

    # Paper.js canvas resize event
    view.onResize = (event) ->
      previous = local.size # Before resizing
      html.setSize() # Update size variables

      # Scale by a factor of intended width / real width
      draw.bottom.scale( # Don't know why times 2 but it works don't touch it
        (local.width / draw.bottom.bounds.width) * 2,
        (local.height / draw.bottom.bounds.height) * 2
      )
      draw.bottom.position = local.origin # Rectangle is updated

      for bubble in draw.bubbles
        scaledPosition = new Point( # Scale the position of the bubbles
          x: (bubble.position.x / previous.width) * local.size.width
          y: (bubble.position.y / previous.height) * local.size.height
        )
        bubble.position = scaledPosition # Update position
, 1)
