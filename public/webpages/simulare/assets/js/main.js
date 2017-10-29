(function() {
  'use strict';
  var Caeruleus, Calc, Food, Lucarium, Rubrum, SciNum, Viridis, doc, draw, generate, html, i, id, isLoaded, len, local, ref, simulation, time,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  doc = {};

  local = {};

  ref = ['start', 'screen', 'field'];
  for (i = 0, len = ref.length; i < len; i++) {
    id = ref[i];
    doc[id] = $("#" + id);
  }

  Calc = {};

  generate = {};

  time = {};

  Calc.scale = function(value, needed) {
    var DPC, size;
    if (needed == null) {
      needed = 'scaled';
    }
    DPC = 72 / 2.54;
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

  generate.id = function() {
    return "id";
  };

  time.now = function() {
    return 'time';
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
    }

    return Food;

  })();

  Lucarium = (function() {
    function Lucarium(diameter, energy1, position, generation) {
      this.diameter = diameter;
      this.energy = energy1;
      this.position = position;
      this.generation = generation;
      this.update = bind(this.update, this);
      this.display = bind(this.display, this);
      this.id = generate.id();
      this.family = "Lucarium";
      this.maxSpeed = 0;
      this.acceleration = 0;
    }

    Lucarium.prototype.display = function() {
      this.body = new Path.Circle(this.position.round(), Calc.scale(this.diameter.value / 2));
      return this.body.fillColor = this.color;
    };

    Lucarium.prototype.update = function() {
      return this.body.position = this.position.round();
    };

    return Lucarium;

  })();

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

  simulation.createLife = function() {
    var energy, size;
    console.log("Creating life");
    size = new SciNum(1.0e-6, 'length', 'metre');
    energy = new SciNum(3.9e9, 'energy', 'joule');
    return global.bacteria[0] = new Viridis(size, energy, local.center, 1);
  };

  simulation.setup = function() {
    paper.install(window);
    paper.setup(doc.screen[0]);
    html.setSize();
    draw.background();
    simulation.createLife();
    return draw.bacteria();
  };

  simulation.start = function() {
    var input;
    console.log("Loaded completely");
    simulation.setup();
    doc.start.find("button[name=continue]").click(function() {
      return doc.start.find(".screen:first").hide();
    });
    doc.start.find("button[name=start]").click(function() {
      return doc.start.hide();
    });
    input = doc.start.find(".slider");
    input.each(function() {
      global.enviroment[this.name] = new SciNum(this.value, this.name, this.dataset.unit);
      return $(this).change(function() {
        return global.enviroment[this.name] = new SciNum(this.value, this.name, this.dataset.unit);
      });
    });
    return $("#loading").hide();
  };

  simulation.run = function() {};

  draw = {};

  draw.background = function() {
    var bubbleValues, index, j, len1, results, value;
    draw.bottom = new Path.Rectangle(local.origin, local.size);
    draw.bottom.fillColor = 'grey';
    draw.bubbles = [];
    bubbleValues = [
      {
        position: [350, 200],
        size: 30
      }, {
        position: [100, 300],
        size: 50
      }
    ];
    results = [];
    for (index = j = 0, len1 = bubbleValues.length; j < len1; index = ++j) {
      value = bubbleValues[index];
      draw.bubbles[index] = new Path.Circle(value.position, value.size / 2);
      results.push(draw.bubbles[index].fillColor = 'darkgrey');
    }
    return results;
  };

  draw.bacteria = function() {
    var bacterium, j, len1, ref1, results;
    ref1 = global.bacteria;
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      bacterium = ref1[j];
      results.push(bacterium.display());
    }
    return results;
  };

  isLoaded = setInterval(function() {
    if (global.interaction.loaded) {
      simulation.start();
      clearInterval(isLoaded);
      view.onFrame = function(event) {
        var bacterium, j, len1, ref1, results;
        ref1 = global.bacteria;
        results = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          bacterium = ref1[j];
          results.push(bacterium.update());
        }
        return results;
      };
      return view.onResize = function(event) {
        var bubble, j, len1, previous, ref1, results, scaledPosition;
        previous = local.size;
        html.setSize();
        draw.bottom.scale((local.width / draw.bottom.bounds.width) * 2, (local.height / draw.bottom.bounds.height) * 2);
        draw.bottom.position = local.origin;
        ref1 = draw.bubbles;
        results = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          bubble = ref1[j];
          scaledPosition = new Point({
            x: (bubble.position.x / previous.width) * local.size.width,
            y: (bubble.position.y / previous.height) * local.size.height
          });
          results.push(bubble.position = scaledPosition);
        }
        return results;
      };
    }
  }, 1);

}).call(this);
