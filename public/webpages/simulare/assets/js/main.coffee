# The Js for the main page is made in coffeescript for readibility
# Lines have a max length
# Sometimes the comment for an expression will be above the line
# Code groups are distinguised by << >>
# Objects are used to group functions and variables
"use strict"

# TODO work on efficiency of code

# << Variables >>
# Group
doc = {}
local =
  resolution: 72 # No way to get this
  fps: 30 # Standard for canvas
  scaleFactor: 1.2e6 # Scale of the animation, 1 cm : this cm
  maxInstances:
    food: 15,
    bacteria: 30
  standard:
    mass: 1.64e-15 # Will get the average values of the species


# Get elements with these id's
for id in ['start', 'home', 'screen', 'field', 'menu', 'sidebar', 'cards', 'enviroment', 'bacteria', 'priority']
  doc[id] = $("##{id}")
# Store these selections
doc.menuItems = doc.menu.find('.item button')
doc.menuButton = doc.menu.find('.indicator button')
doc.data = doc.bacteria.find('.data tr td')
doc.values = doc.bacteria.find('.values tr td')
doc.conditions = doc.enviroment.find('meter')
doc.clock = doc.priority.find('.clock p span')

# << Return functions >>
# Groups
Calc = {}
Random = {}
check = {}
generate = {}
time =
  time: 0
  trackSecond: 0

# Tests if the circles overlap
check.circleOverlap = (circle1, circle2) ->
  distance = Calc.combine(circle1.position.subtract(circle2.position))
  result = distance <= (circle2.bounds.width + circle1.bounds.width) / 2
  return result

# Tests if circle 2 is inside circle 1
check.circleInside = (circle1, circle2) ->
  distance = Calc.combine(circle1.position.subtract(circle2.position))
  result = distance + (circle2.bounds.width / 2) <= circle1.bounds.width / 2
  return result

# Tests if point in circle
check.inCircle = (point, circle) ->
  distance = Calc.combine(circle.position.subtract(point))
  result = distance <= circle.bounds.width / 2 # Inside circle radius
  return result

# TODO add accuracy calculations
# Returns the value according to a scale
Calc.scale = (value, needed = 'scaled') ->
  DPC = local.resolution / 2.54 # From px/inch to px/cm

  if needed == "scaled"
    size = value * local.scaleFactor # Get the scaled value in cm
    size = size * DPC # Total size
    return size
  else if needed == "real"
    size = value / DPC # Scaled value in cm
    size = size / local.scaleFactor # Real value
    return size

# Diameter to volume and back
Calc.diameter = (value, needed = 'diameter') ->
  if needed == 'diameter'
    # Rewritten formula
    diameter = Math.pow((8 * 3 * value) / (4 * Math.PI), 1/3) # 3th root
    return diameter

  else if needed == 'volume'
    volume = (4/3) * Math.PI * (value/2)**3 # Formula for volume of sphere
    return volume

# Combines the vector into one value
Calc.combine = (vector) ->
  # Uses a^2 + b^2 = c^2
  result = Math.sqrt(vector.x**2 + vector.y**2)
  return result

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
    for i in [0..9] # Length of 10
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
  constructor: (value, quantity, unit) ->
    @value = value
    @quantity = quantity
    @unit = unit

  # Change number notation as string
  notation: (number) =>
    number = number.toFixed(3)
    string = number.toString()
    return string

  # Change unit to html markup
  unitNotation: (string) =>
    html = null
    if string.indexOf('/') != -1 # Is a fraction
      parts = string.split('/')
      html = $('<span></span>').addClass('fraction')
      html.append($('<span></span>').addClass('top').html(parts[0]))
      html.append($('<span></span>').addClass('bottom').html(parts[1]))
      html = html[0] # As dom object
    else
      html = $('<span></span>').html(string)[0] # dom object
    return html

  # Changes unit to be more friendly
  represent: =>
    set = global.constants.prefixes
    unit = @unit
    value = @value

    value = Calc.combine(value) if value instanceof Point # vector
    value = 0 if @quantity == 'speed' and value < 1e-9 # When breaking

    # Exeptions
    if unit == 'kg' # Base of gram is at kilograms
      unit = 'g'
      newValue *= 1000

    if 0 < Math.abs(value) < 1 # Low numbers
      set = set.lower
    else if Math.abs(value) >= 1 # Higher numbers
      set = set.higher

    for prefix in set
      newValue = value / prefix[1] # Will make the value higher or lower

      # Change prefix
      if 1 <= Math.abs(newValue) <= 1000 # New value is of normal size
        console.log newValue, @quantity
        unitDifferent = new SciNum(@notation(newValue), @quantity, @unitNotation("#{prefix[0]}#{unit}"))
        return unitDifferent

