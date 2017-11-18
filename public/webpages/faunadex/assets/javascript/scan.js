$(function () {
  'use strict'
  // Control: mageTaken --> imageSent --> saveResult
  // Data: image --> clarifai API --> wikipedia --> localstorage

  // << Variables >>
  // Document
  const doc = {
    feed: $('#feed'),
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
    state: 'select', // Stores page state
    view: {
      width: $(window).width(),
      height: $(window).height()
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
        width: {
          ideal: local.view.width
        },
        height: {
          ideal: local.view.height
        },
        facingMode: "environment",
        frameRate: {
          ideal: 15
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

  // Convert image
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
    // https://stackoverflow.com/questions/19183180/how-to-save-an-image-to-localstorage-and-display-it-on-the-next-page
  const toBase64 = function (img) {
    img = img.replace(/^data:image\/(png|jpg)base64,/, "")
    // img = btoa(img)
    // try {
    //   atob(img) // Works
    // } catch (error) {
    //   console.log(error) // TODO handle error
    // }
    return img
  }

  // << Functions >>
  // Gets a local.result from an image
    // https://www.clarifai.com/developer/guide/
  const imageGetResult = () =>
    Clarifai.app.models.predict(Clarifai.model, {base64: toBase64(local.image)}).then(function (response) {
      console.log(response)
    }, function (error) {
      // TODO handle error
      console.log(error)
    })


  // Get wikipedia data
    // https://www.mediawiki.org/wiki/API:Query
  const wikipediaData = () =>
    $.ajax("https://en.wikipedia.org/w/api.php", {
      data: { // Parameters
        action: 'query',
        list: 'search',
        format: 'json', // To  return
        srsearch: local.result
      }, // To search for
      dataType: 'jsonp', // Get data from outside domain
      method: 'POST'
    } // Http method
  ).done((data) => {
      console.log(data)
      // Get data from this page
      const targetPage = data.query.search[0].pageid
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
      }).fail((error) => {
        // TODO handle error
        console.log(error)
      })
    }).fail((error) => {
      // TODO handle error
      console.log(error)
    })


  // The page is loaded
  const loaded = () => null

  // Image is selected by user TODO add loader
  const imageSent = function () {
    doc.accept.hide()
    local.state = 'result' // Change behaviour of back
    imageGetResult()
  }

  // Image is selected
  const imageTaken = function () {
    doc.take.hide()
    doc.accept.show()
    local.state = 'accept' // Change behaviour of back
  }

  // Get the video frame
    // http://cwestblog.com/2017/05/03/javascript-snippet-get-video-frame-as-an-image/
  const getFrame = function (video) {
    // Display videoframe in canvas
    local.context.drawImage(video, 0, 0, local.view.width, local.view.height)
    local.image = doc.image[0].toDataURL() // Store frame as image
  }

  // << Actions >>
  // TODO Get permissions on phones

  // Show camera feed in page
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // https://developers.google.com/web/updates/2015/10/media-devices
  navigator.mediaDevices.getUserMedia(setConstraints()).then(function (stream) {
    // Add feed to video
    doc.feed[0].srcObject = stream // Add media stream to video element

    doc.feed[0].onloadedmetadata = function (event) {
      doc.feed[0].play() // Play feed
      loaded() // Everthing done
    }
  }).catch((error) => {
    // TODO handle error
    console.log(error)
  })

  // << Events >>
  // Camera take picture event
  doc.take.click(() => {
    getFrame(doc.feed[0])
  })

  // Accept the image
  doc.accept.click(() => {
    imageSent()
  })

  // TODO save data into storage
  doc.save.click(function () {

  })

  // When a new file is entered
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  doc.gallery.change( function () {
    if (validateInput(this.files)) {
      const reader = new FileReader() // Can read the image
      reader.onload = function (event) {
        local.image = event.target.result // Saved as dataUrl in variable
        const img = new Image() // Canavas needs html image element
        img.src = local.image
        img.onload = () => { // Image needs to load before displaying
          // Display the image in canvas
          local.context.drawImage(img, 0, 0, local.view.width, local.view.height)
        }
      }

      reader.readAsDataURL(this.files[0]) // Read the image as a dataUrl
    }
  })

  // TODO back button event
  doc.back.click( function () {

  })

  // Update variables
  $(window).resize(() => {
    local.view = {
      width: $(window).width(),
      height: $(window).height()
    }
  })
})
