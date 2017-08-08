(function() {
  var math, random;

  math = {

    /* More specific math object for project */
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    log: Math.log,
    max: Math.max,
    min: Math.min
  };

  random = {

    /* Different functions regarding random */
    random: Math.random(),
    randint: function(min, max, inclusive) {
      if (inclusive == null) {
        inclusive = false;
      }
      if (inclusive) {
        max = +1;
      }
      return Math.floor(Math.random() * (max - min) + min);
    },
    choice: function(array) {}
  };

  console.log(math.ceil(1.2));

  console.log(random.randint(2, 4));

  random.choice([1, 2]);

}).call(this);
