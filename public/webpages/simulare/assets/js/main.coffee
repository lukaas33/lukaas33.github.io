# The Js for the main page is made for readibility
# Comments explaining a codeblock are above the block
# Comments explaining lines are next to the expression
# Code groups are distinguised by << >>
# Objects are used to group functions

# TODO The styling of the bacteria here

# << Variables >>
# Group
doc = {}
local =
  resolution: 72 # No way to get this
  fps: 30 # Standard for canvas

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
  DPC = local.resolution / 2.54 # From px/inch to px/cm

  if needed == "scaled"
    size = value * global.constants.scaleFactor # Get the scaled value in cm
    size = size * DPC # Total size
    return size
  else if needed == "real"
    size = value / DPC # Scaled value in cm
    size = size / global.constants.scaleFactor # Real value
    return size

# Combines the vectors in both axis
Calc.combine = (vector) ->
  # Uses a^2 + b^2 = c^2
  result = Math.sqrt(vector.x**2 + vector.y**2)

# Returns value in range
Random.value = (bottom, top) ->
  middle = top - bottom
  value = (Math.random() * middle) + bottom
  return value

# Return true with a certain chance
Random.chance = (chance) ->
  result = Math.ceil(Math.random() * chance) # Number 1 until chance
  if result == 1 # Chance of one in chance
    return true
  else
    return false

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
    @radius = new SciNum(@diameter.value / 2, 'length', 'm')
    # Starts as 0
    @acceleration = new SciNum(new Point(0, 0), 'acceleration', 'm/s^2')
    # Its bodylength per second
    @maxSpeed = new SciNum(@diameter.value, 'speed', 'm/s')
    # Starts as 0
    @speed = new SciNum(new Point(0, 0), 'speed', 'm/s')

  # Methods
  # Starts living
  born: =>
    @display()
    @ages()
    @chooseDirection()

  # Continues living
  live: =>
    @foodNearby()
    @move()
    @update()

  # Creates a body
  display: =>
    # Body at instance's location
    @body = new Path.Circle(@position.round(), Calc.scale(@radius.value))
    @body.fillColor = @color

  # Updates its body
  update: =>
    @checkCollision()
    @body.position = @position.round() # Change position

  # Gets older
  ages: =>
    setInterval( =>
      @age = new SciNum((time.time - @birth) / 1000, 'time', 's')
    , 1000)

  # Starts moving
  move: =>
    # Will accelerate to maxSpeed
    @speed.value = @speed.value.add(@acceleration.value)
    # Check if xSpeed and ySpeed together are higher than maxSpeed
    if Calc.combine(@speed.value) > @maxSpeed.value
      @acceleration.value = new Point(0, 0)
      @speed.value.normalize(@maxSpeed.value) # Reduce
    # Scaled speed
    speed = new Point(
      x: Calc.scale(@speed.value.x)
      y: Calc.scale(@speed.value.y)
    )
    # Per second instead of frame
    speed = speed.divide(local.fps)
    # Change position
    @position = @position.add(speed)

  # Checks if there is food nearby
  foodNearby: =>
    if false # Food is near
      @goToPoint()
    else
      # With a chance of 1/x, change direction
      if Random.chance(50)
        @chooseDirection()

  # Checks if there is a collision
  checkCollision: =>
    bodyRadius = (@body.bounds.width / 2)
    # Check if in field
    if @position.x + bodyRadius >= local.width
      @speed.value = new Point(0, 0) # Stop moving
      @chooseDirection(180) # New direction
    else if @position.x - bodyRadius <= 0
      @speed.value = new Point(0, 0) # Stop moving
      @chooseDirection(0) # New direction
    if @position.y + bodyRadius >= local.height
      @speed.value = new Point(0, 0) # Stop moving
      @chooseDirection(270) # New direction
    else if @position.y - bodyRadius <= 0
      @speed.value = new Point(0, 0) # Stop moving
      @chooseDirection(90) # New direction

  # Choose a new direction default is random
  chooseDirection: (angle = Random.value(0, 360)) =>
    Math.floor(angle + 1) # Inclusive of range
    angle = angle * (Math.PI / 180) # In radians
    # Direction as point relative to self (origin)
    @direction = new Point(Math.cos(angle), Math.sin(angle))

     # Will change length of vector to be the max speed
    targetSpeed = @direction.normalize(@maxSpeed.value)
    # Set the acceleration, it will take x seconds to accelerate
    @acceleration.value = targetSpeed.divide(1.5 * local.fps)

  # Go to a point
  goToPoint: (point) =>

  # Divide itself
  divide: =>

  # Dies
  die: =>

  # Gets energy
  eat: =>


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
  if global.interaction.pauzed # Unpauze
    global.interaction.pauzed = false
    icon.attr('src', 'assets/images/icons/ic_pause_black_24px.svg')
  else # Pauze
    global.interaction.pauzed = true
    icon.attr('src', 'assets/images/icons/ic_play_arrow_black_24px.svg')

# Creates instances of bacteria
simulation.createLife = ->
  console.log("Creating life")
  size = new SciNum(1.0e-6, 'length', 'm')
  energy = new SciNum(3.9e9, 'energy', 'j')

  global.bacteria[0] = new Viridis(
    size,
    energy,
    local.center,
    1,
    0
  )
  global.bacteria[1] = new Rubrum(
    size,
    energy,
    local.center.subtract(100, 0),
    1,
    0
  )
  global.bacteria[2] = new Caeruleus(
    size,
    energy,
    local.center.add(100, 0),
    1,
    0
  )

# Sets up the document
simulation.setup = ->
  paper.install(window) # Don't have to acces objects via paper object
  paper.setup(doc.screen[0]) # Make use of the paperscript library
  html.setSize() # Initial value

  draw.background()
  simulation.createLife()

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
  global.interaction.pauzed = false # Unpauze time
  for bacterium in global.bacteria
    bacterium.born() # Starts the bacteria

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
    {position: [350, 200], size: 200}
    {position: [600, 700], size: 100}
  ]

  for value, index in bubbleValues # Every value
    draw.bubbles[index] = new Path.Circle(value.position, value.size / 2)
    draw.bubbles[index].fillColor = 'darkgrey'

# Checks if loading is done
isLoaded = setInterval( ->
  if global.interaction.loaded
    # << Actions >>
    simulation.start()
    clearInterval(isLoaded) # End itself from rechecking

    # << Events >>
    # Update simulated time
    time.clock = setInterval( ->
      if not global.interaction.pauzed # Time is not pauzed
        time.time += 2 # Update time Is two to account for code running time
    , 1)

    # Every full second
    time.second = setInterval( ->
      if not global.interaction.pauzed # Time is not pauzed
        html.clock()
    , 1000)

    # Every frame of the canvas
    view.onFrame = (event) ->
      # Loop through the bacteria
      for bacterium in global.bacteria
        if not global.interaction.pauzed # Time is not pauzed
          bacterium.live() # Bacteria does actions

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