# Constructor for food
class Food
  # Values that need to be entered
  constructor: (energy) ->
    @id = generate.id(global.food)
    @energy = new SciNum(energy, 'energy', 'atp')
    @mass = new SciNum(@energy.value * global.constants.atpMass.value, 'mass', 'kg')
    # Density based on water density, real value doesn't exist because the molecules are made up
    @volume = new SciNum(@mass.value / (global.constants.waterDensity.value / 2.5), 'volume', 'm^3')
    @diameter = new SciNum(Calc.diameter(@volume.value), 'length', 'm') # Size depends on energy
    @radius = new SciNum(@diameter.value / 2, 'length', 'm')

  # Checks if position is legal
  isLegal: =>
    radius = Calc.scale(@radius.value)
    if @position.x - radius <= 0
      return false
    else if @position.x + radius >= local.size.width
      return false
    if @position.y - radius <= 0
      return false
    else if @position.y + radius >= local.size.height
      return false

    for bacterium in global.bacteria
      if check.circleOverlap(bacterium.body, @particle)
        return false

    if global.food.length > 0 # Not empty
      for food in global.food
        if food.id != @id
          if check.circleOverlap(food.particle, @particle)
            return false

    return true # Only if nothing else has returned

  # Creates the particle
  display: =>
    # Random location in field, not near the edges
    range = local.size
    @position = Point.random().multiply(range) # Initial
    # Canvas object
    @particle = new Path.Circle(
      @position.round(),
      Math.round(Calc.scale(@radius.value))
    )

    while not @isLegal() # Choose position again
      @position = Point.random().multiply(range)
      @particle.position = @position # Update
    # @particle.visible = true # Draw
    @particle.fillColor = 'yellow'
    html.layer.food.addChild(@particle) # Add to layer

  # Update location
  update: =>
    @particle.position = @position.round()

  # Gets eaten, removes itself
  eaten: =>
    for food, index in global.food
      # Don't know why, but the loop keeps getting an undefined
      if typeof(food) != 'undefined'
        # Remove reference to self
        global.food.splice(index, 1) if food.id == @id
    @particle.remove() # Remove drawn shape

