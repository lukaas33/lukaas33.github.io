$(document).ready(function() {
	// Toggles menu and button state 
	var $menu = $(".menu");
	var $main = $(".main");
	var $hamburger = $(".hamburger");
	var $close = $(".close");
	
	var $openMenu = function() {
		$hamburger.hide();
		$close.show();
		$menu.css("left", "0");
		$main.css("margin-left", "10rem");
	};
	
	var $closeMenu = function() {
		$close.hide();
		$hamburger.show();
		$menu.css("left", "-10rem");
		$main.css("margin-left", "0rem");
	};
	
	$hamburger.click(function() {
		$openMenu();
	});
	
	$close.click(function() {
		$closeMenu();
	});
	
	// Theme changer
	var $theme = $('.theme');
	var $themeChange = $('.changeTheme');
	var $overlay = $('.overlay');
	var $themeOption = $('.themeOption');
	var $navItem = $('.navItem');	
	
	$theme.click(function() {
		$closeMenu();
		$themeChange.fadeIn();
		$overlay.fadeIn();
	});
	
	$overlay.click(function() {
		$themeChange.fadeOut();
		$overlay.fadeOut();
	});
	
	var active = function() {
		$themeOption.empty();
		if ($themeOption.hasClass('active')) {
			$('.active').html('<i class="material-icons md-24 md-light">check</i>');
		}
	};
	
	var pageSelect = function(color) {
		$navItem.css('border-bottom', '4px solid transparent');
		$('.current').css('border-bottom', 'solid 4px ' + color);
	};
	
	function Theme(p500, p400, p300, p100, s100, s200, s400) {
		this.p500 = p500;
		this.p400 = p400;
		this.p300 = p300;
		this.p100 = p100;
		this.s100 = s100;
		this.s200 = s100;
		this.s400 = s100;
	}
	
	Theme.prototype.change = function() {
		$('header').css('background-color', this.p500);
		pageSelect(this.p300);
		$('.navItem a').css('color', this.p100);
		$('.FAB').css('background-color', this.s200);
		$('.progress').css('background-color', this.s200);
		$('.card a:link').css('color', this.s200);
		$('.card a:visited').css('color', this.s400);
	};
	
	var purple = new Theme('#6D3D88', '#895DA1', '#895DA1', '#AD88C1', '#8ECEA1', '#63B27B', '#3F9659');
	var teal = new Theme('#277554', '#499273', '#499273', '#7DB49C', '#FFB2B2', '#D76F6F', '#AA3939');
	var blue = new Theme('#2C4770', '#4F6A8E', '#4F6A8E', '#7D91AD', '#EBA2B8', '#D87895', '#B64D6D');
	var red =  new Theme('#AA3939', '#D76F6F', '#D76F6F', '#FFB2B2', '#8A9DC0', '#6077A0', '#415987');
	
	var $purple = $('#purple');
	var $teal = $('#teal');
	var $blue = $('#blue');
	var $red = $('#red');
	
	var r = Math.floor(Math.random()*4);
	var activeTheme;
	
	switch(r) {
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
	
	$themeOption.click(function(){
		$('.active').removeClass('active');
		if ($(this).attr('id') === 'purple') {
			activeTheme = purple;
			$purple.addClass('active');
		}
		else if ($(this).attr('id') === 'teal') {
			activeTheme = teal;
			$teal.addClass('active');
		}
		else if ($(this).attr('id') === 'blue') {
			activeTheme = blue;
			$blue.addClass('active');
		}
		else if ($(this).attr('id') === 'red') {
			activeTheme = red;
			$red.addClass('active');
			
		}
		activeTheme.change();
		active();
	});
	
	$navItem.mouseenter(function(){
		
	});
	
	$navItem.mouseleave(function(){
	});	
	
	// Switches pages
	var $aboutMe = $('.cards.aboutMe');
	var $experience = $('.cards.experience');
	var $skills = $('.cards.skills');
	var $portfolio = $('.cards.portfolio');
	
	$experience.hide();
	$skills.hide();
	$portfolio.hide();
	
	$navItem.children().click(function(){
		if (!$(this).parent().hasClass('current')) {
			$navItem.removeClass('current');
			$(this).parent().addClass('current');
			pageSelect(activeTheme.p300);
			if ($(this).attr('id') === 'aboutMe') {
				$experience.hide();
				$skills.hide();
				$portfolio.hide();
				$aboutMe.show();
			}
			else if ($(this).attr('id') === 'experience') {
				$skills.hide();
				$portfolio.hide();
				$aboutMe.hide();
				$experience.show();
			}
			else if ($(this).attr('id') === 'skills') {
				$portfolio.hide();
				$aboutMe.hide();
				$experience.hide();
				$skills.show();
			}
			else if ($(this).attr('id') === 'portfolio') {
				$aboutMe.hide();
				$skills.hide();
				$experience.hide();
				$portfolio.show();
			}
		}
	});
	
	// Calculates age
	var $age = $('.age');
	var age = function() {
		var today = new Date();
		var birth = today.getTime() - (86400000 * 11192);
		return Math.floor(birth / 31556952000);
	};
	$age.text(age());
	
	// Sets collapse sections
	var $collapse = $('.collapse');
	
	$collapse.accordion({collapsible: true, active: false});
	$(".ui-accordion-header").css({
		"background": "#eeeeee",
		"border": "none"
	});
	$(".ui-accordion-content").css({
		"border": "none",
		"padding": "1rem 0rem"
	});
	
	// Rule for progress bars 
	var $progress = $(".progress");
	$progress.children("p").hide();
	
	$progress.mouseenter(function() {
		if ($(this).width() > 35) {
			$(this).children("p").fadeIn("fast");
		}
		else {
		}
	});
	$progress.mouseleave(function() {
		$(this).children("p").fadeOut("fast");
	});
	
	
	// Shows option button on hover 
	var $card = $(".card");
	
	$card.mouseenter(function() {
		$(this).find(".more").fadeIn("fast");
	});
	$card.mouseleave(function() {
		$(this).find(".more").fadeOut("fast");
	});
	
	// Shows the options menu on click 
	var $more = $(".more");
	var $cardMenu = $(".cardMenu");
	
	$more.click(function() {
		$(this).next().show("scale", {origin: ["left", "top"]}, 400);
	});
	$cardMenu.mouseleave(function() {
		$(this).hide("scale", {origin: ["left", "top"]}, 400);
	});
	
	// Resizes card on click 
	var $resize = $(".resize");
	
	$resize.click(function() {
		var $resizeCard = $(this).closest(".card");
		if ($resizeCard.hasClass("small")) {
			$resizeCard.removeClass("small");
			$resizeCard.addClass("medium");
		}
		else if ($resizeCard.hasClass("medium")) {
			$resizeCard.removeClass("medium");
			$resizeCard.addClass("big");
		}
		else {
			$resizeCard.removeClass("big");
			$resizeCard.addClass("small");
		}
	});
	
	// Clears the card 
	var $clear = $(".clear");
	var $undo = $(".undo");
	var $undoButton = $(".undoButton");
	
	var undo = function(card) {
		$undo.fadeIn("slow");
		$undoButton.click(function() {
			card.show();
			$(this).fadeOut("slow");
		});	
	};
	
	$clear.click(function() {
		var $clearCard = $(this).closest(".card");
		$clearCard.hide();
		undo($clearCard);
		$undo.delay(5000).fadeOut("slow");	
	});	
});