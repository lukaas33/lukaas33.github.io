paper.install(window); // No accessing through the paper object

// These need to be global and can be setup before the document is ready
var selectedColor;
var inputIsChar = true;
var inputText;
var drawCircle = true;
var textOpacity = false;
var font = "noto sans";
var colors =
[
  [["#f44336", "#d32f2f"], "red"],
  [["#e91e63", "#c2185b"], "pink"],
  [["#9c27b0", "#7b1fa2"], "purple"],
  [["#673ab7", "#512da8"], "deepPurple"],
  [["#3f51b5", "#303f9f"], "indigo"],
  [["#2196f3", "#1976d2"], "blue"],
  [["#03a9f4", "#0288d1"], "lightBlue"],
  [["#00bcd4", "#0097a7"], "cyan"],
  [["#009688", "#00796b"], "teal"],
  [["#4caf50", "#388e3c"], "green"],
  [["#8bc34a", "#689f38"], "lightGreen"],
  [["#cddc39", "#afb42b"], "lime"],
  [["#ffeb3b", "#fbc02d"], "yellow"],
  [["#ffc107", "#ffa000"], "amber"],
  [["#ff9800", "#f57c00"], "orange"],
  [["#ff5722", "#e64a19"], "deepOrange"],
  [["#795548", "#5d4037"], "brown"],
  [["#9e9e9e", "#757575"], "grey"],
  [["#607d8b", "#455a64"], "blueGrey"]
];

