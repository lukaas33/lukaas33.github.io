(function() { // Global vars are local to this file
'use strict'

// << Variables >>
// const target = 'https://general-server.herokuapp.com/chat' // Server route
const target = 'http://localhost:5000/chat'

const register = document.getElementById('register')
const chat = document.getElementById('chat')
const input = document.getElementById('input')
const message = document.getElementById('message')
const messages = document.getElementById('messages')
const text = document.getElementById('text')

var local = {
  selected: null,
  load: null,
  user: null,
  data: {
    users: null,
    messages: null
  },
  read: [],
  scroll: true,
  setup: false
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
    link = target + '?action=createuser'
    // link = target + '/createuser'
  } else if (sending === 'message') {
    link = target + '?action=sendmessage'
    // link = target + '/sendmessage'
  }
  http.open('POST', link, true) // Post request at external server
  http.setRequestHeader('Content-Type', 'application/json') // Server will expect format
  http.send(JSON.stringify(data)) // Sends the data
}

// Gets data from servers
const getData = function (callback) {
  var http = new XMLHttpRequest()
  http.onreadystatechange = function () { // When done
    if (this.readyState === 4 && this.status === 200) {
      console.log('got', this.responseText)
      if (this.responseText !== 'error') { // Ajax succesfull
        callback(JSON.parse(this.responseText, function (key, value) {
          if (key === 'time') {
            return new Date(value)
          } else {
            return value
          }
        }))
      } else {
        callback(null)
      }
    }
  }

  var link = `${target}?id=${local.user.ID}`
  // var link = `${target}/data/${local.user.ID}`
  http.open('GET', link, true) // Post request at external server
  // http.setRequestHeader('Content-Type', 'application/json') // Server will expect format
  http.send() // Sends the request
}

// << Other functions >>
// Displays the chats
const displayChats = function () {
  var prefix = (num) => {
    var str = String(num)
    if (str.length === 1) {
      return '0' + str
    } else {
      return str
    }
  }

  if (local.selected !== null) { // Someone is selected by the user
    messages.innerHTML = '' // Empty
    for (let mess of local.data.messages) {
      if ((mess.sender === local.user.ID && mess.receiver === local.selected) || (mess.sender === local.selected  && mess.receiver === local.user.ID)) {
        let container = document.createElement('div')
        let text = document.createElement('p')
        text.classList.add('text')
        let date = document.createElement('span')
        date.classList.add('date')


        text.textContent = mess.message
        date.textContent = `${mess.time.getHours()}:${
          prefix(mess.time.getMinutes())
        }  ${
          mess.time.getFullYear()}-${mess.time.getMonth() + 1}-${mess.time.getDate()
        }`
        container.appendChild(text)
        container.appendChild(date)

        if (mess.sender === local.user.ID) { // Sent by user
          container.classList.add('self', 'chat')
        } else if (mess.receiver === local.user.ID) { // Sent to user
          if (local.read.indexOf(mess.messageID) === -1) {
            local.read.push(mess.messageID) // User read the message
          }
          container.classList.add('other', 'chat')
          let sender = document.createElement('span')
          sender.classList.add('sender')
          sender.textContent = `#${local.selected}`
          container.appendChild(sender)
        }

        messages.insertAdjacentElement('afterbegin', container) // Add to document
      }
    }
  }
}

const unreadChats = function (user) {
  var total = 0
  for (let message of local.data.messages) {
    // Has an unread message
    if ((local.read.indexOf(message.messageID) === -1) && (message.sender === user)) {
      total += 1
    }
  }
  return total
}

// Displays the users
const displayUser = function (user, item) {
  for (let prop in user) {
    let value = user[prop]
    if (value !== null && value !== 'null') { // Valid value
      let elem = document.createElement('span')
      elem.className = prop
      elem.textContent = value
      if (prop === 'name') {
        item.insertAdjacentElement('afterbegin', elem)
      } else {
        item.appendChild(elem)
      }
    }
  }
  if (user.ID !== local.user.ID) {
    var unread = document.createElement('span')
    unread.className = 'unread'
    unread.textContent = unreadChats(user.ID)
    item.appendChild(unread)

    item.addEventListener('click', function (event) { // On click
      let textarea = doc('#text textarea')
      if (this.classList.contains('selected')) { // Already selected
        this.classList.remove('selected')
        message.style.display = 'none'

        if (local.selected === 'chatbot') { // Return to default
          textarea.maxlength = 65536
        }

        local.selected = null
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
            if (prop.textContent === 'chatbot') { // Different max length
              textarea.maxlength = 256
            } else {
              textarea.maxlength = 65536
            }

            local.selected = prop.textContent
            displayData() // Re-display
            displayChats() // Display now
            console.log('selected', local.selected)
            break
          }
        }
      }
    })
  }
  return item
}

// Display the user data
const displayData = function () {

  var list = doc('#users ul')
  var items = doc('#users .other')
  if (NodeList.prototype.isPrototypeOf(items)) {
    for (let i = 0; i < items.length; i++) {
      items[i].outerHTML = '' // To update
    }
  } else if (items instanceof HTMLElement) {
    items.outerHTML = ''
  }

  if (!local.setup) {
    var elem = document.createElement('li')
    elem.className = 'self'
    elem = displayUser(local.user, elem)
    var logo = document.createElement('img')
    logo.src = 'assets/icons/logo.svg'
    elem.appendChild(logo)
    list.appendChild(elem)
    local.setup = true
  }

  var reselected = false

  for (let user of local.data.users) { // Add the connected users
    let item = document.createElement('li')
    if (local.selected === user.ID) {
      item.classList.add('selected', 'other')
      reselected = true // Won't reset selected
    } else {
      item.className = 'other'
    }

    if (user.ID === 'chatbot') {
      let tag = document.createElement('span')
      tag.className = 'tag'
      tag.textContent = 'Bot'
      item.appendChild(tag)
    }

    // item.textContent = JSON.stringify(user)
    item = displayUser(user, item)
    list.appendChild(item)
  }

  if (local.selected !== null) {
    if (!reselected) { // The user was deleted
      console.log('delete', local.selected)
      message.style.display = 'none'
      local.selected = null
    }
  }
}

const initialiseApp = function () {
  chat.style.display = 'flex'

  window.onbeforeunload = function (event) {
    event.returnValue = 'All messages will be deleted when you leave'
    return dialogText
  }

  window.onblur = function (event) {
    if (local.selected !== null) {
      doc('#users .selected').click()
    }
  }

  local.refresh = setInterval(function refresh() { // Refresh
    getData((data) => {
      if (data !== null) {
        local.data.users = data.users // Store
        local.data.messages = data.messages
        displayData()
        displayChats()
      } else {

      }
    })
    return refresh // The function executes once before being loaded with the setInterval
  }(), 2500)
}

// << Events >>
// Input submit
input.addEventListener('submit', function (event) {
  event.preventDefault() // I'll handle this
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
        alert('No name entered')
        submit.disabled = false
        valid = false
        values = {}
        break
      } else if (value.length > 64) {
        alert('Invalid name')
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
        alert('Server error')
        submit.disabled = false
        values = {}
      }
    })
  }

})

// Message
text.addEventListener('submit', function (event) {
  event.preventDefault()
  var submit = doc('#text button[name=submit]')
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
    console.log('send', values)
    sendData('message', values, (success) => {
      submit.disabled = false
      if (success) {
        text.reset() // The form
      } else {

      }
    })
  } else {

  }
})

}).call(this)
