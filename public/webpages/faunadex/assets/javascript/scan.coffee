$ ->
  # << Variables >>
  $feed = $('#feed')
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia

  # << Functions >>
  # Something went wrong displaying video
  error = (error) ->
    console.log(error)

  # Update camera feed
  update = (stream) ->
    $feed.attr('src', window.URL.createObjectURL(stream))

  # Source https://www.kirupa.com/html5/accessing_your_webcam_in_html5.htm
  if navigator.getUserMedia
    navigator.getUserMedia(video: true, update, error)
