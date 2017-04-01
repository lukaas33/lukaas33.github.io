/*
---BUGS---
- Hide card only works once
- Nav extended fails to work properly sometimes (Doesn't fill screen)
*/
$(document).ready(function()
{
	// Jquery vars
	var $main = $(".main");
	var $menu = $(".menu");
    var $hamburger = $(".hamburger");

	var $box = $('.menuItem.box');

	var $setLanguage = $('.menuItem.language');
	var $changeLanguage = $('.centerCard.changeLanguage');

	var $openAbout = $('.menuItem.about');
	var $aboutWeb = $('.centerCard.aboutWebsite');

	var $mail = $(".FAB.bottom");
	var $sendMail = $(".centerCard.sendMail");

	var $themeChange = $('.centerCard.changeTheme');
	var $theme = $('.menuItem.theme');
    var $overlay = $('.overlay');
    var $themeOption = $('.themeOption');

    var $purple = $('#purple');
    var $teal = $('#teal');
    var $blue = $('#blue');
    var $red = $('#red');

	var $tabs = $(".navItem a");
	var $navItem = $('.navItem');
	var $aboutMe = $('.cards.aboutMe');
    var $experience = $('.cards.experience');
    var $skills = $('.cards.skills');
    var $portfolio = $('.cards.portfolio');
    var $cards = $(".cards");

	var $tab = $('.tab');
	var $aboutMeTab = $('.tab.one');
    var $experienceTab = $('.tab.two');
    var $skillsTab = $('.tab.three');
    var $portfolioTab = $('.tab.four');

	var $navMore = $('.navMore');
	var $icon = $('.navMore i');
    var $nav = $("nav");
	var $ul = $("nav ul");
	var $header = $("header");

	var $clear = $(".clear");
    var $undo = $(".undo");
    var $undoButton = $(".undoButton");

	var $resize = $(".resize");

	var $more = $(".more");
    var $cardMenu = $(".cardMenu");

	var $card = $(".card");

	var $age = $('.age');
	var $sinceCreated = $('.sinceCreated');
	var $sinceHtml= $('.sinceHtml');
	var $sinceGE= $('.sinceGE');
	var $sinceNL= $('.sinceNL');
	var $sinceEN= $('.sinceEN');

	var $collapse = $('.collapse');

	// Other vars
	var ran = Math.floor(Math.random() * 4);
    var activeTheme;
	var highlightC = true;

	var purple = new Theme('#5e35b1', '#673ab7', '#7e57c2', '#9575cd', '#d1c4e9', '#ff80ab', '#ff4081', '#f50057');
    var teal = new Theme('#00897b', '#009688', '#26a69a', '#4db6ac', '#b2dfdb', '#ff9e80', '#ff6e40', '#ff3d00');
    var blue = new Theme('#1e88e5', '#2196f3', '#42a5f5', '#64b5f6', '#bbdefb', '#ff8a80', '#ff5252', '#ff1744');
    var red = new Theme('#d32f2f', '#e53935', '#f44336', '#ef9a9a', '#ffcdd2', '#82b1ff', '#448aff', '#2979ff');

	var language = navigator.language;

	var boxView = false;

	var clickable = true;

	var millisecondsDay = 86400000;
    var today = new Date();


	// Functions
    function progressText()
	{
        var $progress = $(".progress");
        $progress.children("p").hide();
        $progress.children("p").delay(2500).fadeIn();
    };

    function openMenu()
	{
		$hamburger.attr("disabled", true);
		$hamburger.children().html("close");
        $menu.animate(
			{"left": "0"},
			{
				duration: 800,
			 	complete: function()
				{
					$hamburger.attr("disabled", false);
					navState();
				}
			});
        $main.animate({"margin-left": "10rem"}, 600);
    };
    function closeMenu()
	{
		$hamburger.attr("disabled", true);
		$hamburger.children().html("menu");
        $menu.animate(
			{"left": "-10rem"},
			{
				duration: 800,
				complete: function()
				{
					$hamburger.attr("disabled", false);
					navState();
				}
			});
        $main.animate({"margin-left": "0rem"}, 600);
    };

    function active()
	{
        $themeOption.children().empty();
        if ($themeOption.hasClass('active'))
		{
            $('.active').children().html('check');
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
        this.s200 = s200;
        this.s400 = s400;
    };
    Theme.prototype.change = function()
	{
		pageSelect(this.p300);
        $('header').css('background-color', this.p500);
		$("nav ul").css('background-color', this.p500);
        $('.navItem a').css('color', this.p100);
        $('.FAB').css('background-color', this.s200);
        $('.progress.normal').css('background-color', this.s200);
		$('.progress.small').css('background-color', this.s100);
        $('.card a:link').css('color', this.s200);
        $('.card a:visited').css('color', this.s400);
    };

	function timePassed(date)
	{
		var between = today.getTime() - date.getTime(); // Difference in milliseconds
		var days = Math.floor(between / millisecondsDay); // Difference in days
		var years = Math.floor(between / (millisecondsDay * 365.25)); // Difference in years
		if (days < 365)
		{
			return (days + " days");
		}
		else if (years == 1) // 1 year
		{
			return (years + " year");
		}
		else
		{
			return (years + " years");
		}
	};

    function undo(card)
	{
        $undo.fadeIn("slow");
        $undoButton.click(function()
		{
            card.show();
            $(this).fadeOut("slow");
        });
    };

    function inlineNav()
	{
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

	// Events
    $hamburger.click(function()
	{
		if ($(this).hasClass("open"))
		{
			openMenu();
		}
		else if ($(this).hasClass("close"))
		{
			closeMenu();
		}
		$hamburger.toggleClass("open");
		$hamburger.toggleClass("close");
    });

	$mail.click(function()
	{
        closeMenu();
		$mail.parent().fadeOut();
        $sendMail.fadeIn();
        $overlay.fadeIn();
    });

	$openAbout.click(function()
	{
		closeMenu();
		$aboutWeb.fadeIn();
		$overlay.fadeIn();
	});

	$setLanguage.click(function()
	{
		closeMenu();
		$changeLanguage.fadeIn()
		$overlay.fadeIn();
	});

	$overlay.click(function()
	{
		$overlay.fadeOut();

		$aboutWeb.fadeOut();

		$sendMail.fadeOut();
		$mail.parent().fadeIn();

		$themeChange.fadeOut();

		$changeLanguage.fadeOut()
	});

	function switchPage(to)
	{
		if (to == 'aboutMe')
		{
			$aboutMe.removeClass("goDown");
			$aboutMe.addClass("goUp");
			$aboutMe.show();
		}
		else if (to == 'experience')
		{
			$experience.removeClass("goDown");
			$experience.addClass("goUp");
			$experience.show();
		}
		else if (to == 'skills')
		{
			$skills.removeClass("goDown");
			$skills.addClass("goUp");
			$skills.show();
			progressText();
		}
		else if (to == 'portfolio')
		{
			$portfolio.removeClass("goDown");
			$portfolio.addClass("goUp");
			$portfolio.show();
		}
		setTimeout(function()
		{
			$tabs.removeClass("inactive");
		}, 800);
	}

	function down(previousTab, newTab)
	{
		$tabs.addClass("inactive");
		previousTab.removeClass('current');
		newTab.addClass('current');
		pageSelect(activeTheme.p300);
		$cards.removeClass("goUp");
		$cards.addClass("goDown");
	}

	function setPage(clicked)
	{
		closeMenu();
		var newTab = clicked.parent();
		var previousTab = $(".current");
        if (!newTab.hasClass('current') && !clicked.hasClass('inactive'))
		{
			down(previousTab, newTab);
			setTimeout(function()
			{
				$cards.hide(0, function() {switchPage(clicked.attr("id"))});
			}, 750);
        }
	}

	// Events
    $navItem.children().click(function()
	{
		setPage($(this))
    });

	$tab.click(function()
	{
		if ($(this).hasClass("one"))
		{
			setPage($("#aboutMe"));
		}
		else if ($(this).hasClass("two"))
		{
			setPage($("#experience"));
		}
		else if ($(this).hasClass("three"))
		{
			setPage($("#skills"));
		}
		else if ($(this).hasClass("four"))
		{
			setPage($("#portfolio"));
		}
	});

    $theme.click(function()
	{
        closeMenu();
        $themeChange.fadeIn();
        $overlay.fadeIn();
    });

	$themeOption.click(function()
	{
        $('.active').removeClass('active');
        if ($(this).attr('id') == 'purple')
		{
            activeTheme = purple;
            $purple.addClass('active');
        }
		else if ($(this).attr('id') == 'teal')
		{
            activeTheme = teal;
            $teal.addClass('active');
        }
		else if ($(this).attr('id') == 'blue')
		{
            activeTheme = blue;
            $blue.addClass('active');
        }
		else if ($(this).attr('id') == 'red')
		{
            activeTheme = red;
            $red.addClass('active');
        }
        activeTheme.change();
        active();
    });

	$clear.click(function()
	{
		var $clearCard = $(this).parents(".card");
		$clearCard.hide();
		undo($clearCard);
		$undo.delay(5000).fadeOut("slow");
	});

	$box.click(function()
	{
		closeMenu();
		if (!boxView)
		{
			$("body *"). addClass("boxV");
			boxView = true;
		}
		else
		{
			$("body *"). removeClass("boxV");
			boxView = false;
		}
	});

	$navMore.click(function()
	{
		if (clickable)
		{
			clickable = false;
			if ($icon.hasClass("down"))
			{
				state("extended");
				closeMenu();
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

	$resize.click(function()
	{
		var $resizeCard = $(this).closest(".card");
		if ($resizeCard.hasClass("small"))
		{
			$resizeCard.removeClass("small");
			$resizeCard.addClass("big");
		}
		else
		{
			$resizeCard.removeClass("big");
			$resizeCard.addClass("small");
		}
	});

	$card.mouseenter(function()
	{
        $(this).find(".more").fadeIn("fast");
    });
    $card.mouseleave(function()
	{
        $(this).find(".more").fadeOut("fast");
    });

	// Actions on ready
	$cards.hide();
    $aboutMe.show();

	switch (ran)
	{
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
	navState();

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

	$age.text(timePassed(new Date(2000, 07, 22, 22, 22)));
	$sinceCreated.text(timePassed(new Date(2016, 11, 23)));
	$sinceHtml.text(timePassed(new Date(2016, 08, 24)));
	$sinceEN.text(timePassed(new Date("2010")));
	$sinceGE.text(timePassed(new Date("2014")));
	$sinceNL.text(timePassed(new Date("2004")));

	$("body").show();
});
