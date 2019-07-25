// << Variables >>
const doc = {
  project: document.querySelector('#projects'),
  experience: document.querySelector('#experience'),
  skills: document.querySelector('#skills'),
  type: document.querySelector('select[name=type]'),
  media: document.querySelectorAll('input[name=media]'),
  thumbnail: document.querySelector('input[name=thumbnail]'),
  cover: document.querySelector('input[name=cover]'),
  download: document.querySelector('.download')
}

// const base = 'http://localhost:5000'
const base = 'https://' + window.location.host
var target = null
var images = []
var files = []
var user
var pass
var working = [] // Tracks files begin read async

// TODO add collection upload

// << Functions >>
// Get info from input fields
const getData = function (from, object = {}, callback = () => {}) {
  for (let item of from.children) { // Direct children
    switch (item.tagName.toLowerCase()) { // Html tag
      case 'fieldset':
        getData(item, object) // Recursion to get the subfields
      break
      case 'input':
      case 'textarea':
        if (!item.disabled) {
          let value = item.value
          if (value === '') {
            value = null
          }
          if (item.type === 'file' && item.files.length > 0) {
            image(item, (base64) => {
              object[item.getAttribute('name')] = base64
            })
          } else if (item.type === 'date') {
            object[item.getAttribute('name')] = new Date(value)
          } else if (item.type === 'number') {
            object[item.getAttribute('name')] = Number(value)
          } else {
            object[item.getAttribute('name')] = value
          }
        }
      break
      case 'select':
        let value = item.options[item.selectedIndex].value
        if (value === '') {
          value = null
        }
        object[item.getAttribute('name')] = value
      break
    }
  }

  var end = function () {
    if (working.every((bool) => {return !bool})) { // All are done
      clearInterval(wait)
      callback(object)
    }
  }

  var wait = setInterval(() => {
    end()
  }, 100)
}

// Confirm to send
const accept = function (data) {
  if (confirm('Send:\n' + JSON.stringify(data).replace(/,/g, '\n'))) {
    sendData(data)
  }
}

// Covert image for transfer
const image = function (item, callback) {
  var name = item.getAttribute('name')

  for (let i in images) { // First see if it is stored already
    let image = images[i]
    if (name === image.name) {
      if (item.files[0] in files) { // Is this the image you're looking for?
        console.log('Already loaded', item.files)
        callback(image.value) // Return data
        return // End function
      } else {
        images.splice(i, 1) // Convert new
        break
      }
    }
  }

  let i = working.length // Store location in array
  console.log('Loading', i, item.files)
  working[i] = true
  var value = []
  let loaded = 0
  for (let file of item.files) { // Can be multiple
    (function() {
      files.push(file)
      let reader = new FileReader()
      reader.onload = () => { // Working
        if (reader.error === null) { // No error
          value.push(reader.result)
          loaded += 1
          if (loaded === item.files.length) { // All loaded
            console.log('Loaded', i, item.files, reader)
            images.push({ // Store for if needed later
              name: name,
              value: value
            })
            callback(value) // Return data
            working[i] = false
            return // End function
          } else {
            console.log('File number', loaded)
          }
        } else {
          console.log(reader.error)
        }
      }
      reader.readAsDataURL(file) // Convert file to binary data
    })(file, item)
  }
}

// Display coverted image
const display = function (name, options = {crop: false}) {
  var canvas = document.getElementById(name)
  var context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)

  var image = new Image()
  for (let img of images) {
    if (img.name === name) {
      // Image will be displayed via dataurl
      image.src = img.value[0]
      break
    }
  }

  image.onload = () => {
    canvas.style.display = 'block'

    if (options.crop) { // Has fixed ratio
      var height = canvas.height
      var width = canvas.height / (image.height / image.width) // Scaled

      var startHeight = (canvas.height - height) / 2 // Center
      var startWidth = (canvas.width - width) / 2 // Center

      context.drawImage(
        image, 0, 0, image.width, image.height,
        startWidth, startHeight, width, height
      )

      var newImg = canvas.toDataURL('image/jpeg', 1.0) // Save the cropped version

      for (let img of images) {
        if (img.name === name) {
          console.log('Image was cropped')
          img.value[0] = newImg // Store new
          doc.download.href = newImg
          doc.download.download = 'cropped-thumbnail'
          doc.download.style.display = 'block'
          break
        }
      }
    } else {
      var width = canvas.width
      var height = canvas.width * (image.height / image.width) // Scaled

      canvas.height = height
      context.drawImage(
        image, 0, 0, image.width, image.height,
        0, 0, width, height
      )
    }
  }
}