# Bacteria constructors
class Bacteria # Has values shared by all bacteria
  # Values that need to be entered
  constructor: (mass, position, generation, birth) ->
    # Values that are initialised from arguments
    @id = generate.id(global.bacteria)
    @mass = {}
    @mass.current = new SciNum(mass, 'mass', 'kg')
    @position = position
    @generation = generation
    @birth = birth

    # Other values TODO store as objects
    @energy = new SciNum(
      Math.round(@mass.current.value / global.constants.atpMass.value), # Number of atp molecules
      'energy',
      'atp'
    )
    @density = new SciNum( # Different by a factor of 1.1 from water
      ((2/3) * global.constants.waterDensity.value) + ((1/3) * (13/10) * global.constants.waterDensity.value),
      'density',
      'kg/m^3'
    )
    @volume = new SciNum(@mass.current.value / @density.value, 'volume', 'm^3')
    @diameter = new SciNum(Calc.diameter(@volume.value), 'length', 'm')
    @radius = new SciNum(@diameter.value / 2, 'length', 'm')
    @acceleration = new SciNum(new Point(0, 0), 'acceleration', 'm/s^2') # Used when starting to move
    @speed = {}
    @decceleration = new SciNum(0, 'negative acceleration', 'm/s^2') # Used when slowing down
    @speed.min = new SciNum(new Point(0, 0), 'speed', 'm/s')
    @speed.current = new SciNum(new Point(0, 0), 'speed', 'm/s')
    @age = new SciNum(0, 'time', 's')
    # Depends on constant to avoid change
    @mass.max = new SciNum(1.5 * local.standard.mass, 'mass', 'kg')
    @mass.min = new SciNum(0.35 * local.standard.mass, 'mass', 'kg')
    @energyLoss = {}
    @energyLoss.current = new SciNum(0, 'energy per second', 'atp/s') # Initially
    @direction = null # Stores the direction as point
    @target = null # No target yet
    # Tracks actions
    @action = {}
    @action.current = null # Initial
    @action.previous = null

  # Methods
  # Starts living
  born: =>
    @display()
    @ages()
    @chooseDirection()

  # Continues living TODO work out energy system with traits
  live: =>
    if @action.current == 'dying' # RIP
      @die()
    else if @action.current == 'dividing'
      @divide()
    else # Normal
      if @action.current == 'colliding' # Needs to move away
        @chooseDirection()
      else
        @foodNearby()
        if @target == null # Not chasing
          # With a chance of 1/x, change direction
          @chooseDirection() if Random.chance(25)
        else # Food is near
          @findTarget() # Go get food
      @loseEnergy()
    @move()
    @update()

  # Changes the action
  changeAction: (action) =>
    if action != @action.current or @action.current == null # Changes
      @action.previous = @action.current
      @action.current = action

  # Creates a body TODO the colors and style of the bacteria
  display: =>
    # Body at instance's location
    @body = new Path.Circle(
      @position.round(),
      Math.round(Calc.scale(@radius.value))
    )
    @body.fillColor = @color
    @body.name = @id # In paper.js layer
    html.layer.bacteria.addChild(@body)

  # Updates its body
  update: =>
    @checkValues()
    @mass.current.value = @energy.value * global.constants.atpMass.value
    @volume.value = @mass.current.value / @density.value
    @diameter.value = Calc.diameter(@volume.value)
    # Change its size
    previous = @radius.value
    @radius.value = @diameter.value / 2
    if @radius.value != previous
      difference = @radius.value / previous # Ratio
      @body.scale(difference)
    @body.position = @position.round() # Change position

  # Gets selected by user
  select: =>
    if global.interaction.selected == @id
      global.interaction.selected = null # Deselect
      @body.selected = false # Changes appearance
    else # Other bacteria is selected
      if global.interaction.selected != null
        for bacterium in global.bacteria
          if global.interaction.selected == bacterium.id
            bacterium.body.selected = false # Deselect current
            break # End loop
      global.interaction.selected = @id
      @body.selected = true # Changes appearance

  # Gets older
  ages: =>
    setInterval( =>
      @age.value = (time.time - @birth) / 1000
    , 1000)

  # Change acceleration to go to direction
  startMoving: =>
    # Will change length of vector to be the max speed
    targetSpeed = @direction.normalize(@speed.max.value)
    # Add to the acceleration, at 0 it will take x seconds to accelerate
    @acceleration.value = targetSpeed.divide(3.5)

  # Slows the bacteria down
  slowDown: =>
    @changeAction('finding')
    # Slow down
    @decceleration.value = Calc.combine(@speed.current.value)

  # Starts moving
  move: =>
    @checkCollision() # Test if it can move
    if @action.current == 'finding' # Slowing down
      # Per frame to per second
      decceleration = @decceleration.value / local.fps
      newSpeed = Calc.combine(@speed.current.value) - decceleration
      # Reduces speed
      @speed.current.value = @speed.current.value.normalize(newSpeed)
    else
      # Per second instead of frame
      acceleration = @acceleration.value.divide(local.fps)
      # Will accelerate to maxSpeed
      @speed.current.value = @speed.current.value.add(acceleration)

    @checkSpeed()

    # Scaled speed
    speed = new Point(
      x: Calc.scale(@speed.current.value.x)
      y: Calc.scale(@speed.current.value.y)
    )
    # Per second instead of frame
    speed = speed.divide(local.fps)
    # Change position
    @position = @position.add(speed)

  # Loses energy TODO calculate the energy loss with traits
  loseEnergy: =>
    loss = @energyLoss.min.value
    # Influence of conditions
    for condition in ['temperature', 'toxicity', 'acidity']
      # Get the difference between the value and ideal value
      value = global.enviroment[condition]
      difference = Math.abs(value - @idealConditions[condition].value)
      # Each species has a different tolerance
      if difference >= @tolerance[condition].value
        difference -= @tolerance[condition].value
      else
        difference = 0

      # Increase the Influence of the conditions
      loss += (difference * 100) * @energyLoss.min.value

    loss *= 35 # Increased to speed up things
    @energyLoss.current.value = loss

    # Loses energy per second
    atpSec = (@energyLoss.current.value / local.fps)
    @energy.value -= atpSec
    # # Loses mass
    # mass = atpSec * global.constants.atpMass.value
    # @mass.current.value -= mass

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
        # Set the correct target or update with new data
        if target.distance == minDistance
          if @target == null # First encounter
            # Will slow down until reached
            @speed.min.value = @speed.max.value / 8
            @slowDown()
          else if @target.id != target.instance.id # New target
            # Will slow down until reached
            @speed.min.value = @speed.max.value / 8
            @slowDown()
          @target = target.instance
    else
      @target = null # Doesn't exist anymore

  # Check if it can divide or if it dies
  checkValues: =>
    if @mass.current.value <= @mass.min.value
      @changeAction('dying')
    else if @mass.current.value >= @mass.max.value
        @changeAction('dividing')

  # Checks the speed
  checkSpeed: =>
    # console.log(@action, @previousAction) if global.interaction.selected == @id
    # Check if xSpeed and ySpeed together are higher than maxSpeed
    if Calc.combine(@speed.current.value) >= @speed.max.value
      @acceleration.value = new Point(0, 0) # No acceleration
      @speed.current.value.normalize(@speed.max.value) # Reduce speed

    else if Calc.combine(@speed.current.value) <= @speed.min.value
      @speed.current.value.normalize(@speed.min.value) # Increase speed
      if @action.current == 'finding' # Has slowed down
        # console.log(true) if global.interaction.selected == @id
        @speed.min.value = 0 # Reached, is reset
        @decceleration.value = 0 # Is reset
        @changeAction('chasing')

  # Checks if there is a collision
  checkCollision: =>
    checkNotColliding = 0

    bodyRadius = Calc.scale(@radius.value)
    # Check if in field
    if @position.x + bodyRadius >= local.width
      @changeAction('colliding')
      @speed.current.value.x = 0
      @chooseDirection(180) # Start moving away
    else if @position.x - bodyRadius <= 0
      @changeAction('colliding')
      @speed.current.value.x = 0
      @chooseDirection(0) # Start moving away
    else
      checkNotColliding += 1
    if @position.y + bodyRadius >= local.height
      @changeAction('colliding')
      @speed.current.value.y = 0
      @chooseDirection(270) # Start moving away
    else if @position.y - bodyRadius <= 0
      @changeAction('colliding')
      @speed.current.value.y = 0
      @chooseDirection(90) # Start moving away
    else
      checkNotColliding += 1

    # Check collisions with other bacteria TODO make this check error-free
    for bacterium in global.bacteria
      if @id != bacterium.id # Not itself
        # How far away the bacteria is
        distance = bacterium.position.subtract(@position)
        otherBodyRadius = Calc.scale(bacterium.radius.value)
        # If the paths are too close
        if Calc.combine(distance) <= bodyRadius + otherBodyRadius
          @changeAction('colliding')
          # Angle between vectors
          impactAngle = @speed.current.value.getAngle(distance)
          # Speed in the illegal direction
          cosine = Math.cos(Calc.rad(impactAngle))
          speedComponent = @speed.current.value.multiply(cosine)
          # Some values return NaN in Math.cos
          if not isNaN(Calc.combine(speedComponent))
            # Stop moving in this direction
            @speed.current.value = @speed.current.value.subtract(speedComponent)
        else
          checkNotColliding += 1

    if @action.current == 'colliding' and checkNotColliding == 2 + global.bacteria.length - 1 # Stopped colliding
      @changeAction(@action.previous)

  # Choose a new direction default is random
  chooseDirection: (angle = Random.value(0, 360)) => # TODO use perlin noise
    angle = Calc.rad(angle % 360) # Get out the whole circles
    # Direction as point relative to self (origin)
    @direction = new Point(Math.cos(angle), Math.sin(angle))
    @startMoving()
    @changeAction('wandering')

  # Will go to a point until reached
  findTarget: =>
    if @action.current == 'chasing' # After it has slowed
      @goToPoint(@target.position)
      @eat() # Try to eat

  # Go to a point TODO work out method
  goToPoint: (point) =>
    # Set the direction
    relativePosition = @target.position.subtract(@position)
    @direction = relativePosition.normalize(1)
    @startMoving()

  # Divide itself TODO work out this functionality
  divide: =>
    @speed.min.value = 0 # Stop
    @slowDown()

  # Dies TODO work out method
  die: =>
    @speed.min.value = 0 # Stop
    @slowDown()
    for bacterium, index in global.bacteria
      if typeof(bacterium) != 'undefined' # Can be called twice
        if bacterium.id == @id
          global.bacteria.splice(index, 1) # Stop tracking
          @body.remove()

  # Eat food instances
  eat: =>
    # Inside it
    if check.circleInside(@body, @target.particle)
      energy = @target.energy.value * 10 # Increased to speed up things
      @energy.value += energy
      # Gains mass
      # mass = energy * global.constants.atpMass.value
      # @mass.current.value += mass
      @target.eaten() # Removes itself
      # findTarget won't be called anymore
      @target = null # Doesn't exist anymore
