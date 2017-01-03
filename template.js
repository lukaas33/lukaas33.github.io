$(document).ready(function() {
	
	/* Sets collapse sections */
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
	
	/* Rule for progress bars */
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
	
	/* Shows option button on hover */
	var $card = $(".card");
	
	$card.mouseenter(function() {
		$(this).find(".more").fadeIn("fast");
	});
	$card.mouseleave(function() {
		$(this).find(".more").fadeOut("fast");
	});
	
	/* Shows the options menu on click */
	var $more = $(".more");
	var $cardMenu = $(".cardMenu");
	
	$more.click(function() {
		$(this).next().show("scale", {origin: ["left", "top"]}, 400);
	});
	$cardMenu.mouseleave(function() {
		$(this).hide("scale", {origin: ["left", "top"]}, 400);
	});
	
	/* Resizes card on click */
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
	
	/* Clears the card */
	var $clear = $(".clear");
	var $undo = $(".undo");
	var $undoButton = $(".undoButton");
	
	$clear.click(function() {
		var $clearCard = $(this).closest(".card");
		$clearCard.hide();
		$undo.fadeIn("slow");
		$undoButton.click(function() {
			$clearCard.show();
			$undo.fadeOut("slow");
		});
		$undo.delay(5000).fadeOut("slow");	
	});
	
	/* Toggles menu and button state */
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


