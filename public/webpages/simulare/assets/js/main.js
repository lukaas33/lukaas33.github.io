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
    scaleFactor: 1.2e6, // Scale of the animation, 1 cm : this cm
    maxInstances: {
      food: 30
    },
    standard: {
      mass: 1.64e-15 // Will get the average values of the species
    }
  };

  ref = ['start', 'home', 'screen', 'field', 'menu', 'sidebar', 'cards', 'enviroment', 'bacteria', 'priority', 'scale', 'overlay'];
  
  // Get elements with these id's
  for (j = 0, len = ref.length; j < len; j++) {
    id = ref[j];
    doc[id] = $(`#${id}`);
  }

  // Store these selections
  doc.body = $('body');

  doc.close = $('[data-close] button[name=close]');

  doc.clear = $('[data-clear] button[name=clear]');

  doc.menuItems = doc.menu.find('.item button');

  doc.menuButton = doc.menu.find('.indicator button');

  doc.data = doc.bacteria.find('.data tr td');

  doc.values = doc.bacteria.find('.values tr td');

  doc.conditions = doc.enviroment.find('progress');

  doc.clock = doc.priority.find('.clock p span');

  doc.ratio = doc.priority.find('.chart');

  // << Return functions >>
  // Groups
  Calc = {};

  Random = {};

  check = {};

  generate = {};

  time = {
    time: 0,
    trackSecond: 0,
    check: {}
  };

  // Convert period to h:m:s
  time.represent = function(total) {
    var hours, minutes, seconds;
    // Set values, from https://goo.gl/P14JkU
    hours = Math.floor(total / 3600);
    minutes = Math.floor(total % 3600 / 60);
    seconds = Math.floor(total % 3600 % 60);
    return [hours, minutes, seconds];
  };

  // Interval function using the pauze functionality
  time.interval = function(timing, func) {
    var target;
    target = time.time + (timing * 1000);
    id = generate.id(time.check); // To be able to reset
    return time.check[id] = setInterval((target, func, id) => {
      if (time.time >= target) {
        clearInterval(time.check[id]);
        return func();
      }
    }, 1000, target, func, id);
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
  Random.value = function(bottom, top, use = Math.random) {
    var middle, value;
    middle = top - bottom;
    value = (use() * middle) + bottom;
    return value;
  };

  // Return true with a certain chance
  Random.chance = function(chance) {
    var result;
    result = Math.ceil(Math.random() * chance); // Number 1 until chance
    if (result === 1) { // Chance of one in chance
      return true;
    } else {
      return false;
    }
  };

  // Normal distribution random numbers
  // From https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
  Random.normal = function() {
    var i, total;
    total = ((function() {
      var k, results;
      results = [];
      for (i = k = 1; k <= 6; i = ++k) {
        results.push(Math.random());
      }
      return results;
    })()).reduce(function(t, s) {
      return t + s;
    });
    return total / 6;
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
    constructor(value, quantity, unit) {
      // Change number notation as string
      this.notation = this.notation.bind(this);
      // Change unit to html markup
      this.unitNotation = this.unitNotation.bind(this);
      // Changes unit to be more friendly
      this.represent = this.represent.bind(this);
      this.value = value;
      this.quantity = quantity;
      this.unit = unit;
    }

    notation(number) {
      var string;
      number = number.toFixed(3);
      string = number.toString();
      return string;
    }

    unitNotation(string) {
      var dom, html, parts;
      html = null;
      if (string.indexOf('/') !== -1) { // Is a fraction
        parts = string.split('/');
        dom = $('<span></span>').addClass('fraction');
        dom.append($('<span></span>').addClass('top').append(this.unitNotation(parts[0]))); // Recursion, will add fraction html if present
        dom.append($('<span></span>').addClass('bottom').append(this.unitNotation(parts[1])));
        html = dom[0];
      } else if (string.indexOf('^') !== -1) { // Has an exponent
        parts = string.split('^');
        dom = $('<span></span>');
        dom.append($('<span></span>').html(parts[0]));
        dom.append($('<sup></sup>').html(parts[1]));
        html = dom[0];
      } else {
        html = $('<span></span>').html(string)[0];
      }
      return html;
    }

    represent() {
      var converted, form, hours, k, len1, minutes, newValue, prefix, ref1, seconds, set, unit, value;
      set = global.constants.prefixes;
      unit = this.unit;
      value = this.value;
      converted = null;
      if (value instanceof Point) { // vector
        value = Calc.combine(value);
      }
      
      // Exeptions
      if (unit === 'kg') { // Base of gram is at kilograms
        unit = 'g';
        newValue *= 1000;
      }
      if (value === 0) { // Same with every unit
        converted = new SciNum(value, this.quantity, this.unitNotation(unit));
      } else {
        if (unit === 's') { // Different common notation
          form = function(number) {
            var string;
            string = String(number);
            if (string.length === 1) {
              string = `0${string}`;
            }
            return string;
          };
          [hours, minutes, seconds] = time.represent(this.value);
          converted = new SciNum(`${form(hours)}:${form(minutes)}:${form(seconds)}`, this.quantity, null);
        } else {
          if (Math.abs(value) < 1) { // Low numbers
            set = set.lower;
          } else if (Math.abs(value) >= 1) { // Higher numbers
            set = set.higher;
          }
          for (k = 0, len1 = set.length; k < len1; k++) {
            prefix = set[k];
            newValue = value / prefix[1];
            
            // Change prefix
            if ((1 <= (ref1 = Math.abs(newValue)) && ref1 <= 1000)) { // New value is of normal size
              // console.log newValue, @quantity
              converted = new SciNum(this.notation(newValue), this.quantity, this.unitNotation(`${prefix[0]}${unit}`));
            }
          }
        }
      }
      // console.log unitDifferent
      return converted;
    }

  };

  // Constructor for food
  Food = class Food {
    // Values that need to be entered
    constructor(energy) {
      // Checks if position is legal
      this.isLegal = this.isLegal.bind(this);
      
      // Creates the particle
      this.display = this.display.bind(this);
      
      // Update location
      this.update = this.update.bind(this);
      // Gets eaten, removes itself
      this.eaten = this.eaten.bind(this);
      this.id = generate.id(global.food);
      this.energy = new SciNum(energy, 'energy', 'atp');
      this.mass = new SciNum(this.energy.value * global.constants.atpMass.value, 'mass', 'kg');
      // Density based on water density, real value doesn't exist because the molecules are made up
      this.volume = new SciNum(this.mass.value / (global.constants.waterDensity.value / 2.5), 'volume', 'm^3');
      this.diameter = new SciNum(Calc.diameter(this.volume.value), 'length', 'm'); // Size depends on energy
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
      var food, index, k, len1, ref1;
      ref1 = global.food;
      for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
        food = ref1[index];
        // Don't know why, but the loop keeps getting an undefined
        if (typeof food !== 'undefined') {
          if (food.id === this.id) {
            // Remove reference to self
            global.food.splice(index, 1);
          }
        }
      }
      return this.particle.remove(); // Remove drawn shape
    }

  };

  
  // Bacteria constructors
  Bacteria = class Bacteria { // Has values shared by all bacteria
    // Values that need to be entered
    constructor(mass, position, generation = 1, birth = 0, mutations = []) {
      // Methods
      // Starts living
      this.born = this.born.bind(this);
      // Continues living TODO work out energy system with traits
      this.live = this.live.bind(this);
      // Changes the action
      this.changeAction = this.changeAction.bind(this);
      // Creates a body TODO the colors and style of the bacteria
      this.display = this.display.bind(this);
      // Updates its body
      this.update = this.update.bind(this);
      
      // Gets selected by user
      this.select = this.select.bind(this);
      
      // Gets older
      this.ages = this.ages.bind(this);
      // Change acceleration to go to direction
      this.startMoving = this.startMoving.bind(this);
      // Starts moving
      this.move = this.move.bind(this);
      // Loses energy TODO calculate the energy loss with traits
      this.loseEnergy = this.loseEnergy.bind(this);
      // Checks if there is food nearby
      this.foodNearby = this.foodNearby.bind(this);
      
      // Check if it can divide or if it dies
      this.checkValues = this.checkValues.bind(this);
      // Checks the speed
      this.checkSpeed = this.checkSpeed.bind(this);
      // Checks if there is a collision
      this.checkCollision = this.checkCollision.bind(this);
      // Choose a new direction default is random
      this.chooseDirection = this.chooseDirection.bind(this);
      // Go to a point
      this.goToPoint = this.goToPoint.bind(this);
      // Prepares for division
      this.stop = this.stop.bind(this);
      
      // Divison TODO make animatio
      this.mitosis = this.mitosis.bind(this);
      
      // Dies TODO make animation
      this.die = this.die.bind(this);
      // Eat food instances
      this.eat = this.eat.bind(this);
      // Values that are initialised from arguments
      this.mass = {};
      this.mass.current = new SciNum(mass, 'mass', 'kg');
      this.position = position;
      this.generation = generation;
      this.birth = birth;
      this.mutations = mutations; // Stores the mutations since generation 1
      
      // Other values
      this.id = generate.id(global.bacteria.concat(global.dead)); // Unique with all bacteria, living and dead
      this.energy = new SciNum(Math.round(this.mass.current.value / global.constants.atpMass.value), 'energy', 'atp'); // Number of atp molecules
      this.density = new SciNum(((2 / 3) * global.constants.waterDensity.value) + ((1 / 3) * (13 / 10) * global.constants.waterDensity.value), 'density', 'kg/m^3'); // Different by a factor of 1.1 from water
      this.volume = new SciNum(this.mass.current.value / this.density.value, 'volume', 'm^3');
      this.diameter = new SciNum(Calc.diameter(this.volume.value), 'length', 'm');
      this.radius = new SciNum(this.diameter.value / 2, 'length', 'm');
      this.acceleration = new SciNum(new Point(0, 0), 'acceleration', 'm/s^2'); // Used when starting to move
      this.speed = {};
      this.decceleration = new SciNum(0, 'negative acceleration', 'm/s^2'); // Used when slowing down
      this.speed.min = new SciNum(new Point(0, 0), 'speed', 'm/s');
      this.speed.current = new SciNum(new Point(0, 0), 'speed', 'm/s');
      this.age = new SciNum(0, 'time', 's');
      // Depends on constant to avoid change
      this.mass.max = new SciNum(1.5 * local.standard.mass, 'mass', 'kg');
      this.mass.min = new SciNum(0.35 * local.standard.mass, 'mass', 'kg');
      this.lastDivision = new SciNum(null, 'time', 's'); // Hasn't divided yet
      this.energyLoss = {};
      this.energyLoss.current = new SciNum(0, 'energy per second', 'atp/s'); // Initially
      this.direction = null; // Stores the direction as point
      this.target = null; // No target yet
      this.timer = null; // Stores interval
      // Tracks actions
      this.action = { // Initial
        current: null,
        previous: null
      };
    }

    born() {
      this.display();
      this.ages();
      return this.chooseDirection();
    }

    live() {
      var ref1;
      if (this.action.current === 'Dying') { // RIP
        this.die();
      } else if ((ref1 = this.action.current) === 'Mitosis' || ref1 === 'Stopping') { // Normal

      } else {
        // Do nothing in this block
        if (this.action.current === 'Colliding') { // Move away
          this.chooseDirection();
        } else {
          this.foodNearby();
          if (this.target === null) { // Not chasing
            if (Random.chance(25)) { // Food is near
              // With a chance of 1/x, change direction
              this.chooseDirection();
            }
          } else {
            if (this.action.current === 'Chasing') { // After it has slowed
              this.goToPoint(this.target.position);
            }
          }
        }
        this.eat(); // Will try to eat
        this.loseEnergy();
      }
      this.move();
      return this.update();
    }

    changeAction(action) {
      if (action !== this.action.current || this.action.current === null) { // Changes
        this.action.previous = this.action.current;
        return this.action.current = action;
      }
    }

    display() {
      // Body at instance's location
      this.body = new Path.Circle(this.position.round(), Math.round(Calc.scale(this.radius.value)));
      this.body.fillColor = this.color;
      this.body.name = this.id; // In paper.js layer
      return html.layer.bacteria.addChild(this.body);
    }

    update() {
      var difference, previous;
      this.checkValues();
      this.mass.current.value = this.energy.value * global.constants.atpMass.value; // Convert
      this.volume.value = this.mass.current.value / this.density.value;
      this.diameter.value = Calc.diameter(this.volume.value);
      // Change its size
      previous = this.radius.value;
      this.radius.value = this.diameter.value / 2; // New value
      if (this.radius.value !== previous) {
        difference = this.radius.value / previous; // Ratio
        this.body.scale(difference);
      }
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
      return this.timer = setInterval(() => {
        return this.age.value = (time.time - this.birth) / 1000;
      }, 1000);
    }

    startMoving() {
      var targetSpeed;
      // Will change length of vector to be the max speed
      targetSpeed = this.direction.normalize(this.speed.max.value);
      // Add to the acceleration, at 0 it will take x seconds to accelerate
      return this.acceleration.value = targetSpeed.divide(3.5);
    }

    move() {
      var acceleration, decceleration, newSpeed, ref1, speed;
      this.checkCollision(); // Test if it can move
      if ((ref1 = this.action.current) === 'Finding' || ref1 === 'Stopping') { // Slowing down
        // Per frame to per second
        decceleration = this.decceleration.value / local.fps;
        newSpeed = Calc.combine(this.speed.current.value) - decceleration;
        // Reduces speed
        this.speed.current.value = this.speed.current.value.normalize(newSpeed);
      } else {
        // Per second instead of frame
        acceleration = this.acceleration.value.divide(local.fps);
        // Will accelerate to maxSpeed
        this.speed.current.value = this.speed.current.value.add(acceleration);
      }
      this.checkSpeed();
      // Scaled speed
      speed = new Point({
        x: Calc.scale(this.speed.current.value.x),
        y: Calc.scale(this.speed.current.value.y)
      });
      // Per second instead of frame
      speed = speed.divide(local.fps);
      // Change position
      return this.position = this.position.add(speed);
    }

    loseEnergy() {
      var atpSec, condition, current, difference, factor, k, len1, loss, range, ref1;
      loss = this.energyLoss.min.value;
      ref1 = ['temperature', 'concentration', 'acidity'];
      // Influence of conditions
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        condition = ref1[k];
        // Get the difference between the value and ideal value
        current = global.enviroment[condition].value;
        difference = Math.abs(current - this.idealConditions[condition].value);
        // Each species has a different tolerance
        if (difference >= this.tolerance[condition].value) {
          difference -= this.tolerance[condition].value;
        } else {
          difference = 0;
        }
        // All conditions will have similar effects
        range = global.enviroment.ranges[condition][1] - global.enviroment.ranges[condition][0];
        factor = difference / range;
        if (condition === 'concentration') {
          factor /= 2; // Same energy effect as other enviroment factors
        }
        factor *= 3; // Increase the effect of enviroment factors
        
        // The difference influences the loss of energy
        if (factor !== 0) {
          loss *= factor;
        }
      }
      loss = Math.floor(loss);
      this.energyLoss.current.value = loss;
      loss *= 30; // Increased to speed up things
      
      // Loses energy per second
      atpSec = loss / local.fps;
      return this.energy.value -= atpSec;
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
              // Will slow down until reached
              this.speed.min.value = this.speed.max.value / 8;
              this.changeAction('Finding');
              // Slow down
              this.decceleration.value = Calc.combine(this.speed.current.value);
            } else if (this.target.id !== target.instance.id) { // New target
              // Will slow down until reached
              this.speed.min.value = this.speed.max.value / 8;
              this.changeAction('Finding');
              // Slow down
              this.decceleration.value = Calc.combine(this.speed.current.value);
            }
            results.push(this.target = target.instance);
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        return this.target = null; // Doesn't exist anymore
      }
    }

    checkValues() {
      var ref1;
      if (this.mass.current.value <= this.mass.min.value && this.action.current !== 'Dying') {
        return this.changeAction('Dying');
      } else if (this.mass.current.value >= this.mass.max.value) {
        if ((ref1 = this.action.current) !== 'Mitosis' && ref1 !== 'Stopping') { // Not already dividing
          return this.stop();
        }
      }
    }

    checkSpeed() {
      var duration;
      // Check if xSpeed and ySpeed together are higher than maxSpeed
      if (Calc.combine(this.speed.current.value) >= this.speed.max.value) {
        this.acceleration.value = new Point(0, 0); // No acceleration
        this.speed.current.value.normalize(this.speed.max.value); // Reduce speed
      }
      if (this.action.current === 'Finding') { // Looking for food
        if (Calc.combine(this.speed.current.value) <= this.speed.min.value) { // Has slowed down
          // Speed reached minimum or got too low
          this.speed.current.value.normalize(this.speed.min.value); // Increase speed
          this.speed.min.value = 0; // Reached, is reset
          this.decceleration.value = 0; // Is reset
          this.changeAction('Chasing');
        }
      }
      if (this.action.current === 'Stopping') { // Coming to a full stop
        if (Calc.combine(this.speed.current.value) < 1e-9) { // Too low to see
          this.speed.current.value = new Point(0, 0); // Stop completely
          this.acceleration.value = new Point(0, 0); // To be sure
          this.decceleration.value = 0; // Is reset
          if (this.action.current !== 'Mitosis') { // Double check
            console.log(this.id, 'start mitosis');
            this.changeAction('Mitosis'); // Next step in divison
            duration = this.mitosisDuration.value / 60; // Changed for user experience
            return time.interval(duration, this.mitosis);
          }
        }
      }
    }

    checkCollision() {
      var bacterium, bodyRadius, checkNotColliding, cosine, distance, impactAngle, k, len1, otherBodyRadius, ref1, ref2, speedComponent;
      checkNotColliding = 0;
      bodyRadius = Calc.scale(this.radius.value);
      // Check if in field
      if (this.position.x + bodyRadius >= local.width) {
        this.changeAction('Colliding');
        this.speed.current.value.x = 0;
        this.chooseDirection(180); // Start moving away
      } else if (this.position.x - bodyRadius <= 0) {
        this.changeAction('Colliding');
        this.speed.current.value.x = 0;
        this.chooseDirection(0); // Start moving away
      } else {
        checkNotColliding += 1;
      }
      if (this.position.y + bodyRadius >= local.height) {
        this.changeAction('Colliding');
        this.speed.current.value.y = 0;
        this.chooseDirection(270); // Start moving away
      } else if (this.position.y - bodyRadius <= 0) {
        this.changeAction('Colliding');
        this.speed.current.value.y = 0;
        this.chooseDirection(90); // Start moving away
      } else {
        checkNotColliding += 1;
      }
      ref1 = global.bacteria;
      // Check collisions with other bacteria TODO make this check error-free
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bacterium = ref1[k];
        if (this.id !== bacterium.id) { // Not itself
          // How far away the bacteria is
          distance = bacterium.position.subtract(this.position);
          otherBodyRadius = Calc.scale(bacterium.radius.value);
          // If the paths are too close
          if (Calc.combine(distance) <= bodyRadius + otherBodyRadius) {
            this.changeAction('Colliding');
            // Angle between vectors
            impactAngle = this.speed.current.value.getAngle(distance);
            // Speed in the illegal direction
            cosine = Math.cos(Calc.rad(impactAngle));
            speedComponent = this.speed.current.value.multiply(cosine);
            // Some values return NaN in Math.cos
            if (!isNaN(Calc.combine(speedComponent))) {
              // Stop moving in this direction
              this.speed.current.value = this.speed.current.value.subtract(speedComponent);
            }
          } else {
            checkNotColliding += 1;
          }
        }
      }
      if (this.action.current === 'Colliding' && ((ref2 = this.action.previous) === 'Mitosis' || ref2 === 'Stopping')) { // Action must go on
        this.changeAction(this.action.previous);
      }
      if (this.action.current === 'Colliding' && checkNotColliding === 2 + global.bacteria.length - 1) { // Stopped colliding
        return this.changeAction(this.action.previous);
      }
    }

    chooseDirection(angle = Random.value(0, 360)) { // TODO use perlin noise
      angle = Calc.rad(angle % 360); // Get out the whole circles
      // Direction as point relative to self (origin)
      this.direction = new Point(Math.cos(angle), Math.sin(angle));
      this.startMoving();
      return this.changeAction('Wandering');
    }

    goToPoint(point) {
      var relativePosition;
      // Set the direction
      relativePosition = this.target.position.subtract(this.position);
      this.direction = relativePosition.normalize(1);
      return this.startMoving();
    }

    stop() {
      var ref1;
      if ((ref1 = this.action.current) !== 'Mitosis' && ref1 !== 'Stopping') { // No double
        this.changeAction('Stopping');
        // Slow to a stop
        return this.decceleration.value = Calc.combine(this.speed.current.value) / 5; // Low because speed is already low
      }
    }

    mitosis() {
      var args, chance, condition, factor, index, k, len1, offspring, ref1;
      // Values of the current bacteria changes
      this.energy.value /= 2;
      this.update(); // Force mass update
      
      // Store time it took to divide
      if (this.lastDivision.value === null) {
        global.data.divisionTime.push(time.time - this.birth);
      } else {
        global.data.divisionTime.push(time.time - (this.lastDivision.value * 1000));
      }
      this.lastDivision.value = time.time / 1000;
      // Gets changed values
      args = [
        this.mass.current.value,
        this.position.add(Calc.scale(this.radius.value) * 1.5), // Outside current
        this.generation + 1,
        time.time,
        this.mutations
      ];
      // Call constructor
      if (this.species === 'Viridis') {
        offspring = new Viridis(...args);
      } else if (this.species === 'Rubrum') {
        offspring = new Rubrum(...args);
      } else if (this.species === 'Caeruleus') {
        offspring = new Caeruleus(...args);
      }
      chance = this.mutationChance * 100; // Is higher for user experience
      ref1 = ['temperature', 'concentration', 'acidity'];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        condition = ref1[k];
        if (Random.chance(Math.pow(chance, -1))) { // Mutation occurs
          console.log(offspring.id, 'mutated');
          // Rand value with normal distribution around 1
          factor = Random.value(0.5, 1.5, Random.normal);
          offspring.tolerance[condition].value *= factor; // Can get higher or lower
          offspring.mutations.push({ // Mutaion info
            generation: offspring.generation,
            condition: condition,
            value: offspring.tolerance[condition].value
          });
        }
      }
      index = global.bacteria.push(offspring) - 1; // Insert at the index
      global.bacteria[index].born(); // It's alive!
      html.ratio();
      console.log(offspring.id, 'came into existence');
      return this.chooseDirection(); // Resume activity
    }

    die() {
      var bacterium, index, k, len1, ref1, results;
      ref1 = global.bacteria;
      results = [];
      for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
        bacterium = ref1[index];
        if (typeof bacterium !== 'undefined') { // Can be called twice
          if (bacterium.id === this.id) {
            console.log(this.id, 'died');
            if (global.interaction.selected === this.id) {
              global.interaction.selected = null; // Deselect
            }
            clearInterval(this.timer); // Stop aging
            global.bacteria.splice(index, 1); // Stop tracking
            global.dead.push(this); // Store info
            html.ratio();
            results.push(this.body.remove());
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

    eat() {
      var energy;
      if (this.target !== null) {
        // Inside it
        if (check.circleInside(this.body, this.target.particle)) {
          energy = this.target.energy.value * 10; // Increased to speed up things
          this.energy.value += energy;
          this.target.eaten(); // Removes itself
          // findTarget won't be called anymore
          return this.target = null; // Doesn't exist anymore
        }
      }
    }

  };

  
  // Constructors that inherit code
  Lucarium = class Lucarium extends Bacteria { // This family of bacteria has its own traits
    constructor() {
      super(...arguments); // Parent constructor
      // Are initialised
      this.family = "Lucarium";
      this.speed.max = new SciNum(this.diameter.value * 1.5, 'speed', 'm/s'); // Speed based on body size
      this.energyLoss.min = new SciNum(4e5, 'energy per second', 'atp/s');
      this.viewRange = new SciNum(this.diameter.value * 2.5, 'length', 'm');
      this.mitosisDuration = new SciNum(60 * 20, 'time', 's');
      this.mutationChance = 1 / 1000;
      this.idealConditions = {
        temperature: new SciNum(20, 'temperature', 'degrees'),
        acidity: new SciNum(7, 'pH', ''),
        concentration: new SciNum(0, 'concentration', 'M')
      };
    }

  };

  Viridis = class Viridis extends Lucarium { // TODO make different traits for the species
    constructor() {
      var k, len1, mutation, ref1;
      super(...arguments); // Parent constructor
      // Values that are initialised
      this.species = "Viridis";
      this.taxonomicName = `${this.family} ${this.species // Super has to be called first
}`;
      this.color = '#4caf50';
      this.tolerance = {
        temperature: new SciNum(2, 'temperature', '&deg;C'),
        acidity: new SciNum(0.15, 'pH', ''),
        concentration: new SciNum(7.8, 'concentration', 'kg/m^3')
      };
      // inherit mutations
      if (this.mutations.length > 0) {
        ref1 = this.mutations;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          mutation = ref1[k];
          if (mutation.generation = this.generation - 1) { // Parent
            this.tolerance[mutation.condition].value = mutation.value;
          }
        }
      }
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
        temperature: new SciNum(10, 'temperature', '&deg;C'),
        acidity: new SciNum(0.15, 'pH', ''),
        concentration: new SciNum(1.56, 'concentration', 'kg/m^3')
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
        temperature: new SciNum(2, 'temperature', '&deg;C'),
        acidity: new SciNum(0.75, 'pH', ''),
        concentration: new SciNum(1.56, 'concentration', 'kg/m^3')
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
    width = doc.body.width() * 0.8; // 80 vw
    height = doc.body.height();
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
    var form, hours, minutes, seconds;
    [hours, minutes, seconds] = time.represent(time.time / 1000);
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

  // Display the ratio between the bacteria TODO display in sidebar
  html.ratio = function() {
    var all, amount, at, bacterium, ca, circle, htmlClass, index, k, l, len1, len2, number, percentage, pie, ref1, results, ru, species, total, vi;
    total = global.bacteria.length;
    species = ['Rubrum', 'Caeruleus', 'Viridis'];
    [vi, ru, ca] = [0, 0, 0];
    ref1 = global.bacteria;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      bacterium = ref1[k];
      if (bacterium.species === species[0]) {
        ru += 1;
      } else if (bacterium.species === species[1]) {
        ca += 1;
      } else if (bacterium.species === species[2]) {
        vi += 1;
      }
    }
    all = [ru / total, ca / total, vi / total];
    global.data.ratio.push({ // Store the data
      time: time.time,
      population: total,
      ratio: {
        Rubrum: all[0],
        Caeruleus: all[1],
        Viridis: all[2]
      }
    });
    // As text in tooltip
    doc.ratio.next().text(`Ratio ${Math.round(all[2] * 100)}:${Math.round(all[1] * 100)}:${Math.round(all[0] * 100)}`);
    circle = Math.round(Math.PI * 100); // Circumference of circle
    at = 0;
    results = [];
    for (index = l = 0, len2 = all.length; l < len2; index = ++l) {
      percentage = all[index];
      number = percentage * circle; // Part of the circle
      htmlClass = species[index].toLowerCase();
      pie = doc.ratio.find(`.${htmlClass // Class in html
}`);
      amount = at + number;
      at += number;
      results.push(pie.css('strokeDasharray', `${amount}%, ${circle}%`));
    }
    return results;
  };

  // sets up the values of the elements
  html.setup = function() {
    // << Actions >>
    doc.conditions.each(function() {
      var condition, range, relative, repr, val;
      // Worked with meter-element, progress min is always 0
      // $(@).attr('min', range[0])
      condition = global.enviroment[this.dataset.name];
      val = condition.value;
      range = global.enviroment.ranges[this.dataset.name];
      relative = (val - range[0]) / (range[1] - range[0]);
      $(this).attr('max', 1);
      $(this).attr('value', relative);
      repr = condition.represent();
      return $(this).next().html(Math.round(repr.value) + ' ').append(repr.unit); // Add to tooltip
    });
    doc.scale.find('span').text(` 1 : ${local.scaleFactor}`);
    // << Events >>
    // Update simulated time
    time.clock = setInterval(function() {
      if (!global.interaction.pauzed) { // Time is not pauzed
        time.time += 10; // Update time
        time.trackSecond += 10;
        if (time.trackSecond > 1000) { // Full simulated second
          time.trackSecond = 0; // Restart second
          return simulation.feed();
        }
      }
    }, 10);
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
          if (typeof bacterium !== 'undefined') { // Stop being called when bacteria is removed
            results.push(bacterium.live()); // Bacteria does actions
          } else {
            results.push(void 0);
          }
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
    $(window).blur(function() {});
    // Window refocuses
    // html.pause(off) # Set to on
    $(window).focus(function() {});
    // User has to confirm in order to leave the page
    // html.pause(on) # Set to off
    window.onbeforeunload = function() {
      return '';
    };
    // Keyboard shortcuts
    $(document).keypress(function(event) {
      console.log('key', event.which);
      if (global.interaction.started) {
        switch (event.which) {
          case 32:
          case 112: // space, p
            return html.pause();
          case 27:
          case 13: // shift, enter
            return html.menu();
          case 109:
          case 45: // m, -
            return html.sound();
        }
      }
    });
    // # TODO add restart button event
    // doc.start.click( ->

    // )

    // General close button event
    doc.close.click(function() {
      return $(this).parents('[data-close]').hide();
    });
    // General clear button event
    doc.clear.click(function() {
      return $(this).parents('[data-clear]').remove();
    });
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
    doc.overlay.find('.container').click(function(event) {
      console.log(event);
      if (event.target === this) { // Won't fire when the card is clicked
        return html.showFull(true);
      }
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
            return html.showFull(false, 'information');
          case "info":
            return html.showFull(false, 'cards');
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
            var value;
            if ($(this).hasClass('value')) {
              // Get the value from the propertyname
              value = data[this.dataset.name];
              if (typeof value === 'object') {
                value = value.current;
              }
              return this.textContent = value;
            }
          });
          doc.values.each(function() {
            var ref2, representation, scinum;
            if ($(this).hasClass('value')) {
              // TODO edit values before displaying
              scinum = data[this.dataset.name];
              if ((ref2 = this.dataset.name) === 'mass' || ref2 === 'speed' || ref2 === 'energyLoss') {
                scinum = scinum.current;
              }
              representation = scinum.represent();
              // Loop through two spans
              return $(this).find('span').each(function() {
                if ($(this).hasClass('number')) {
                  // console.log representation
                  return this.textContent = representation.value;
                } else if ($(this).hasClass('unit')) {
                  if (representation.unit !== null) {
                    this.innerHTML = ''; // Empty
                    return this.appendChild(representation.unit);
                  }
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
      global.interaction.audio.pause();
      return icon.attr('src', 'assets/images/icons/ic_volume_off_black_24px.svg'); // Pauze
    } else {
      global.interaction.sound = true;
      global.interaction.audio.play();
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

  html.showFull = function(hide, htmlClass) {
    var card;
    if (hide) {
      doc.overlay.find('.full').hide();
      return doc.overlay.hide();
    } else {
      card = doc.overlay.find(`.${htmlClass}`);
      card.show();
      return doc.overlay.show();
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
    console.log("Creating life");
    html.layer.bacteria.activate();
    global.bacteria[0] = new Viridis(local.standard.mass, local.center);
    global.bacteria[1] = new Rubrum(local.standard.mass, local.center.subtract(100, 0));
    return global.bacteria[2] = new Caeruleus(local.standard.mass, local.center.add(100, 0));
  };

  // Set up the constants
  simulation.setConstants = function() {
    global.constants = {
      waterDensity: new SciNum(0.9982e3, 'density', 'kg/m^3'), // Around a temperature of 20 degrees
      atomairMass: new SciNum(1.660539e-27, 'mass', 'kg'),
      avogadroContstant: 6.02214129e23,
      prefixes: {
        lower: [
          ['y',
          1e-24],
          ['z',
          1e-21],
          ['a',
          1e-18],
          ['f',
          1e-15],
          ['p',
          1e-12],
          ['n',
          1e-9],
          [
            '&mu;',
            1e-6 // Html code
          ],
          ['m',
          1e-3]
        ],
        higher: [['', 1e0], ['k', 1e3], ['M', 1e6], ['G', 1e9], ['T', 1e12], ['P', 1e15], ['E', 1e18], ['Z', 1e21], ['Y', 1e24]]
      }
    };
    global.constants.prefixes.lower.reverse(); // For looping
    return global.constants.atpMass = new SciNum(507.18 * global.constants.atomairMass.value, 'mass', 'kg'); // Using the mass of 507 u
  };

  // Generates food
  simulation.feed = function() {
    var amount, around, food, left, results, total;
    html.layer.food.activate;
    total = global.enviroment.energy.value;
    left = total; // Inital
    results = [];
    
    // Food left to give and maximum instances not reached
    while (left > 0 && global.food.length < local.maxInstances.food) {
      // Around is an equal distribution, it will be higher than that to get bigger particles
      around = total / local.maxInstances.food;
      amount = Random.value(around * 2, around * 6);
      if (amount < (left * 0.9)) { // Spawn while higher lower than 90% of what's left (prevents to small spawms)
        left -= amount; // Remove from what's left
      } else {
        amount = left; // Remainder
        left = 0; // Ends loop
      }
      // Add food
      food = new Food(Math.floor(amount));
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
    var at, input, names;
    console.log("Loaded completely");
    names = ["continue", "start"];
    // Add events to elements
    doc.start.find(".screen:first").show(); // Show first screen
    doc.start.find(`button[name=${names[0]}]`).click(function() {
      doc.start.find(".screen:first").hide(); // Hide first screen
      return doc.start.find(".screen:last").show(); // Show second screen
    });
    doc.start.find(`button[name=${names[1]}]`).click(function() {
      doc.start.hide(); // Hide complete screen
      doc.home.css({
        display: 'flex'
      });
      return simulation.run();
    });
    at = 0;
    $(document).keypress(function(event) {
      if (!global.interaction.started) {
        switch (event.which) {
          case 32:
          case 13: // Space, enter
            doc.start.find(`button[name=${names[at]}]`).click(); // Trigger click
            return at += 1;
        }
      }
    });
    input = doc.start.find(".slider");
    input.each(function() {
      // Initial value
      global.enviroment[this.name] = new SciNum(Number(this.value), this.name, this.dataset.unit);
      $(this).next().next().text(this.value); // Value in tooltip
      
      // Update the variables on change
      return $(this).change(function() {
        var value;
        value = Number(this.value); // Is recieved as string
        global.enviroment[this.name] = new SciNum(value, this.name, this.dataset.unit);
        return $(this).next().next().text(this.value); // Value in tooltip
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
      bacterium.born(); //s Starts the bacteria
    }
    global.interaction.pauzed = false; // Unpauze time
    global.interaction.started = true;
    html.setup(); // Activate document
    console.log(project.activeLayer);
    html.clock(); // Starts the time display
    html.ratio(); // Display inital ratio
    return global.interaction.audio.play(); // Starts music
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
