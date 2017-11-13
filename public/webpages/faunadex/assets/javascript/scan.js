(function() {
  $(function() {
    var $feed, constraints;
    $feed = $('#feed');
    constraints = {
      audio: false,
      video: {
        facingMode: {
          exact: "environment"
        },
        width: {
          ideal: 1280
        },
        height: {
          ideal: 720
        },
        frameRate: {
          ideal: 10,
          max: 15
        }
      }
    };
    return navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      $feed.srcObject = stream;
      return $feed.onloadedmetadata = function(event) {
        return $feed.play();
      };
    })["catch"](function(error) {
      console.log(error);
      return document.write(error);
    });
  });

}).call(this);
