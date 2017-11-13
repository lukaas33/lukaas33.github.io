$ ->
  # << Variables >>
  $feed = $('#feed')
  $image = $('#image')
  $take = $('button[name=take]')
  $accept = $('button[name=accept]')
  $gallery = $('input[name=gallery]')

  constraints =
    audio: false
    video:
      facingMode:
        exact: "environment"
      width: {ideal: 1280}
      height: {ideal: 720}
      frameRate:
        ideal: 10
        max: 15

  image = null # Stores the image

  # << Functions >>

  # << Actions >>
  # TODO Get permissions on phones

  # Show camera feed in page
    # https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    # https://developers.google.com/web/updates/2015/10/media-devices
  navigator.mediaDevices.getUserMedia(constraints).then((stream) ->
    video = $feed[0] # jQuery --> DOM
    # Add feed to video
    video.srcObject = stream
    video.onloadedmetadata = (event) ->
      video.play() # Play feed
  ).catch((error) ->
    # TODO handle error
    alert(error)
  )

  # << Events >>
  $take.click( ->

  )

  $gallery.change( ->

  )
