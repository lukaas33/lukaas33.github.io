$(function() {

  /*Variables */
  var $date, $main, $more, Clock, birthday, getAge, set, units;
  $more = $(".more");
  $main = $(".main");
  $date = $(".date");
  birthday = "1967-05-18";
  units = {
    ms: 1,
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
    w: 604800000,
    y: 31557600000
  };

  /*Functions */
  getAge = function(format) {
    var age, birthdate;
    birthdate = new Date(birthday);
    age = Date.now() - birthdate.getTime();
    return Math.round(age / units[format]);
  };
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
  set = function() {
    var setAccordion, setClock;
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

  /*Events */
  $date.click(function() {
    var input;
    input = prompt("Voer je geboortedatum in: \n (jjjjj-mm-dd)");
    if (input != null) {
      return birthday = input;
    }
  });

  /*Actions */
  set();
  return $("body").fadeIn("slow");
});
