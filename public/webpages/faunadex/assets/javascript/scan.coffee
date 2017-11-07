$ ->
  # << Variables >>
  $feed = $('#feed')
  constraints =
    audio: false
    video: true

  # << Functions >>

  # << Actions >>
  # Use camera and show in page
  # https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  navigator.mediaDevices.getUserMedia(constraints).then((stream) ->
    $feed.attr('src', window.URL.createObjectURL(stream))
  ).catch((error) ->
    console.log(error)
  )
