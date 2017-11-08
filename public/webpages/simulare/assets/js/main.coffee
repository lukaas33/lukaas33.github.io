# The Js for the main page is made for readibility
# Lines have a max length
# Sometimes the comment for an expression will be above the line
# Code groups are distinguised by << >>
# Objects are used to group functions and variables

# << Variables >>
# Group
doc = {}
local =
  resolution: 72 # No way to get this
  fps: 30 # Standard for canvas

# Get elements with these id's
for id in ['start', 'screen', 'field', 'menu', 'priority', 'sidebar']
  doc[id] = $("##{id}")
# Store these selections
doc.menuItems = doc.menu.find('.item button')
doc.clock = doc.priority.find('.clock p span')
doc.data = doc.sidebar.find('.data tr td')
doc.values = doc.sidebar.find('.values tr td')

# << Return functions >>
# Groups
Calc = {}
Random = {}
generate = {}
time =
  time: 0
  trackSecond: 0

# TODO add accuracy calculations
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

# Combines the vector into one value
Calc.combine = (vector) ->
  # Uses a^2 + b^2 = c^2
  result = Math.sqrt(vector.x**2 + vector.y**2)
  return result

# TODO add function that converts between base and si prefixes
Calc.prefixSI = (scinum) ->
  null

Calc.rad = (degrees) ->
  angle = degrees * (Math.PI / 180) # In radians
  return angle


# Returns value in range
Random.value = (bottom, top) ->
  middle = top - bottom
  value = (Math.random() * middle) + bottom
  return value

# Return true with a certain chance TODO seed random function
Random.chance = (chance) ->
  result = Math.ceil(Math.random() * chance) # Number 1 until chance
  if result == 1 # Chance of one in chance
    return true
  else
    return false

# TODO add a normal distribution function
Random.normal = () ->
  null

# Creates unique id
generate.id = (instances) ->
  unique = false
  string = null

  while not unique
    result = []
    for i in [0..8] # Length of 8
      charcode = Random.value(65, 91) # A-Z
      result.push(String.fromCharCode(charcode)) # Add the string
    string = result.join('') # As string

    if instances.length > 0 # Not empty
      occurs = false # Until proven
      for instance in instances
        if instance.id == string
          occurs = true # Loop will run again
          break # End the for loop
      unique = not occurs
    else # No instances
      unique = true
      break # End the while loop

  return string

# << Constructors >>
# Constructor for scientific numbers
class SciNum
  # Values that need to be entered
  constructor: (@value, @quantity, @unit) ->

# Constructor for food
class Food
  # Values that need to be entered
  constructor: (@energy, @position) ->
    @diameter = Random.value(0.3e-6, 0.5e-6) # TODO is related to energy
    @radius = @diameter / 2

  # Creates the particle
  display: =>
    @particle = new Path.Circle(
      @position.round(),
      Math.round(Calc.scale(@radius))
    )
    @particle.fillColor = 'yellow'

  # Gets eaten TODO work out method
  # eaten: =>

