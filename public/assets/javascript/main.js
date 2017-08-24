(function() {
  'use strict';
  var highLight, scrollToLoc, sendMail, setForm, setMap, switchPage, toggle;

  switchPage = function(change) {
    var newPage;
    if (global.pageNum > 1) {
      global.previous = parseInt(global.cookie("page"));
      newPage = global.previous + change;
      if (newPage < 1) {
        newPage = global.pageNum;
      }
      if (newPage > global.pageNum) {
        newPage = 1;
      }
      console.log("Switching to " + newPage);
      global.cookie("page", newPage);
      return setPages(global.timing);
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
    } else if (position < calcTop($("#experience"))) {
      $($li[1]).addClass("focus");
      return $($li[2]).addClass("show");
    } else if (position < calcTop($("#skills"))) {
      $($li[2]).addClass("focus");
      return $($li[3]).addClass("show");
    } else if (position < calcTop($("#portfolio"))) {
      $($li[3]).addClass("focus");
      return $($li[4]).addClass("show");
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
    if (global.state[active] !== card || global.state[active] === null) {
      animate(global.state[active]);
      global.state[active] = card;
      return animate(card);
    } else if (global.state[active] === card) {
      animate(global.state[active]);
      return global.state[active] = null;
    }
  };

  setForm = function() {
    var $form;
    $form = $("#contact").find("form");
    $form.find("input[name='name']").val(global.cookie("name"));
    $form.find("input[name='email']").val(global.cookie("email"));
    return $form.find("textarea").val(global.cookie("message"));
  };

  setMap = function(change) {
    var $button, $data, $map, setOff, setOn;
    $map = $("#contact").find(".map");
    $data = $("#contact").find(".card:nth-child(1) .text");
    $button = $("#contact").find(".show");
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
    if (global.cookie("map") === "true") {
      if (change) {
        return setOff(global.timing / 2);
      } else {
        return setOn(0);
      }
    } else if (global.cookie("map") === "false") {
      if (change) {
        return setOn(global.timing / 2);
      } else {
        return setOff(0);
      }
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
        global.cookie("name", "");
        global.cookie("email", "");
        return global.cookie("message", "");
      }
    }).fail(function() {
      return success(false);
    });
  };

  global.admin = function(password) {
    if (password != null) {
      return $.ajax({
        url: "/auth",
        data: JSON.stringify({
          pass: password
        }),
        processData: false,
        contentType: "application/json",
        type: 'POST'
      }).done(function(response) {
        if (response === "success") {
          return console.log("You are now an admin");
        } else if (response === "fail") {
          return console.log("Login failed");
        }
      }).fail(function() {
        return console.warn("Ajax request didn't work");
      });
    }
  };

  $(function() {

    /* Actions */
    console.log("// DOM events loading...");
    setMap();
    setForm();
    setTimeout(function() {
      highLight();
      return $(window).scroll(function() {
        return highLight();
      });
    }, global.timing * 2);

    /* Events */
    $(window).on("resize", function() {
      var resizeTimer;
      $('*').addClass("notransition");
      clearTimeout(resizeTimer);
      return resizeTimer = setTimeout(function() {
        $('*').removeClass("notransition");
        if ($(this).width() >= 1200) {
          return console.log("Breakpoint: desktop-up");
        } else if ($(this).width() >= 900) {
          return console.log("Breakpoint: tablet-landscape-up");
        } else if ($(this).width() >= 600) {
          return console.log("Breakpoint: tablet-portrait-up");
        } else if ($(this).width() <= 599) {
          return console.log("Breakpoint: phone-only");
        }
      }, 250);
    });
    $("nav ul").find("a").click(function(event) {
      var href;
      event.preventDefault();
      href = $(this).attr("href");
      return scrollToLoc($(href));
    });
    $("[tooltip]").hover(function() {
      $(this).find(".tooltip").off();
      return global.timeout = setTimeout((function(_this) {
        return function() {
          return $(_this).find(".tooltip").fadeIn(global.animation);
        };
      })(this), 500);
    }, function() {
      clearTimeout(global.timeout);
      return $(this).find(".tooltip").fadeOut(global.animation);
    });
    $("#experience").find(".head").click(function() {
      return toggle($(this).closest(".card")[0], "experience");
    });
    $("#skills").find(".head").click(function() {
      return toggle($(this).closest(".card")[0], "skills");
    });
    $("#portfolio").find(".preview").hover(function() {
      return $(this).find(".tags").fadeTo(global.timing, 1);
    }, function() {
      return $(this).find(".tags").fadeTo(global.timing, 0);
    });
    $("#portfolio").find(".backward").click(function() {
      return switchPage(-1);
    });
    $("#portfolio").find(".forward").click(function() {
      return switchPage(1);
    });
    $("#portfolio").find(".sort a").click(function() {
      return global.cookie("page", 1);
    });
    $("#contact").find(".show").click(function() {
      return setMap(true);
    });
    $("#contact").find("form [type='text']").blur(function() {
      var name;
      name = $(this).attr("name");
      return global.cookie(name, $(this).val());
    });
    $("[ripple]").click(function(event) {
      var buttonHeight, buttonWidth, posX, posY, ripple, x, y;
      $("[ripple]").find(".ripple").remove();
      posX = $(this).offset().left;
      posY = $(this).offset().top;
      buttonWidth = $(this).width();
      buttonHeight = $(this).height();
      ripple = $("<span></span>").addClass("ripple");
      $(this).prepend(ripple);
      if (buttonWidth >= buttonHeight) {
        buttonHeight = buttonWidth;
      } else {
        buttonWidth = buttonHeight;
      }
      x = event.pageX - posX - buttonWidth / 2;
      y = event.pageY - posY - buttonHeight / 2;
      return $("[ripple]").find(".ripple").css({
        width: buttonWidth,
        height: buttonHeight,
        top: y + 'px',
        left: x + 'px'
      }).addClass("effect");
    });
    return $("#contact").find("form").submit(function(event) {
      var error, formdata, regex;
      event.preventDefault();
      $(this).find(".error").hide();
      try {
        console.log("Testing input...");
        $(this).children("fieldset").find("[type='text']").each(function() {
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
            $(this).find(".error").html("Email was successfully sent");
            return $(this).find(".error").fadeIn(global.animation);
          } else {
            $(this).find(".error").html("An error has occured while sending");
            return $(this).find(".error").fadeIn(global.animation);
          }
        }).bind(this));
      } catch (error1) {
        error = error1;
        console.warn(error);
        if (error.message === "Input empty") {
          $(this).find(".error").html("Please fill out all fields");
          return $(this).find(".error").fadeIn(global.animation);
        } else if (error.message === "Email incorrect") {
          $(this).find(".error").html("The email entered is invalid");
          return $(this).find(".error").fadeIn(global.animation);
        } else {
          $(this).find(".error").html("An unknown error occured");
          return $(this).find(".error").fadeIn(global.animation);
        }
      }
    });
  });

}).call(this);
