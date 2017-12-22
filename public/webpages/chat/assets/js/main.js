(function() { // Global vars are local to this file
'use strict'

// << Variables >>
// const target = 'https://general-server.herokuapp.com/chat' // Server route
const target = 'http://localhost:5000/chat'

const register = document.getElementById('register')
const chat = document.getElementById('chat')
const input = document.getElementById('input')
const message = document.getElementById('message')
const text = document.getElementById('text')

var local = {
  selected: null,
  load: null,
  user: null,
  data: {
    users: null,
    messages: null
  }
}

// << Return functions >>
// Generates ids
const id = function (len) {
  // var options = []
  // var ranges = [[48, 57], [65, 90], [97, 122]] // Possible char codes
  // for (let i of ranges) {
  //   var temp = new Array(range[1] - range[0])
  //   temp.fill(0)
  //   for (let num = 0; num <= temp.length; num++) {
  //     let code = range[0] + num
  //     options.push(code) // Add the possible charcode
  //   }
  // }

  // Pre-generated for speed
  const options = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122]

  var result = [] // String parts
  for (let n = 0; n < len; n++) {
    let rand = Math.floor(Math.random() * options.length)
    let charcode = options[rand]
    result.push(String.fromCharCode(charcode)) // Character
  }

  return result.join('') // Add together
}

// Check values
const escape = function (value) {
  var result = value
  if (typeof(value) === 'string') {
    result = result.trim()
    if (result === '') {
      return null // None entered
    } else {
      result = encodeURIComponent(result) // Remove , / ? : @ & = + $ #
      // From https://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly
      result = result.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
          case "\0":
            return "\\0";
          case "\x08":
            return "\\b";
          case "\x09":
            return "\\t";
          case "\x1a":
            return "\\z";
          case "\n":
            return "\\n";
          case "\r":
            return "\\r";
          case "\"":
          case "'":
          case "\\":
          case "%":
            return "\\"+char
        }
      }) // Escape for sql
      return result
    }
  } else if (typeof(value) === 'number') {
    if (value <= 0) {
      return null // None entered
    } else {
      return value
    }
  } else {

  }
  return result
}

// Short hand, like jquery
const doc = function (query) {
  var res = document.querySelectorAll(query)
  if (res.length > 1) {
    return res
  } else if (res.length === 1) {
    return res[0]
  } else {
    return undefined
  }
}

// << Ajax functions
// Creates the session
const sendData = function (sending, data, callback) {
  var http = new XMLHttpRequest()
  http.onreadystatechange = function () { // When done
    if (this.readyState === 4 && this.status === 200) {
      if (this.responseText === 'success') {
        callback(true) // Ajax succesfull
      } else {
        callback(false)
      }
    }
  }

  var link = null
  if (sending === 'user') {
    link = target + '/createuser'
  } else if (sending === 'message') {
    link = target + '/sendmessage'
  }
  http.open('POST', link, true) // Post request at external server
  http.setRequestHeader('Content-Type', 'application/json') // Server will expect format
  http.send(JSON.stringify(data)) // Sends the data
}

// Gets data from servers
const getData = function (needed, callback) {
  var http = new XMLHttpRequest()
  http.onreadystatechange = function () { // When done
    if (this.readyState === 4 && this.status === 200) {
      console.log(this.responseText)
      if (this.responseText !== 'error') {
        callback(JSON.parse(this.responseText)) // Ajax succesfull
      } else {
        callback(null)
      }
    }
  }

  var link = `${target}/data/`
  if (needed === 'users') {
    link += local.user.ID
  } else if (needed === 'messages') {
    link += `${local.user.ID}-${local.selected}`
  }

  http.open('GET', link, true) // Post request at external server
  // http.setRequestHeader('Content-Type', 'application/json') // Server will expect format
  http.send() // Sends the request
}

// << Other functions >>
// Displays the chats
const displayChats = function (chats) {

}

