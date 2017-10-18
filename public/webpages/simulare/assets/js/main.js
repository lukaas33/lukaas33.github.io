(function() {
  var SciNum, isLoaded, start;

  SciNum = (function() {
    function SciNum(value, quantity, unit) {
      this.value = value;
      this.quantity = quantity;
      this.unit = unit;
    }

    return SciNum;

  })();

  start = function() {
    var $input, $start;
    console.log("Loaded completely");
    $start = $("#start");
    $start.find(".continue:first").click(function() {
      return $start.find(".screen:first").hide();
    });
    $start.find(".continue:last").click(function() {
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
      return clearInterval(isLoaded);
    }
  }, 1);

}).call(this);
