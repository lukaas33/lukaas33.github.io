$ ->
  # << Variables >>
  $feed = $('#feed')
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

  # << Functions >>

  # << Actions >>
  # Use camera feed


  # Show in page
  # https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  navigator.mediaDevices.getUserMedia(constraints).then((stream) ->
    $feed.srcObject = stream
    $feed.onloadedmetadata = (event) ->
      $feed.play()
  ).catch((error) ->
    console.log(error)
    document.write(error)
  )
