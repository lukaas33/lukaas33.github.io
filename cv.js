/*
---BUGS---
- Hide card only works once
- Responsive sizing is a disaster, have disabled it
- Nav extended fails to work properly sometimes (Doesn't fill screen)
*/
$(document).ready(function()
{
	var $main = $(".main");

    // Rule for progress bars
    function progressText()
	{
        var $progress = $(".progress");
        $progress.children("p").hide();
        $progress.children("p").delay(2500).fadeIn();
    };

	/*
    // Responsive sizing

	var resize = function(size, newWidth)
	{
        $(".card" + size).width(newWidth);
    };
   var response = function()
   {
      if ($main.innerWidth() > 1400)
	  {
            resize(".small", "27.5rem");
            resize(".medium", "56.75rem");
            resize(".big", "84rem");
        } else if ($main.innerWidth() < 1400 && $main.width() > 1250)
		{
            resize(".small", "24.5rem");
            resize(".medium", "49.75rem");
            resize(".big", "75rem");
        } else if ($main.innerWidth() < 1250 && $main.width() > 1150)
		{
            resize(".small", "18.5rem");
            resize(".medium", "37.75rem");
            resize(".big", "57rem");
        } else if ($main.innerWidth() < 1150 && $main.width() > 1000)
		{
            resize(".small", "14.5rem");
            resize(".medium", "29.75rem");
            resize(".big", "45rem");
        } else if ($main.innerWidth() < 1000)
		{
            resize(".small", "29.75rem");
            resize(".medium", "29.75rem");
            resize(".big", "29.75rem");
        }
    };

    $(window).resize(function()
	{
        response();
    });
	*/

    // Toggles menu and button state
    var $menu = $(".menu");
    var $hamburger = $(".hamburger");
    var $close = $(".close");

    function $openMenu()
	{
		console.log("Opening menu");
        $hamburger.hide();
		$close.attr("disabled", true);
        $close.show();
		navState();
        $menu.animate(
			{"left": "0"},
			{
				duration: 800,
			 	complete: function()
				{
					$close.attr("disabled", false);
				}
			});
        $main.animate({"margin-left": "10rem"}, 800);
        /*setTimeout(function() {
            response();
        }, 1000);*/
    };
    function $closeMenu()
	{
		console.log("Closing menu");
        $close.hide();
		$hamburger.attr("disabled", true);
        $hamburger.show();
        $menu.animate(
			{"left": "-10rem"},
			{
				duration: 800,
				complete: function()
				{
					$hamburger.attr("disabled", false);
				}
			});
        $main.animate({"margin-left": "0rem"}, 800);
        /*setTimeout(function() {
            response();
        }, 1000);*/
    };

    $hamburger.click(function()
	{
        $openMenu();
    });
    $close.click(function()
	{
        $closeMenu();
    });

    // Theme changer
    var $theme = $('.theme');
    var $themeChange = $('.changeTheme');
    var $overlay = $('.overlay');
    var $themeOption = $('.themeOption');
    var $navItem = $('.navItem');

    var $purple = $('#purple');
    var $teal = $('#teal');
    var $blue = $('#blue');
    var $red = $('#red');

    var ran = Math.floor(Math.random() * 4);
    var activeTheme;
	var highlightC = true;

    $theme.click(function()
	{
        $closeMenu();
        $themeChange.fadeIn();
        $overlay.fadeIn();
    });
    $overlay.click(function()
	{
        $themeChange.fadeOut();
        $overlay.fadeOut();
    });

    function active()
	{
        $themeOption.empty();
        if ($themeOption.hasClass('active'))
		{
            $('.active').html('<i class="material-icons md-24 md-light">check</i>');
        }
    };
	function pageSelect(color)
	{
		if (highlightC)
		{
			$navItem.css('border-bottom', '4px solid transparent');
			$('.current').css('border-bottom', 'solid 4px ' + color);
		}
    };

    function Theme(p600, p500, p400, p300, p100, s100, s200, s400)
	{
		this.p600 = p600;
        this.p500 = p500;
        this.p400 = p400;
        this.p300 = p300;
        this.p100 = p100;
        this.s100 = s100;
        this.s200 = s100;
        this.s400 = s100;
    };

    Theme.prototype.change = function()
	{
        $('header').css('background-color', this.p500);
		$("nav ul").css('background-color', this.p500);
        pageSelect(this.p300);
        $('.navItem a').css('color', this.p100);
        $('.FAB').css('background-color', this.s400);
        $('.progress').css('background-color', this.s100);
        $('.card a:link').css('color', this.s200);
        $('.card a:visited').css('color', this.s400);
    };

    var purple = new Theme('#5e35b1', '#673ab7', '#7e57c2', '#9575cd', '#d1c4e9', '#ff80ab', '#ff4081', '#f50057');
    var teal = new Theme('#00897b', '#009688', '#26a69a', '#4db6ac', '#b2dfdb', '#ff9e80', '#ff6e40', '#ff3d00');
    var blue = new Theme('#1e88e5', '#2196f3', '#42a5f5', '#64b5f6', '#bbdefb', '#ff8a80', '#ff5252', '#ff1744');
    var red = new Theme('#d32f2f', '#e53935', '#f44336', '#ef9a9a', '#ffcdd2', '#82b1ff', '#448aff', '#2979ff');

    switch (ran) {
        case 0: // purple
            activeTheme = purple;
            $purple.addClass('active');
            break;
        case 1: // teal
            activeTheme = teal;
            $teal.addClass('active');
            break;
        case 2: // blue
            activeTheme = blue;
            $blue.addClass('active');
            break;
        case 3: // red
            activeTheme = red;
            $red.addClass('active');
            break;
        default:
    }

    activeTheme.change();
    active();

    $themeOption.click(function()
	{
		console.log("Changing theme");
        $('.active').removeClass('active');
        if ($(this).attr('id') == 'purple')
		{
            activeTheme = purple;
            $purple.addClass('active');
        } else if ($(this).attr('id') == 'teal')
		{
            activeTheme = teal;
            $teal.addClass('active');
        } else if ($(this).attr('id') == 'blue')
		{
            activeTheme = blue;
            $blue.addClass('active');
        } else if ($(this).attr('id') == 'red')
		{
            activeTheme = red;
            $red.addClass('active');
        }
        activeTheme.change();
        active();
    });

    // Switches pages
    var $aboutMe = $('.cards.aboutMe');
    var $experience = $('.cards.experience');
    var $skills = $('.cards.skills');
    var $portfolio = $('.cards.portfolio');
    var $cards = $(".cards");

    $cards.hide();
    $aboutMe.show();

    $navItem.children().click(function()
	{
		console.log("Changing page");
        if (!$(this).parent().hasClass('current'))
		{
            $navItem.removeClass('current');
            $(this).parent().addClass('current');
            pageSelect(activeTheme.p300);
            if ($(this).attr('id') == 'aboutMe')
			{
                $cards.hide();
                $aboutMe.show();
            }
			else if ($(this).attr('id') == 'experience')
			{
                $cards.hide();
                $experience.show();
            }
			else if ($(this).attr('id') == 'skills')
			{
                $cards.hide();
                $skills.show();
                progressText();
            }
			else if ($(this).attr('id') == 'portfolio')
			{
                $cards.hide();
                $portfolio.show();
            }
        }
    });

    // Calculates age
    var $age = $('.age');

    function age()
	{
        var today = new Date();
        var birth = today.getTime() - (86400000 * 11192);
        return Math.floor(birth / 31556952000);
    };

    $age.text(age());

    // Sets collapse sections
    var $collapse = $('.collapse');

    $collapse.accordion(
	{
        collapsible: true,
        active: false
    });
    $(".ui-accordion-header").css(
	{
        background: "#eeeeee",
        border: "none"
    });
    $(".ui-accordion-content").css(
	{
        border: "none",
        padding: "1rem 0rem",
        height: "100%"
    });

    // Shows option button on hover
    var $card = $(".card");

    $card.mouseenter(function()
	{
        $(this).find(".more").fadeIn("fast");
    });
    $card.mouseleave(function()
	{
        $(this).find(".more").fadeOut("fast");
    });

    // Shows the options menu on click
    var $more = $(".more");
    var $cardMenu = $(".cardMenu");

    $more.click(function()
	{
        $(this).next().show("scale",
		{
            origin: ["left", "top"]
        }, 200);
    });
    $cardMenu.mouseleave(function()
	{
        $(this).hide("scale",
		{
            origin: ["left", "top"]
        }, 200);
    });

    // Resizes card on click
    var $resize = $(".resize");

    $resize.click(function()
	{
		console.log("Resizing");
        var $resizeCard = $(this).closest(".card");
        if ($resizeCard.hasClass("small"))
		{
            $resizeCard.removeClass("small");
            $resizeCard.addClass("medium");
        }
		else if ($resizeCard.hasClass("medium"))
		{
            $resizeCard.removeClass("medium");
            $resizeCard.addClass("big");
        }
		else
		{
            $resizeCard.removeClass("big");
            $resizeCard.addClass("small");
        }
    });

    // Clears the card
    var $clear = $(".clear");
    var $undo = $(".undo");
    var $undoButton = $(".undoButton");

    function undo(card)
	{
		console.log("Undid hide");
        $undo.fadeIn("slow");
        $undoButton.click(function()
		{
            card.show();
            $(this).fadeOut("slow");
        });
    };
    $clear.click(function()
	{
		console.log("Hiding card");
        var $clearCard = $(this).parents(".card");
        $clearCard.hide();
        undo($clearCard);
        $undo.delay(5000).fadeOut("slow");
    });

    // Nav for smaller screens
    var $navMore = $('.navMore');
    var $nav = $("nav");
	var $ul = $("nav ul");
	var $header = $("header");
	var $icon = $navMore.children("i");
	var clickable = true;

    function inlineNav()
	{
		console.log("Normal nav");
		highlightC = true;
        $navItem.css(
			{
				display: "inline-block",
				borderBottom: "4px solid transparent",
	        }
		);
		$ul.css({boxShadow: "none"});
		$ul.animate(
			{
				backgroundColor: activeTheme.p500,
				top: "0",
			}, 400
		);
		$main.animate(
			{marginTop: "0rem"},
			{
				duration: 400,
				complete: function()
				{
					$nav.css(
					{
						padding: "1rem",
						width: "65%"
					});
					clickable = true;
				}
			}
		);
    };
    function lowerNav()
	{
		console.log("Lower nav");
		highlightC = false;
        $navItem.css(
			{
				display: "inline-block",
				borderBottom: "0px solid transparent",
	        }
		);
		$nav.css(
			{
				width: "100vw",
				padding: "0"
			}
		);
		$ul.animate(
			{
				backgroundColor: activeTheme.p600,
				top: $header.height(),
				paddingTop: "0.25rem",
			}, 400
		);
		$main.animate(
			{"margin-top": $header.height()},
			{
				duration: 400,
				complete: function()
				{
					clickable = true;
					$ul.css({boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)"});
				}
			}
		);
    };
	function state(state)
	{
		if (state == "collapsed")
		{
			$icon.addClass("down");
            $icon.text('keyboard_arrow_down');
            inlineNav();
			$navItem.hide();
		}
		else if (state == "extended")
		{
			$icon.removeClass("down");
            $icon.text('keyboard_arrow_up');
            lowerNav();
		}
	};
	function navState()
	{
        if ($(window).width() > 1200)
		{
			$navMore.hide();
			inlineNav()
			$navItem.show();
			pageSelect(activeTheme.p300);
		}
		else if ($(window).width() < 1200)
		{
			$navMore.show();
			$navItem.hide()
			state("collapsed");
		}
	};

    $navMore.click(function()
	{
		if (clickable)
		{
			clickable = false;
			if ($icon.hasClass("down"))
			{
				state("extended");
				$closeMenu();
	        }
			else if (!$icon.hasClass("down"))
			{
				state("collapsed");
	        }
		}
    });
	$(window).resize(function()
	{
		navState();
    });

	navState();
});
