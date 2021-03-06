(function() {
  "use strict";
  var Bacteria, Caeruleus, Calc, Food, Lucarium, Random, Rubrum, SciNum, Viridis, check, doc, draw, generate, html, id, isLoaded, j, len, local, ref, simulation, time,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  doc = {};

  local = {
    resolution: 72,
    fps: 30,
    scaleFactor: 1.2e6,
    maxInstances: {
      food: 30
    },
    standard: {
      mass: 1.64e-15
    }
  };

  ref = ['start', 'home', 'screen', 'field', 'menu', 'sidebar', 'cards', 'enviroment', 'bacteria', 'priority', 'scale', 'overlay', 'music'];
  for (j = 0, len = ref.length; j < len; j++) {
    id = ref[j];
    doc[id] = $("#" + id);
  }

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

  Calc = {};

  Random = {};

  check = {};

  generate = {};

  time = {
    time: 0,
    trackSecond: 0,
    check: {}
  };

  time.represent = function(total) {
    var hours, minutes, seconds;
    hours = Math.floor(total / 3600);
    minutes = Math.floor(total % 3600 / 60);
    seconds = Math.floor(total % 3600 % 60);
    return [hours, minutes, seconds];
  };

  time.interval = function(timing, func) {
    var target;
    target = time.time + (timing * 1000);
    id = generate.id(time.check);
    return time.check[id] = setInterval((function(_this) {
      return function(target, func, id) {
        if (time.time >= target) {
          clearInterval(time.check[id]);
          return func();
        }
      };
    })(this), 1000, target, func, id);
  };

  check.circleOverlap = function(circle1, circle2) {
    var distance, result;
    distance = Calc.combine(circle1.position.subtract(circle2.position));
    result = distance <= (circle2.bounds.width + circle1.bounds.width) / 2;
    return result;
  };

  check.circleInside = function(circle1, circle2) {
    var distance, result;
    distance = Calc.combine(circle1.position.subtract(circle2.position));
    result = distance + (circle2.bounds.width / 2) <= circle1.bounds.width / 2;
    return result;
  };

  check.inCircle = function(point, circle) {
    var distance, result;
    distance = Calc.combine(circle.position.subtract(point));
    result = distance <= circle.bounds.width / 2;
    return result;
  };

  Calc.scale = function(value, needed) {
    var DPC, size;
    if (needed == null) {
      needed = 'scaled';
    }
    DPC = local.resolution / 2.54;
    if (needed === "scaled") {
      size = value * local.scaleFactor;
      size = size * DPC;
      return size;
    } else if (needed === "real") {
      size = value / DPC;
      size = size / local.scaleFactor;
      return size;
    }
  };

  Calc.diameter = function(value, needed) {
    var diameter, volume;
    if (needed == null) {
      needed = 'diameter';
    }
    if (needed === 'diameter') {
      diameter = Math.pow((8 * 3 * value) / (4 * Math.PI), 1 / 3);
      return diameter;
    } else if (needed === 'volume') {
      volume = (4 / 3) * Math.PI * Math.pow(value / 2, 3);
      return volume;
    }
  };

  Calc.combine = function(vector) {
    var result;
    result = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    return result;
  };

  Calc.rad = function(degrees) {
    var angle;
    angle = degrees * (Math.PI / 180);
    return angle;
  };

  Random.value = function(bottom, top, use) {
    var middle, value;
    if (use == null) {
      use = Math.random;
    }
    middle = top - bottom;
    value = (use() * middle) + bottom;
    return value;
  };

  Random.choose = function(array) {
    var item;
    item = array[Math.floor(Math.random() * array.length)];
    return item;
  };

  Random.chance = function(chance) {
    var result;
    result = Math.ceil(Math.random() * chance);
    if (result === 1) {
      return true;
    } else {
      return false;
    }
  };

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

  generate.id = function(instances) {
    var charcode, i, instance, k, l, len1, occurs, result, string, unique;
    unique = false;
    string = null;
    while (!unique) {
      result = [];
      for (i = k = 0; k <= 4; i = ++k) {
        charcode = Random.value(65, 91);
        result.push(String.fromCharCode(charcode));
      }
      string = result.join('');
      if (instances.length > 0) {
        occurs = false;
        for (l = 0, len1 = instances.length; l < len1; l++) {
          instance = instances[l];
          if (instance.id === string) {
            occurs = true;
            break;
          }
        }
        unique = !occurs;
      } else {
        unique = true;
        break;
      }
    }
    return string;
  };

  SciNum = (function() {
    function SciNum(value, quantity, unit) {
      this.represent = bind(this.represent, this);
      this.unitNotation = bind(this.unitNotation, this);
      this.notation = bind(this.notation, this);
      this.value = value;
      this.quantity = quantity;
      this.unit = unit;
    }

    SciNum.prototype.notation = function(number) {
      var needed, string;
      string = Math.round(number).toString();
      needed = 3 - string.length;
      number = number.toFixed(needed);
      string = number.toString();
      return string;
    };

    SciNum.prototype.unitNotation = function(string) {
      var dom, html, parts;
      html = null;
      if (string.indexOf('/') !== -1) {
        parts = string.split('/');
        dom = $('<span></span>').addClass('fraction');
        dom.append($('<span></span>').addClass('top').append(this.unitNotation(parts[0])));
        dom.append($('<span></span>').addClass('bottom').append(this.unitNotation(parts[1])));
        html = dom[0];
      } else if (string.indexOf('^') !== -1) {
        parts = string.split('^');
        dom = $('<span></span>');
        dom.append($('<span></span>').html(parts[0]));
        dom.append($('<sup></sup>').html(parts[1]));
        html = dom[0];
      } else {
        html = $('<span></span>').html(string)[0];
      }
      return html;
    };

    SciNum.prototype.represent = function() {
      var converted, form, hours, k, len1, minutes, newValue, prefix, ref1, ref2, seconds, set, unit, value;
      set = global.constants.prefixes;
      unit = this.unit;
      value = this.value;
      converted = null;
      if (value instanceof Point) {
        value = Calc.combine(value);
      }
      if (unit === 'kg') {
        unit = 'g';
        newValue *= 1000;
      }
      if (value === 0) {
        converted = new SciNum(value, this.quantity, this.unitNotation(unit));
      } else {
        if (unit === 's') {
          form = function(number) {
            var string;
            string = String(number);
            if (string.length === 1) {
              string = "0" + string;
            }
            return string;
          };
          ref1 = time.represent(this.value), hours = ref1[0], minutes = ref1[1], seconds = ref1[2];
          converted = new SciNum((form(hours)) + ":" + (form(minutes)) + ":" + (form(seconds)), this.quantity, null);
        } else {
          if (Math.abs(value) < 1) {
            set = set.lower;
          } else if (Math.abs(value) >= 1) {
            set = set.higher;
          }
          for (k = 0, len1 = set.length; k < len1; k++) {
            prefix = set[k];
            newValue = value / prefix[1];
            if ((1 <= (ref2 = Math.abs(newValue)) && ref2 <= 1000)) {
              converted = new SciNum(this.notation(newValue), this.quantity, this.unitNotation("" + prefix[0] + unit));
            }
          }
        }
      }
      return converted;
    };

    return SciNum;

  })();

  Food = (function() {
    function Food(energy) {
      this.eaten = bind(this.eaten, this);
      this.update = bind(this.update, this);
      this.display = bind(this.display, this);
      this.isLegal = bind(this.isLegal, this);
      this.id = generate.id(global.food);
      this.energy = new SciNum(energy, 'energy', 'atp');
      this.mass = new SciNum(this.energy.value * global.constants.atpMass.value, 'mass', 'kg');
      this.volume = new SciNum(this.mass.value / (global.constants.waterDensity.value / 2.5), 'volume', 'm^3');
      this.diameter = new SciNum(Calc.diameter(this.volume.value), 'length', 'm');
      this.radius = new SciNum(this.diameter.value / 2, 'length', 'm');
    }

    Food.prototype.isLegal = function() {
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
      if (global.food.length > 0) {
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
      return true;
    };

    Food.prototype.display = function() {
      var colorcode;
      this.position = Point.random().multiply(local.size.multiply(0.9));
      this.position = this.position.add(local.size.multiply(0.05));
      this.particle = new Path.Circle(this.position.round(), Math.round(Calc.scale(this.radius.value)));
      while (!this.isLegal()) {
        this.position = Point.random().multiply(local.size.multiply(0.9));
        this.position = this.position.add(local.size.multiply(0.05));
        this.particle.position = this.position;
      }
      colorcode = Random.choose([400, 600, 500, 700]);
      this.particle.fillColor = global.colors.amber[colorcode];
      return html.layer.food.addChild(this.particle);
    };

    Food.prototype.update = function() {
      return this.particle.position = this.position.round();
    };

    Food.prototype.eaten = function() {
      var food, index, k, len1, ref1;
      ref1 = global.food;
      for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
        food = ref1[index];
        if (typeof food !== 'undefined') {
          if (food.id === this.id) {
            global.food.splice(index, 1);
          }
        }
      }
      return this.particle.remove();
    };

    return Food;

  })();

  Bacteria = (function() {
    function Bacteria(mass, position, generation, birth, mutations) {
      if (generation == null) {
        generation = 1;
      }
      if (birth == null) {
        birth = 0;
      }
      if (mutations == null) {
        mutations = [];
      }
      this.eat = bind(this.eat, this);
      this.die = bind(this.die, this);
      this.mitosis = bind(this.mitosis, this);
      this.stop = bind(this.stop, this);
      this.goToPoint = bind(this.goToPoint, this);
      this.chooseDirection = bind(this.chooseDirection, this);
      this.checkCollision = bind(this.checkCollision, this);
      this.checkSpeed = bind(this.checkSpeed, this);
      this.checkValues = bind(this.checkValues, this);
      this.foodNearby = bind(this.foodNearby, this);
      this.loseEnergy = bind(this.loseEnergy, this);
      this.move = bind(this.move, this);
      this.startMoving = bind(this.startMoving, this);
      this.ages = bind(this.ages, this);
      this.select = bind(this.select, this);
      this.update = bind(this.update, this);
      this.display = bind(this.display, this);
      this.changeAction = bind(this.changeAction, this);
      this.live = bind(this.live, this);
      this.born = bind(this.born, this);
      this.mass = {};
      this.mass.current = new SciNum(mass, 'mass', 'kg');
      this.position = position;
      this.generation = generation;
      this.birth = birth;
      this.mutations = mutations;
      this.id = generate.id(global.bacteria.concat(global.dead));
      this.energy = new SciNum(Math.round(this.mass.current.value / global.constants.atpMass.value), 'energy', 'atp');
      this.density = new SciNum(((2 / 3) * global.constants.waterDensity.value) + ((1 / 3) * (13 / 10) * global.constants.waterDensity.value), 'density', 'kg/m^3');
      this.volume = new SciNum(this.mass.current.value / this.density.value, 'volume', 'm^3');
      this.diameter = new SciNum(Calc.diameter(this.volume.value), 'length', 'm');
      this.radius = new SciNum(this.diameter.value / 2, 'length', 'm');
      this.acceleration = new SciNum(new Point(0, 0), 'acceleration', 'm/s^2');
      this.speed = {};
      this.decceleration = new SciNum(0, 'negative acceleration', 'm/s^2');
      this.speed.min = new SciNum(new Point(0, 0), 'speed', 'm/s');
      this.speed.current = new SciNum(new Point(0, 0), 'speed', 'm/s');
      this.age = new SciNum(0, 'time', 's');
      this.mass.max = new SciNum(1.5 * local.standard.mass, 'mass', 'kg');
      this.mass.min = new SciNum(0.35 * local.standard.mass, 'mass', 'kg');
      this.lastDivision = new SciNum(null, 'time', 's');
      this.energyLoss = {};
      this.energyLoss.current = new SciNum(0, 'energy per second', 'atp/s');
      this.direction = null;
      this.target = null;
      this.timer = null;
      this.action = {
        current: null,
        previous: null
      };
    }

    Bacteria.prototype.born = function() {
      this.display();
      this.ages();
      return this.chooseDirection();
    };

    Bacteria.prototype.live = function() {
      var ref1;
      if (this.action.current === 'Dying') {
        this.die();
      } else if ((ref1 = this.action.current) === 'Mitosis' || ref1 === 'Stopping') {

      } else {
        if (this.action.current === 'Colliding') {
          this.chooseDirection();
        } else {
          this.foodNearby();
          if (this.target === null) {
            if (Random.chance(25)) {
              this.chooseDirection();
            }
          } else {
            if (this.action.current === 'Chasing') {
              this.goToPoint(this.target.position);
            }
          }
        }
        this.eat();
        this.loseEnergy();
      }
      this.move();
      return this.update();
    };

    Bacteria.prototype.changeAction = function(action) {
      if (action !== this.action.current || this.action.current === null) {
        this.action.previous = this.action.current;
        return this.action.current = action;
      }
    };

    Bacteria.prototype.display = function() {
      var all, colorcode, dot, dotnumber, legal, main, point, radius, range;
      radius = Math.round(Calc.scale(this.radius.value));
      main = new Path.Circle(this.position.round(), radius);
      main.style = {
        fillColor: this.color[500],
        strokeColor: this.color[700],
        strokeWidth: 3
      };
      main.name = 'main';
      range = main.bounds.bottomRight.subtract(main.bounds.topLeft);
      all = [];
      dotnumber = 4 + this.mutations.length;
      while (dotnumber > 0) {
        while (true) {
          point = Point.random();
          point = point.multiply(range);
          point = point.add(main.bounds.topLeft);
          dot = new Path.Circle(point.round(), Math.floor(Random.value(radius / 6, radius / 4)));
          if (check.circleInside(main, dot)) {
            legal = true;
            if (legal) {
              colorcode = Random.choose([300, 400, 600, 700, 800]);
              dot.fillColor = this.color[colorcode];
              all.push(dot);
              break;
            } else {
              dot.remove();
            }
          } else {
            dot.remove();
          }
        }
        dotnumber -= 1;
      }
      all.unshift(main);
      this.body = new Group(all);
      this.body.name = this.id;
      this.body.opacity = 0.7;
      return html.layer.bacteria.addChild(this.body);
    };

    Bacteria.prototype.update = function() {
      var difference, previous;
      this.checkValues();
      this.mass.current.value = this.energy.value * global.constants.atpMass.value;
      this.volume.value = this.mass.current.value / this.density.value;
      this.diameter.value = Calc.diameter(this.volume.value);
      previous = this.radius.value;
      this.radius.value = this.diameter.value / 2;
      if (this.radius.value !== previous) {
        difference = this.radius.value / previous;
        this.body.scale(difference);
      }
      return this.body.position = this.position.round();
    };

    Bacteria.prototype.select = function() {
      var bacterium, k, len1, ref1;
      if (global.interaction.selected === this.id) {
        global.interaction.selected = null;
        return this.body.children.main.selected = false;
      } else {
        if (global.interaction.selected !== null) {
          ref1 = global.bacteria;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            bacterium = ref1[k];
            if (global.interaction.selected === bacterium.id) {
              bacterium.body.selected = false;
              break;
            }
          }
        }
        global.interaction.selected = this.id;
        return this.body.children.main.selected = true;
      }
    };

    Bacteria.prototype.ages = function() {
      return this.timer = setInterval((function(_this) {
        return function() {
          return _this.age.value = (time.time - _this.birth) / 1000;
        };
      })(this), 1000);
    };

    Bacteria.prototype.startMoving = function() {
      var targetSpeed;
      targetSpeed = this.direction.normalize(this.speed.max.value);
      return this.acceleration.value = targetSpeed.divide(3.5);
    };

    Bacteria.prototype.move = function() {
      var acceleration, decceleration, newSpeed, ref1, speed;
      this.checkCollision();
      if ((ref1 = this.action.current) === 'Finding' || ref1 === 'Stopping') {
        decceleration = this.decceleration.value / local.fps;
        newSpeed = Calc.combine(this.speed.current.value) - decceleration;
        this.speed.current.value = this.speed.current.value.normalize(newSpeed);
      } else {
        acceleration = this.acceleration.value.divide(local.fps);
        this.speed.current.value = this.speed.current.value.add(acceleration);
      }
      this.checkSpeed();
      speed = new Point({
        x: Calc.scale(this.speed.current.value.x),
        y: Calc.scale(this.speed.current.value.y)
      });
      speed = speed.divide(local.fps);
      return this.position = this.position.add(speed);
    };

    Bacteria.prototype.loseEnergy = function() {
      var atpSec, condition, current, difference, factor, k, len1, loss, range, ref1;
      loss = this.energyLoss.min.value;
      ref1 = ['temperature', 'concentration', 'acidity'];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        condition = ref1[k];
        current = global.enviroment[condition].value;
        difference = Math.abs(current - this.idealConditions[condition].value);
        if (difference >= this.tolerance[condition].value) {
          difference -= this.tolerance[condition].value;
        } else {
          difference = 0;
        }
        range = global.enviroment.ranges[condition][1] - global.enviroment.ranges[condition][0];
        factor = difference / range;
        if (condition === 'concentration') {
          factor /= 2;
        }
        factor *= 3;
        if (factor !== 0) {
          loss *= factor;
        }
      }
      loss = Math.floor(loss);
      this.energyLoss.current.value = loss;
      loss *= 35;
      atpSec = loss / local.fps;
      return this.energy.value -= atpSec;
    };

    Bacteria.prototype.foodNearby = function() {
      var distance, distances, food, isNearby, k, l, len1, len2, minDistance, possibleTargets, ref1, results, target;
      isNearby = false;
      possibleTargets = [];
      ref1 = global.food;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        food = ref1[k];
        distance = Calc.combine(food.position.subtract(this.position));
        if (distance < Calc.scale(this.viewRange.value)) {
          possibleTargets.push({
            instance: food,
            distance: distance,
            distance: distance
          });
        }
      }
      if (possibleTargets.length > 0) {
        distances = (function() {
          var l, len2, results;
          results = [];
          for (l = 0, len2 = possibleTargets.length; l < len2; l++) {
            target = possibleTargets[l];
            results.push(target.distance);
          }
          return results;
        })();
        minDistance = Math.min.apply(Math, distances);
        results = [];
        for (l = 0, len2 = possibleTargets.length; l < len2; l++) {
          target = possibleTargets[l];
          if (target.distance === minDistance) {
            if (this.target === null) {
              this.speed.min.value = this.speed.max.value / 8;
              this.changeAction('Finding');
              this.decceleration.value = Calc.combine(this.speed.current.value);
            } else if (this.target.id !== target.instance.id) {
              this.speed.min.value = this.speed.max.value / 8;
              this.changeAction('Finding');
              this.decceleration.value = Calc.combine(this.speed.current.value);
            }
            results.push(this.target = target.instance);
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        return this.target = null;
      }
    };

    Bacteria.prototype.checkValues = function() {
      var ref1;
      if (this.mass.current.value <= this.mass.min.value && this.action.current !== 'Dying') {
        return this.changeAction('Dying');
      } else if (this.mass.current.value >= this.mass.max.value) {
        if ((ref1 = this.action.current) !== 'Mitosis' && ref1 !== 'Stopping') {
          return this.stop();
        }
      }
    };

    Bacteria.prototype.checkSpeed = function() {
      var duration;
      if (Calc.combine(this.speed.current.value) >= this.speed.max.value) {
        this.acceleration.value = new Point(0, 0);
        this.speed.current.value.normalize(this.speed.max.value);
      }
      if (this.action.current === 'Finding') {
        if (Calc.combine(this.speed.current.value) <= this.speed.min.value) {
          this.speed.current.value.normalize(this.speed.min.value);
          this.speed.min.value = 0;
          this.decceleration.value = 0;
          this.changeAction('Chasing');
        }
      }
      if (this.action.current === 'Stopping') {
        if (Calc.combine(this.speed.current.value) < 1e-9) {
          this.speed.current.value = new Point(0, 0);
          this.acceleration.value = new Point(0, 0);
          this.decceleration.value = 0;
          if (this.action.current !== 'Mitosis') {
            console.log(this.id, 'start mitosis');
            this.changeAction('Mitosis');
            duration = this.mitosisDuration.value / 60;
            return time.interval(duration, this.mitosis);
          }
        }
      }
    };

    Bacteria.prototype.checkCollision = function() {
      var bacterium, bodyRadius, checkNotColliding, cosine, distance, impactAngle, k, len1, otherBodyRadius, ref1, ref2, speedComponent;
      checkNotColliding = 0;
      bodyRadius = Calc.scale(this.radius.value);
      if (this.position.x + bodyRadius >= local.width) {
        this.changeAction('Colliding');
        this.speed.current.value.x = 0;
        this.chooseDirection(180);
      } else if (this.position.x - bodyRadius <= 0) {
        this.changeAction('Colliding');
        this.speed.current.value.x = 0;
        this.chooseDirection(0);
      } else {
        checkNotColliding += 1;
      }
      if (this.position.y + bodyRadius >= local.height) {
        this.changeAction('Colliding');
        this.speed.current.value.y = 0;
        this.chooseDirection(270);
      } else if (this.position.y - bodyRadius <= 0) {
        this.changeAction('Colliding');
        this.speed.current.value.y = 0;
        this.chooseDirection(90);
      } else {
        checkNotColliding += 1;
      }
      ref1 = global.bacteria;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bacterium = ref1[k];
        if (this.id !== bacterium.id) {
          distance = bacterium.position.subtract(this.position);
          otherBodyRadius = Calc.scale(bacterium.radius.value);
          if (Calc.combine(distance) <= bodyRadius + otherBodyRadius) {
            this.changeAction('Colliding');
            impactAngle = this.speed.current.value.getAngle(distance);
            cosine = Math.cos(Calc.rad(impactAngle));
            speedComponent = this.speed.current.value.multiply(cosine);
            if (!isNaN(Calc.combine(speedComponent))) {
              this.speed.current.value = this.speed.current.value.subtract(speedComponent);
            }
          } else {
            checkNotColliding += 1;
          }
        }
      }
      if (this.action.current === 'Colliding' && ((ref2 = this.action.previous) === 'Mitosis' || ref2 === 'Stopping')) {
        this.changeAction(this.action.previous);
      }
      if (this.action.current === 'Colliding' && checkNotColliding === 2 + global.bacteria.length - 1) {
        return this.changeAction(this.action.previous);
      }
    };

    Bacteria.prototype.chooseDirection = function(angle) {
      if (angle == null) {
        angle = Random.value(0, 360);
      }
      angle = Calc.rad(angle % 360);
      this.direction = new Point(Math.cos(angle), Math.sin(angle));
      this.startMoving();
      return this.changeAction('Wandering');
    };

    Bacteria.prototype.goToPoint = function(point) {
      var relativePosition;
      relativePosition = this.target.position.subtract(this.position);
      this.direction = relativePosition.normalize(1);
      return this.startMoving();
    };

    Bacteria.prototype.stop = function() {
      var ref1;
      if ((ref1 = this.action.current) !== 'Mitosis' && ref1 !== 'Stopping') {
        this.changeAction('Stopping');
        return this.decceleration.value = Calc.combine(this.speed.current.value) / 5;
      }
    };

    Bacteria.prototype.mitosis = function() {
      var args, chance, condition, factor, index, k, len1, offspring, ref1;
      this.energy.value /= 2;
      this.update();
      if (this.lastDivision.value === null) {
        global.data.divisionTime.push(time.time - this.birth);
      } else {
        global.data.divisionTime.push(time.time - (this.lastDivision.value * 1000));
      }
      this.lastDivision.value = time.time / 1000;
      args = [this.mass.current.value, this.position.add(Calc.scale(this.radius.value) * 1.5), this.generation + 1, time.time, this.mutations];
      if (this.species === 'Viridis') {
        offspring = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Viridis, args, function(){});
      } else if (this.species === 'Rubrum') {
        offspring = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Rubrum, args, function(){});
      } else if (this.species === 'Caeruleus') {
        offspring = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Caeruleus, args, function(){});
      }
      chance = this.mutationChance * 85;
      ref1 = ['temperature', 'concentration', 'acidity'];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        condition = ref1[k];
        if (Random.chance(Math.pow(chance, -1))) {
          console.log(offspring.id, 'mutated');
          factor = Random.value(0.25, 1.75, Random.normal);
          offspring.tolerance[condition].value *= factor;
          offspring.mutations.push({
            generation: offspring.generation,
            condition: condition,
            value: offspring.tolerance[condition].value
          });
        }
      }
      index = global.bacteria.push(offspring) - 1;
      global.bacteria[index].born();
      html.ratio();
      console.log(offspring.id, 'came into existence');
      return this.chooseDirection();
    };

    Bacteria.prototype.die = function() {
      var bacterium, index, k, len1, ref1, results;
      ref1 = global.bacteria;
      results = [];
      for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
        bacterium = ref1[index];
        if (typeof bacterium !== 'undefined') {
          if (bacterium.id === this.id) {
            console.log(this.id, 'died');
            if (global.interaction.selected === this.id) {
              global.interaction.selected = null;
            }
            clearInterval(this.timer);
            global.bacteria.splice(index, 1);
            global.dead.push(this);
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
    };

    Bacteria.prototype.eat = function() {
      var energy;
      if (this.target !== null) {
        if (check.circleInside(this.body, this.target.particle)) {
          energy = this.target.energy.value * 8;
          this.energy.value += energy;
          this.target.eaten();
          return this.target = null;
        }
      }
    };

    return Bacteria;

  })();

  Lucarium = (function(superClass) {
    extend(Lucarium, superClass);

    function Lucarium() {
      Lucarium.__super__.constructor.apply(this, arguments);
      this.family = "Lucarium";
      this.speed.max = new SciNum(this.diameter.value * 1.5, 'speed', 'm/s');
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

    return Lucarium;

  })(Bacteria);

  Viridis = (function(superClass) {
    extend(Viridis, superClass);

    function Viridis() {
      var k, len1, mutation, ref1;
      Viridis.__super__.constructor.apply(this, arguments);
      this.species = "Viridis";
      this.taxonomicName = this.family + " " + this.species;
      this.color = global.colors.green;
      this.tolerance = {
        temperature: new SciNum(2, 'temperature', '&deg;C'),
        acidity: new SciNum(0.15, 'pH', ''),
        concentration: new SciNum(7.8, 'concentration', 'kg/m^3')
      };
      if (this.mutations.length > 0) {
        ref1 = this.mutations;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          mutation = ref1[k];
          if (mutation.generation = this.generation - 1) {
            this.tolerance[mutation.condition].value = mutation.value;
          }
        }
      }
    }

    return Viridis;

  })(Lucarium);

  Rubrum = (function(superClass) {
    extend(Rubrum, superClass);

    function Rubrum() {
      Rubrum.__super__.constructor.apply(this, arguments);
      this.species = "Rubrum";
      this.taxonomicName = this.family + " " + this.species;
      this.color = global.colors.red;
      this.tolerance = {
        temperature: new SciNum(10, 'temperature', '&deg;C'),
        acidity: new SciNum(0.15, 'pH', ''),
        concentration: new SciNum(1.56, 'concentration', 'kg/m^3')
      };
    }

    return Rubrum;

  })(Lucarium);

  Caeruleus = (function(superClass) {
    extend(Caeruleus, superClass);

    function Caeruleus() {
      Caeruleus.__super__.constructor.apply(this, arguments);
      this.species = "Caeruleus";
      this.taxonomicName = this.family + " " + this.species;
      this.color = global.colors.blue;
      this.tolerance = {
        temperature: new SciNum(2, 'temperature', '&deg;C'),
        acidity: new SciNum(0.75, 'pH', ''),
        concentration: new SciNum(1.56, 'concentration', 'kg/m^3')
      };
    }

    return Caeruleus;

  })(Lucarium);

  simulation = {};

  html = {};

  html.layer = {};

  html.setSize = function() {
    var height, width;
    width = doc.body.width() * 0.8;
    height = doc.body.height();
    local.width = width;
    local.height = height;
    local.center = new Point(width / 2, height / 2);
    local.size = new Size(width, height);
    return local.origin = new Point(0, 0);
  };

  html.card = function(data) {
    return null;
  };

  html.clock = function() {
    var form, hours, minutes, ref1, seconds;
    ref1 = time.represent(time.time / 1000), hours = ref1[0], minutes = ref1[1], seconds = ref1[2];
    form = function(number) {
      var string;
      string = String(number);
      if (string.length === 1) {
        string = "0" + string;
      }
      return string;
    };
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

  html.ratio = function() {
    var all, amount, at, bacterium, ca, circle, htmlClass, index, k, l, len1, len2, number, percentage, pie, ref1, ref2, results, ru, species, total, vi;
    total = global.bacteria.length;
    species = ['Rubrum', 'Caeruleus', 'Viridis'];
    ref1 = [0, 0, 0], vi = ref1[0], ru = ref1[1], ca = ref1[2];
    if (total > 0) {
      ref2 = global.bacteria;
      for (k = 0, len1 = ref2.length; k < len1; k++) {
        bacterium = ref2[k];
        if (bacterium.species === species[0]) {
          ru += 1;
        } else if (bacterium.species === species[1]) {
          ca += 1;
        } else if (bacterium.species === species[2]) {
          vi += 1;
        }
      }
      all = [ru / total, ca / total, vi / total];
    } else {
      all = [0, 0, 0];
    }
    global.data.ratio.push({
      time: time.time,
      population: total,
      ratio: {
        Rubrum: all[0],
        Caeruleus: all[1],
        Viridis: all[2]
      }
    });
    doc.ratio.next().text("Ratio " + (Math.round(all[2] * 100)) + ":" + (Math.round(all[1] * 100)) + ":" + (Math.round(all[0] * 100)));
    circle = Math.round(Math.PI * 100);
    at = 0;
    results = [];
    for (index = l = 0, len2 = all.length; l < len2; index = ++l) {
      percentage = all[index];
      number = percentage * circle;
      htmlClass = species[index].toLowerCase();
      pie = doc.ratio.find("." + htmlClass);
      amount = at + number;
      at += number;
      results.push(pie.css('strokeDasharray', amount + "%, " + circle + "%"));
    }
    return results;
  };

  html.setup = function() {
    var disabled;
    doc.conditions.each(function() {
      var condition, range, relative, repr, val;
      condition = global.enviroment[this.dataset.name];
      val = condition.value;
      range = global.enviroment.ranges[this.dataset.name];
      relative = (val - range[0]) / (range[1] - range[0]);
      $(this).attr('max', 1);
      $(this).attr('value', relative);
      repr = condition.represent();
      return $(this).next().html(Math.round(repr.value) + ' ').append(repr.unit);
    });
    doc.scale.find('span').text(" 1 : " + local.scaleFactor);
    time.clock = setInterval(function() {
      if (!global.interaction.pauzed) {
        time.time += 10;
        time.trackSecond += 10;
        if (time.trackSecond > 1000) {
          time.trackSecond = 0;
          return simulation.feed();
        }
      }
    }, 10);
    time.second = setInterval(function() {
      if (!global.interaction.pauzed) {
        html.clock();
        return html.selected();
      }
    }, 1000);
    view.onFrame = function(event) {
      var bacterium, k, len1, ref1, results;
      if (!global.interaction.pauzed) {
        ref1 = global.bacteria;
        results = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          bacterium = ref1[k];
          if (typeof bacterium !== 'undefined') {
            results.push(bacterium.live());
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };
    view.onResize = function(event) {
      var previous, scalePositions;
      previous = local.size;
      html.setSize();
      scalePositions = function(instances) {
        var instance, k, len1, results, scaledPosition;
        results = [];
        for (k = 0, len1 = instances.length; k < len1; k++) {
          instance = instances[k];
          scaledPosition = new Point({
            x: (instance.position.x / previous.width) * local.width,
            y: (instance.position.y / previous.height) * local.height
          });
          instance.position = scaledPosition.round();
          if (!(instance instanceof Path)) {
            results.push(instance.update());
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
      scalePositions(global.bacteria);
      return scalePositions(global.food);
    };
    $(window).blur(function() {});
    $(window).focus(function() {});
    window.onbeforeunload = function() {
      return '';
    };
    disabled = false;
    $(document).keypress(function(event) {
      console.log('Key', event.which);
      if (global.interaction.started) {
        if (!disabled) {
          switch (event.which) {
            case 120:
              doc.clear.click();
              break;
            case 114:
              simulation.selectRand();
              break;
            case 109:
            case 13:
              html.menu();
              break;
            case 105:
              html.showFull(false, 'information');
              break;
            case 99:
              html.showFull(false, 'cards');
              break;
            case 116:
              html.menu(true);
              html.cardsToggle();
              break;
            case 115:
            case 45:
              html.menu(true);
              html.sound();
              break;
            case 32:
            case 112:
              html.menu(true);
              html.pause();
          }
          disabled = true;
          return setTimeout(function() {
            return disabled = false;
          }, global.interaction.time);
        }
      }
    });
    doc.close.click(function() {
      return $(this).parents('[data-close]').hide();
    });
    doc.clear.click(function() {
      return $(this).parents('[data-clear]').remove();
    });
    doc.screen.click(function(event) {
      var bacterium, k, len1, location, ref1, results;
      location = new Point(event.pageX, event.pageY);
      console.log("Click at ", location);
      ref1 = global.bacteria;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bacterium = ref1[k];
        if (check.inCircle(location, bacterium.body)) {
          bacterium.select();
          html.selected();
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
    doc.menuButton.click(function() {
      return html.menu();
    });
    doc.overlay.find('.container').click(function(event) {
      console.log(event);
      if (event.target === this) {
        return html.showFull(true);
      }
    });
    return doc.menuItems.each(function() {
      return $(this).click(function() {
        switch (this.name) {
          case "volume":
            return html.sound();
          case "pause":
            return html.pause();
          case "cards":
            return html.cardsToggle();
          case "info":
            return html.showFull(false, 'information');
          case "view":
            return html.showFull(false, 'cards');
        }
      });
    });
  };

  html.selected = function() {
    var bacterium, data, k, len1, ref1, results;
    if (global.interaction.selected !== null) {
      ref1 = global.bacteria;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bacterium = ref1[k];
        if (bacterium.id === global.interaction.selected) {
          data = bacterium;
          doc.data.each(function() {
            var value;
            if ($(this).hasClass('value')) {
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
              scinum = data[this.dataset.name];
              if ((ref2 = this.dataset.name) === 'mass' || ref2 === 'speed' || ref2 === 'energyLoss') {
                scinum = scinum.current;
              }
              representation = scinum.represent();
              return $(this).find('span').each(function() {
                if ($(this).hasClass('number')) {
                  return this.textContent = representation.value;
                } else if ($(this).hasClass('unit')) {
                  if (representation.unit !== null) {
                    this.innerHTML = '';
                    return this.appendChild(representation.unit);
                  }
                }
              });
            }
          });
          doc.bacteria.attr('data-content', true);
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    } else {
      return doc.bacteria.attr('data-content', false);
    }
  };

  html.pause = function(change) {
    var icon;
    if (change == null) {
      change = global.interaction.pauzed;
    }
    icon = doc.menu.find("button[name=pause] img");
    if (change) {
      global.interaction.pauzed = false;
      return icon.attr('src', 'assets/images/icons/ic_pause_black_24px.svg');
    } else {
      global.interaction.pauzed = true;
      return icon.attr('src', 'assets/images/icons/ic_play_arrow_black_24px.svg');
    }
  };

  html.sound = function(change) {
    var icon;
    if (change == null) {
      change = global.interaction.sound;
    }
    icon = doc.menu.find("button[name=volume] img");
    if (change) {
      global.interaction.sound = false;
      global.interaction.audio.pause();
      return icon.attr('src', 'assets/images/icons/ic_volume_off_black_24px.svg');
    } else {
      global.interaction.sound = true;
      global.interaction.audio.play();
      return icon.attr('src', 'assets/images/icons/ic_volume_up_black_24px.svg');
    }
  };

  html.cardsToggle = function(change) {
    var icon;
    if (change == null) {
      change = global.interaction.cards;
    }
    icon = doc.menu.find("button[name=cards] img");
    if (change) {
      global.interaction.cards = false;
      doc.cards.hide();
      return icon.attr('src', 'assets/images/icons/ic_chat_outline_black_24px.svg');
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
      card = doc.overlay.find("." + htmlClass);
      card.show();
      return doc.overlay.show();
    }
  };

  html.menu = function(change) {
    var icon;
    if (change == null) {
      change = doc.menu.attr('data-state');
    }
    icon = doc.menuButton.find('img');
    change = change === 'collapse' || change === true;
    if (change) {
      doc.menuButton.attr('disabled', true);
      doc.menu.attr('data-state', 'expand');
      return setTimeout(function() {
        doc.menuButton.attr('disabled', false);
        return icon.attr('src', 'assets/images/icons/ic_close_white_24px.svg');
      }, global.interaction.time);
    } else {
      doc.menuButton.attr('disabled', true);
      doc.menu.attr('data-state', 'collapse');
      return setTimeout(function() {
        doc.menuButton.attr('disabled', false);
        return icon.attr('src', 'assets/images/icons/ic_menu_white_24px.svg');
      }, global.interaction.time);
    }
  };

  simulation.createLife = function() {
    console.log("Creating life");
    html.layer.bacteria.activate();
    global.bacteria[0] = new Viridis(local.standard.mass, local.center);
    global.bacteria[1] = new Rubrum(local.standard.mass, local.center.subtract(100, 0));
    return global.bacteria[2] = new Caeruleus(local.standard.mass, local.center.add(100, 0));
  };

  simulation.setConstants = function() {
    global.constants = {
      waterDensity: new SciNum(0.9982e3, 'density', 'kg/m^3'),
      atomairMass: new SciNum(1.660539e-27, 'mass', 'kg'),
      avogadroContstant: 6.02214129e23,
      prefixes: {
        lower: [['y', 1e-24], ['z', 1e-21], ['a', 1e-18], ['f', 1e-15], ['p', 1e-12], ['n', 1e-9], ['&mu;', 1e-6], ['m', 1e-3]],
        higher: [['', 1e0], ['k', 1e3], ['M', 1e6], ['G', 1e9], ['T', 1e12], ['P', 1e15], ['E', 1e18], ['Z', 1e21], ['Y', 1e24]]
      }
    };
    global.constants.prefixes.lower.reverse();
    return global.constants.atpMass = new SciNum(507.18 * global.constants.atomairMass.value, 'mass', 'kg');
  };

  simulation.feed = function() {
    var amount, around, food, left, results, total;
    html.layer.food.activate;
    total = global.enviroment.energy.value;
    left = total;
    results = [];
    while (left > 0 && global.food.length < local.maxInstances.food) {
      around = total / local.maxInstances.food;
      amount = Random.value(around * 2, around * 6);
      if (amount < (left * 0.9)) {
        left -= amount;
      } else {
        amount = left;
        left = 0;
      }
      food = new Food(Math.floor(amount));
      food.display();
      results.push(global.food.push(food));
    }
    return results;
  };

  simulation.setup = function(callback) {
    paper.install(window);
    paper.setup(doc.screen[0]);
    html.setSize();
    html.layer.food = new Layer();
    html.layer.bacteria = new Layer();
    simulation.setConstants();
    simulation.createLife();
    return callback();
  };

  simulation.start = function() {
    var at, input, names;
    console.log("Loaded completely");
    names = ["continue", "start"];
    doc.start.find(".screen:first").show();
    doc.start.find("button[name=" + names[0] + "]").click(function() {
      doc.start.find(".screen:first").hide();
      return doc.start.find(".screen:last").show();
    });
    doc.start.find("button[name=" + names[1] + "]").click(function() {
      doc.start.hide();
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
          case 13:
            doc.start.find("button[name=" + names[at] + "]").click();
            return at += 1;
          case 115:
          case 45:
            return html.sound();
        }
      }
    });
    input = doc.start.find(".slider");
    input.each(function() {
      global.enviroment[this.name] = new SciNum(Number(this.value), this.name, this.dataset.unit);
      $(this).next().next().text(this.value);
      return $(this).change(function() {
        var value;
        value = Number(this.value);
        global.enviroment[this.name] = new SciNum(value, this.name, this.dataset.unit);
        return $(this).next().next().text(this.value);
      });
    });
    return $("#loading").hide();
  };

  simulation.selectRand = function() {
    var choice;
    choice = Math.floor(Random.value(0, global.bacteria.length));
    if (global.bacteria[choice].id !== global.interaction.selected) {
      return global.bacteria[choice].select();
    } else {
      return simulation.selectRand();
    }
  };

  simulation.run = function() {
    var bacterium, k, len1, ref1;
    console.log('Start simulation');
    ref1 = global.bacteria;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      bacterium = ref1[k];
      bacterium.born();
    }
    global.interaction.pauzed = false;
    global.interaction.started = true;
    html.setup();
    console.log(project.activeLayer);
    html.clock();
    return html.ratio();
  };

  draw = {};

  draw.background = function() {
    var bubble, bubbleValues, k, l, len1, len2, spot, spotValues, value;
    html.layer.background.activate();
    draw.bottom = new Path.Rectangle(local.origin, local.size);
    draw.bottom.fillColor = global.colors.grey[600];
    html.layer.background.addChild(draw.bottom);
    draw.spots = [];
    spotValues = [
      {
        position: [35, 30],
        size: 5
      }, {
        position: [35, 30],
        size: 5
      }, {
        position: [55, 25],
        size: 6.5
      }, {
        position: [20, 80],
        size: 8
      }, {
        position: [85, 25],
        size: 6
      }, {
        position: [55, 75],
        size: 5.5
      }, {
        position: [65, 65],
        size: 7.5
      }, {
        position: [75, 70],
        size: 4.5
      }, {
        position: [90, 100],
        size: 5
      }, {
        position: [10, 25],
        size: 6
      }, {
        position: [35, 5],
        size: 7
      }, {
        position: [100, 45],
        size: 8.5
      }, {
        position: [5, 65],
        size: 6.5
      }
    ];
    for (k = 0, len1 = spotValues.length; k < len1; k++) {
      value = spotValues[k];
      spot = new Path.Circle([value.position[0] * local.width / 100, value.position[1] * local.height / 100], value.size * local.width / 100);
      spot.fillColor = global.colors.grey[700];
      draw.spots.push(spot);
    }
    html.layer.background.addChildren(draw.spots);
    draw.bubbles = [];
    bubbleValues = [
      {
        position: [35, 20],
        size: 2
      }, {
        position: [60, 70],
        size: 3
      }, {
        position: [90, 20],
        size: 4
      }, {
        position: [10, 80],
        size: 2.5
      }, {
        position: [55, 55],
        size: 3
      }, {
        position: [5, 10],
        size: 3
      }, {
        position: [80, 85],
        size: 3
      }, {
        position: [30, 90],
        size: 3
      }, {
        position: [25, 45],
        size: 2
      }, {
        position: [75, 55],
        size: 2
      }, {
        position: [65, 15],
        size: 3.5
      }
    ];
    for (l = 0, len2 = bubbleValues.length; l < len2; l++) {
      value = bubbleValues[l];
      bubble = new Path.Circle([value.position[0] * local.width / 100, value.position[1] * local.height / 100], value.size * local.width / 100);
      bubble.style = {
        fillColor: global.colors.grey[400],
        strokeColor: global.colors.grey[800],
        strokeWidth: 2
      };
      bubble.opacity = 0.35;
      draw.bubbles.push(bubble);
    }
    return html.layer.background.addChildren(draw.bubbles);
  };

  isLoaded = setInterval(function() {
    if (global.interaction.loaded) {
      clearInterval(isLoaded);
      console.log('Start main js');
      return simulation.setup(function() {
        return simulation.start();
      });
    }
  }, 1);

}).call(this);