# Constructors that inherit code

class Lucarium extends Bacteria # This family of bacteria has its own traits
  constructor: () ->
    super(arguments...) # Parent constructor
    # Are initialised
    @family = "Lucarium"
    @speed.max = new SciNum(@diameter.value * 1.5, 'speed', 'm/s') # Speed based on body size
    @energyLoss.min = new SciNum(4e5, 'energy per second', 'atp/s')
    @viewRange = new SciNum(@diameter.value * 2.5, 'length', 'm')
    @mutationChance = 1/1000 # Will be increased for user experience
    @idealConditions =
      temperature: new SciNum(20, 'temperature', 'degrees')
      acidity: new SciNum(7, 'pH', '')
      toxicity: new SciNum(0, 'concentration', 'M')

class Viridis extends Lucarium # TODO make different traits for the species
  constructor: () ->
    super(arguments...) # Parent constructor
    # Values that are initialised
    @species = "Viridis"
    @taxonomicName = "#{@family} #{@species}" # Super has to be called first
    @color = '#4caf50'
    @tolerance =
      temperature: new SciNum(5, 'temperature', '&deg;C')
      acidity: new SciNum(0.5, 'pH', '')
      toxicity: new SciNum(2, 'concentration', 'kg/m^3')

class Rubrum extends Lucarium
  constructor: () ->
    super(arguments...) # Parent constructor
    # Values that are initialised
    @species = "Rubrum"
    @taxonomicName = "#{@family} #{@species}" # Super has to be called first
    @color = '#f44336'
    @tolerance =
      temperature: new SciNum(5, 'temperature', '&deg;C')
      acidity: new SciNum(0.5, 'pH', '')
      toxicity: new SciNum(2, 'concentration', 'kg/m^3')