# Bacteria constructors
class Bacteria
  # Values that need to be entered
  constructor: (@diameter, @energy, @position, @generation, @birth) ->
    # Values that are initialised
    # TODO diameter is related to energy
    @id = generate.id(global.bacteria)
    @radius = new SciNum(@diameter.value / 2, 'length', 'm')
    @viewRange = new SciNum(@diameter.value * 3, 'length', 'm')
    @acceleration = new SciNum(new Point(0, 0), 'acceleration', 'm/s*s')
    # x times its bodylength per second
    @maxSpeed = new SciNum(@diameter.value * 1.5, 'speed', 'm/s')
    @speed = new SciNum(new Point(0, 0), 'speed', 'm/s')
    @target = null # No target
    @age = new SciNum(0, 'time', 's')

  # Methods
  # Starts living
  born: =>
    @display()
    @ages()
    @chooseDirection()

  # Continues living TODO work out energy system with traits
  live: =>
    @foodNearby()
    if @target != null # Food is near
      @findTarget() # Go get food
    else # Wandering
      # With a chance of 1/x, change direction
      @chooseDirection() if Random.chance(25)
    @move()
    @update()

  # Creates a body TODO the colors and style of the bacteria
  display: =>
    # Body at instance's location
    @body = new Path.Circle(
      @position.round(),
      Math.round(Calc.scale(@radius.value))
    )
    @body.fillColor = @color

  # Updates its body
  update: =>
    @body.position = @position.round() # Change position

  # Gets older
  ages: =>
    setInterval( =>
      @age.value = (time.time - @birth) / 1000
    , 1000)

  # Change acceleration to go to direction
  startMoving: =>
     # Will change length of vector to be the max speed
    targetSpeed = @direction.normalize(@maxSpeed.value)
    # Set the acceleration, it will take x seconds to accelerate
    @acceleration.value = targetSpeed.divide(3 * local.fps)

  # Starts moving TODO method uses energy
  move: =>
    @checkCollision() # Test if it can move
    # Will accelerate to maxSpeed
    @speed.value = @speed.value.add(@acceleration.value)

    # Check if xSpeed and ySpeed together are higher than maxSpeed
    if Calc.combine(@speed.value) > @maxSpeed.value
      @acceleration.value = new Point(0, 0) # No acceleration
      @speed.value.normalize(@maxSpeed.value) # Reduce speed
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
    isNearby = false # Until proven
    possibleTargets = []
    # Loops through food
    for food in global.food
      # The distance between the food and the bacteria
      distance = Calc.combine(food.position.subtract(@position))
      # Is in range
      if distance < Calc.scale(@viewRange.value)
        possibleTargets.push({instance: food, distance, distance})
    if possibleTargets.length > 0 # There are targets
      distances = (target.distance for target in possibleTargets)
      minDistance = Math.min(distances...) # Lowest
      for target in possibleTargets
        # Set the correct target
        @target = target.instance if target.distance == minDistance

  # Checks if there is a collision
  checkCollision: =>
    bodyRadius = Calc.scale(@radius.value)
    # Check if in field
    if @position.x + bodyRadius >= local.width
      @speed.value.x = 0
      @chooseDirection(180) # Start moving away
    else if @position.x - bodyRadius <= 0
      @speed.value.x = 0
      @chooseDirection(0) # Start moving away
    if @position.y + bodyRadius >= local.height
      @speed.value.y = 0
      @chooseDirection(270) # Start moving away
    else if @position.y - bodyRadius <= 0
      @speed.value.y = 0
      @chooseDirection(90) # Start moving away

    # Check collisions with other bacteria TODO make this check error-free
    for bacterium in global.bacteria
      if @id != bacterium.id # Not itself
        # How far away the bacteria is
        distance = bacterium.position.subtract(@position)
        otherBodyRadius = Calc.scale(bacterium.radius.value)
        # If the paths are too close
        if Calc.combine(distance) <= bodyRadius + otherBodyRadius
          # Angle between vectors
          impactAngle = @speed.value.getAngle(distance)
          # Speed in the illegal direction
          speed = Math.cos(Calc.rad(impactAngle))
          speedComponent = @speed.value.multiply(speed)
          # Stop moving in this direction
          @speed.value = @speed.value.subtract(speedComponent)
          @speed.value = @speed.value.multiply(0.75) # Loses speed by impact
          @chooseDirection() # Pick a new direction
          # Check speed
          if Calc.combine(@speed.value) > @maxSpeed.value
            @speed.value.normalize(@maxSpeed.value) # Reduce speed

  # Choose a new direction default is random
  chooseDirection: (angle = Random.value(0, 360)) => # TODO use perlin noise
    angle = Calc.rad(angle % 360) # Get out the whole circles
    # Direction as point relative to self (origin)
    @direction = new Point(Math.cos(angle), Math.sin(angle))
    @startMoving()

  # Will go to a point until reached
  findTarget: =>
    if @target.position == @position
      @target = null # Stop following
    else
      @goToPoint(@target.position)

  # Go to a point TODO work out method
  goToPoint: (point) =>
    # Set the direction
    relativePosition = @target.position.subtract(@position)
    @direction = relativePosition.normalize(1)
    @startMoving()

  # Divide itself TODO work out this functionality
  divide: =>

  # Dies TODO work out method
  die: =>

  # Gets energy TODO work out method
  eat: =>


# Constructors that inherit code
class Lucarium extends Bacteria # TODO add unique traits for family
  constructor: ->
    # Are initialised
    @family = "Lucarium"
    @taxonomicName = "#{@family} #{@species}"
    super # Call parent constructor

class Viridis extends Lucarium # TODO make different traits for the species
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

# TODO add function that adds cards from data
html.card = (data) ->
  null

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
  doc.clock.each( ->
    if $(@).hasClass('hour')
      @.textContent = form(hours)
    else if $(@).hasClass('minute')
      @.textContent = form(minutes)
    else if $(@).hasClass('second')
      @.textContent = form(seconds)
  )