const sendData = function (data) {
  var http = new XMLHttpRequest()
  http.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      alert(this.responseText)
    }
  }
  // Send to the server
  http.open('POST', `${base}/enter`, true)
  http.setRequestHeader('Content-Type', 'application/json') // Server will expect format
  var request = {
    user: user,
    pass: pass,
    data: data,
    target: target
  }
  http.send(JSON.stringify(request))
}

// << Events >>
doc.type.addEventListener('change', () => {
  for (let input of doc.media) {
    input.disabled = true // Default
  }
  switch (doc.type.options[doc.type.selectedIndex].value) { // Selected
    case 'document':
      doc.media[1].disabled = false
    break
    case 'collection':
      doc.media[2].disabled = false
    break
    case 'website':
    case 'presentation':
      doc.media[0].disabled = false
    break
  }
})

doc.thumbnail.addEventListener('change', (event) => {
  image(event.target, (base64) => {
    display('thumbnail', {crop: true})
  })
})

doc.cover.addEventListener('change', (event) => {
  image(event.target, (base64) => {
    display('cover')
  })
})

doc.project.addEventListener('submit', (event) => {
  event.preventDefault() // Don't trust html
   // Get from form
  getData(doc.project.children[0], { }, function (send) {
    // Modify data
    send.date = {
      end: send.end,
      start: send.start
    }
    delete send.end // Delete old holder
    delete send.start // Delete old holder
    send.tags = send.tags.split(',') // Covert to array
    for (let i in send.tags) {
      send.tags[i] = send.tags[i].trim() // Whitespace removal
    }
    target = 'projects'
    accept(send)
  })
})

doc.experience.addEventListener('submit', (event) => {
  event.preventDefault() // Don't trust html
  // Get from form
  getData(doc.experience.children[0], { }, function (send) {
    // Modify data
    send.date = {
      end: send.end,
      start: send.start
    }
    delete send.end // Delete old holder
    delete send.start // Delete old holder

    send.data = []
    for (let i = 0; i < 4; i++) { // 4 fields of data
      send.data.push({ // Add empy object
        value: null,
        type: null
      })
    }

    for (let prop in send) { // All properties to find value
      let propPart = prop.split('-')
      if (propPart[0] === 'value') { // Found one
        if (send[prop] !== null) { // Valid
          let i = Number(propPart[1])
          send.data[i].value = send[prop] // Save
        }
        delete send[prop] // Delete old holder
      }
    }

    for (let prop in send) { // All properties to find the types for the values
      let propPart = prop.split('-')
      if (propPart[0] === 'type' && propPart.length > 1) {
        let i = Number(propPart[1])

        if (send.data[i].value !== null) { // Value valid
          send.data[i].type = send[prop] // Save
        }
        delete send[prop] // Delete old holder
      }
    }

    target = 'experience'
    accept(send)
  })
})

doc.skills.addEventListener('submit', (event) => {
  event.preventDefault() // Don't trust html
  // Get from form
  getData(doc.skills.children[0], { }, function (send) {
    // Modify data
    send.skills = []
    for (let prop in send) { // All properties to find value
      let propPart = prop.split('-')

      if (propPart[0] === 'name') { // Found one
        if (send[prop] !== null) {
          let data = {
            name: send[prop],
            percentage: null
          }
          let at = propPart[1]

          for (let prop in send) { // All properties to find type
            let propPart = prop.split('-')
            if (propPart[0] === 'percentage') {
              if (propPart[1] === at) {
                data.percentage = send[prop]
                delete send[prop] // Delete old holder
              }
            }
          }

          send.skills.push(data)
        }
        delete send[prop] // Delete old holder
      }
    }

    target = 'skills'
    accept(send)
  })
})


// << Actions >>
setTimeout(() => {
  // Auth
  user = prompt('Username', '')
  pass = prompt('Password', '')

  if (user === null || pass === null) { // Wrong
    window.history.back() // Return
  } else {
    user = user.toLowerCase()
    user = user.trim()
    pass = pass.trim()

    if (pass === '' || user === '') { // Wrong
      window.history.back() // Return
    } else {
      alert('Information will be checked when data is entered')
    }
  }
}, 500) // Don't stop page loading
