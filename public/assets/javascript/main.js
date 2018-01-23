(function() {
  'use strict';
  var disable, highLight, scrollToLoc, sendMail, setForm, setMap, setPages, setPos, switchPage, toggle;

  setForm = function() {
    var $form;
    $form = $("#contact").find("form");
    $form.find("input[name='name']").val(global.cookie("name"));
    $form.find("input[name='email']").val(global.cookie("email"));
    return $form.find("textarea").val(global.cookie("message"));
  };

  setPages = function(time) {
    var $pages, current, target;
    $pages = $("#portfolio").find(".page");
    global.pages.pageNum = $pages.length;
    current = Number(global.cookie("page"));
    if (global.pages.previous === null) {
      target = $pages;
    } else {
      target = $($pages[global.pages.previous - 1]);
    }
    return target.fadeOut({
      duration: time,
      easing: "swing",
      complete: function() {
        return $($pages[current - 1]).fadeIn({
          duration: time,
          easing: "swing",
          complete: function() {
            var status;
            status = current + "/" + global.pages.pageNum;
            return $("#portfolio").find(".select p span").text(status);
          }
        });
      }
    });
  };

  setMap = function(change) {
    var $button, $data, $map, setOff, setOn;
    $map = $("#contact").find(".map");
    $button = $("#contact").find(".show");
    $data = $("#contact").find(".card:nth-child(1) .text");
    setOff = function(time) {
      console.log("Map hidden");
      return $map.fadeOut({
        duration: time,
        easing: "swing",
        complete: function() {
          $button.find('p').text("Show map");
          $data.fadeIn({
            duration: time,
            easing: "swing"
          });
          return global.cookie("map", false);
        }
      });
    };
    setOn = function(time) {
      console.log("Map shown");
      return $data.fadeOut({
        duration: time,
        easing: "swing",
        complete: function() {
          $button.find('p').text("Hide map");
          $map.fadeIn({
            duration: time,
            easing: "swing"
          });
          return global.cookie("map", true);
        }
      });
    };
    if (global.cookie("map")) {
      if (change) {
        return setOff(global.timing / 2);
      } else {
        return setOn(0);
      }
    } else {
      if (change) {
        return setOn(global.timing / 2);
      } else {
        return setOff(0);
      }
    }
  };

  setPos = function() {
    var at;
    at = window.location.href.split('#');
    if (at.length !== 1) {
      return scrollToLoc($('#' + at[1]));
    }
  };

  disable = function() {
    $(this).prop("disabled", true);
    return setTimeout((function(_this) {
      return function() {
        return $(_this).prop("disabled", false);
      };
    })(this), global.timing);
  };

  switchPage = function(change) {
    var $current, newPage;
    if (global.pages.pageNum > 1) {
      global.pages.previous = Number(global.cookie("page"));
      newPage = global.pages.previous + change;
      if (newPage < 1) {
        newPage = global.pages.pageNum;
      } else if (newPage > global.pages.pageNum) {
        newPage = 1;
      }
      console.log("Switching to " + newPage);
      $current = $($(".page")[newPage - 1]).find(".container");
      if ($current.length < 7) {
        scrollToLoc($("#portfolio"));
      }
      global.cookie("page", newPage);
      return setPages(global.timing / 2);
    }
  };

  highLight = function() {
    var $li, calcTop, position;
    $li = $("nav ul li");
    $li.removeClass("focus");
    $li.next().removeClass("show");
    position = $(window).scrollTop();
    calcTop = function(element) {
      var location, top;
      top = Math.round(element.offset().top + element.height());
      location = top - parseInt(element.css("margin-bottom")) - $("nav").height();
      return location;
    };
    if (position <= calcTop($("#about"))) {
      $($li[0]).addClass("focus");
      return $($li[1]).addClass("show");
    } else if (position <= calcTop($("#experience"))) {
      $($li[1]).addClass("focus");
      return $($li[2]).addClass("show");
    } else if (position <= calcTop($("#skills"))) {
      $($li[2]).addClass("focus");
      return $($li[3]).addClass("show");
    } else if (position <= calcTop($("#portfolio"))) {
      $($li[3]).addClass("focus");
      return $($li[4]).addClass("show");
    } else if (position <= calcTop($("#contact"))) {
      return $($li[4]).addClass("focus");
    }
  };

  scrollToLoc = function(section) {
    var bottom, location;
    bottom = Math.round(section.offset().top);
    location = bottom - parseInt(section.css("margin-top")) - $("nav").height();
    return $("html, body").animate({
      scrollTop: location
    }, {
      duration: global.timing * 2,
      easing: "swing"
    });
  };

  toggle = function(card, active) {
    var animate;
    animate = function(card) {
      var $collapse;
      $collapse = $(card).find(".collapse");
      return $collapse.slideToggle({
        duration: global.timing,
        easing: "swing"
      });
    };
    if (global.state[active] !== card[0] || global.state[active] === null) {
      animate(global.state[active]);
      global.state[active] = card[0];
      return animate(card);
    } else if (global.state[active] === card[0]) {
      animate(global.state[active]);
      return global.state[active] = null;
    }
  };

  sendMail = function(data, success) {
    return $.ajax({
      url: '/send',
      data: data,
      processData: false,
      contentType: false,
      type: 'POST'
    }).done(function(response) {
      if (response === "error") {
        return success(false);
      } else {
        success(true);
        global.cookie("name", null);
        global.cookie("email", null);
        return global.cookie("message", null);
      }
    }).fail(function() {
      return success(false);
    });
  };

  $(function() {

    /* Actions */
    console.log("# DOM value setup loading...");
    $("html").scrollTop(0);
    setMap(false);
    setForm();
    setPages(0);
    $("body").show();
    setTimeout(function() {
      return setPos();
    }, global.timing * 2);
    console.log("# DOM events loading...");
    setTimeout(function() {
      highLight();
      return $(window).scroll(function() {
        return highLight();
      });
    }, global.timing * 2);

    /* Events */
    $(window).on("resize", function() {
      if ($(this).width() >= 1200) {
        console.log("Breakpoint: desktop-up");
      } else if ($(this).width() >= 900) {
        console.log("Breakpoint: tablet-landscape-up");
      } else if ($(this).width() >= 600) {
        console.log("Breakpoint: tablet-portrait-up");
      } else if ($(this).width() <= 599) {
        console.log("Breakpoint: phone-only");
      }
      $('*').addClass("notransition");
      clearTimeout(global.timeouts.resize);
      return global.timeouts.resize = setTimeout(function() {
        return $('*').removeClass("notransition");
      }, 250);
    });
    $("nav ul").find('a').click(function(event) {
      var href;
      href = $(this).attr("href");
      return scrollToLoc($(href));
    });
    $("#experience").find(".head").click(function() {
      return toggle($(this).parents(".card"), "experience");
    });
    $("#skills").find(".head").click(function() {
      return toggle($(this).parents(".card"), "skills");
    });
    $("[tooltip]").hover(function() {
      $(this).find(".tooltip").off();
      return global.timeouts.hover = setTimeout((function(_this) {
        return function() {
          return $(_this).find(".tooltip").fadeIn(global.animation);
        };
      })(this), 500);
    }, function() {
      clearTimeout(global.timeouts.hover);
      return $(this).find(".tooltip").fadeOut(global.animation);
    });
    $("#portfolio").find(".sort a").click(function(event) {
      var i, len, options, ref, variable;
      event.preventDefault();
      options = [
        {
          Newest: {
            "date.end": -1
          }
        }, {
          Oldest: {
            "date.end": 1
          }
        }, {
          Name: {
            "title": 1
          }
        }, {
          Type: {
            "type": 1
          }
        }
      ];
      ref = ["current", "next"];
      for (i = 0, len = ref.length; i < len; i++) {
        variable = ref[i];
        global.sort[variable] += 1;
        if (global.sort[variable] < 0) {
          global.sort[variable] = options.length;
        } else if (global.sort[variable] > (options.length - 1)) {
          global.sort[variable] = 0;
        }
      }
      $(this).find("span").text(Object.keys(options[global.sort.current]));
      return $(this).find(".tooltip").text("Sort by " + Object.keys(options[global.sort.next]));
    });
    $("#portfolio").find(".backward").click(function() {
      switchPage(-1);
      return disable.apply(this);
    });
    $("#portfolio").find(".forward").click(function() {
      switchPage(1);
      return disable.apply(this);
    });
    $("#contact").find(".show").click(function() {
      setMap(true);
      return disable.apply(this);
    });
    $("#contact").find("form [type='text']").blur(function() {
      var name;
      name = $(this).attr("name");
      return global.cookie(name, $(this).val());
    });
    $("[ripple]").click(function(event) {
      var $ripple, height, width, x, y;
      $("[ripple]").find(".ripple").remove();
      width = $(this).width();
      height = $(this).height();
      $ripple = $("<span></span>").addClass("ripple");
      $(this).prepend($ripple);
      if (width >= height) {
        height = width;
      } else {
        width = height;
      }
      x = event.pageX - $(this).offset().left - width / 2;
      y = event.pageY - $(this).offset().top - height / 2;
      return $("[ripple]").find(".ripple").css({
        width: width,
        height: height,
        top: '#{y}px',
        left: '#{x}px'
      }).addClass("effect");
    });
    return $("#contact").find("form").submit(function(event) {
      var error, formdata, regex;
      event.preventDefault();
      $(this).find(".error").hide();
      try {
        console.log("Testing input...");
        $(this).find("fieldset").find("[type='text']").each(function() {
          if ($(this).val() === '') {
            throw new Error("Input empty");
          }
        });
        regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\n])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!regex.test($(this).find("[name='email']").val())) {
          throw new Error("Email incorrect");
        }
        formdata = new FormData(this);
        console.log("Sending...");
        return sendMail(formdata, (function(success) {
          if (success) {
            $(this).trigger("reset");
            return $(this).find(".error").html("Email was successfully sent").fadeIn(global.animation);
          } else {
            return $(this).find(".error").html("An error has occured while sending").fadeIn(global.animation);
          }
        }).bind(this));
      } catch (error1) {
        error = error1;
        console.warn(error);
        if (error.message === "Input empty") {
          return $(this).find(".error").html("Please fill out all fields").fadeIn(global.animation);
        } else if (error.message === "Email incorrect") {
          return $(this).find(".error").html("The email entered is invalid").fadeIn(global.animation);
        } else {
          return $(this).find(".error").html("An unknown error occured").fadeIn(global.animation);
        }
      }
    });
  });

}).call(this);
