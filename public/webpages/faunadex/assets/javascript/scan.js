(function() {
  $(function() {
    var $feed, constraints;
    $feed = $('#feed');
    constraints = {
      audio: false,
      video: true
    };
    return navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      return $feed.attr('src', window.URL.createObjectURL(stream));
    })["catch"](function(error) {
      return console.log(error);
    });
  });

}).call(this);
