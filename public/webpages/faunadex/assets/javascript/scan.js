$(function () {
  'use strict'
  // Control: select img || take pic --> accept || go back --> send and wait --> send and wait for wikipedia twice --> display result --> save || go back
  // TODO import partials

  // << Variables >>
  // Document
  const doc = {
    feed: $('#feed'),
    result: $('#result'),
    image: $('#image'),
    take: $('button[name=take]'),
    accept: $('button[name=accept]'),
    save: $('button[name=save]'),
    gallery: $('input[name=gallery]'),
    back: $('button[name=back]')
  }

  // Other
  const local = {
    image: null, // Stores the image
    result: null, // Stores the top search result
    state: 'selecting', // Stores page state
    view: {
      width: $(window).width(),
      height: $(window).height(),
      ratio:  $(window).width() / $(window).height() // Multiply by a height to get a width
    },
    feed: { // Will store real feed dimentions
      width: undefined,
      height: undefined
    },
    context: doc.image[0].getContext('2d') // Used to draw on the canvas
  }

  // << Return functions >>
  // Sets the media constraints
  const setConstraints = function() {
    // Video input constraints TODO tweak values
    const constraints = {
      audio: false,
      video: {
        // width: {
        //   ideal: local.view.width
        // },
        // height: {
        //   ideal: local.view.height
        // },
        // aspectRatio: local.view.ratio,
        facingMode: "environment",
        frameRate: {
          ideal: 20
        }
      }
    }

    // TODO change based on device
    return constraints
  }

  // TODO Tests input
  const validateInput = (input) => {
    return true
  }

  // TODO filters image recognition output for animals
  const filterOutput = function (output) {
    var data = output.outputs[0].data
    var result = data.concepts[0] // The most likely guess
    return result
  }

  // Convert image
    // https://stackoverflow.com/questions/19183180/how-to-save-an-image-to-localstorage-and-display-it-on-the-next-page
  const toBase64 = function (img) {
    img = img.split(',')[1] // Withoput metadata
    try {
      atob(img) // Works
    } catch (error) {
      console.log(error) // TODO handle error
    }
    return img
  }

  // << Functions >>
  // The page is loaded
  const loaded = () => {

  }

  // Gets a local.result from an image
  // https://www.clarifai.com/developer/guide/
  const imageGetResult = function () {
    Clarifai.app.models.predict(Clarifai.model, {base64: toBase64(local.image)}).then((response) => {
      processOutput(response)
    }, (error) => {
      // TODO handle error
      console.log(error)
    })
  }

  // Get wikipedia data
    // https://www.mediawiki.org/wiki/API:Query
  const wikipediaData = function (search, callback) {
    $.ajax("https://en.wikipedia.org/w/api.php", {
      data: { // Parameters
        action: 'query',
        list: 'search',
        format: 'json', // To  return
        srsearch: search
      }, // To search for
      dataType: 'jsonp', // Get data from outside domain
      method: 'POST' // Http method
    }).done((pages) => {
      console.log(pages)
      // Get data from this page
      const targetPage = pages.query.search[0].pageid

      $.ajax("https://en.wikipedia.org/w/api.php", {
        data: { // Parameters
          action: 'parse', // Return html of site
          format: 'json', // As json format
          pageid: targetPage
        }, // wikipedia page
        dataType: 'jsonp', // Get data from outside domain
        method: 'POST' // Http method
      }).done((data) => {
        console.log(data)
        callback(data) // Call function with the data
      }).fail((error) => {
        // TODO handle error
        console.log(error)
      })
    }).fail((error) => {
      // TODO handle error
      console.log(error)
    })
  }

  // Processes the image response
  const processOutput = function (output) {
    console.log(output)
    local.result = filterOutput(output) // The result
    // Call to wikipedia api
    wikipediaData(local.result.name, (data) => {
      local.result = {
        returned: local.result,
        data: data
      }
      displayResult()
    })
  }

  // Displays the final result
  const displayResult = function () {
    // TODO include html using EJS
    doc.result.html(local.result.data.parse.text['*'])
    doc.result.show()
    doc.back.parents('.top').show()
    doc.save.show()
    local.state = 'result' // Change behaviour of back
  }

  // Image is selected by user TODO add loaders
  const imageSent = function () {
    doc.accept.hide()
    doc.back.parents('.top').hide() // Until loaded
    imageGetResult()
    local.state = 'accepted' // Change behaviour of back
  }

  const imageSelected = function () {
    doc.take.hide()
    doc.accept.show()
    doc.gallery.parents('.top').hide()
    local.state = 'selected' // Change behaviour of back
  }

  const goBack = function () {
    // The begin state of the site Will always work because hiding a hidden object won't do anything
    const beginState = () => {
      // Buttons
      doc.gallery.parents('.top').show()
      doc.accept.hide()
      doc.save.hide()
      doc.take.show()
      // Screens
      doc.image.hide()
      doc.result.hide()
      doc.feed.show()
      
      doc.feed[0].play()
      local.state = 'selecting' // Revert to previous screen
    }

    if (local.state === 'selecting') {
      let home = window.location.href.replace('scan/', '')
      window.location.href = home
    } else if (local.state === 'selected') {
      local.image = null
      // Clear canvas
      local.context.clearRect(0, 0, local.view.width, local.view.height)
      beginState()
    } else if (local.state === 'result') {
      local.result = null
      doc.result.empty() // Html content is removed
      beginState()
    }
  }

  // Image is selected
  const imageTaken = function () {
    const img = new Image() // Canavas needs html image element
    img.src = local.image
    img.onload = () => { // Image needs to load before displaying
      drawImg(img)
    }
    doc.feed.hide()
    doc.image.show()
    imageSelected()
  }

  const drawImg = function (img) {
    var size = { // Get from img
      height: img.height,
      width: img.width
    }
    var height, width = 0 // Initial
    var startHeight, startWidth = 0 // Initial

    // Image ratio
    if (size.width >= size.height) {
      // Center the image
      startHeight = (local.view.height - size.height) / 2
      // Values
      width = local.view.width
      height = size.height
    } else {
      // Center the image
      startWidth = (local.view.width - size.width) / 2
      // Values
      width = size.width
      height = local.view.height
    }
    // Image does not fit on screen
    if (size.width > local.view.width || size.height > local.view.height) {
      // TODO handle it
    }
    // Display the image in canvas
    local.context.drawImage(
      img, 0, 0, width, height, startWidth, startHeight, width, height
    )
  }

  // << Actions >>
  // TODO Get permissions on phones

  // Show camera feed in page
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // https://developers.google.com/web/updates/2015/10/media-devices
  navigator.mediaDevices.getUserMedia(setConstraints()).then((stream) => {
    // Add feed to video
    doc.feed[0].srcObject = stream // Add media stream to video element

    doc.feed[0].onloadedmetadata = (event) => {
      local.feed.height = this.videoHeight // Store value
      local.feed.width = this.videoHeight * local.view.ratio // Real width
      doc.feed[0].play() // Play feed
      loaded() // Everthing done
    }
  }).catch((error) => {
    // TODO handle error
    console.log(error)
  })

  // Canvas size can't be via css
  doc.image.attr('height', local.view.height)
  doc.image.attr('width', local.view.width)

  // << Events >>
  // Accept the image
  doc.accept.click(() => {
    imageSent()
  })

  // TODO save data into storage
  doc.save.click(function () {

  })

  // Camera take picture event
  doc.take.click(() => {
    var video = doc.feed[0]
    video.pause() // User sees current frame
    // Get the video frame
      // http://cwestblog.com/2017/05/03/javascript-snippet-get-video-frame-as-an-image/
    local.context.drawImage(video, 0, 0) // Display to get frame
    local.image = doc.image[0].toDataURL() // Store frame as image
    // Clear canvas
    local.context.clearRect(0, 0, local.view.width, local.view.height)
    imageSelected()
  })

  // Back button event
  doc.back.click( function () {
    goBack()
  })

  // When a new file is entered
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  doc.gallery.change( function () {
    if (validateInput(this.files)) {
      const reader = new FileReader() // Can read the image
      reader.onload = function (event) {
        local.image = event.target.result // Saved as dataUrl in variable
        imageTaken()
      }

      reader.readAsDataURL(this.files[0]) // Read the image as a dataUrl
    }
  })
})