$(document).ready(function()
{
  var canvas = $('#canvas');
  var $canvas = $('.canvas');

  var $colors =
  [
    $(".red"),
    $(".pink"),
    $(".purple"),
    $(".deepPurple"),
    $(".indigo"),
    $(".blue"),
    $(".lightBlue"),
    $(".cyan"),
    $(".teal"),
    $(".green"),
    $(".lightGreen"),
    $(".lime"),
    $(".yellow"),
    $(".amber"),
    $(".orange"),
    $(".deepOrange"),
    $(".brown"),
    $(".grey"),
    $(".blueGrey")
  ];

  // Initial setup of values
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  inputText = chars[Math.round(Math.random() * (chars.length - 1))];
  selectedColor = Math.floor(Math.random() * colors.length);
  var $icon = $(".icon");
  var $options = $icon.children();
  $($options[Math.floor(Math.random() * $options.length)]).attr("selected", true);

  // --- Select colors ---
  var $color = $(".color");
  $color.click(function()
  {
    for (var i = 0; i < colors.length; i++)
    {
      if (!$(this).hasClass("selected"))
      {
        if ($(this).hasClass(colors[i][1]))
        {
          selectedColor = i;
          console.log("You selected num " + selectedColor + ": " + colors[i][1]);
          applySelection();
          drawCanvas();
        }
      }
    }
  });

  // Change view of colors
  var $forward = $(".forward");
  $forward.click(function() // Go right
  {
    scroll(-70);
  });
  var $back = $(".back");
  $back.click(function() // Go left
  {
    scroll(70);
  });

  // Bottoms visiblily
  function isVisible()
  {
    if ($(".colors ul").css("left") == "0px") // Min
    {
      $back.attr("disabled", true);
      $back .css({visibility: "hidden"});
    }
    else
    {
      $back.attr("disabled", false);
      $back .css({visibility: "visible"});
    }
    if ($(".colors ul").css("left") == "-1050px") // Max
    {
      $forward.attr("disabled", true);
      $forward .css({visibility: "hidden"});
    }
    else
    {
      $forward.attr("disabled", false);
      $forward .css({visibility: "visible"});
    }
  };

  // Scolling
  var $colorbox = $(".colors ul");
  var $bothButton = $(".arrow");
  function scroll(dir)
  {
    $bothButton.attr("disabled", true);
    var boxX = $(".colors ul").css("left");
    var newX = (Number(boxX.replace(/[^-\d\.]/g, '')) + dir) + "px";
    console.log("Scroll to " + newX);
    $colorbox.animate
    (
      {left: newX},
      {
        duration: 200,
        complete: function()
        {
          $bothButton.attr("disabled", false); // Can be clicked again after complete
          isVisible();
        }
      }
    );
  };

  // Shows if colors are selected
  function applySelection()
  {
    var selection = $colors[selectedColor]
    $(".selected").children().empty();
    $(".selected").removeClass("selected");
    selection.children().text("check");
    selection.addClass("selected");
  };

  // --- Select font ---
  var $font = $('.font');
  $font.val(font);
  $font.change(function()
  {
    font = $font.val();
    console.log("You selected " + font);
    setTimeout(drawCanvas, 100); // Delay for font loading time
  });

  // Symbol or icon
  var	$contains = $(".contains");
  $contains.click(function()
  {
    if 	($(this).hasClass("charContainer"))
    {
      $(".iconContainer").addClass("inactive");
      $(".charContainer").removeClass("inactive");
      inputIsChar = true;
      font = $font.val();
      inputText = $text.val().toUpperCase();
      drawCanvas();
    }
    else
    {
      $(".iconContainer").removeClass("inactive");
      $(".charContainer").addClass("inactive");
      inputIsChar = false;
      font = "material icons";
      inputText = $icon.val();
      drawCanvas();
    }
  });

  // --- Text input ---
  var $text = $('.text');
  $text.val(inputText);
  $text.change(function()
  {
    inputText = $text.val().toUpperCase();
    console.log("You selected " + inputText);
    drawCanvas();
  });

  // --- Select icon ---
  $icon.change(function()
  {
    inputText = $icon.val();
    console.log("You selected an icon");
    drawCanvas();
  });

  // --- Options ---
  // Checks and unchecks
  var $checkbox = $(".checkbox");
  $checkbox.click(function()
  {
    if ($(this).hasClass("checked"))
    {
      $(this).removeClass("checked");
      $(this).find("i").text("check_box_outline_blank");
      check();
    }
    else
    {
      $(this).addClass("checked");
      $(this).find("i").text("check_box");
      check();
    }
  });

  // Checks changes in options
  function check()
  {
    // Inner circle
    if ($("#circle").hasClass("checked"))
    {
      console.log("Check circle");
      drawCircle = true;
    }
    else
    {
      console.log("Uncheck circle");
      drawCircle = false;
    }
    // Partly transparent symbol
    if ($("#textOpacity").hasClass("checked"))
    {
      console.log("Check textOpacity");
      textOpacity = true;
    }
    else
    {
      console.log("Uncheck textOpacity");
      textOpacity = false;
    }
    drawCanvas();
  };

  // --- Download ---
  var $fabD = $(".fab.download");
  $fabD.click(function()
  {
    var name = (colors[selectedColor][1] + "-" + inputText + ".jpg");
    download($fabD[0], name);
  });

  function download(link, name)
  {
    link.href  = canvas[0].toDataURL("image/jpeg"); // Location of new image
    link.download = name;
    console.log("Downloading...");
  };

  // --- View of canvas ---
  var $fabV = $(".fab.view");
  var square = true;
  $fabV.click(function()
  {
    if (square)
    {
      $fabV.attr("disabled", true);
      $fabV.children().text("panorama_fish_eye");
      canvas.animate({borderRadius: "100%"});
      $canvas.animate
      (
        {borderRadius: "100%"},
        function()
        {
          $fabV.attr("disabled", false);
        }
      );
      square = false;
    }
    else
    {
      $fabV.attr("disabled", true);
      $fabV.children().text("crop_square");
      $canvas.css({borderRadius: "0%"});
      canvas.animate
      (
        {borderRadius: "0%"},
        function()
        {
          $fabV.attr("disabled", false);
        }
      );
      square = true;
    }
  });

  // --- Draw ---
  function drawCanvas()
  {
    console.log("Drawing canvas...");

    paper.setup(canvas[0]); // Only acceps DOM objects
    var canHeight = view.viewSize.height; // Height of canvas

    // Background
    var background = new Path.Rectangle([0, 0], [canHeight, canHeight]); // Fullscreen
    background.fillColor = colors[selectedColor][0][0];

    // Inner circle
    if (drawCircle)
    {
      var innerCircle = new Path.Circle(view.center, (canHeight * 0.80) / 2);
      innerCircle.fillColor = colors[selectedColor][0][1];
    }

    // Contains symbol
    var container = new Path.Rectangle(
    {
      size: [canHeight * 0.6, canHeight * 0.6],
      point: [view.center.x - canHeight * 0.6 / 2 , view.center.y - canHeight * 0.6 / 2 ]
    });
    // Symbol
    var color = new Color(255, 255, 255, 0.95);
    if (textOpacity)
    {
      color = new Color(255, 255, 255, 0.55);
    }
    var centerText = new PointText(
    {
      content: inputText,
      fillColor: color,
      fontFamily: font
    });
    centerText.fitBounds(container.bounds); // As big as the rectangle
    if (inputIsChar) // For chars
    {
      centerText.position.y += (centerText.bounds.height / 15);
    }
    else // For icons
    {
      centerText.position.y += (centerText.bounds.height / 5.5);
    }
  };

  // Redraw when resized
  view.onResize = function(event)
  {
    drawCanvas()
  };

  // Initial setup finish
  drawCanvas();
  applySelection();
  isVisible()

  // Welcome
  console.log("-- Welcome to picturer --");
  console.log("-- There are currently more than " + (colors.length * (26 + 30) * $font.children().length * 2 * 2 + colors.length * $icon.children().length * 2 * 2) + " possible combinations that can be made --");
});