// Displays the users
const displayUser = function (user, item) {
  for (let prop in user) {
    let value = user[prop]
    if (value !== null && value !== 'null') { // Valid value
      let elem = document.createElement('span')
      elem.className = prop
      elem.textContent = decodeURIComponent(value).replace(/\\/g, "")
      if (prop === 'name') {
        item.insertAdjacentElement('afterbegin', elem)
      } else {
        item.appendChild(elem)
      }
    }
  }
  return item
}

// Display the user data
const displayData = function () {
  var list = doc('#users ul')
  list.innerHTML = ''

  var elem = document.createElement('li')
  elem.className = 'self'
  elem = displayUser(local.user, elem)
  list.appendChild(elem)

  for (let user of local.data.users) { // Add the connected users
    let item = document.createElement('li')
    if (local.selected === user.ID) {
      item.classList.add('selected', 'other')
    } else {
      item.className = 'other'
    }

    item.addEventListener('click', function (event) { // On click
      if (this.classList.contains('selected')) { // Already selected
        this.classList.remove('selected')
        message.style.display = 'none'
        local.selected = null
        clearInterval(local.load)
      } else { // Not selected
        let select = doc('#users li.selected')
        if (typeof(select) !== 'undefined') {
          select.classList.remove('selected')
        }
        this.classList.add('selected')
        message.style.display = 'inline-block'

        // Store the id
        for (let prop of this.children) {
          if (prop.className === 'ID') {
            local.selected = prop.textContent
            console.log(local.selected)
            chatUser()
            break
          }
        }
      }
    })
    // item.textContent = JSON.stringify(user)
    item = displayUser(user, item)
    list.appendChild(item)
  }
}

const chatUser = function () {
  local.load = setInterval(function load() {
    getData('messages', (data) => {
      console.log(data)
      if (data !== null) {
        displayChats(data)
      } else {

      }
    })
    return load // The function executes once before being loaded with the setInterval
  }(), 2000)
}

const initialiseApp = function () {
  chat.style.display = 'flex'

  local.refresh = setInterval(function refresh() { // Refresh
    getData('users', (data) => {
      if (data !== null) {
        local.data.users = data // Store
        displayData()
      } else {

      }
    })
    return refresh // The function executes once before being loaded with the setInterval
  }(), 10000)
}

// << Events >>
// Input submit
input.addEventListener('submit', function (event) {
  event.preventDefault() // I'll handle this
  var status = document.getElementById('status')
  var submit = doc('#input input[name=submit]')
  var fields = doc('#input .field')

  var values = { // Store values
    ID: id(8),
    name: fields[0].value,
    country: fields[1].options[fields[1].selectedIndex].value,
    age: Number(fields[2].value)
  }
  submit.disabled = true // No resubmit

  var valid = true // Until disproven
  for (let prop in values) { // Checks values
    values[prop] = escape(values[prop]) // Escapes values
    let value = values[prop]

    if (prop === 'name') { // Check the required value
      if (value === null) {
        status.textContent = 'No name entered'
        submit.disabled = false
        valid = false
        values = {}
        break
      } else if (value.length > 64) {
        status.textContent = 'Invalid name'
        submit.disabled = false
        valid = false
        values = {}
        break
      }
    }
  }

  if (valid) { // Send info
    sendData('user', values, (success) => {
      if (success) {
        register.style.display = 'none'
        local.user = values
        initialiseApp() // Start the app
      } else {
        status.textContent = 'Server error'
        submit.disabled = false
        values = {}
      }
    })
  }

})

// Message
text.addEventListener('submit', function (event) {
  event.preventDefault()
  var submit = doc('#text input[name=submit]')
  var field = doc('#text textarea')

  var values = {
    messageID: id(16),
    sender: local.user.ID,
    receiver: local.selected,
    message: escape(field.value),
    time: new Date()
  }
  submit.disabled = true

  if (values.message !== null) {
    console.log(values)
    sendData('message', values, (success) => {
      submit.disabled = false
      if (success) {

      } else {

      }
    })
  } else {

  }
})

window.onbeforeunload = function (event) {
  event.returnValue = 'All messages will be deleted when you leave'
  return dialogText
}

}).call(this)
