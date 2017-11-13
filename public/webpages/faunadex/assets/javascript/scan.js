(function() {
  $(function() {
    var $accept, $back, $feed, $gallery, $image, $take, context, displayImage, getFrame, image, imageTaken, loaded, setConstraints, state, validateInput, view;
    $feed = $('#feed');
    $image = $('#image');
    $take = $('button[name=take]');
    $accept = $('button[name=accept]');
    $gallery = $('input[name=gallery]');
    $back = $('button[name=back]');
    context = $image[0].getContext('2d');
    image = null;
    state = 'select';
    view = {
      width: $(window).width(),
      height: $(window).height()
    };
    loaded = function() {
      return null;
    };
    setConstraints = function() {
      var constraints;
      constraints = {
        audio: false,
        video: {
          width: {
            ideal: view.width
          },
          height: {
            ideal: view.height
          }
        },
        facingMode: {
          exact: "environment"
        },
        frameRate: {
          ideal: 20,
          max: 25
        }
      };
      return constraints;
    };
    validateInput = function(input) {
      return true;
    };
    imageTaken = function() {
      $take.hide();
      $accept.show();
      return state = 'accept';
    };
    displayImage = function(image) {
      return context.drawImage(image, 0, 0, view.width, view.height);
    };
    getFrame = function(video) {
      context.drawImage(video, 0, 0, view.width, view.height);
      return image = $image[0].toDataURL();
    };
    navigator.mediaDevices.getUserMedia(setConstraints()).then(function(stream) {
      $feed[0].srcObject = stream;
      return $feed[0].onloadedmetadata = function(event) {
        $feed[0].play();
        return loaded();
      };
    })["catch"](function(error) {
      return alert(error);
    });
    $take.click(function() {
      return getFrame($feed[0]);
    });
    $accept.click(function() {});
    $gallery.change(function() {
      var reader;
      if (validateInput(this.files)) {
        image = this.files[0];
        reader = new FileReader();
        reader.onload = function(event) {
          var htmlImg;
          htmlImg = new Image();
          htmlImg.src = this.result;
          return htmlImg.onload = function() {
            return displayImage(htmlImg);
          };
        };
        return reader.readAsDataURL(image);
      }
    });
    $back.click(function() {});
    return $(window).resize(function() {
      return view = {
        width: $(window).width(),
        height: $(window).height()
      };
    });
  });

}).call(this);
