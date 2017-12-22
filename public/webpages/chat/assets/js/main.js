(function() { // Global vars are local to this file
'use strict'

// const target = 'https://general-server.herokuapp.com/chat' // Server route
const target = 'http://localhost:5000/chat'

const register = document.getElementById('register')
const chat = document.getElementById('chat')
const input = document.getElementById('input')

var local = {}

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

// Creates the session
const createUser = function (data, callback) {
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
  http.open('POST', target + '/createuser', true) // Post request at external server
  http.setRequestHeader('Content-Type', 'application/json') // Server will expect format
  http.send(JSON.stringify(data)) // Sends the data
}

const displayData = function () {
  var list = doc('#users ul')
  list.innerHTML = ''
  for (let user of local.data.users) {
    let item = document.createElement('li')
    item.class = 'other'
    // item.textContent = JSON.stringify(user)
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
    list.appendChild(item)
  }
}

const getData = function (callback) {
  var http = new XMLHttpRequest()
  http.onreadystatechange = function () { // When done
    if (this.readyState === 4 && this.status === 200) {
      if (this.responseText !== 'error') {
        callback(JSON.parse(this.responseText)) // Ajax succesfull
      } else {
        callback(null)
      }
    }
  }
  http.open('GET', `${target}/data/${local.user.ID}`, true) // Post request at external server
  // http.setRequestHeader('Content-Type', 'application/json') // Server will expect format
  http.send() // Sends the request
}

const initialiseApp = function () {
  chat.style.display = 'block'

  local.refresh = setInterval(function refresh() { // Refresh
    getData((data) => {
      if (data !== null) {
        local.data = data // Store
        displayData()
      } else {

      }
    })
    return refresh // The function executes once before being loaded with the setInterval
  }(), 10000)
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
    createUser(values, (succes) => {
      if (succes) {
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

}).call(this)
