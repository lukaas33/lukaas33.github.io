
/*constructors */

(function() {
  var Clock, birthday, getAge, set, setBirth, units;

  Clock = (function() {
    function Clock(element) {
      this.element = element;
    }

    Clock.prototype.update = function() {
      var i, index, len, part, string, unitString;
      unitString = $(this.element).attr("unit");
      string = String(getAge(unitString));
      string = string.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      if (unitString === 'ms') {
        string = string.split(" ");
        for (index = i = 0, len = string.length; i < len; index = ++i) {
          part = string[index];
          string[index] = "<span> " + part + " </span>";
        }
        string.join(" ");
      }
      return $(this.element).find(".number").html(string);
    };

    return Clock;

  })();


  /*Functions */

  setBirth = function() {
    var input, result;
    input = prompt("Enter your birthday: \n (jjjj-mm-dd)");
    if ((input != null) && input !== '') {
      result = input;
    }
    return result;
  };

  getAge = function(format) {
    var age, birthdate;
    birthdate = new Date(birthday);
    age = Date.now() - birthdate.getTime();
    return Math.round(age / units[format]);
  };

  set = function() {
    var $more, setAccordion, setClock;
    $more = $(".more");
    setClock = function() {
      var $clocks, clock, i, index, len, results;
      $clocks = $(".timer");
      console.log($clocks);
      results = [];
      for (index = i = 0, len = $clocks.length; i < len; index = ++i) {
        clock = $clocks[index];
        results.push((function(clock) {
          var timer;
          timer = new Clock(clock);
          return setInterval(function() {
            return timer.update();
          }, 1);
        })(clock));
      }
      return results;
    };
    setAccordion = function() {
      $more.accordion({
        collapsible: true,
        active: false,
        icons: {
          "header": "ui-icon-triangle-1-s",
          "activeHeader": "ui-icon-triangle-1-n"
        }
      });
      $more.find("h3").css({
        margin: 0,
        borderRadius: 0,
        height: "5vh",
        border: "0px solid transparent",
        background: "transparent",
        textAlign: "center"
      });
      $more.find("h3").find(".ui-icon").css({
        fontSize: "1rem",
        backgroundImage: "url(https://download.jqueryui.com/themeroller/images/ui-icons_f06292_256x240.png)"
      });
      return $more.find(".units").css({
        height: "65vh"
      });
    };
    setClock();
    return setAccordion();
  };


  /*Variables */

  birthday = setBirth();

  units = {
    ms: 1,
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
    w: 604800000,
    y: 31557600000
  };

  $(function() {

    /*Events */
    $(".date").click(function() {
      return birthday = setBirth();
    });

    /*Actions */
    set();
    return $("body").fadeIn("slow");
  });

}).call(this);
