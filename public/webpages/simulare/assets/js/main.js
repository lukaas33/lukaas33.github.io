(function() {
  // The Js for the main page is made in coffeescript for readibility
  // Lines have a max length
  // Sometimes the comment for an expression will be above the line
  // Code groups are distinguised by << >>
  // Objects are used to group functions and variables
  "use strict";
  var Bacteria, Caeruleus, Calc, Food, Lucarium, Random, Rubrum, SciNum, Viridis, check, doc, draw, generate, html, id, isLoaded, j, len, local, ref, simulation, time;

  // TODO work on efficiency of code

  // << Variables >>
  // Group
  doc = {};

  local = {
    resolution: 72, // No way to get this
    fps: 30, // Standard for canvas
    scaleFactor: 1.5e6 // Scale of the animation, 1 cm : this cm
  };

  ref = ['start', 'screen', 'field', 'menu', 'sidebar', 'cards', 'enviroment', 'bacteria', 'priority'];
  
  // Get elements with these id's
  for (j = 0, len = ref.length; j < len; j++) {
    id = ref[j];
    doc[id] = $(`#${id}`);
  }

  // Store these selections
  doc.menuItems = doc.menu.find('.item button');

  doc.menuButton = doc.menu.find('.indicator button');

  doc.data = doc.bacteria.find('.data tr td');

  doc.values = doc.bacteria.find('.values tr td');

  doc.conditions = doc.enviroment.find('meter');

  doc.clock = doc.priority.find('.clock p span');

  // << Return functions >>
  // Groups
  Calc = {};

  Random = {};

  check = {};

  generate = {};

  time = {
    time: 0,
    trackSecond: 0
  };

  // Tests if the circles overlap
  check.circleOverlap = function(circle1, circle2) {
    var distance, result;
    distance = Calc.combine(circle1.position.subtract(circle2.position));
    result = distance <= (circle2.bounds.width + circle1.bounds.width) / 2;
    return result;
  };

  // Tests if circle 2 is inside circle 1
  check.circleInside = function(circle1, circle2) {
    var distance, result;
    distance = Calc.combine(circle1.position.subtract(circle2.position));
    result = distance + (circle2.bounds.width / 2) <= circle1.bounds.width / 2;
    return result;
  };

  // Tests if point in circle
  check.inCircle = function(point, circle) {
    var distance, result;
    distance = Calc.combine(circle.position.subtract(point));
    result = distance <= circle.bounds.width / 2; // Inside circle radius
    return result;
  };

  // TODO add accuracy calculations
  // Returns the value according to a scale
  Calc.scale = function(value, needed = 'scaled') {
    var DPC, size;
    DPC = local.resolution / 2.54; // From px/inch to px/cm
    if (needed === "scaled") {
      size = value * local.scaleFactor; // Get the scaled value in cm
      size = size * DPC; // Total size
      return size;
    } else if (needed === "real") {
      size = value / DPC; // Scaled value in cm
      size = size / local.scaleFactor; // Real value
      return size;
    }
  };

  // Diameter to volume and back
  Calc.diameter = function(value, needed = 'diameter') {
    var diameter, volume;
    if (needed === 'diameter') {
      // Rewritten formula
      diameter = Math.pow((8 * 3 * value) / (4 * Math.PI), 1 / 3); // 3th root
      return diameter;
    } else if (needed === 'volume') {
      volume = (4 / 3) * Math.PI * Math.pow(value / 2, 3); // Formula for volume of sphere
      return volume;
    }
  };

  // Combines the vector into one value
  Calc.combine = function(vector) {
    var result;
    // Uses a^2 + b^2 = c^2
    result = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    return result;
  };

  Calc.rad = function(degrees) {
    var angle;
    angle = degrees * (Math.PI / 180); // In radians
    return angle;
  };

  // Returns value in range
  Random.value = function(bottom, top) {
    var middle, value;
    middle = top - bottom;
    value = (Math.random() * middle) + bottom;
    return value;
  };

  // Return true with a certain chance TODO seed random function
  Random.chance = function(chance) {
    var result;
    result = Math.ceil(Math.random() * chance); // Number 1 until chance
    if (result === 1) { // Chance of one in chance
      return true;
    } else {
      return false;
    }
  };

  // TODO add a normal distribution function
  Random.normal = function() {
    return null;
  };

  // Creates unique id
  generate.id = function(instances) {
    var charcode, i, instance, k, l, len1, occurs, result, string, unique;
    unique = false;
    string = null;
    while (!unique) {
      result = [];
      // Length of 10
      for (i = k = 0; k <= 9; i = ++k) {
        charcode = Random.value(65, 91); // A-Z
        result.push(String.fromCharCode(charcode)); // Add the string
      }
      string = result.join(''); // As string
      if (instances.length > 0) { // Not empty
        occurs = false; // Until proven
        for (l = 0, len1 = instances.length; l < len1; l++) {
          instance = instances[l];
          if (instance.id === string) {
            occurs = true; // Loop will run again
            break; // End the for loop
          }
        }
        unique = !occurs; // No instances
      } else {
        unique = true;
        break; // End the while loop
      }
    }
    return string;
  };

  // << Constructors >>
  // Constructor for scientific numbers
  SciNum = class SciNum {
    // Values that need to be entered
    constructor(value1, quantity, unit) {
      // TODO add method that converts between base and si prefixes
      this.notation = this.notation.bind(this);
      this.value = value1;
      this.quantity = quantity;
      this.unit = unit;
    }

    notation() {
      var value;
      if (this.value instanceof Point) {
        value = Calc.combine(this.value);
      } else {
        value = this.value;
      }
      return value.toExponential(4);
    }

  };

  // Constructor for food
  Food = class Food {
    // Values that need to be entered
    constructor(energy1) {
      // Checks if position is legal
      this.isLegal = this.isLegal.bind(this);
      
      // Creates the particle
      this.display = this.display.bind(this);
      
      // Update location
      this.update = this.update.bind(this);
      // Gets eaten, removes itself
      this.eaten = this.eaten.bind(this);
      this.energy = energy1;
      this.id = generate.id(global.food);
      // TODO is related to energy
      this.diameter = new SciNum(Random.value(0.3e-6, 0.5e-6), 'length', 'm');
      this.radius = new SciNum(this.diameter.value / 2, 'length', 'm');
    }

    isLegal() {
      var bacterium, food, k, l, len1, len2, radius, ref1, ref2;
      radius = Calc.scale(this.radius.value);
      if (this.position.x - radius <= 0) {
        return false;
      } else if (this.position.x + radius >= local.size.width) {
        return false;
      }
      if (this.position.y - radius <= 0) {
        return false;
      } else if (this.position.y + radius >= local.size.height) {
        return false;
      }
      ref1 = global.bacteria;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bacterium = ref1[k];
        if (check.circleOverlap(bacterium.body, this.particle)) {
          return false;
        }
      }
      if (global.food.length > 0) { // Not empty
        ref2 = global.food;
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          food = ref2[l];
          if (food.id !== this.id) {
            if (check.circleOverlap(food.particle, this.particle)) {
              return false;
            }
          }
        }
      }
      return true; // Only if nothing else has returned
    }

    display() {
      var range;
      // Random location in field, not near the edges
      range = local.size;
      this.position = Point.random().multiply(range); // Initial
      // Canvas object
      this.particle = new Path.Circle(this.position.round(), Math.round(Calc.scale(this.radius.value)));
      while (!this.isLegal()) { // Choose position again
        this.position = Point.random().multiply(range);
        this.particle.position = this.position; // Update
      }
      // @particle.visible = true # Draw
      this.particle.fillColor = 'yellow';
      return html.layer.food.addChild(this.particle); // Add to layer
    }

    update() {
      return this.particle.position = this.position.round();
    }

    eaten() {
      var food, index, k, len1, ref1, results;
      this.particle.remove(); // Remove drawn shape
      ref1 = global.food;
      results = [];
      for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
        food = ref1[index];
        // Don't know why, but the loop keeps getting an undefined
        if (food !== void 0) {
          if (food.id === this.id) {
            // Remove reference to self
            results.push(global.food.splice(index, 1));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

  };

  // Bacteria constructors
  Bacteria = class Bacteria {
    // Values that need to be entered
    constructor(mass1, energy1, position, generation, birth) {
      // Methods
      // Starts living
      this.born = this.born.bind(this);
      // Continues living TODO work out energy system with traits
      this.live = this.live.bind(this);
      // Creates a body TODO the colors and style of the bacteria
      this.display = this.display.bind(this);
      // Update variables propotional to each other
      this.proportions = this.proportions.bind(this);
      // Updates its body
      this.update = this.update.bind(this);
      
      // Gets selected by user
      this.select = this.select.bind(this);
      
      // Gets older
      this.ages = this.ages.bind(this);
      // Change acceleration to go to direction
      this.startMoving = this.startMoving.bind(this);
      // Slows the bacteria down
      this.slowDown = this.slowDown.bind(this);
      // @speed.value = @speed.value.normalize(@minSpeed.value)

      // Starts moving
      this.move = this.move.bind(this);
      // Loses energy TODO calculate the energy loss with traits
      this.loseEnergy = this.loseEnergy.bind(this);
      // @energy.value -= atpSec

      // Loses mass
      // @mass.value -= atpSec * global.constants.atpMass.value

      // Checks if there is food nearby
      this.foodNearby = this.foodNearby.bind(this);
      // Check if it can divide or if it dies
      this.checkValues = this.checkValues.bind(this);
      // Checks the speed
      this.checkSpeed = this.checkSpeed.bind(this);
      // Checks if there is a collision
      this.checkCollision = this.checkCollision.bind(this);
      // if checkNotColliding == 2 + global.bacteria.length - 1
      // @action = @previousAction # Not colliding with anything

      // Choose a new direction default is random
      this.chooseDirection = this.chooseDirection.bind(this);
      // Will go to a point until reached
      this.findTarget = this.findTarget.bind(this);
      
      // Go to a point TODO work out method
      this.goToPoint = this.goToPoint.bind(this);
      // Divide itself TODO work out this functionality
      this.divide = this.divide.bind(this);
      // Dies TODO work out method
      this.die = this.die.bind(this);
      // Eat food instances
      this.eat = this.eat.bind(this);
      this.mass = mass1;
      this.energy = energy1;
      this.position = position;
      this.generation = generation;
      this.birth = birth;
      // Values that are initialised
      // TODO diameter is related to energy
      this.id = generate.id(global.bacteria);
      this.volume = new SciNum(this.mass.value / global.constants.bacteriaDensity.value, 'volume', 'm^3');
      this.diameter = new SciNum(Calc.diameter(this.volume.value), 'length', 'm');
      this.radius = new SciNum(this.diameter.value / 2, 'length', 'm');
      this.viewRange = new SciNum(this.diameter.value * 3, 'length', 'm');
      this.acceleration = new SciNum(new Point(0, 0), 'acceleration', 'm/s^2');
      // x times its bodylength per second
      this.maxSpeed = new SciNum(this.diameter.value * 1.5, 'speed', 'm/s');
      this.minSpeed = new SciNum(new Point(0, 0), 'speed', 'm/s');
      this.speed = new SciNum(new Point(0, 0), 'speed', 'm/s');
      this.direction = null; // Stores the direction as point
      this.age = new SciNum(0, 'time', 's');
      this.target = null; // No target yet
      this.minEnergyLoss = new SciNum(4e6, 'energy per second', 'atp/s');
      this.energyLoss = new SciNum(0, 'energy per second', 'atp/s'); // Initially
      // Tracks actions
      this.action = null;
      this.previousAction = null;
    }

    born() {
      this.display();
      this.ages();
      return this.chooseDirection();
    }

    live() {
      // if @action != 'colliding'
      // console.log(@minSpeed.value) if global.interaction.selected == @id
      this.foodNearby();
      if (this.target === null) {
        this.previousAction = this.action;
        this.action = 'wandering';
        if (Random.chance(25)) { // Food is near
          // With a chance of 1/x, change direction
          this.chooseDirection();
        }
      } else {
        this.findTarget(); // Go get food
      }
      this.move();
      this.loseEnergy();
      return this.update();
    }

    display() {
      // Body at instance's location
      this.body = new Path.Circle(this.position.round(), Math.round(Calc.scale(this.radius.value)));
      this.body.fillColor = this.color;
      this.body.name = this.id; // In paper.js layer
      return html.layer.bacteria.addChild(this.body);
    }

    proportions() {
      var difference, previous;
      this.volume.value = this.mass.value / global.constants.bacteriaDensity.value;
      this.diameter.value = Calc.diameter(this.volume.value);
      // Change its size
      previous = this.radius.value;
      this.radius.value = this.diameter.value / 2;
      difference = this.radius.value / previous; // Ratio
      return this.body.scale(difference);
    }

    update() {
      this.checkValues();
      // @proportions()
      return this.body.position = this.position.round(); // Change position
    }

    select() {
      var bacterium, k, len1, ref1;
      if (global.interaction.selected === this.id) {
        global.interaction.selected = null; // Deselect
        return this.body.selected = false; // Changes appearance
// Other bacteria is selected
      } else {
        if (global.interaction.selected !== null) {
          ref1 = global.bacteria;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            bacterium = ref1[k];
            if (global.interaction.selected === bacterium.id) {
              bacterium.body.selected = false; // Deselect current
              break; // End loop
            }
          }
        }
        global.interaction.selected = this.id;
        return this.body.selected = true; // Changes appearance
      }
    }

    ages() {
      return setInterval(() => {
        return this.age.value = (time.time - this.birth) / 1000;
      }, 1000);
    }

    startMoving() {
      var targetSpeed;
      // Will change length of vector to be the max speed
      targetSpeed = this.direction.normalize(this.maxSpeed.value);
      // Add to the acceleration, at 0 it will take x seconds to accelerate
      return this.acceleration.value = targetSpeed.divide(3.5);
    }

    slowDown() {
      // Will slow down until reached
      // @minSpeed.value = Calc.combine(@speed.value.divide(4))
      this.minSpeed.value = this.maxSpeed.value;
      // Slow down in x seconds
      return this.acceleration.value = this.direction.normalize(this.minSpeed.value).multiply(-1); // Negative acceleration
    }

    move() {
      var acceleration, speed;
      this.checkCollision(); // Test if it can move
      // Per second instead of frame
      acceleration = this.acceleration.value.divide(local.fps);
      // Will accelerate to maxSpeed
      this.speed.value = this.speed.value.add(acceleration);
      this.checkSpeed();
      // Scaled speed
      speed = new Point({
        x: Calc.scale(this.speed.value.x),
        y: Calc.scale(this.speed.value.y)
      });
      // Per second instead of frame
      speed = speed.divide(local.fps);
      // Change position
      return this.position = this.position.add(speed);
    }

    loseEnergy() {
      var atpSec, condition, difference, k, len1, loss, ref1, value;
      loss = this.minEnergyLoss.value;
      ref1 = ['temperature', 'toxicity', 'acidity'];
      // Influence of conditions
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        condition = ref1[k];
        // Get the difference between the value and ideal value
        value = global.enviroment[condition];
        difference = Math.abs(value - this.idealConditions[condition].value);
        // Each species has a different tolerance
        if (difference >= this.tolerance[condition].value) {
          difference -= this.tolerance[condition].value;
        } else {
          difference = 0;
        }
        // Energy loss can go up exponentially
        loss += difference * this.minEnergyLoss.value;
      }
      this.energyLoss.value = loss;
      // Loses energy per second
      return atpSec = this.energyLoss.value / local.fps;
    }

    foodNearby() {
      var distance, distances, food, isNearby, k, l, len1, len2, minDistance, possibleTargets, ref1, results, target;
      isNearby = false; // Until proven
      possibleTargets = [];
      ref1 = global.food;
      // Loops through food
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        food = ref1[k];
        // The distance between the food and the bacteria
        distance = Calc.combine(food.position.subtract(this.position));
        // Is in range
        if (distance < Calc.scale(this.viewRange.value)) {
          possibleTargets.push({
            instance: food,
            distance,
            distance
          });
        }
      }
      if (possibleTargets.length > 0) { // There are targets
        distances = (function() {
          var l, len2, results;
          results = [];
          for (l = 0, len2 = possibleTargets.length; l < len2; l++) {
            target = possibleTargets[l];
            results.push(target.distance);
          }
          return results;
        })();
        minDistance = Math.min(...distances); // Lowest
        results = [];
        for (l = 0, len2 = possibleTargets.length; l < len2; l++) {
          target = possibleTargets[l];
          // Set the correct target or update with new data
          if (target.distance === minDistance) {
            if (this.target === null) { // First encounter
              this.previousAction = this.action;
              this.action = 'finding';
              this.slowDown();
            } else if (this.target.id !== target.instance.id) {
              this.previousAction = this.action;
              this.action = 'finding'; // New target
              this.slowDown();
            }
            results.push(this.target = target.instance);
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        this.target = null; // Doesn't exist anymore
        return this.action = this.previousAction;
      }
    }

    checkValues() {}

    checkSpeed() {
      if (global.interaction.selected === this.id) {
        console.log(this.action, this.previousAction);
      }
      // Check if xSpeed and ySpeed together are higher than maxSpeed
      if (Calc.combine(this.speed.value) >= this.maxSpeed.value) {
        this.acceleration.value = new Point(0, 0); // No acceleration
        return this.speed.value.normalize(this.maxSpeed.value); // Reduce speed
      } else if (Calc.combine(this.speed.value) <= this.minSpeed.value) {
        this.speed.value.normalize(this.minSpeed.value); // Increase speed
        if (this.action === 'finding') { // Has slowed down
          if (global.interaction.selected === this.id) {
            console.log(true);
          }
          this.minSpeed.value = 0; // Reached
          this.acceleration.value = new Point(0, 0); // No acceleration
          this.previousAction = this.action;
          return this.action = 'chasing';
        }
      }
    }

    checkCollision() {
      var bacterium, bodyRadius, checkNotColliding, cosine, distance, impactAngle, k, len1, otherBodyRadius, ref1, results, speedComponent;
      checkNotColliding = 0;
      // if @action != 'colliding'
      //   @previousAction = @action # Stores to return to
      bodyRadius = Calc.scale(this.radius.value);
      // Check if in field
      if (this.position.x + bodyRadius >= local.width) {
        // @action = 'colliding'
        this.speed.value.x = 0;
        this.chooseDirection(180); // Start moving away
      } else if (this.position.x - bodyRadius <= 0) {
        // @action = 'colliding'
        this.speed.value.x = 0;
        this.chooseDirection(0); // Start moving away
      } else {
        checkNotColliding += 1;
      }
      if (this.position.y + bodyRadius >= local.height) {
        // @action = 'colliding'
        this.speed.value.y = 0;
        this.chooseDirection(270); // Start moving away
      } else if (this.position.y - bodyRadius <= 0) {
        // @action = 'colliding'
        this.speed.value.y = 0;
        this.chooseDirection(90); // Start moving away
      } else {
        checkNotColliding += 1;
      }
      ref1 = global.bacteria;
      // Check collisions with other bacteria TODO make this check error-free
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bacterium = ref1[k];
        if (this.id !== bacterium.id) { // Not itself
          // How far away the bacteria is
          distance = bacterium.position.subtract(this.position);
          otherBodyRadius = Calc.scale(bacterium.radius.value);
          // If the paths are too close
          if (Calc.combine(distance) <= bodyRadius + otherBodyRadius) {
            // @action = 'colliding'
            // Angle between vectors
            impactAngle = this.speed.value.getAngle(distance);
            // Speed in the illegal direction
            cosine = Math.cos(Calc.rad(impactAngle));
            speedComponent = this.speed.value.multiply(cosine);
            // Some values return NaN in Math.cos
            if (!isNaN(Calc.combine(speedComponent))) {
              // Stop moving in this direction
              this.speed.value = this.speed.value.subtract(speedComponent);
            }
            results.push(this.chooseDirection());
          } else {
            results.push(checkNotColliding += 1);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

    chooseDirection(angle = Random.value(0, 360)) { // TODO use perlin noise
      angle = Calc.rad(angle % 360); // Get out the whole circles
      // Direction as point relative to self (origin)
      this.direction = new Point(Math.cos(angle), Math.sin(angle));
      return this.startMoving();
    }

    findTarget() {
      if (this.action === 'chasing') { // After it has slowed
        this.goToPoint(this.target.position);
        return this.eat(); // Try to eat
      }
    }

    goToPoint(point) {
      var relativePosition;
      // Set the direction
      relativePosition = this.target.position.subtract(this.position);
      this.direction = relativePosition.normalize(1);
      return this.startMoving();
    }

    divide() {}

    die() {}

    eat() {
      // Inside it
      if (check.circleInside(this.body, this.target.particle)) {
        this.energy.value += this.target.energy.value;
        // Gains mass
        this.mass.value += this.target.energy.value * global.constants.atpMass.value;
        this.target.eaten(); // Removes itself
        // findTarget won't be called anymore
        this.target = null; // Doesn't exist anymore
        this.previousAction = this.action;
        this.action = 'wandering';
        return this.chooseDirection();
      }
    }

  };

  // Constructors that inherit code
  Lucarium = class Lucarium extends Bacteria { // TODO add unique traits for family
    constructor() {
      super(...arguments); // Parent constructor
      // Are initialised
      this.family = "Lucarium";
      this.idealConditions = {
        temperature: new SciNum(20, 'temperature', 'degrees'),
        acidity: new SciNum(7, 'pH', ''),
        toxicity: new SciNum(0, 'concentration', 'M')
      };
    }

  };

  Viridis = class Viridis extends Lucarium { // TODO make different traits for the species
    constructor() {
      super(...arguments); // Parent constructor
      // Values that are initialised
      this.species = "Viridis";
      this.taxonomicName = `${this.family} ${this.species // Super has to be called first
}`;
      this.color = '#4caf50';
      this.tolerance = {
        temperature: new SciNum(5, 'temperature', 'degrees'),
        acidity: new SciNum(0.5, 'pH', ''),
        toxicity: new SciNum(2, 'concentration', 'M')
      };
    }

  };

  Rubrum = class Rubrum extends Lucarium {
    constructor() {
      super(...arguments); // Parent constructor
      // Values that are initialised
      this.species = "Rubrum";
      this.taxonomicName = `${this.family} ${this.species // Super has to be called first
}`;
      this.color = '#f44336';
      this.tolerance = {
        temperature: new SciNum(5, 'temperature', 'degrees'),
        acidity: new SciNum(0.5, 'pH', ''),
        toxicity: new SciNum(2, 'concentration', 'M')
      };
    }

  };

  Caeruleus = class Caeruleus extends Lucarium {
    constructor() {
      super(...arguments); // Parent constructor
      // Values that are initialised
      this.species = "Caeruleus";
      this.taxonomicName = `${this.family} ${this.species // Super has to be called first
}`;
      this.color = '#2196f3';
      this.tolerance = {
        temperature: new SciNum(5, 'temperature', 'degrees'),
        acidity: new SciNum(0.5, 'pH', ''),
        toxicity: new SciNum(2, 'concentration', 'M')
      };
    }

  };

  // << Document functions >>
  // Groups
  simulation = {};

  html = {};

  html.layer = {};

  // Sets the size variables
  html.setSize = function() {
    var height, width;
    width = doc.field.width();
    height = doc.field.height();
    // Local variables
    local.width = width;
    local.height = height;
    local.center = new Point(width / 2, height / 2);
    local.size = new Size(width, height);
    return local.origin = new Point(0, 0);
  };

  // TODO add function that adds cards from data
  html.card = function(data) {
    return null;
  };

  // Updates the screen clock
  html.clock = function() {
    var form, hours, minutes, seconds, total;
    // Set values, from https://goo.gl/P14JkU
    total = time.time / 1000;
    hours = Math.floor(total / 3600);
    minutes = Math.floor(total % 3600 / 60);
    seconds = Math.floor(total % 3600 % 60);
    // Format a timestring
    form = function(number) {
      var string;
      string = String(number);
      if (string.length === 1) {
        string = `0${string}`;
      }
      return string;
    };
    // Loop through the parts of the clock
    return doc.clock.each(function() {
      if ($(this).hasClass('hour')) {
        return this.textContent = form(hours);
      } else if ($(this).hasClass('minute')) {
        return this.textContent = form(minutes);
      } else if ($(this).hasClass('second')) {
        return this.textContent = form(seconds);
      }
    });
  };

  // TODO add function that sets up the values of the elements
  html.setup = function() {
    // << Actions >>
    doc.conditions.each(function() {
      return $(this).attr('value', global.enviroment[this.dataset.name].value);
    });
    // << Events >>
    // Update simulated time
    time.clock = setInterval(function() {
      if (!global.interaction.pauzed) { // Time is not pauzed
        time.time += 5; // Update time
        time.trackSecond += 5;
        if (time.trackSecond > 1000) { // Full simulated second
          time.trackSecond = 0; // Restart second
          return simulation.feed();
        }
      }
    }, 5);
    // Every full second
    time.second = setInterval(function() {
      if (!global.interaction.pauzed) { // Time is not pauzed
        html.clock();
        return html.selected();
      }
    }, 1000);
    // Every frame of the canvas
    view.onFrame = function(event) {
      var bacterium, k, len1, ref1, results;
      if (!global.interaction.pauzed) { // Time is not pauzed
        ref1 = global.bacteria;
        // Loop through the bacteria
        results = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          bacterium = ref1[k];
          results.push(bacterium.live()); // Bacteria does actions
        }
        return results;
      }
    };
    
    // Paper.js canvas resize event
    view.onResize = function(event) {
      var previous, scalePositions;
      previous = local.size; // Before resizing
      html.setSize(); // Update size variables
      
      // Function for scaling positions
      scalePositions = function(instances) {
        var instance, k, len1, results, scaledPosition;
        results = [];
        for (k = 0, len1 = instances.length; k < len1; k++) {
          instance = instances[k];
          scaledPosition = new Point({ // Scale the position of the instance
            x: (instance.position.x / previous.width) * local.width,
            y: (instance.position.y / previous.height) * local.height
          });
          instance.position = scaledPosition.round(); // Update position
          // If it isn't a shape
          if (!(instance instanceof Path)) {
            results.push(instance.update()); // Manual update
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
      
      // Scale these
      scalePositions(global.bacteria);
      scalePositions(global.food);
      scalePositions(draw.bubbles);
      // Scale by a factor of intended width / real width
      draw.bottom.scale((local.width / draw.bottom.bounds.width) * 2, (local.height / draw.bottom.bounds.height) * 2); // Don't know why times 2 but it works, don't touch it
      return draw.bottom.position = local.origin; // Rectangle is updated
    };
    
    // When view goes out of focus
    $(window).blur(function() {
      return html.pause(false); // Set to on
    });
    // Window refocuses
    $(window).focus(function() {
      return html.pause(true); // Set to off
    });
    // TODO add restart button event
    doc.start.click(function() {});
    // Click events check if bacteria is clicked
    doc.screen.click(function(event) {
      var bacterium, k, len1, location, ref1, results;
      location = new Point(event.pageX, event.pageY);
      console.log("Click at ", location);
      ref1 = global.bacteria;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bacterium = ref1[k];
        if (check.inCircle(location, bacterium.body)) {
          bacterium.select(); // Gets selected
          html.selected(); // Trigger now instead of waiting
          break; // End loop
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
    // Open and close menu
    doc.menuButton.click(function() {
      return html.menu();
    });
    // The menu events TODO work out these events
    return doc.menuItems.each(function() {
      return $(this).click(function() {
        switch (this.name) { // Different name attributes
          case "volume":
            return html.sound();
          case "pause":
            return html.pause();
          case "cards":
            return html.cardsToggle();
          case "view":
            return null;
          case "info":
            return null;
        }
      });
    });
  };

  // Updates infopanel
  html.selected = function() {
    var bacterium, data, k, len1, ref1, results;
    if (global.interaction.selected !== null) {
      ref1 = global.bacteria;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bacterium = ref1[k];
        // Find the selected
        if (bacterium.id === global.interaction.selected) {
          data = bacterium;
          // Loop through the rows
          doc.data.each(function() {
            if ($(this).hasClass('value')) {
              // Get the value from the propertyname
              return this.textContent = data[this.dataset.name];
            }
          });
          doc.values.each(function() {
            var scinum;
            if ($(this).hasClass('value')) {
              // TODO edit values before displaying
              scinum = data[this.dataset.name];
              // Loop through two spans
              return $(this).find('span').each(function() {
                if ($(this).hasClass('number')) {
                  return this.textContent = scinum.notation();
                } else if ($(this).hasClass('unit')) {
                  return this.textContent = scinum.unit;
                }
              });
            }
          });
          doc.bacteria.attr('data-content', true); // Make visible
          break; // End loop
// No selected
        } else {
          results.push(void 0);
        }
      }
      return results;
    } else {
      return doc.bacteria.attr('data-content', false);
    }
  };

  // TODO add function that displays the ratio
  html.pie = function() {
    return null;
  };

  // Pauses the simulation
  html.pause = function(change = global.interaction.pauzed) {
    var icon;
    icon = doc.menu.find("button[name=pause] img");
    if (change) { // Unpauze
      global.interaction.pauzed = false;
      return icon.attr('src', 'assets/images/icons/ic_pause_black_24px.svg'); // Pauze
    } else {
      global.interaction.pauzed = true;
      return icon.attr('src', 'assets/images/icons/ic_play_arrow_black_24px.svg');
    }
  };

  // Music control
  html.sound = function(change = global.interaction.sound) {
    var icon;
    icon = doc.menu.find("button[name=volume] img");
    if (change) { // Unpauze
      global.interaction.sound = false;
      return icon.attr('src', 'assets/images/icons/ic_volume_off_black_24px.svg'); // Pauze
    } else {
      global.interaction.sound = true;
      return icon.attr('src', 'assets/images/icons/ic_volume_up_black_24px.svg');
    }
  };

  // Toggle the card system
  html.cardsToggle = function(change = global.interaction.cards) {
    var icon;
    icon = doc.menu.find("button[name=cards] img");
    if (change) { // Unpauze
      global.interaction.cards = false;
      doc.cards.hide();
      return icon.attr('src', 'assets/images/icons/ic_chat_outline_black_24px.svg'); // Pauze
    } else {
      global.interaction.cards = true;
      doc.cards.show();
      return icon.attr('src', 'assets/images/icons/ic_chat_black_24px.svg');
    }
  };

  html.menu = function(change = doc.menu.attr('data-state')) {
    var icon;
    icon = doc.menuButton.find('img');
    // Possible values
    change = change === 'collapse' || change === true;
    if (change) {
      doc.menuButton.attr('disabled', true); // No double click
      doc.menu.attr('data-state', 'expand');
      // After animation
      return setTimeout(function() {
        doc.menuButton.attr('disabled', false);
        return icon.attr('src', 'assets/images/icons/ic_close_white_24px.svg');
      }, global.interaction.time);
    } else {
      doc.menuButton.attr('disabled', true); // No double click
      doc.menu.attr('data-state', 'collapse');
      // After animation
      return setTimeout(function() {
        doc.menuButton.attr('disabled', false);
        return icon.attr('src', 'assets/images/icons/ic_menu_white_24px.svg');
      }, global.interaction.time);
    }
  };

  // Creates instances of bacteria
  simulation.createLife = function() {
    var energy, mass;
    console.log("Creating life");
    html.layer.bacteria.activate();
    // Starter values
    mass = new SciNum(7e-16, 'mass', 'kg');
    energy = new SciNum(3.9e9, 'energy', 'atp');
    global.bacteria[0] = new Viridis(mass, energy, local.center, 1, 0);
    global.bacteria[1] = new Rubrum(mass, energy, local.center.subtract(100, 0), 1, 0);
    return global.bacteria[2] = new Caeruleus(mass, energy, local.center.add(100, 0), 1, 0);
  };

  // Set up the constants
  simulation.setConstants = function() {
    global.constants = {
      waterDensity: new SciNum(0.982e3, 'density', 'kg/m^3'), // Around a temperature of 20 degrees
      atomairMass: new SciNum(1.660539e-27, 'mass', 'kg')
    };
    global.constants.bacteriaDensity = new SciNum(((2 / 3) * global.constants.waterDensity.value) + ((1 / 3) * (13 / 10) * global.constants.waterDensity.value), 'density', 'kg/m^3'); // Different by a factor of 1.1
    return global.constants.atpMass = new SciNum(507.18 * global.constants.atomairMass.value, 'mass', 'kg'); // Using the mass of 507 u
  };

  // Generates food
  simulation.feed = function() {
    var amount, food, left, results, total;
    html.layer.food.activate;
    total = global.enviroment.energy.value;
    left = total; // Inital
    results = [];
    // Food left to give and maximum instances not reached
    while (left > 0 && global.food.length <= 20) {
      // A percentage of the total
      amount = Random.value(total * 0.10, total * 0.15);
      if (amount < left) {
        left -= amount; // Remove from what's left
      } else {
        amount = left; // Remainder
        left = 0; // Ends loop
      }
      // Add food
      food = new Food(new SciNum(Math.floor(amount), 'energy', 'j'));
      food.display(); // Draw in field
      results.push(global.food.push(food)); // Add to array
    }
    return results;
  };

  
  // Sets up the document
  simulation.setup = function(callback) {
    paper.install(window); // Don't have to acces objects via paper object
    paper.setup(doc.screen[0]);
    html.setSize(); // Initial value
    
    // Paper.js layers
    html.layer.background = new Layer();
    html.layer.food = new Layer();
    html.layer.bacteria = new Layer();
    simulation.setConstants();
    draw.background();
    simulation.createLife();
    return callback();
  };

  // Starts simulation
  simulation.start = function() {
    var input;
    console.log("Loaded completely");
    // Add events to elements
    doc.start.find("button[name=continue]").click(function() {
      return doc.start.find(".screen:first").hide(); // Hide first screen
    });
    doc.start.find("button[name=start]").click(function() {
      doc.start.hide(); // Hide complete screen
      return simulation.run();
    });
    input = doc.start.find(".slider");
    input.each(function() {
      // Initial value
      global.enviroment[this.name] = new SciNum(Number(this.value), this.name, this.dataset.unit);
      // Update the variables on change
      return $(this).change(function() {
        var value;
        value = Number(this.value); // Is recieved as string
        return global.enviroment[this.name] = new SciNum(value, this.name, this.dataset.unit);
      });
    });
    return $("#loading").hide(); // Hide loading screen
  };

  
  // Runs simulation
  simulation.run = function() {
    var bacterium, k, len1, ref1;
    ref1 = global.bacteria;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      bacterium = ref1[k];
      bacterium.born(); // Starts the bacteria
    }
    global.interaction.pauzed = false; // Unpauze time
    html.setup(); // Activate document
    return console.log(project.activeLayer);
  };

  // << Simulation functions >>
  // Groups
  draw = {};

  // Draws the background
  draw.background = function() {
    var bubbleValues, index, k, len1, value;
    html.layer.background.activate();
    // Background objects TODO add more and style them
    draw.bottom = new Path.Rectangle(local.origin, local.size);
    draw.bottom.fillColor = 'grey';
    html.layer.background.addChild(draw.bottom);
    draw.bubbles = [];
    bubbleValues = [ // Th info for the bubbles
      {
        position: [350,
      200],
        size: 200
      },
      {
        position: [600,
      700],
        size: 100
      }
    ];
    // Every value
    for (index = k = 0, len1 = bubbleValues.length; k < len1; index = ++k) {
      value = bubbleValues[index];
      draw.bubbles[index] = new Path.Circle(value.position, value.size / 2);
      draw.bubbles[index].fillColor = 'darkgrey';
    }
    return html.layer.background.addChildren(draw.bubbles);
  };

  // Checks if loading is done
  isLoaded = setInterval(function() {
    if (global.interaction.loaded) {
      // << Actions >>
      clearInterval(isLoaded); // End itself from rechecking
      return simulation.setup(function() {
        return simulation.start();
      });
    }
  }, 1);

}).call(this);