class Caeruleus extends Lucarium
  constructor: () ->
    super(arguments...) # Parent constructor
    # Values that are initialised
    @species = "Caeruleus"
    @taxonomicName = "#{@family} #{@species}" # Super has to be called first
    @color = '#2196f3'
    @tolerance =
      temperature: new SciNum(5, 'temperature', '&deg;C')
      acidity: new SciNum(0.5, 'pH', '')
      toxicity: new SciNum(2, 'concentration', 'kg/m^3')

# << Document functions >>
# Groups
simulation = {}
html = {}
html.layer = {}

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
      @textContent = form(hours)
    else if $(@).hasClass('minute')
      @textContent = form(minutes)
    else if $(@).hasClass('second')
      @textContent = form(seconds)
  )

# TODO add function that sets up the values of the elements
html.setup = ->
  # << Actions >>
  doc.conditions.each( ->
    $(@).attr('value', global.enviroment[@dataset.name].value)
  )

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
        if typeof(bacterium) != 'undefined' # Stop being called when bacteria is removed
          bacterium.live() # Bacteria does actions

  # Paper.js canvas resize event
  view.onResize = (event) ->
    previous = local.size # Before resizing
    html.setSize() # Update size variables

    # Function for scaling positions
    scalePositions = (instances) ->
      for instance in instances
        scaledPosition = new Point( # Scale the position of the instance
          x: (instance.position.x / previous.width) * local.width
          y: (instance.position.y / previous.height) * local.height
        )
        instance.position = scaledPosition.round() # Update position
        # If it isn't a shape
        if instance not instanceof Path
          instance.update() # Manual update

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

  # When view goes out of focus
  $(window).blur( ->
    html.pause(off) # Set to on
  )
  # Window refocuses
  $(window).focus( ->
    html.pause(on) # Set to off
  )

  # TODO add restart button event
  doc.start.click( ->

  )

  # Click events check if bacteria is clicked
  doc.screen.click((event) ->
    location = new Point(event.pageX, event.pageY)
    console.log("Click at ", location)
    for bacterium in global.bacteria
      if check.inCircle(location, bacterium.body)
        bacterium.select() # Gets selected
        html.selected() # Trigger now instead of waiting
        break # End loop
  )

  # Open and close menu
  doc.menuButton.click( ->
    html.menu()
  )

  # The menu events TODO work out these events
  doc.menuItems.each( ->
    $(@).click ->
      switch @name # Different name attributes
        when "volume" then html.sound()
        when "pause" then html.pause()
        when "cards" then html.cardsToggle()
        when "view" then null
        when "info" then null
  )

