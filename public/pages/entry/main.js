// << Variables >>
const doc = {
  project: document.querySelector('#projects'),
  experience: document.querySelector('#experience'),
  skills: document.querySelector('#skills'),
  type: document.querySelector('select[name=type]'),
  media: document.querySelectorAll('input[name=media]')
}

// const base = 'http://localhost:5000'
const base = 'https://' + window.location.host
var target = null
var working = [] // Tracks files begin read async
// TODO add collection upload
// TODO add image crop
// << Functions >>
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
            let i = working.length // Store location in array
            console.log('Loading', i, item.files)
            working[i] = true
            value = []
            let loaded = 0
            for (let file of item.files) { // Can be multiple
              (function (file, item) { // Closure for own scope
                reader = new FileReader()
                reader.onload = () => { // Working
                  console.log(reader)
                  if (reader.error === null) { // No error
                    value.push(reader.result)
                    loaded += 1
                    if (loaded === item.files.length) { // All loaded
                      console.log('Loaded', i, item.files)
                      object[item.getAttribute('name')] = value
                      working[i] = false
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
      setTimeout(() => {
        clearInterval(wait)
        callback(object)
      }, 1000)
    }
  }

  var wait = setInterval(() => {
    end()
  }, 100)
}

const accept = function (data) {
  if (confirm('Send:\n' + JSON.stringify(data).replace(/,/g, '\n'))) {
    sendData(data)
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

// << Actions >>
// Auth
const user = prompt('Username', '').toLowerCase()
const pass = prompt('Password', '')

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
