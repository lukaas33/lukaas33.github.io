$ ->
  # Flow: displayImage or getFrame --> imageTaken --> imageSent --> saveResult

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
  result = null # Stores the top search result
  state = 'select' # Stores page state
  view =
    width: $(window).width()
    height: $(window).height()

  # << Return functions >>
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
        facingMode: "environment"
        frameRate:
          ideal: 15

    # TODO change based on device
    return constraints

  # TODO Tests input
  validateInput = (input) ->
    return true

  # Wikipedia query url
    # https://www.mediawiki.org/wiki/API:Opensearch
  queryUrl = (term) ->
    url = "https://en.wikipedia.org/w/api.php" + # API url
      "?action=opensearch" + # Action is search
      "?search=#{term}" + # Get result for the term
      "?limit=1" + # Only the first
      "?namespace=0" + # No idea
      "?format=json" # Json data
    return url


  # Convert image
    # https://stackoverflow.com/questions/19183180/how-to-save-an-image-to-localstorage-and-display-it-on-the-next-page
  toBase64 = (img) ->
    img = img.replace(/^data:image\/(png|jpg);base64,/, "")
    return img

  # << Functions >>
  # Gets a result from an image
    # https://www.clarifai.com/developer/guide/
  imageGetResult = ->
    Clarifai.app.models.predict(Clarifai.model, base64: toBase64(image)).then((
      (response) ->
        console.log response
    ), (
      (error) ->
        # TODO handle error
        console.log error
    ))

  # Get wikipedia data
  wikipedia = ->
    $.ajax(queryUrl(result),
      
    )

  # The page is loaded
  loaded = ->
    null

  # Image is selected by user TODO add loader
  imageSent = ->
    $accept.hide()
    state = 'result' # Change behaviour of back
    imageGetResult()

  # Image is selected
  imageTaken = ->
    $take.hide()
    $accept.show()
    state = 'accept' # Change behaviour of back

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
    console.log(error)
  )

  # << Events >>
  # Camera take picture event
  $take.click( ->
    getFrame($feed[0])
  )

  # TODO image accept event
  $accept.click( ->
    imageSent()
  )

  # When a new file is entered
    # https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  $gallery.change( ->
    if validateInput(@files)
      reader = new FileReader() # Can read the image
      reader.onload = (event) ->
        image = @result # Saved as dataUrl in variable

        img = new Image() # Canavas needs html image element
        img.src = @result
        img.onload = -> # Image needs to load before displaying
          # Display the image in canvas
          context.drawImage(img, 0, 0, view.width, view.height)

      reader.readAsDataURL(@files[0]) # Read the image as a dataUrl
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
