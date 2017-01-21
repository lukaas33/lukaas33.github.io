$(document).ready(function() {
	
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
	$progress.children("p").hide()
	
	$progress.mouseenter(function() {
		if ($(this).width() > 35) {
			$(this).children("p").fadeIn("fast");
		}
		else {
		};
	});
	$progress.mouseleave(function() {
		$(this).children("p").fadeOut("fast");
	});
	
	// Theme changer
	$theme = $('.theme');
	$themeChange = $('.changeTheme');
	$overlay = $('.overlay');
	$themeOption = $('.themeOption');			
	
	$theme.click(function() {
		$themeChange.fadeIn();
		$overlay.fadeIn();
		;
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
	
	var changeTheme = function(p500, p400, p300, p100, s100, s200, s400) {
		$('header').css('background-color', p500);
		$('.current').css('border-color', p300);
		$('.navItem a').css('color', p100);
		$('.FAB').css('background-color', s200);
		$('.progress').css('background-color', s200);
		$('.card a:link').css('color', s200);
		$('.card a:visited').css('color', s400);
	};
	
	var purple = function() { changeTheme('#6D3D88', '#895DA1', '#895DA1', '#AD88C1', '#8ECEA1', '#63B27B', '#3F9659');};
	var teal = function() { changeTheme('#277554', '#499273', '#499273', '#7DB49C', '#FFB2B2', '#D76F6F', '#AA3939');};
	var blue = function() { changeTheme('#2C4770', '#4F6A8E', '#4F6A8E', '#7D91AD', '#EBA2B8', '#D87895', '#B64D6D');};
	var red = function() { changeTheme('#AA3939', '#D76F6F', '#D76F6F', '#FFB2B2', '#8A9DC0', '#6077A0', '#415987');};
	
	var $purple = $('.purple');
	var $teal = $('.teal');
	var $blue = $('.blue');
	var $red = $('.red');
	
	var r = Math.floor(Math.random()*4);
	
	switch(r) {
    case 0: // purple
		purple();
		$purple.addClass('active');
        break;
    case 1: // teal
		teal();
		$teal.addClass('active');
        break;
	case 2: // blue
		blue();
		$blue.addClass('active');
		break;
    case 3: // red
         red();
		 $red.addClass('active');
		 break;
	default: 
		changeTheme();
	};
	
	active();
	
	$themeOption.click(function(){
		$('.active').removeClass('active');
		if ($(this).hasClass('purple')) {
			purple();
			$purple.addClass('active');
		}
		else if ($(this).hasClass('teal')) {
			teal();
			$teal.addClass('active');
		}
		else if ($(this).hasClass('blue')) {
			blue();
			$blue.addClass('active');
		}
		else if ($(this).hasClass('red')) {
			red();
			$red.addClass('active');
			
		}
		active();
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
		};
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
	
	
	
	// Toggles menu and button state 
	var $menu = $(".menu");
	var $main = $(".main");
	var $hamburger = $(".hamburger");
	var $close = $(".close");
	
	$hamburger.click(function() {
		$hamburger.hide();
		$close.show();
		$menu.css("left", "0")
		$main.css("margin-left", "10rem");
	});
	$close.click(function() {
		$close.hide();
		$hamburger.show();
		$menu.css("left", "-10rem")
		$main.css("margin-left", "0rem");
	});
	
});


