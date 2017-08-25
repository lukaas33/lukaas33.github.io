(function() {
  $("[ripple]").click(function(event) {
    var height, ripple, width, x, y;
    $("[ripple]").find(".ripple").remove();
    width = $(this).width();
    height = $(this).height();
    ripple = $("<span></span>").addClass("ripple");
    $(this).prepend(ripple);
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
      top: y + "px",
      left: x + "px"
    }).addClass("effect");
  });

}).call(this);
