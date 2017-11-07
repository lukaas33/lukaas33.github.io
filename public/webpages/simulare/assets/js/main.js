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

  ref = ['start', 'screen', 'field', 'menu', 'priority'];
  for (j = 0, len = ref.length; j < len; j++) {
    id = ref[j];
    doc[id] = $("#" + id);
  }

  doc.menuItems = doc.menu.find('.item button');

  doc.clock = doc.priority.find('.clock p');

  Calc = {};

  Random = {};

  generate = {};

  time = {
    time: 0
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
      if (instances.length < 1) {
        unique = true;
        break;
      } else {
        occurs = false;
        for (l = 0, len1 = instances.length; l < len1; l++) {
          instance = instances[l];
          if (instance.id === string) {
            occurs = true;
            break;
          }
        }
        unique = !occurs;
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
      this.id = generate.id(global.food);
      this.diameter = Random.value(0.3e-6, 0.5e-6);
      this.radius = this.diameter / 2;
    }

    Food.prototype.display = function() {
      this.particle = new Path.Circle(this.position, Calc.scale(this.radius));
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
      this.chooseDirection = bind(this.chooseDirection, this);
      this.checkCollision = bind(this.checkCollision, this);
      this.foodNearby = bind(this.foodNearby, this);
      this.move = bind(this.move, this);
      this.ages = bind(this.ages, this);
      this.update = bind(this.update, this);
      this.display = bind(this.display, this);
      this.live = bind(this.live, this);
      this.born = bind(this.born, this);
      this.id = generate.id(global.bacteria);
      this.radius = new SciNum(this.diameter.value / 2, 'length', 'm');
      this.acceleration = new SciNum(new Point(0, 0), 'acceleration', 'm/s^2');
      this.maxSpeed = new SciNum(this.diameter.value * 1.5, 'speed', 'm/s');
      this.speed = new SciNum(new Point(0, 0), 'speed', 'm/s');
    }

    Bacteria.prototype.born = function() {
      this.display();
      this.ages();
      return this.chooseDirection();
    };

    Bacteria.prototype.live = function() {
      this.foodNearby();
      this.move();
      return this.update();
    };

    Bacteria.prototype.display = function() {
      this.body = new Path.Circle(this.position.round(), Calc.scale(this.radius.value));
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
      if (false) {
        return this.goToPoint();
      } else {
        if (Random.chance(25)) {
          return this.chooseDirection();
        }
      }
    };

    Bacteria.prototype.checkCollision = function() {
      var bacterium, bodyRadius, distance, k, len1, otherBodyRadius, ref1, results;
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
          distance = this.position.subtract(bacterium.position);
          otherBodyRadius = Calc.scale(bacterium.radius.value);
          if (Calc.combine(distance) <= bodyRadius + otherBodyRadius) {
            this.chooseDirection();
            if (this.position.x >= bacterium.position.x + otherBodyRadius) {
              this.speed.value.x = 0;
            } else if (this.position.x <= bacterium.position.x - otherBodyRadius) {
              this.speed.value.x = 0;
            }
            if (this.position.y >= bacterium.position.y + otherBodyRadius) {
              results.push(this.speed.value.y = 0);
            } else if (this.position.y <= bacterium.position.y - otherBodyRadius) {
              results.push(this.speed.value.y = 0);
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
      var targetSpeed;
      if (angle == null) {
        angle = Random.value(0, 360);
      }
      angle = angle % 360;
      angle = angle * (Math.PI / 180);
      this.direction = new Point(Math.cos(angle), Math.sin(angle));
      targetSpeed = this.direction.normalize(this.maxSpeed.value);
      return this.acceleration.value = targetSpeed.divide(3 * local.fps);
    };

    Bacteria.prototype.goToPoint = function(point) {};

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
    return null;
  };

  html.selected = function() {
    return null;
  };

  html.pie = function() {
    return null;
  };

  html.pause = function() {
    var icon;
    icon = $("button[name=pause] img");
    if (global.interaction.pauzed) {
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
    return global.bacteria[2] = new Caeruleus(size, energy, local.center.add(100, 0), 1, 0);
  };

  simulation.feed = function() {
    var amount, food, left, leftThisSecond, location, results, total;
    total = global.enviroment.energy.value;
    left = total;
    results = [];
    while (left > 0) {
      amount = Random.value(total * 0.02, total * 0.08);
      if (amount < left) {
        leftThisSecond -= amount;
      } else {
        amount = left;
        leftThisSecond = 0;
      }
      location = Point.random().multiply(local.size);
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
    global.interaction.pauzed = false;
    ref1 = global.bacteria;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      bacterium = ref1[k];
      bacterium.born();
    }
    return simulation.feed();
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
          return time.time += 5;
        }
      }, 5);
      time.second = setInterval(function() {
        if (!global.interaction.pauzed) {
          return html.clock();
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
      view.onResize = function(event) {
        var bacterium, bubble, food, k, l, len1, len2, len3, m, previous, ref1, ref2, ref3, results, scaledPosition;
        previous = local.size;
        html.setSize();
        draw.bottom.scale((local.width / draw.bottom.bounds.width) * 2, (local.height / draw.bottom.bounds.height) * 2);
        draw.bottom.position = local.origin;
        ref1 = global.food;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          food = ref1[k];
          scaledPosition = new Point({
            x: (food.position.x / previous.width) * local.size.width,
            y: (food.position.y / previous.height) * local.size.height
          });
          food.position = scaledPosition.round();
        }
        ref2 = global.bacteria;
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          bacterium = ref2[l];
          scaledPosition = new Point({
            x: (bacterium.position.x / previous.width) * local.size.width,
            y: (bacterium.position.y / previous.height) * local.size.height
          });
          bacterium.position = scaledPosition.round();
        }
        ref3 = draw.bubbles;
        results = [];
        for (m = 0, len3 = ref3.length; m < len3; m++) {
          bubble = ref3[m];
          scaledPosition = new Point({
            x: (bubble.position.x / previous.width) * local.size.width,
            y: (bubble.position.y / previous.height) * local.size.height
          });
          results.push(bubble.position = scaledPosition.round());
        }
        return results;
      };
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
    }
  }, 1);

}).call(this);
