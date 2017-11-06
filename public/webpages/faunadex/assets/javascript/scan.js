(function() {
  $(function() {
    var $feed, error, update;
    $feed = $('#feed');
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
    error = function(error) {
      return console.log(error);
    };
    update = function(stream) {
      return $feed.attr('src', window.URL.createObjectURL(stream));
    };
    if (navigator.getUserMedia) {
      return navigator.getUserMedia({
        video: true
      }, update, error);
    }
  });

}).call(this);
