$ ->
  # << Variables >>
  # Document
  $feed = $('#feed')
  $image = $('#image')
  $take = $('button[name=take]')
  $accept = $('button[name=accept]')
  $gallery = $('input[name=gallery]')
  $back = $('button[name=back]')

  context = $image[0].getContext('2d') # Used to draw on the canvas

  # Other
  image = null # Stores the image
  state = 'select' # Stores page state
  view =
    width: $(window).width()
    height: $(window).height()

  # << Functions >>
  # The page is loaded
  loaded = ->
    null

  # Sets the media constraints
  setConstraints = ->
    # Video input constraints TODO tweak values
    constraints =
      audio: false
      video:
        width:
          ideal: view.width
        height:
          ideal: view.height
      facingMode:
        exact: "environment"
      frameRate:
        ideal: 20
        max: 25

    # TODO change based on device
    return constraints

  # TODO Tests input
  validateInput = (input) ->
    return true

  imageTaken = () ->
    $take.hide()
    $accept.show()
    state = 'accept' # Change behaviour of back

  # Display image on screen
    # https://www.w3schools.com/graphics/canvas_images.asp
  displayImage = (image) ->
    # Display the image in canvas
    context.drawImage(image, 0, 0, view.width, view.height)

  # Get the video frame
    # http://cwestblog.com/2017/05/03/javascript-snippet-get-video-frame-as-an-image/
  getFrame = (video) ->
    # Display videoframe in canvas
    context.drawImage(video, 0, 0, view.width, view.height)
    image = $image[0].toDataURL() # Store frame as image

  # << Actions >>
  # TODO Get permissions on phones

  # Show camera feed in page
    # https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    # https://developers.google.com/web/updates/2015/10/media-devices
  navigator.mediaDevices.getUserMedia(setConstraints()).then((stream) ->
    # Add feed to video
    $feed[0].srcObject = stream # Add media stream to video element
    $feed[0].onloadedmetadata = (event) ->
      $feed[0].play() # Play feed
      loaded() # Everthing done
  ).catch((error) ->
    # TODO handle error
    alert(error)
  )

  # << Events >>
  # Camera take picture event
  $take.click( ->
    getFrame($feed[0])
  )

  # TODO image accept event
  $accept.click( ->

  )

  # When a new file is entered
    # https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  $gallery.change( ->
    if validateInput(@files)
      image = @files[0]

      reader = new FileReader() # Can read the image
      reader.onload = (event) ->
        htmlImg = new Image() # Canavas needs html image element
        htmlImg.src = @result
        htmlImg.onload = -> # Image needs to load before displaying
          displayImage(htmlImg)
      reader.readAsDataURL(image) # Read the image as a dataUrl
  )

  # TODO back button event
  $back.click( ->

  )

  # Update variables
  $(window).resize( ->
    view =
      width: $(window).width()
      height: $(window).height()
  )
