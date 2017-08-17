
/* Functions */

(function() {
  var setDate, setDoc, setPages, setProjects, sinceDate;

  sinceDate = function(date) {
    var days, milli, offset, today, years;
    milli = 8.64e7;
    today = new Date(Date.now());
    date = new Date(date.toUTCString());
    today = new Date(today.toUTCString());
    offset = today.getTime() - date.getTime();
    days = offset / milli;
    years = days / 365.2425;
    if (days < 2) {
      return (String(Math.floor(days))) + " day";
    } else if (years < 1) {
      return (String(Math.floor(days))) + " days";
    } else if (years < 2) {
      return (String(Math.floor(years))) + " year";
    } else {
      return (String(Math.floor(years))) + " years";
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
        results.push(date.find(".tooltip").html("Ended " + (sinceDate(begin)) + " ago"));
      } else {
        date.find(".end").text(end);
        results.push(date.find(".tooltip").html("Started " + (sinceDate(begin)) + " ago"));
      }
    }
    return results;
  };

  setProjects = function() {
    var $content, $page, $portfolio, card, i, j, last, page, ref, ref1, ref2, results;
    $portfolio = $("#portfolio .content");
    $content = $portfolio.find(".container");
    global.pageNum = Math.ceil($content.length / 9);
    results = [];
    for (page = i = 1, ref = global.pageNum + 1; 1 <= ref ? i < ref : i > ref; page = 1 <= ref ? ++i : --i) {
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
    current = parseInt(global.cookie("page"));
    target = $pages;
    if (global.previous !== null) {
      target = $($pages[global.previous - 1]);
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

  setDoc = function() {
    var i, len, ref, since;
    ref = $(".since");
    for (i = 0, len = ref.length; i < len; i++) {
      since = ref[i];
      $(since).html(sinceDate(new Date($(since).attr("date"))));
    }
    setDate($("#experience .card").find(".date"));
    setProjects();
    return setPages(0);
  };

  $(function() {

    /* Actions */
    console.log("// DOM setup via Js loading...");
    setDoc();
    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.register("serviceworker.js").then(function(registration) {
        return console.log("SW registration successfull");
      }, function(error) {
        return console.warn("SW registration failed: " + error);
      });
    }
  });

}).call(this);
