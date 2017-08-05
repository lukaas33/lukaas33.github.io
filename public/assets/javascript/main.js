
/* Don't edit js file, edit coffeescript and upload created Js file */

(function() {
  var cookie, highLight, num, previous, scrollToLoc, setBox, setDate, setDoc, setForm, setMap, setPages, setProjects, sinceDate, state, switchPage, timeout, timing, toggle;

  cookie = function(name, value) {
    var cookies, current, i, len;
    cookies = document.cookie.split(';');
    if (value === void 0) {
      for (i = 0, len = cookies.length; i < len; i++) {
        value = cookies[i];
        current = value.split('=');
        if (current[0].trim() === name) {
          return current[1];
        }
      }
    } else {
      console.log("Set cookie " + name + " to " + value);
      return document.cookie = name + "=" + value + "; path=/";
    }
  };


  /* Variables */

  if (cookie("map") === void 0) {
    cookie("map", false);
  }

  if (cookie("page") === void 0) {
    cookie("page", 1);
  }

  if (cookie("name") === void 0) {
    cookie("name", "");
  }

  if (cookie("email") === void 0) {
    cookie("email", "");
  }

  if (cookie("message") === void 0) {
    cookie("message", "");
  }

  state = {
    "experience": null,
    "skills": null
  };

  timing = 400;

  timeout = null;

  num = 0;

  previous = null;


  /* Functions */

  highLight = function() {
    var $li, calcTop, position;
    $li = $("nav ul li").find("a");
    $li.removeClass("focus");
    position = $(window).scrollTop();
    calcTop = function(element) {
      var location, top;
      top = Math.round(element.offset().top + element.height());
      location = top - parseInt(element.css("margin-bottom")) - $("nav").height();
      return location;
    };
    if (position <= calcTop($("#about"))) {
      return $($li[0]).addClass("focus");
    } else if (position < calcTop($("#experience"))) {
      return $($li[1]).addClass("focus");
    } else if (position < calcTop($("#skills"))) {
      return $($li[2]).addClass("focus");
    } else if (position < calcTop($("#portfolio"))) {
      return $($li[3]).addClass("focus");
    } else if (position < calcTop($("#contact"))) {
      return $($li[4]).addClass("focus");
    }
  };

  scrollToLoc = function(section) {
    var location, top;
    top = Math.round(section.offset().top);
    location = top - parseInt(section.css("margin-top")) - $("nav").height();
    return $("html, body").animate({
      scrollTop: location
    }, {
      duration: timing * 2,
      easing: "swing"
    });
  };

  toggle = function(card, active) {
    var animate;
    animate = function(card) {
      var $collapse;
      $collapse = $(card).find(".collapse");
      return $collapse.slideToggle({
        duration: timing,
        easing: "swing"
      });
    };
    if (state[active] !== card || state[active] === null) {
      animate(state[active]);
      state[active] = card;
      return animate(card);
    } else if (state[active] === card) {
      animate(state[active]);
      return state[active] = null;
    }
  };

  sinceDate = function(date) {
    var days, milli, offset, today, years;
    milli = 86400000;
    today = Date.now();
    offset = today - date.getTime();
    days = offset / milli;
    years = days / 365.25;
    if (days < 2) {
      return String(Math.floor(days)) + " day";
    } else if (years < 1) {
      return String(Math.floor(days)) + " days";
    } else if (years < 2) {
      return String(Math.floor(years)) + " year";
    } else {
      return String(Math.floor(years)) + " years";
    }
  };

  setDate = function(dates) {
    var begin, date, end, i, len, results;
    results = [];
    for (i = 0, len = dates.length; i < len; i++) {
      date = dates[i];
      date = $(date);
      begin = date.find(".begin").attr("date");
      end = date.find(".end").attr("date");
      begin = new Date(begin);
      date.find(".begin").text(begin.getFullYear());
      if (end !== "now") {
        end = new Date(end);
        date.find(".end").text(end.getFullYear());
        results.push(date.find(".tooltip").html("ended " + (sinceDate(begin)) + " ago"));
      } else {
        date.find(".end").text(end);
        results.push(date.find(".tooltip").html("started " + (sinceDate(begin)) + " ago"));
      }
    }
    return results;
  };

  setBox = function() {
    return $('*').css({
      border: "1px solid grey"
    });
  };

  setMap = function(change) {
    var $button, $data, $map, setOff, setOn;
    $map = $("#contact .card").find(".map");
    $data = $("#contact .card:nth-child(1)").find(".text");
    $button = $("#contact .card").find(".show");
    setOff = function(time) {
      console.log("Map hidden");
      return $map.fadeOut({
        duration: time,
        easing: "swing",
        complete: function() {
          $button.text("Show map");
          $data.fadeIn({
            duration: time,
            easing: "swing"
          });
          return cookie("map", false);
        }
      });
    };
    setOn = function(time) {
      console.log("Map shown");
      return $data.fadeOut({
        duration: time,
        easing: "swing",
        complete: function() {
          $button.text("Hide map");
          $map.fadeIn({
            duration: time,
            easing: "swing"
          });
          return cookie("map", true);
        }
      });
    };
    if (cookie("map") === "true") {
      if (change) {
        return setOff(timing / 2);
      } else {
        return setOn(0);
      }
    } else if (cookie("map") === "false") {
      if (change) {
        return setOn(timing / 2);
      } else {
        return setOff(0);
      }
    }
  };

  setForm = function() {
    var $form;
    $form = $("#contact form");
    $form.find("input[name='name']").val(cookie("name"));
    $form.find("input[name='email']").val(cookie("email"));
    return $form.find("textarea").val(cookie("message"));
  };

  setProjects = function() {
    var $content, $page, $portfolio, card, i, j, last, page, ref, ref1, ref2, results;
    $portfolio = $("#portfolio .content");
    $content = $portfolio.find(".container");
    num = Math.ceil($content.length / 9);
    results = [];
    for (page = i = 1, ref = num + 1; 1 <= ref ? i < ref : i > ref; page = 1 <= ref ? ++i : --i) {
      $page = $("<div></div>").addClass("page");
      $page.attr("num", page);
      last = 9 * page;
      for (card = j = ref1 = last - 9, ref2 = last; ref1 <= ref2 ? j <= ref2 : j >= ref2; card = ref1 <= ref2 ? ++j : --j) {
        $page.append($content[card]);
      }
      results.push($portfolio.append($page));
    }
    return results;
  };

  setPages = function(time) {
    var $pages, current, target;
    $pages = $("#portfolio").find(".page");
    current = parseInt(cookie("page"));
    target = $pages;
    if (previous !== null) {
      target = $($pages[previous - 1]);
    }
    return target.fadeOut({
      duration: time,
      easing: "swing",
      complete: function() {
        return $($pages[current - 1]).fadeIn({
          duration: time,
          easing: "swing",
          complete: function() {
            return $("#portfolio .select p").find("span").text(current);
          }
        });
      }
    });
  };

  switchPage = function(change) {
    var newPage;
    previous = parseInt(cookie("page"));
    newPage = previous + change;
    if (newPage < 1) {
      newPage = num;
    }
    if (newPage > num) {
      newPage = 1;
    }
    console.log("Switching to " + newPage);
    cookie("page", newPage);
    return setPages(timing);
  };

  setDoc = function() {
    var i, len, ref, since;
    ref = $(".since");
    for (i = 0, len = ref.length; i < len; i++) {
      since = ref[i];
      $(since).html(sinceDate(new Date($(since).attr("date"))));
    }
    setDate($("#experience .card").find(".date"));
    setMap(false);
    setForm();
    setProjects();
    return setPages(0);
  };

  $(function() {

    /* Events */
    $("nav ul li").find("a").click(function(event) {
      var href;
      event.preventDefault();
      href = $(this).attr("href");
      return scrollToLoc($(href));
    });
    $(".tooltip").parent().hover(function() {
      $(this).find(".tooltip").off();
      return timeout = setTimeout((function(_this) {
        return function() {
          return $(_this).find(".tooltip").fadeIn({
            duration: timing,
            easing: "swing"
          });
        };
      })(this), 500);
    }, function() {
      clearTimeout(timeout);
      return $(this).find(".tooltip").fadeOut({
        duration: timing,
        easing: "swing"
      });
    });
    $("#experience .card").find(".head").click(function() {
      return toggle($(this).closest(".card")[0], "experience");
    });
    $("#skills .card").find(".head").click(function() {
      return toggle($(this).closest(".card")[0], "skills");
    });
    $("#portfolio .preview").hover(function() {
      return $(this).find(".tags").fadeIn({
        duration: timing,
        easing: "swing"
      });
    }, function() {
      return $(this).find(".tags").fadeOut({
        duration: timing,
        easing: "swing"
      });
    });
    $("#portfolio .select").find(".backward").click(function() {
      return switchPage(-1);
    });
    $("#portfolio .select").find(".forward").click(function() {
      return switchPage(1);
    });
    $("#portfolio .sort").find("a").click(function() {
      return cookie("page", 1);
    });
    $("#contact form").find("input[type='text']").blur(function() {
      var name;
      name = $(this).attr("name");
      return cookie(name, $(this).val());
    });
    $("#contact form").find("textarea").blur(function() {
      var name;
      name = $(this).attr("name");
      return cookie(name, $(this).val());
    });
    $("#contact form").submit(function(event) {});
    $("#contact form").find("input[type='submit']").click(function() {
      cookie("name", "");
      cookie("email", "");
      return cookie("message", "");
    });
    $("#contact .card").find(".show").click(function() {
      return setMap(true);
    });

    /*Actions */
    setTimeout(function() {
      highLight();
      return $(window).scroll(function() {
        return highLight();
      });
    }, timing * 2);
    setDoc();
    return $("body").show();
  });

}).call(this);
