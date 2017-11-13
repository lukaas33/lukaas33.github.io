(function() {
  $(function() {
    var $accept, $feed, $gallery, $image, $take, constraints, image;
    $feed = $('#feed');
    $image = $('#image');
    $take = $('button[name=take]');
    $accept = $('button[name=accept]');
    $gallery = $('input[name=gallery]');
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
    image = null;
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      var video;
      video = $feed[0];
      video.srcObject = stream;
      return video.onloadedmetadata = function(event) {
        return video.play();
      };
    })["catch"](function(error) {
      return alert(error);
    });
    $take.click(function() {});
    return $gallery.change(function() {});
  });

}).call(this);
