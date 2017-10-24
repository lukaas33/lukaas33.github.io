(function() {
  'use strict';
  var Caeruleus, Calc, Food, Lucarium, Rubrum, SciNum, Viridis, doc, draw, generate, isLoaded, local, simulation, time,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  doc = {};

  local = {};

  doc['$start'] = $("#start");

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
    function Food(energy1, quantity) {
      this.energy = energy1;
      this.quantity = quantity;
    }

    return Food;

  })();

  Lucarium = (function() {
    function Lucarium(diameter, energy1, position, generation) {
      this.diameter = diameter;
      this.energy = energy1;
      this.position = position;
      this.generation = generation;
      this.move = bind(this.move, this);
      this.eat = bind(this.eat, this);
      this.update = bind(this.update, this);
      this.display = bind(this.display, this);
      this.divide = bind(this.divide, this);
      this.id = generate.id();
      this.family = "Lucarium";
    }

    Lucarium.prototype.divide = function() {};

    Lucarium.prototype.display = function() {
      this.body = new Path.Circle(this.position, Calc.scale(this.diameter.value / 2));
      console.log(this.position, Calc.scale(this.diameter.value / 2));
      return this.body.fillColor = this.color;
    };

    Lucarium.prototype.update = function() {};

    Lucarium.prototype.eat = function() {};

    Lucarium.prototype.move = function() {};

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

  simulation.createLife = function() {
    var energy, size;
    console.log("Creating life");
    size = new SciNum(1.0e-6, 'length', 'metre');
    energy = new SciNum(3.9e9, 'energy', 'joule');
    return global.bacteria[0] = new Viridis(size, energy, new Point(view.center), 1);
  };

  simulation.setup = function() {
    paper.install(window);
    paper.setup($('#screen')[0]);
    draw.background();
    simulation.createLife();
    return draw.bacteria();
  };

  simulation.start = function() {
    var $input;
    console.log("Loaded completely");
    simulation.setup();
    doc['$start'].find(".continue button[name=continue]").click(function() {
      return doc['$start'].find(".screen:first").hide();
    });
    doc['$start'].find(".continue button[name=start]").click(function() {
      return doc['$start'].hide();
    });
    $input = doc['$start'].find(".slider");
    $input.each(function() {
      global.enviroment[this.name] = new SciNum(this.value, this.name, this.dataset.unit);
      return $(this).change(function() {
        return global.enviroment[this.name] = new SciNum(this.value, this.name, this.dataset.unit);
      });
    });
    return $("#loading").hide();
  };

  draw = {};

  draw.background = function() {
    var bottomLayer;
    bottomLayer = new Path.Rectangle(new Point(0, 0), view.viewSize);
    return bottomLayer.fillColor = 'grey';
  };

  draw.bacteria = function() {
    var bacterium, i, len, ref, results;
    ref = global.bacteria;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      bacterium = ref[i];
      results.push(bacterium.display());
    }
    return results;
  };

  isLoaded = setInterval(function() {
    if (global.interaction.loaded) {
      simulation.start();
      clearInterval(isLoaded);
      view.onResize = function(event) {
        return console.log("Resized canvas");
      };
      return view.onFrame = function(event) {
        var bacterium, i, len, ref, results;
        ref = global.bacteria;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          bacterium = ref[i];
          results.push(bacterium.update());
        }
        return results;
      };
    }
  }, 1);

}).call(this);