# Updates infopanel
html.selected = ->
  if global.interaction.selected != null
    for bacterium in global.bacteria
      # Find the selected
      if bacterium.id == global.interaction.selected
        data = bacterium

        # Loop through the rows
        doc.data.each( ->
          if $(@).hasClass('value')
            # Get the value from the propertyname
            @textContent = data[@dataset.name]
        )
        doc.values.each( ->
          if $(@).hasClass('value')
            # TODO edit values before displaying
            scinum = data[@dataset.name]
            if @dataset.name in ['mass', 'speed']
              scinum = scinum.current

            representation = scinum.represent()
            # Loop through two spans
            $(@).find('span').each( ->
              if $(@).hasClass('number')
                # console.log representation
                @textContent = representation.value
              else if $(@).hasClass('unit')
                @innerHTML = '' # Empty
                @appendChild(representation.unit)
            )
        )
        doc.bacteria.attr('data-content', true) # Make visible
        break # End loop
  else # No selected
    doc.bacteria.attr('data-content', false)

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

# Music control
html.sound = (change = global.interaction.sound) ->
  icon = doc.menu.find("button[name=volume] img")
  if change # Unpauze
    global.interaction.sound = false
    icon.attr('src', 'assets/images/icons/ic_volume_off_black_24px.svg')
  else # Pauze
    global.interaction.sound = true
    icon.attr('src', 'assets/images/icons/ic_volume_up_black_24px.svg')

# Toggle the card system
html.cardsToggle = (change = global.interaction.cards) ->
  icon = doc.menu.find("button[name=cards] img")
  if change # Unpauze
    global.interaction.cards = false
    doc.cards.hide()
    icon.attr('src', 'assets/images/icons/ic_chat_outline_black_24px.svg')
  else # Pauze
    global.interaction.cards = true
    doc.cards.show()
    icon.attr('src', 'assets/images/icons/ic_chat_black_24px.svg')

html.menu = (change = doc.menu.attr('data-state')) ->
  icon = doc.menuButton.find('img')
  # Possible values
  change = (change == 'collapse' or change == true)
  if change
    doc.menuButton.attr('disabled', true) # No double click
    doc.menu.attr('data-state', 'expand')
    # After animation
    setTimeout( ->
      doc.menuButton.attr('disabled', false)
      icon.attr('src', 'assets/images/icons/ic_close_white_24px.svg')
    , global.interaction.time)
  else
    doc.menuButton.attr('disabled', true) # No double click
    doc.menu.attr('data-state', 'collapse')
    # After animation
    setTimeout( ->
      doc.menuButton.attr('disabled', false)
      icon.attr('src', 'assets/images/icons/ic_menu_white_24px.svg')
    , global.interaction.time)

