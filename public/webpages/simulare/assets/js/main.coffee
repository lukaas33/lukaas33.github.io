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
for id in ['start', 'screen', 'field', 'menu', 'priority']
  doc[id] = $("##{id}")
# Store these selections
doc.menuItems = doc.menu.find('.item button')
doc.clock = doc.priority.find('.clock p')

# << Return functions >>
# Groups
Calc = {}
Random = {}
generate = {}
time = {
  time: 0
}

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

# Returns value in range
Random.value = (bottom, top) ->
  middle = top - bottom
  value = (Math.random() * middle) + bottom
  return value

# Creates unique id
generate.id = ->
  return "id"

# << Constructors >>
# Constructor for scientific numbers
class SciNum
  # Values that need to be entered
  constructor: (@value, @quantity, @unit) ->

# Constructor for food
class Food
  # Values that need to be entered
  constructor: (@energy, @position) ->
    @diameter = Random.value(0.3e-6, 0.5e-6)
    @radius = @diameter / 2

  # Creates the particle
  display: =>
    @particle = new Path.Circle(@position, Calc.Scale(@radius))
    @particle.fillColor = 'yellow'

  # # Gets eaten
  # eaten: =>

# Bacteria constructors
class Lucarium
  # Values that need to be entered
  constructor: (@diameter, @energy, @position, @generation, @birth) ->
    # Values that are initialised
    @id = generate.id()
    @family = "Lucarium"
    @maxSpeed = new SciNum(@diameter.value * 2, 'speed', 'm/s')
    @radius = new SciNum(@diameter.value / 2, 'length', 'm')
    @acceleration = 0
    @speed = 0

  # Methods
  # Creates a body
  display: =>
    # Body at instance's location
    @body = new Path.Circle(@position.round(), Calc.scale(@radius.value))
    @body.fillColor = @color

  # Updates its body
  update: =>
    bodyRadius = (@body.bounds.width / 2)
    # Check if in field TODO, change direction
    if @position.x + bodyRadius > local.width
      @position.x = local.width - bodyRadius # Stay inside field
    else if @position.x - bodyRadius < 0
      @position.x = bodyRadius # Stay inside field
    if @position.y + bodyRadius > local.height
      @position.y = local.height - bodyRadius # Stay inside field
    else if @position.y - bodyRadius < 0
      @position.y = bodyRadius # Stay inside field

    @body.position = @position.round() # Change position

  # Gets older
  ages: =>
    @age = new SciNum((time.time - @birth) / 1000, 'time', 's')

  # Starts moving
  move: =>
    @speed.value += @acceleration.value if @acceleration.value != null
    @acceleration.value = null if @speed.value >= @maxSpeed.value
    @location += Calc.scale(@speed.value) # Change position with scaled value

  chooseDirection: =>

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

# Updates the screen clock
html.clock = ->
  # Set values, from https://goo.gl/P14JkU
  total = time.time / 1000
  hours = Math.floor(total / 3600)
  minutes = Math.floor(total % 3600 / 60)
  seconds = Math.floor(total % 3600 % 60)

  # Format a timestring
  form = (number) ->
    string = String(number)
    if string.length == 1
      string = "0#{string}"
    return string

  # Loop through the parts of the clock
  doc.clock.find('span').each( ->
    if $(@).hasClass('hour')
      @.textContent = form(hours)
    else if $(@).hasClass('minute')
      @.textContent = form(minutes)
    else if $(@).hasClass('second')
      @.textContent = form(seconds)
  )

# Pauses the simulation
html.pause = ->
  icon = $("button[name=pause] img")
  if global.pauzed # Unpauze
    global.pauzed = false
    icon.attr('src', 'assets/images/icons/ic_pause_black_24px.svg')
  else # Pauze
    global.pauzed = true
    icon.attr('src', 'assets/images/icons/ic_play_arrow_black_24px.svg')

# Creates instances of bacteria
simulation.createLife = ->
  console.log("Creating life")
  size = new SciNum(1.0e-6, 'length', 'm')
  energy = new SciNum(3.9e9, 'energy', 'j')

  global.bacteria[0] = new Viridis(size, energy, local.center, 1, 0)

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
    simulation.run()

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
  global.pauzed = false # Unpauze time

# << Simulation functions >>
# Groups
draw = {}

# Draws the background
draw.background = ->
  # Background objects
  draw.bottom = new Path.Rectangle(local.origin, local.size)
  draw.bottom.fillColor = 'grey'
  draw.bubbles = []
  bubbleValues = [ # Th info for the bubbles
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
    clearInterval(isLoaded) # End itself from rechecking

    # << Events >>
    # Update simulated time
    time.clock = setInterval( ->
      if not global.pauzed # Time is not pauzed
        time.time += 1 # Update time
    , 1)

    # Every full second
    time.second = setInterval( ->
      if not global.pauzed # Time is not pauzed
        html.clock()
        # Loop through the bacteria
        for bacterium in global.bacteria
          bacterium.ages() # Call method
    , 1000)

    # Every frame of the canvas
    view.onFrame = (event) ->
      # Loop through the bacteria
      for bacterium in global.bacteria
        bacterium.move() # Change
        bacterium.update() # Update position

    # Paper.js canvas resize event
    view.onResize = (event) ->
      previous = local.size # Before resizing
      html.setSize() # Update size variables

      # Scale by a factor of intended width / real width
      draw.bottom.scale( # Don't know why times 2 but it works, don't touch it
        (local.width / draw.bottom.bounds.width) * 2,
        (local.height / draw.bottom.bounds.height) * 2
      )
      draw.bottom.position = local.origin # Rectangle is updated

      # Scale the position of the bacteria
      for bacterium in global.bacteria
        scaledPosition = new Point( # Scale the position of the bubbles
          x: (bacterium.position.x / previous.width) * local.size.width
          y: (bacterium.position.y / previous.height) * local.size.height
        )
        bacterium.position = scaledPosition.round() # Update position

      for bubble in draw.bubbles
        scaledPosition = new Point( # Scale the position of the bubbles
          x: (bubble.position.x / previous.width) * local.size.width
          y: (bubble.position.y / previous.height) * local.size.height
        )
        bubble.position = scaledPosition.round() # Update position

    # The menu events
    doc.menuItems.each( ->
      $(@).click ->
        switch @.name # Different name attributes
          when "volume" then null
          when "pause"
            html.pause()
          when "card" then null
          when "view" then null
          when "info" then null
    )
, 1)
