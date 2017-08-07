$(document).ready(function()
{
  var $previous = $(".previous");
  var $next = $(".next");
  var $arrows = $(".arrow");
  var $wifi = $(".wifi li");
  var $check = $(".checkbox");
  var $close = $(".close");
  var $footer = $("footer");
  var $thanks = $(".thanks");
  var $header = $("header");
  var $headBar = $(".headBar");
  var $loading = $(".loading");
  var screens = [$("#first"), $("#second"), $("#third"), $("#fourth")]; // All screens
  var dots = [$("#one"), $("#two"), $("#three"), $("#four")];

  var currentScreen = 0;
  var connected = false;

  function switchScreen(num)
  {
    function hideScreen() // Hides current screen with animation
    {
      if (num == 1) // To the left
      {
        console.log("Hiding screen num " + currentScreen + " to the left.");
        screens[currentScreen].animate
        (
          {left: "-100%"},
          {
            queue: false,
            complete: function()
            {
              console.log("done");
              $(this).hide();
            }
          }
        );

        screens[currentScreen].css({left: "0%"});
      }
      else // To the right
      {
        console.log("Hiding screen num " + currentScreen + " to the right.");
        screens[currentScreen].animate
        (
          {left: "100%", bottom: "100%"},
          {
            queue: false,
            complete: function()
            {
              console.log("done");
              $(this).hide();
            }
          }
        );
        screens[currentScreen].css({left: "0%"});
      }
      dots[currentScreen].removeClass("active");
    };
    function buttons() // Changes the buttons
    {
      if (currentScreen > 1) // Not the second screen
      {
        $previous.css('visibility', 'visible');
      }
      else
      {
        $previous.css('visibility', 'hidden');
      }
      if (currentScreen == screens.length - 1) // At the final screen
      {
        $next.children().text("done");
        $next.addClass("done");
      }
      else
      {
        $next.children().text("keyboard_arrow_right");
        $next.removeClass("done");
      }
    };
    function showScreen() // Shows new screen with animation
    {
      if (num == 1) // From the right
      {
        console.log("Showing screen num " + currentScreen + " from the right.");
        screens[currentScreen].css({left: "100%", bottom: "0%"});
        screens[currentScreen].show(function()
        {
          $(this).animate
          (
            {left: "0%"},
            {
              queue: false,
              complete: function()
              {
                console.log("done");
                $arrows.attr("disabled", false); // Button can be clicked again
                if (currentScreen == 1) // Only when going from 0 to 1
                {
                  $headBar.css({height: "0%"});
                  $headBar.show();
                  $headBar.animate({height: "5%"});
                }
              }
            }
          )
        });
      }
      else // From the left
      {
        console.log("Showing screen num " + currentScreen + " from the left.");
        screens[currentScreen].css({left: "-100%"});
        screens[currentScreen].show(function()
        {
          $(this).animate
          (
            {left: "0%"},
            {
              queue: false,
              complete: function()
              {
                console.log("done");
                $arrows.attr("disabled", false); // Button can be clicked again
              }
            }
          )
        });
      }
      dots[currentScreen].addClass("active");
    };

    hideScreen();
    currentScreen += num;
    buttons();
    showScreen();
  };
  function done()
  {
    console.log("Complete");
    screens[currentScreen].fadeOut();
    $headBar.animate
    (
      {height: "0"},
      function()
      {
        $headBar.hide();
      }
    );
    $footer.animate
    (
      {bottom: "-100%"},
      function()
      {
        $footer.hide();
      }
    );
    $header.animate
    (
      {top: "-100%"},
      function()
      {
        $header.hide()
        $loading.fadeIn()
      }
    );
    $thanks.parent().hide();
    $thanks.show();
    $thanks.parent().delay(2500).fadeIn("slow");
  };
  function checkTime(i)
  {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
  };
  function startTime()
  {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    m = checkTime(m);
    $("#clock").text(h + ":" + m);
    var t = setTimeout(startTime, 1000);
  };

  $next.click(function() // Forward
  {
    if (!$(this).hasClass("done"))
    {
      $arrows.attr("disabled", true); // No multiple clicks
      switchScreen(1);
    }
    else
    {
      done();
    }
  });
  $previous.click(function() // Backwards
  {
    $arrows.attr("disabled", true); // No multiple clicks
    switchScreen(-1);
  });
  $close.click(function()
  {
    $(this).parent().parent().fadeOut();
  });

  $wifi.click(function()
  {
    if (!connected)
    {
      connected = true;
      $(this).append("<br/><span class='status'>Connecting...</span>");
      $(".iconWifi").delay(1000).queue(function()
      {
        $(".iconWifi").text("network_wifi");
        $(".status").text("Connected");
      });
    }
  });

  startTime();
  $previous.css('visibility', 'hidden');
  screens[0].show();
});