# Creates instances of bacteria
simulation.createLife = ->
  console.log("Creating life")
  html.layer.bacteria.activate()

  global.bacteria[0] = new Viridis(
    local.standard.mass,
    local.center,
    1,
    0
  )
  global.bacteria[1] = new Rubrum(
    local.standard.mass,
    local.center.subtract(100, 0),
    1,
    0
  )
  global.bacteria[2] = new Caeruleus(
    local.standard.mass,
    local.center.add(100, 0),
    1,
    0
  )

# Set up the constants
simulation.setConstants = ->
  global.constants =
    waterDensity: new SciNum(0.9982e3, 'density', 'kg/m^3') # Around a temperature of 20 degrees
    atomairMass: new SciNum(1.660539e-27, 'mass', 'kg')
    avogadroContstant: 6.02214129e23
    prefixes:
      lower: [ # In SI
        ['y', 1e-24]
        ['z', 1e-21]
        ['a', 1e-18]
        ['f', 1e-15]
        ['p', 1e-12]
        ['n', 1e-9]
        ['&mu;', 1e-6] # Html code
        ['m', 1e-3]
      ],
      higher: [
        ['', 1e0]
        ['k', 1e3]
        ['M', 1e6]
        ['G', 1e9]
        ['T', 1e12]
        ['P', 1e15]
        ['E', 1e18]
        ['Z', 1e21]
        ['Y', 1e24]
      ]
  global.constants.prefixes.lower.reverse() # For looping

  global.constants.atpMass = new SciNum( # Using the mass of 507 u
    507.18 * global.constants.atomairMass.value,
    'mass',
    'kg'
  )

# Generates food
simulation.feed = ->
  html.layer.food.activate

  total = global.enviroment.energy.value
  left = total # Inital
  # Food left to give and maximum instances not reached
  while left > 0 and global.food.length <= local.maxInstances.food
    # A percentage of the total
    amount = Random.value(total * 0.10, total * 0.45)
    if amount < left * 0.95 # Spawn while higher lower than 95% of what's left
      left -= amount # Remove from what's left
    else
      amount = left # Remainder
      left = 0 # Ends loop
    # Add food
    food = new Food(Math.floor(amount))
    food.display() # Draw in field
    global.food.push(food) # Add to array

# Sets up the document
simulation.setup = (callback) ->
  paper.install(window) # Don't have to acces objects via paper object
  paper.setup(doc.screen[0]) # Make use of the paperscript library
  html.setSize() # Initial value

  # Paper.js layers
  html.layer.background = new Layer()
  html.layer.food = new Layer()
  html.layer.bacteria = new Layer()

  simulation.setConstants()

  draw.background()
  simulation.createLife()

  callback()

# Starts simulation
simulation.start = ->
  console.log "Loaded completely"

  # Add events to elements
  doc.start.find(".screen:first").show() # Show first screen
  doc.start.find("button[name=continue]").click ->
    doc.start.find(".screen:first").hide() # Hide first screen
    doc.start.find(".screen:last").show() # Show second screen
  doc.start.find("button[name=start]").click ->
    doc.start.hide() # Hide complete screen
    doc.home.css(display: 'flex')
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
  console.log(project.activeLayer)

# << Simulation functions >>
# Groups
draw = {}

# Draws the background
draw.background = ->
  html.layer.background.activate()

  # Background objects TODO add more and style them
  draw.bottom = new Path.Rectangle(local.origin, local.size)
  draw.bottom.fillColor = 'grey'
  html.layer.background.addChild(draw.bottom)

  draw.bubbles = []
  bubbleValues = [ # Th info for the bubbles
    {position: [350, 200], size: 200}
    {position: [600, 700], size: 100}
  ]

  for value, index in bubbleValues # Every value
    draw.bubbles[index] = new Path.Circle(value.position, value.size / 2)
    draw.bubbles[index].fillColor = 'darkgrey'
  html.layer.background.addChildren(draw.bubbles)

# Checks if loading is done
isLoaded = setInterval( ->
  if global.interaction.loaded
    # << Actions >>
    clearInterval(isLoaded) # End itself from rechecking
    simulation.setup( ->
      simulation.start()
    )
, 1)
