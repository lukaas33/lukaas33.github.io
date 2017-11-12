(function() {
  var Bacteria, Caeruleus, Calc, Food, Lucarium, Random, Rubrum, SciNum, Viridis, doc, draw, generate, html, id, isLoaded, j, len, local, ref, simulation, time,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  doc = {};

  local = {
    resolution: 72,
    fps: 30,
    scaleFactor: 1.5e6
  };

  ref = ['start', 'screen', 'field', 'menu', 'sidebar', 'cards'];
  for (j = 0, len = ref.length; j < len; j++) {
    id = ref[j];
    doc[id] = $("#" + id);
  }

  doc.menuItems = doc.menu.find('.item button');

  doc.menuButton = doc.menu.find('.indicator button');

  doc.bacteria = doc.sidebar.find('#bacteria');

  doc.enviroment = doc.sidebar.find('#enviroment');

  doc.data = doc.bacteria.find('.data tr td');

  doc.values = doc.bacteria.find('.values tr td');

  doc.conditions = doc.enviroment.find('meter');

  doc.priority = doc.sidebar.find('#priority');

  doc.clock = doc.priority.find('.clock p span');

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
      size = value * local.scaleFactor;
      size = size * DPC;
      return size;
    } else if (needed === "real") {
      size = value / DPC;
      size = size / local.scaleFactor;
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
      this.notation = bind(this.notation, this);
    }

    SciNum.prototype.notation = function() {
      var value;
      if (this.value instanceof Point) {
        value = Calc.combine(this.value);
      } else {
        value = this.value;
      }
      return value.toExponential(4);
    };

    return SciNum;

  })();

  Food = (function() {
    function Food(energy1) {
      this.energy = energy1;
      this.eaten = bind(this.eaten, this);
      this.update = bind(this.update, this);
      this.display = bind(this.display, this);
      this.id = generate.id(global.food);
      this.diameter = new SciNum(Random.value(0.3e-6, 0.5e-6), 'length', 'm');
      this.radius = new SciNum(this.diameter.value / 2, 'length', 'm');
    }

    Food.prototype.display = function() {
      var range;
      range = local.size;
      this.position = Point.random().multiply(range);
      this.particle = new Path.Circle(this.position.round(), Math.round(Calc.scale(this.radius.value)));
      this.particle.fillColor = 'yellow';
      return html.layer.food.addChild(this.particle);
    };

    Food.prototype.update = function() {
      return this.particle.position = this.position.round();
    };

    Food.prototype.eaten = function() {
      var food, index, k, len1, ref1, results;
      this.particle.remove();
      ref1 = global.food;
      results = [];
      for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
        food = ref1[index];
        if (food !== void 0) {
          if (food.id === this.id) {
            results.push(global.food.splice(index, 1));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
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
      this.loseEnergy = bind(this.loseEnergy, this);
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
      this.acceleration = new SciNum(new Point(0, 0), 'acceleration', 'm/s^2');
      this.maxSpeed = new SciNum(this.diameter.value * 1.5, 'speed', 'm/s');
      this.minSpeed = new SciNum(new Point(0, 0), 'speed', 'm/s');
      this.speed = new SciNum(new Point(0, 0), 'speed', 'm/s');
      this.age = new SciNum(0, 'time', 's');
      this.target = null;
      this.minEnergyLoss = new SciNum(4e5, 'energy per second', 'atp/s');
      this.action = null;
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
      this.loseEnergy();
      return this.update();
    };

    Bacteria.prototype.display = function() {
      this.body = new Path.Circle(this.position.round(), Math.round(Calc.scale(this.radius.value)));
      this.body.fillColor = this.color;
      this.body.name = this.id;
      return html.layer.bacteria.addChild(this.body);
    };

    Bacteria.prototype.update = function() {
      return this.body.position = this.position.round();
    };

    Bacteria.prototype.ages = function() {
      return setInterval((function(_this) {
        return function() {
          return _this.age.value = (time.time - _this.birth) / 1000;
        };
      })(this), 1000);
    };

    Bacteria.prototype.startMoving = function() {
      var targetSpeed;
      targetSpeed = this.direction.normalize(this.maxSpeed.value);
      return this.acceleration.value = targetSpeed.divide(3);
    };

    Bacteria.prototype.move = function() {
      var acceleration, speed;
      this.checkCollision();
      acceleration = this.acceleration.value.divide(local.fps);
      this.speed.value = this.speed.value.add(acceleration);
      if (Calc.combine(this.speed.value) >= this.maxSpeed.value) {
        this.acceleration.value = new Point(0, 0);
        this.speed.value.normalize(this.maxSpeed.value);
      } else if (Calc.combine(this.speed.value) <= this.minSpeed.value) {
        this.minSpeed.value = new Point(0, 0);
        this.acceleration.value = new Point(0, 0);
        this.speed.value.normalize(this.minSpeed.value);
      }
      speed = new Point({
        x: Calc.scale(this.speed.value.x),
        y: Calc.scale(this.speed.value.y)
      });
      speed = speed.divide(local.fps);
      return this.position = this.position.add(speed);
    };

    Bacteria.prototype.loseEnergy = function() {
      var condition, difference, k, len1, loss, ref1, value;
      loss = this.minEnergyLoss.value;
      ref1 = ['temperature', 'toxicity', 'acidity'];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        condition = ref1[k];
        value = global.enviroment[condition];
        difference = Math.abs(value - this.idealConditions[condition].value);
        if (difference >= this.tolerance[condition].value) {
          difference -= this.tolerance[condition].value;
        } else {
          difference = 0;
        }
        loss += Math.pow(difference * this.minEnergyLoss.value, 2);
      }
      return this.energy.value -= loss / local.fps;
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
      } else {
        return this.target = null;
      }
    };

    Bacteria.prototype.checkCollision = function() {
      var bacterium, bodyRadius, cosine, distance, impactAngle, k, len1, otherBodyRadius, ref1, results, speedComponent;
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
            cosine = Math.cos(Calc.rad(impactAngle));
            speedComponent = this.speed.value.multiply(cosine);
            if (!isNaN(Calc.combine(speedComponent))) {
              results.push(this.speed.value = this.speed.value.subtract(speedComponent));
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
      this.goToPoint(this.target.position);
      return this.eat();
    };

    Bacteria.prototype.goToPoint = function(point) {
      var relativePosition;
      relativePosition = this.target.position.subtract(this.position);
      this.direction = relativePosition.normalize(1);
      return this.startMoving();
    };

    Bacteria.prototype.divide = function() {};

    Bacteria.prototype.die = function() {};

    Bacteria.prototype.eat = function() {
      var distance;
      distance = Calc.combine(this.target.position.subtract(this.position));
      if (distance + Calc.scale(this.target.radius.value) <= Calc.scale(this.radius.value)) {
        this.energy.value += this.target.energy.value;
        this.target.eaten();
        return this.target = null;
      }
    };

    return Bacteria;

  })();

  Lucarium = (function(superClass) {
    extend(Lucarium, superClass);

    function Lucarium() {
      this.family = "Lucarium";
      this.taxonomicName = this.family + " " + this.species;
      this.idealConditions = {
        temperature: new SciNum(20, 'temperature', 'degrees'),
        acidity: new SciNum(7, 'pH', ''),
        toxicity: new SciNum(0, 'concentration', 'M')
      };
      Lucarium.__super__.constructor.apply(this, arguments);
    }

    return Lucarium;

  })(Bacteria);

  Viridis = (function(superClass) {
    extend(Viridis, superClass);

    function Viridis() {
      this.species = "Viridis";
      this.color = '#4caf50';
      this.tolerance = {
        temperature: new SciNum(5, 'temperature', 'degrees'),
        acidity: new SciNum(0.5, 'pH', ''),
        toxicity: new SciNum(2, 'concentration', 'M')
      };
      Viridis.__super__.constructor.apply(this, arguments);
    }

    return Viridis;

  })(Lucarium);

  Rubrum = (function(superClass) {
    extend(Rubrum, superClass);

    function Rubrum() {
      this.species = "Rubrum";
      this.color = '#f44336';
      this.tolerance = {
        temperature: new SciNum(5, 'temperature', 'degrees'),
        acidity: new SciNum(0.5, 'pH', ''),
        toxicity: new SciNum(2, 'concentration', 'M')
      };
      Rubrum.__super__.constructor.apply(this, arguments);
    }

    return Rubrum;

  })(Lucarium);

  Caeruleus = (function(superClass) {
    extend(Caeruleus, superClass);

    function Caeruleus() {
      this.species = "Caeruleus";
      this.color = '#2196f3';
      this.tolerance = {
        temperature: new SciNum(5, 'temperature', 'degrees'),
        acidity: new SciNum(0.5, 'pH', ''),
        toxicity: new SciNum(2, 'concentration', 'M')
      };
      Caeruleus.__super__.constructor.apply(this, arguments);
    }

    return Caeruleus;

  })(Lucarium);

  simulation = {};

  html = {};

  html.layer = {};

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

  html.setup = function() {
    doc.conditions.each(function() {
      return $(this).attr('value', global.enviroment[this.dataset.name].value);
    });
    $(window).blur(function() {
      return html.pause(false);
    });
    $(window).focus(function() {
      return html.pause(true);
    });
    doc.start.click(function() {});
    doc.menuButton.click(function() {
      return html.menu();
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
          case "view":
            return null;
          case "info":
            return null;
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
            if ($(this).hasClass('value')) {
              return this.textContent = data[this.dataset.name];
            }
          });
          doc.values.each(function() {
            var scinum;
            if ($(this).hasClass('value')) {
              scinum = data[this.dataset.name];
              return $(this).find('span').each(function() {
                if ($(this).hasClass('number')) {
                  return this.textContent = scinum.notation();
                } else if ($(this).hasClass('unit')) {
                  return this.textContent = scinum.unit;
                }
              });
            }
          });
          results.push(doc.bacteria.attr('data-content', true));
        } else {
          results.push(void 0);
        }
      }
      return results;
    } else {
      return doc.bacteria.attr('data-content', false);
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

  html.sound = function(change) {
    var icon;
    if (change == null) {
      change = global.interaction.sound;
    }
    icon = doc.menu.find("button[name=volume] img");
    if (change) {
      global.interaction.sound = false;
      return icon.attr('src', 'assets/images/icons/ic_volume_off_black_24px.svg');
    } else {
      global.interaction.sound = true;
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

  html.menu = function(change) {
    var icon;
    if (change == null) {
      change = doc.menu.attr('data-state');
    }
    icon = doc.menuButton.find('img');
    console.log(change);
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
    var energy, size;
    console.log("Creating life");
    html.layer.bacteria.activate();
    size = new SciNum(1.0e-6, 'length', 'm');
    energy = new SciNum(3.9e9, 'energy', 'atp');
    global.bacteria[0] = new Viridis(size, energy, local.center, 1, 0);
    global.bacteria[1] = new Rubrum(size, energy, local.center.subtract(100, 0), 1, 0);
    global.bacteria[2] = new Caeruleus(size, energy, local.center.add(100, 0), 1, 0);
    return global.interaction.selected = global.bacteria[2].id;
  };

  simulation.feed = function() {
    var amount, food, left, results, total;
    html.layer.food.activate;
    total = global.enviroment.energy.value;
    left = total;
    results = [];
    while (left > 0 && global.food.length <= 20) {
      amount = Random.value(total * 0.10, total * 0.15);
      if (amount < left) {
        left -= amount;
      } else {
        amount = left;
        left = 0;
      }
      food = new Food(new SciNum(Math.floor(amount), 'energy', 'j'));
      food.display();
      results.push(global.food.push(food));
    }
    return results;
  };

  simulation.setup = function() {
    paper.install(window);
    paper.setup(doc.screen[0]);
    html.setSize();
    html.layer.background = new Layer();
    html.layer.food = new Layer();
    html.layer.bacteria = new Layer();
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
    html.setup();
    return console.log(project.activeLayer);
  };

  draw = {};

  draw.background = function() {
    var bubbleValues, index, k, len1, value;
    html.layer.background.activate();
    draw.bottom = new Path.Rectangle(local.origin, local.size);
    draw.bottom.fillColor = 'grey';
    html.layer.background.addChild(draw.bottom);
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
    for (index = k = 0, len1 = bubbleValues.length; k < len1; index = ++k) {
      value = bubbleValues[index];
      draw.bubbles[index] = new Path.Circle(value.position, value.size / 2);
      draw.bubbles[index].fillColor = 'darkgrey';
    }
    return html.layer.background.addChildren(draw.bubbles);
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
        scalePositions(global.food);
        scalePositions(draw.bubbles);
        draw.bottom.scale((local.width / draw.bottom.bounds.width) * 2, (local.height / draw.bottom.bounds.height) * 2);
        return draw.bottom.position = local.origin;
      };
    }
  }, 1);

}).call(this);
