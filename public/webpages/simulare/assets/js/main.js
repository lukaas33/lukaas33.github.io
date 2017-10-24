(function() {
  'use strict';
  var Caeruleus, Calc, Lucarium, Rubrum, SciNum, Viridis, doc, draw, generate, isLoaded, local, simulation, time,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  doc = {};

  local = {};

  doc['$canvas'] = $("#screen");

  doc['$start'] = $("#start");

  Calc = {};

  generate = {};

  time = {};

  generate.id = function() {
    return "id";
  };

  time.now = function() {};

  SciNum = (function() {
    function SciNum(value, quantity, unit) {
      this.value = value;
      this.quantity = quantity;
      this.unit = unit;
    }

    return SciNum;

  })();

  Lucarium = (function() {
    function Lucarium(diameter, position, generation, birthTime) {
      this.diameter = diameter;
      this.position = position;
      this.generation = generation;
      this.birthTime = birthTime;
    }

    Lucarium.id = generate.id();

    Lucarium.family = "Lucarium";

    return Lucarium;

  })();

  Viridis = (function(superClass) {
    extend(Viridis, superClass);

    function Viridis() {
      return Viridis.__super__.constructor.apply(this, arguments);
    }

    Viridis.species = "Viridis";

    return Viridis;

  })(Lucarium);

  Rubrum = (function(superClass) {
    extend(Rubrum, superClass);

    function Rubrum() {
      return Rubrum.__super__.constructor.apply(this, arguments);
    }

    Rubrum.species = "Rubrum";

    return Rubrum;

  })(Lucarium);

  Caeruleus = (function(superClass) {
    extend(Caeruleus, superClass);

    function Caeruleus() {
      return Caeruleus.__super__.constructor.apply(this, arguments);
    }

    Caeruleus.species = "Caeruleus";

    return Caeruleus;

  })(Lucarium);

  Lucarium.prototype.divide = function() {};

  Lucarium.prototype.display = function() {};

  Lucarium.prototype.move = function() {};

  Lucarium.prototype.eat = function() {};

  simulation = {};

  simulation.createLife = function() {
    return global.bacteria[0] = new Viridis(1.0e-9, new Point(), 1, time.now());
  };

  simulation.setup = function() {
    paper.install(window);
    paper.setup(doc['$canvas'][0]);
    draw.background();
    return simulation.createLife();
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
    bottomLayer = new Path.Rectangle(new Point(0, 0), view.size);
    return bottomLayer.fillColor = 'grey';
  };

  isLoaded = setInterval(function() {
    if (global.interaction.loaded) {
      simulation.start();
      clearInterval(isLoaded);
      view.onResize = function(event) {
        return console.log("Resized canvas");
      };
      return view.onFrame = function(event) {};
    }
  }, 1);

}).call(this);
