(function() {
  var Bacteria, Caeruleus, Calc, Food, Lucarium, Random, Rubrum, SciNum, Viridis, doc, draw, generate, html, id, isLoaded, j, len, local, ref, simulation, time,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  doc = {};

  local = {
    resolution: 72,
    fps: 30
  };

  ref = ['start', 'screen', 'field', 'menu', 'priority', 'sidebar'];
  for (j = 0, len = ref.length; j < len; j++) {
    id = ref[j];
    doc[id] = $("#" + id);
  }

  doc.menuItems = doc.menu.find('.item button');

  doc.clock = doc.priority.find('.clock p');

  doc.data = doc.sidebar.find('.data tr td');

  doc.values = doc.sidebar.find('.values tr td');

  Calc = {};

  Random = {};

  generate = {};

  time = {
    time: 0,
    trackSecond: 0
  };

  Calc.scale = function(value, needed) {
    var DPC, size;
    if (needed == null) {
      needed = 'scaled';
    }
    DPC = local.resolution / 2.54;
    if (needed === "scaled") {
      size = value * global.constants.scaleFactor;
      size = size * DPC;
      return size;
    } else if (needed === "real") {
      size = value / DPC;
      size = size / global.constants.scaleFactor;
      return size;
    }
  };

  Calc.combine = function(vector) {
    var result;
    result = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    return result;
  };

  Calc.prefixSI = function(scinum) {
    return null;
  };

  Calc.rad = function(degrees) {
    var angle;
    angle = degrees * (Math.PI / 180);
    return angle;
  };

  Random.value = function(bottom, top) {
    var middle, value;
    middle = top - bottom;
    value = (Math.random() * middle) + bottom;
    return value;
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
    return null;
  };

  generate.id = function(instances) {
    var charcode, i, instance, k, l, len1, occurs, result, string, unique;
    unique = false;
    string = null;
    while (!unique) {
      result = [];
      for (i = k = 0; k <= 8; i = ++k) {
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
    function SciNum(value1, quantity, unit) {
      this.value = value1;
      this.quantity = quantity;
      this.unit = unit;
    }

    return SciNum;

  })();

  Food = (function() {
    function Food(energy1, position) {
      this.energy = energy1;
      this.position = position;
      this.display = bind(this.display, this);
      this.diameter = Random.value(0.3e-6, 0.5e-6);
      this.radius = this.diameter / 2;
    }

    Food.prototype.display = function() {
      this.particle = new Path.Circle(this.position.round(), Math.round(Calc.scale(this.radius)));
      return this.particle.fillColor = 'yellow';
    };

    return Food;

  })();

  Bacteria = (function() {
    function Bacteria(diameter, energy1, position, generation, birth) {
      this.diameter = diameter;
      this.energy = energy1;
      this.position = position;
      this.generation = generation;
      this.birth = birth;
      this.eat = bind(this.eat, this);
      this.die = bind(this.die, this);
      this.divide = bind(this.divide, this);
      this.goToPoint = bind(this.goToPoint, this);
      this.findTarget = bind(this.findTarget, this);
      this.chooseDirection = bind(this.chooseDirection, this);
      this.checkCollision = bind(this.checkCollision, this);
      this.foodNearby = bind(this.foodNearby, this);
      this.move = bind(this.move, this);
      this.startMoving = bind(this.startMoving, this);
      this.ages = bind(this.ages, this);
      this.update = bind(this.update, this);
      this.display = bind(this.display, this);
      this.live = bind(this.live, this);
      this.born = bind(this.born, this);
      this.id = generate.id(global.bacteria);
      this.radius = new SciNum(this.diameter.value / 2, 'length', 'm');
      this.viewRange = new SciNum(this.diameter.value * 3, 'length', 'm');
      this.acceleration = new SciNum(new Point(0, 0), 'acceleration', 'm/s*s');
      this.maxSpeed = new SciNum(this.diameter.value * 1.5, 'speed', 'm/s');
      this.speed = new SciNum(new Point(0, 0), 'speed', 'm/s');
      this.target = null;
    }

    Bacteria.prototype.born = function() {
      this.display();
      this.ages();
      return this.chooseDirection();
    };

    Bacteria.prototype.live = function() {
      this.foodNearby();
      if (this.target !== null) {
        this.findTarget();
      } else {
        if (Random.chance(25)) {
          this.chooseDirection();
        }
      }
      this.move();
      return this.update();
    };

    Bacteria.prototype.display = function() {
      this.body = new Path.Circle(this.position.round(), Math.round(Calc.scale(this.radius.value)));
      return this.body.fillColor = this.color;
    };

    Bacteria.prototype.update = function() {
      return this.body.position = this.position.round();
    };

    Bacteria.prototype.ages = function() {
      return setInterval((function(_this) {
        return function() {
          return _this.age = new SciNum((time.time - _this.birth) / 1000, 'time', 's');
        };
      })(this), 1000);
    };

    Bacteria.prototype.startMoving = function() {
      var targetSpeed;
      targetSpeed = this.direction.normalize(this.maxSpeed.value);
      return this.acceleration.value = targetSpeed.divide(3 * local.fps);
    };

    Bacteria.prototype.move = function() {
      var speed;
      this.checkCollision();
      this.speed.value = this.speed.value.add(this.acceleration.value);
      if (Calc.combine(this.speed.value) > this.maxSpeed.value) {
        this.acceleration.value = new Point(0, 0);
        this.speed.value.normalize(this.maxSpeed.value);
      }
      speed = new Point({
        x: Calc.scale(this.speed.value.x),
        y: Calc.scale(this.speed.value.y)
      });
      speed = speed.divide(local.fps);
      return this.position = this.position.add(speed);
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
            results.push(this.target = target.instance);
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };

    Bacteria.prototype.checkCollision = function() {
      var bacterium, bodyRadius, combinedSpeed, distance, impactAngle, k, len1, otherBodyRadius, ref1, results, speed, speedComponent;
      bodyRadius = Calc.scale(this.radius.value);
      if (this.position.x + bodyRadius >= local.width) {
        this.speed.value.x = 0;
        this.chooseDirection(180);
      } else if (this.position.x - bodyRadius <= 0) {
        this.speed.value.x = 0;
        this.chooseDirection(0);
      }
      if (this.position.y + bodyRadius >= local.height) {
        this.speed.value.y = 0;
        this.chooseDirection(270);
      } else if (this.position.y - bodyRadius <= 0) {
        this.speed.value.y = 0;
        this.chooseDirection(90);
      }
      ref1 = global.bacteria;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bacterium = ref1[k];
        if (this.id !== bacterium.id) {
          distance = bacterium.position.subtract(this.position);
          otherBodyRadius = Calc.scale(bacterium.radius.value);
          if (Calc.combine(distance) <= bodyRadius + otherBodyRadius) {
            impactAngle = this.speed.value.getAngle(distance);
            speed = Math.cos(Calc.rad(impactAngle));
            speedComponent = this.speed.value.multiply(speed);
            this.speed.value = this.speed.value.subtract(speedComponent);
            combinedSpeed = Calc.combine(this.speed.value);
            if (combinedSpeed === 0) {
              results.push(this.chooseDirection());
            } else if (combinedSpeed > this.maxspeed.value) {
              results.push(this.speed.value.normalize(this.maxSpeed.value));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Bacteria.prototype.chooseDirection = function(angle) {
      if (angle == null) {
        angle = Random.value(0, 360);
      }
      angle = Calc.rad(angle % 360);
      this.direction = new Point(Math.cos(angle), Math.sin(angle));
      return this.startMoving();
    };

    Bacteria.prototype.findTarget = function() {
      if (this.target.position === this.position) {
        return this.target = null;
      } else {
        return this.goToPoint(this.target.position);
      }
    };

    Bacteria.prototype.goToPoint = function(point) {
      var relativePosition;
      relativePosition = this.target.position.subtract(this.position);
      this.direction = relativePosition.normalize(1);
      return this.startMoving();
    };

    Bacteria.prototype.divide = function() {};

    Bacteria.prototype.die = function() {};

    Bacteria.prototype.eat = function() {};

    return Bacteria;

  })();

  Lucarium = (function(superClass) {
    extend(Lucarium, superClass);

    function Lucarium() {
      this.family = "Lucarium";
      Lucarium.__super__.constructor.apply(this, arguments);
    }

    return Lucarium;

  })(Bacteria);

  Viridis = (function(superClass) {
    extend(Viridis, superClass);

    function Viridis() {
      this.species = "Viridis";
      this.color = '#4caf50';
      Viridis.__super__.constructor.apply(this, arguments);
    }

    return Viridis;

  })(Lucarium);

  Rubrum = (function(superClass) {
    extend(Rubrum, superClass);

    function Rubrum() {
      this.species = "Rubrum";
      this.color = '#f44336';
      Rubrum.__super__.constructor.apply(this, arguments);
    }

    return Rubrum;

  })(Lucarium);

  Caeruleus = (function(superClass) {
    extend(Caeruleus, superClass);

    function Caeruleus() {
      this.species = "Caeruleus";
      this.color = '#2196f3';
      Caeruleus.__super__.constructor.apply(this, arguments);
    }

    return Caeruleus;

  })(Lucarium);

  simulation = {};

  html = {};

  html.setSize = function() {
    var height, width;
    width = doc.field.width();
    height = doc.field.height();
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
    var form, hours, minutes, seconds, total;
    total = time.time / 1000;
    hours = Math.floor(total / 3600);
    minutes = Math.floor(total % 3600 / 60);
    seconds = Math.floor(total % 3600 % 60);
    form = function(number) {
      var string;
      string = String(number);
      if (string.length === 1) {
        string = "0" + string;
      }
      return string;
    };
    return doc.clock.find('span').each(function() {
      if ($(this).hasClass('hour')) {
        return this.textContent = form(hours);
      } else if ($(this).hasClass('minute')) {
        return this.textContent = form(minutes);
      } else if ($(this).hasClass('second')) {
        return this.textContent = form(seconds);
      }
    });
  };

  html.setup = function() {
    $(window).blur(function() {
      return html.pause(false);
    });
    $(window).focus(function() {
      return html.pause(true);
    });
    return doc.menuItems.each(function() {
      return $(this).click(function() {
        switch (this.name) {
          case "volume":
            return null;
          case "pause":
            return html.pause();
          case "card":
            return null;
          case "view":
            return null;
          case "info":
            return null;
        }
      });
    });
  };

  html.selected = function() {
    var bacterium, data, k, len1, ref1;
    data = null;
    ref1 = global.bacteria;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      bacterium = ref1[k];
      if (bacterium.id === global.interaction.selected) {
        data = bacterium;
        break;
      }
    }
    if (data !== null) {
      doc.data.each($(this).hasClass('name') ? this.textContent = null : $(this).hasClass('value') ? this.textContent = null : void 0);
      return doc.values.each($(this).hasClass('name') ? this.textContent = null : $(this).hasClass('value') ? this.textContent = null : void 0);
    }
  };

  html.pie = function() {
    return null;
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

  simulation.createLife = function() {
    var energy, size;
    console.log("Creating life");
    size = new SciNum(1.0e-6, 'length', 'm');
    energy = new SciNum(3.9e9, 'energy', 'j');
    global.bacteria[0] = new Viridis(size, energy, local.center, 1, 0);
    global.bacteria[1] = new Rubrum(size, energy, local.center.subtract(100, 0), 1, 0);
    global.bacteria[2] = new Caeruleus(size, energy, local.center.add(100, 0), 1, 0);
    return global.interaction.selected = global.bacteria[2].id;
  };

  simulation.feed = function() {
    var amount, food, left, location, range, results, total;
    total = global.enviroment.energy.value;
    left = total;
    results = [];
    while (left > 0 && global.food.length < 20) {
      amount = Random.value(total * 0.10, total * 0.15);
      if (amount < left) {
        left -= amount;
      } else {
        amount = left;
        left = 0;
      }
      range = local.size.subtract(50);
      location = Point.random().multiply(range).add(25);
      amount = new SciNum(amount, 'energy', 'j');
      food = new Food(amount, location);
      food.display();
      results.push(global.food.push(food));
    }
    return results;
  };

  simulation.setup = function() {
    paper.install(window);
    paper.setup(doc.screen[0]);
    html.setSize();
    draw.background();
    return simulation.createLife();
  };

  simulation.start = function() {
    var input;
    console.log("Loaded completely");
    simulation.setup();
    doc.start.find("button[name=continue]").click(function() {
      return doc.start.find(".screen:first").hide();
    });
    doc.start.find("button[name=start]").click(function() {
      doc.start.hide();
      return simulation.run();
    });
    input = doc.start.find(".slider");
    input.each(function() {
      global.enviroment[this.name] = new SciNum(Number(this.value), this.name, this.dataset.unit);
      return $(this).change(function() {
        var value;
        value = Number(this.value);
        return global.enviroment[this.name] = new SciNum(value, this.name, this.dataset.unit);
      });
    });
    return $("#loading").hide();
  };

  simulation.run = function() {
    var bacterium, k, len1, ref1;
    ref1 = global.bacteria;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      bacterium = ref1[k];
      bacterium.born();
    }
    global.interaction.pauzed = false;
    return html.setup();
  };

  draw = {};

  draw.background = function() {
    var bubbleValues, index, k, len1, results, value;
    draw.bottom = new Path.Rectangle(local.origin, local.size);
    draw.bottom.fillColor = 'grey';
    draw.bubbles = [];
    bubbleValues = [
      {
        position: [350, 200],
        size: 200
      }, {
        position: [600, 700],
        size: 100
      }
    ];
    results = [];
    for (index = k = 0, len1 = bubbleValues.length; k < len1; index = ++k) {
      value = bubbleValues[index];
      draw.bubbles[index] = new Path.Circle(value.position, value.size / 2);
      results.push(draw.bubbles[index].fillColor = 'darkgrey');
    }
    return results;
  };

  isLoaded = setInterval(function() {
    if (global.interaction.loaded) {
      simulation.start();
      clearInterval(isLoaded);
      time.clock = setInterval(function() {
        if (!global.interaction.pauzed) {
          time.time += 5;
          time.trackSecond += 5;
          if (time.trackSecond > 1000) {
            time.trackSecond = 0;
            return simulation.feed();
          }
        }
      }, 5);
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
            results.push(bacterium.live());
          }
          return results;
        }
      };
      return view.onResize = function(event) {
        var previous, scalePositions;
        previous = local.size;
        html.setSize();
        scalePositions = function(instances) {
          var instance, k, len1, results, scaledPosition;
          results = [];
          for (k = 0, len1 = instances.length; k < len1; k++) {
            instance = instances[k];
            scaledPosition = new Point({
              x: (instance.position.x / previous.width) * local.size.width,
              y: (instance.position.y / previous.height) * local.size.height
            });
            results.push(instance.position = scaledPosition.round());
          }
          return results;
        };
        scalePositions(global.bacteria);
        scalePositions(global.food);
        scalePositions(draw.bubbles);
        draw.bottom.scale((local.width / draw.bottom.bounds.width) * 2, (local.height / draw.bottom.bounds.height) * 2);
        return draw.bottom.position = local.origin;
      };
    }
  }, 1);

}).call(this);
