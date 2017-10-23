(function() {
  'use strict';
  var $canvas, Caeruleus, Lucarium, Rubrum, SciNum, Viridis, generateId, isLoaded, setup, start,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  $canvas = $("#screen");

  generateId = function() {
    return "id";
  };

  SciNum = (function() {
    function SciNum(value, quantity, unit) {
      this.value = value;
      this.quantity = quantity;
      this.unit = unit;
    }

    return SciNum;

  })();

  Lucarium = (function() {
    function Lucarium(mass, position) {
      this.mass = mass;
      this.position = position;
    }

    Lucarium.id = generateId();

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

  setup = function() {
    paper.install(window);
    return paper.setup($canvas[0]);
  };

  start = function() {
    var $input, $start;
    console.log("Loaded completely");
    setup();
    $start = $("#start");
    $start.find(".continue button[name=continue]").click(function() {
      return $start.find(".screen:first").hide();
    });
    $start.find(".continue button[name=start]").click(function() {
      return $start.hide();
    });
    $input = $start.find(".slider");
    $input.each(function() {
      global.enviroment[this.name] = new SciNum(this.value, this.name, this.dataset.unit);
      return $(this).change(function() {
        return global.enviroment[this.name] = new SciNum(this.value, this.name, this.dataset.unit);
      });
    });
    return $("#loading").hide();
  };

  isLoaded = setInterval(function() {
    if (global.interaction.loaded) {
      start();
      clearInterval(isLoaded);
      view.onResize = function(event) {
        return console.log("resize canvas");
      };
      return view.onFrame = function(event) {
        return console.log("frame");
      };
    }
  }, 1);

}).call(this);