# TODO add function that sets up the values of the elements
html.setup = ->
  # << Actions >>

  # << Events >>
  # When view goes out of focus
  $(window).blur(->
    html.pause(off) # Set to on
  )
  # Window refocuses
  $(window).focus(->
    html.pause(on) # Set to off
  )

  # TODO add restart button event

  # The menu events TODO work out these events
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

# Updates infopanel
html.selected = ->
  data = null
  for bacterium in global.bacteria
    # Find the selected
    if bacterium.id == global.interaction.selected
      data = bacterium
      break # End loop

  # The selected is found
  if data != null
    # Loop through the rows
    doc.data.each( ->
      if $(@).hasClass('value')
        # Get the value from the propertyname
        @.textContent = data[@dataset.name]
    )
    doc.values.each( ->
      if $(@).hasClass('value')
        # TODO edit values before displaying
        scinum = data[@dataset.name]
        # Loop through two spans
        $(@).find('span').each( ->
          if $(@).hasClass('number')
            value = scinum.value
            value = Calc.combine(value) if value instanceof Point # Vector value

            @.textContent = value
          else if $(@).hasClass('unit')
            @.textContent = scinum.unit
        )
    )

# TODO add function that displays the ratio
html.pie = ->
  null

# Pauses the simulation
html.pause = (change = global.interaction.pauzed) ->
  icon = doc.menu.find("button[name=pause] img")
  if change # Unpauze
    global.interaction.pauzed = false
    icon.attr('src', 'assets/images/icons/ic_pause_black_24px.svg')
  else # Pauze
    global.interaction.pauzed = true
    icon.attr('src', 'assets/images/icons/ic_play_arrow_black_24px.svg')

# Creates instances of bacteria
simulation.createLife = ->
  console.log("Creating life")
  # Starter values
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

  global.interaction.selected = global.bacteria[2].id # TODO let user select

# Generates food
simulation.feed = ->
  total = global.enviroment.energy.value
  left = total # Inital
  # Food left to give and maximum instances not reached
  while left > 0 and global.food.length < 20
    # A percentage of the total
    amount = Random.value(total * 0.10, total * 0.15)
    if amount < left
      left -= amount # Remove from what's left
    else
      amount = left # Remainder
      left = 0 # Ends loop
    # Random location in field, not near the edges
    range = local.size.subtract(50)
    location = Point.random().multiply(range).add(25)
    # Add food
    amount = new SciNum(amount, 'energy', 'j')
    food = new Food(amount, location)
    food.display() # Draw in field
    global.food.push(food) # Add to array

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
    global.enviroment[@name] = new SciNum(Number(@value), @name, @dataset.unit)
    # Update the variables on change
    $(@).change ->
      value = Number(@value) # Is recieved as string
      global.enviroment[@name] = new SciNum(value, @name, @dataset.unit)
  )

  $("#loading").hide() # Hide loading screen

# Runs simulation
simulation.run = ->
  for bacterium in global.bacteria
    bacterium.born() # Starts the bacteria
  global.interaction.pauzed = false # Unpauze time
  html.setup() # Activate document

# << Simulation functions >>
# Groups
draw = {}

# Draws the background
draw.background = ->
  # Background objects TODO add more and style them
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
        time.time += 5 # Update time

        time.trackSecond += 5
        if time.trackSecond > 1000 # Full simulated second
          time.trackSecond = 0 # Restart second
          simulation.feed()
    , 5)

    # Every full second
    time.second = setInterval( ->
      if not global.interaction.pauzed # Time is not pauzed
        html.clock()
        html.selected()
    , 1000)

    # Every frame of the canvas
    view.onFrame = (event) ->
      if not global.interaction.pauzed # Time is not pauzed
        # Loop through the bacteria
        for bacterium in global.bacteria
          bacterium.live() # Bacteria does actions

    # Paper.js canvas resize event
    view.onResize = (event) ->
      previous = local.size # Before resizing
      html.setSize() # Update size variables

      # Function for scaling positions
      scalePositions = (instances) ->
        for instance in instances
          scaledPosition = new Point( # Scale the position of the instance
            x: (instance.position.x / previous.width) * local.size.width
            y: (instance.position.y / previous.height) * local.size.height
          )
          instance.position = scaledPosition.round() # Update position

      # Scale these
      scalePositions(global.bacteria)
      scalePositions(global.food)
      scalePositions(draw.bubbles)

      # Scale by a factor of intended width / real width
      draw.bottom.scale( # Don't know why times 2 but it works, don't touch it
        (local.width / draw.bottom.bounds.width) * 2,
        (local.height / draw.bottom.bounds.height) * 2
      )
      draw.bottom.position = local.origin # Rectangle is updated
, 1)
