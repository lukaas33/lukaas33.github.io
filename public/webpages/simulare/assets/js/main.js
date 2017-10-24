(function() {
  'use strict';
  var Caeruleus, Calc, Lucarium, Rubrum, SciNum, Viridis, doc, draw, generate, isLoaded, local, simulation, time,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  doc = {};

  local = {};

  doc['$start'] = $("#start");

  Calc = {};

  generate = {};

  time = {};

  Calc.scale = function(value, needed) {
    var size;
    if (needed == null) {
      needed = 'scaled';
    }
    if (needed === "scaled") {
      size = value * global.constants.scaleFactor;
      return size + "cm";
    } else if (needed === "real") {
      value = parseInt(value);
      size = value / global.constants.scaleFactor;
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

  Lucarium = (function() {
    function Lucarium(diameter, position, generation) {
      this.diameter = diameter;
      this.position = position;
      this.generation = generation;
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

    Viridis.color = '#4caf50';

    return Viridis;

  })(Lucarium);

  Rubrum = (function(superClass) {
    extend(Rubrum, superClass);

    function Rubrum() {
      return Rubrum.__super__.constructor.apply(this, arguments);
    }

    Rubrum.species = "Rubrum";

    Rubrum.color = '#f44336';

    return Rubrum;

  })(Lucarium);

  Caeruleus = (function(superClass) {
    extend(Caeruleus, superClass);

    function Caeruleus() {
      return Caeruleus.__super__.constructor.apply(this, arguments);
    }

    Caeruleus.species = "Caeruleus";

    Caeruleus.color = '#2196f3';

    return Caeruleus;

  })(Lucarium);

  Lucarium.prototype.divide = function() {};

  Lucarium.prototype.display = function() {
    this.body = new Path.Circle(this.position, Calc.scale(this.diameter / 2));
    return this.body.fillColor = this.color;
  };

  Lucarium.prototype.update = function() {};

  Lucarium.prototype.move = function() {};

  Lucarium.prototype.eat = function() {};

  simulation = {};

  simulation.createLife = function() {
    console.log("Creating life");
    return global.bacteria[0] = new Viridis(1.0e-6, view.center, 1);
  };

  simulation.setup = function() {
    paper.install(window);
    paper.setup($('#screen')[0]);
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
