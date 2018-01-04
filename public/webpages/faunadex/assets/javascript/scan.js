(function() { // Global vars are local to this file
'use strict'
// Control: select img || take pic --> accept || go back --> send and wait --> send and wait for wikipedia twice --> display result --> save || go back

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
  back: $('button[name=back]'),
  top: $('.top'),
  main: $('main')
}

// Other
const local = { // To this file
  image: null, // Stores the image
  metadata: null, // Stores location data
  result: null, // Stores the top search result
  data: null, // Stores the final object
  state: 'selecting', // Stores page state
  animalNames: null, // Will store the object
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
// Search the animals
const binarySearch = function (value) {
  var min = 0
  var max = local.animalNames.length - 1
  while (true) {
    if (min > max) { // End
      break
    } else {
      let middle = Math.floor((min + max) / 2)
      let select = local.animalNames[middle].toLowerCase()
      if (select === value) {
        return true // Found
      } else if (select < value) { // a < z comparison
        min = middle + 1
      } else if (select > value) {
        max = middle - 1
      }
    }
  }
  return false // Not found
}

// Sets the media constraints
const setConstraints = function () {
  // Video input constraints TODO tweak values
  var constraints = {
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
const validateInput = function (input) {
  return true
}

// Filters image recognition output for animals
const filterOutput = function (output) {
  var data = output.outputs[0].data.concepts
  var result = data[0] // The one with the highest certainty
  for (let index in data) { // If the name is in the list, choose this result
    let res = data[index]
    if (binarySearch(res)) { // Binary search for it in the array
      result = res
      break
    }
  }
  return result
}

// Returns date
const getDate = function () { // TODO UTC and stuff
  var now = new Date()
  return now
}


// Returns the location
const getLocation = function (coordinates) { // TODO ask for permission and get location
  if (coordinates) {
    return 1000000
  } else {
    return "street"
  }
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
const loaded = function () {
  doc.main.show()
  doc.top.show()
}

// Filters the wikipedia text into a standard object
const filterText = function () { // Asumes the Wikipedia page of an animal
  var data = local.result.data.query.pages
  var page = data[Object.keys(data)[0]] // One in the object
  var name = page.title
  var text = page.extract

  // Source https://stackoverflow.com/questions/12059284/get-text-between-two-rounded-brackets
  var sciName = text.match(/\(([^)]+)\)/)[1]

  var links = { // TODO get more
    Wikipedia: `https://en.wikipedia.org/wiki/${name}`
  }

  var image = LZString.compressToUTF16(local.image)

  local.data = {
    // Local scope
    name: name,
    img: image, // Compressed base64
    scientific: sciName,
    text: $(text)[0], // Dom object
    links: links,
    confidence: `${Math.floor(local.result.returned.value * 100)}%`,
    date: local.metadata.date,
    location: local.metadata.location
  }
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
    let targetPage = null
    for (let page of pages.query.search) {
      if (page.title.indexOf('(disambiguation)') === -1) {
        // First page that has content
        targetPage = page.pageid
        break
      }
    }

    const querystring = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&pageids=${targetPage}`

    $.ajax(querystring, {
      dataType: 'jsonp', // Cross domain
      method: 'GET' // Http method
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
    filterText() // Change format
    displayResult()
  })
}

// Displays the final result
const displayResult = function () {
  console.log(local.data)
  var card = new EJS({url: 'views/partials/result.ejs'}).render({data: local.data})
  doc.result.html(card)
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
  local.metadata = { // Store the image data
    date: getDate(),
    location: {
      coordinates: getLocation(true), // Get as coordinate
      representation: getLocation(false)
    }
  }
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
    local.image = null
    local.result = null
    local.metadata = null
    local.data = null
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
    width: img.width,
    ratio: img.height / img.width
  }
  var height = 0 // Initial
  var width = 0
  var startHeight = 0 // Initial
  var startWidth = 0

  width = local.view.width // Scaled
  height = local.view.width * size.ratio // Scaled

  startHeight = (local.view.height - height) / 2 // Center

  console.log(0, 0, size.width, size.height, startWidth, startHeight, width, height)
  // Display the image in canvas
  local.context.drawImage(
    img, 0, 0, size.width, size.height, // All of the image
    startWidth, startHeight, width, height // Displayed here
  )
}

// << Actions >>
// Canvas size can't be via css
doc.image.attr('height', local.view.height)
doc.image.attr('width', local.view.width)

var toLoad = 2
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
    toLoad -= 1
    if (toLoad === 0) {
      loaded() // Everthing done
    }
  }
}).catch((error) => {
  // TODO handle error
  console.log(error)
  toLoad -= 1
  if (toLoad === 0) {
    loaded() // Everthing done
  }
})

// Get the aniaml names
$.getJSON('assets/storage/animal-names.json', function (data) {
  local.animalNames = data.names // Store
  toLoad -= 1
  if (toLoad === 0) {
    loaded() // Everthing done
  }
})

// << Events >>
doc.save.click(() => {
  // Store
  shared.storage('results', {value: local.data, genId: true}, () => {
    var newLink = window.location.href.replace('scan', 'results')
    window.location.href = newLink // Redirect, behaviour similar to clicking a link
  })
})

// Change sizes
window.onresize = (event) => {
  local.view = {
    width: $(window).width(),
    height: $(window).height(),
    ratio:  $(window).width() / $(window).height() // Multiply by a height to get a width
  }
  doc.image.attr('height', local.view.height)
  doc.image.attr('width', local.view.width)
}

// Accept the image
doc.accept.click(() => {
  imageSent()
})

// Back button event
doc.back.click(() => {
  goBack()
})

// Camera take picture event
doc.take.click(function () {
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

// When a new file is entered
  // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
doc.gallery.change(function (event) {
  if (validateInput(event.target.files)) {
    const reader = new FileReader() // Can read the image
    reader.onload = function (event) {
      if (typeof(event.target.result) === 'string') {
        local.image = event.target.result // Saved as dataUrl in variable
        imageTaken()
      } else {
        throw Error("Input wasn't processed")
      }
    }

    reader.readAsDataURL(event.target.files[0]) // Read the image as a dataUrl
  }
})
}).call(this)
