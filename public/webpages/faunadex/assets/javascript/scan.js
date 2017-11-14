(function() {
  $(function() {
    var $accept, $back, $feed, $gallery, $image, $take, context, getFrame, image, imageGetResult, imageSent, imageTaken, loaded, setConstraints, state, toBase64, validateInput, view;
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
          },
          facingMode: "environment",
          frameRate: {
            ideal: 15
          }
        }
      };
      return constraints;
    };
    validateInput = function(input) {
      return true;
    };
    toBase64 = function(img) {
      img = img.replace(/^data:image\/(png|jpg);base64,/, "");
      return img;
    };
    imageGetResult = function() {
      return Clarifai.app.models.predict(Clarifai.model, {
        base64: toBase64(image)
      }).then((function(response) {
        return console.log(response);
      }), (function(error) {
        return console.log(error);
      }));
    };
    loaded = function() {
      return null;
    };
    imageSent = function() {
      $accept.hide();
      state = 'result';
      return imageGetResult();
    };
    imageTaken = function() {
      $take.hide();
      $accept.show();
      return state = 'accept';
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
      return console.log(error);
    });
    $take.click(function() {
      return getFrame($feed[0]);
    });
    $accept.click(function() {
      return imageSent();
    });
    $gallery.change(function() {
      var reader;
      if (validateInput(this.files)) {
        reader = new FileReader();
        reader.onload = function(event) {
          var img;
          image = this.result;
          img = new Image();
          img.src = this.result;
          return img.onload = function() {
            return context.drawImage(img, 0, 0, view.width, view.height);
          };
        };
        return reader.readAsDataURL(this.files[0]);
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
