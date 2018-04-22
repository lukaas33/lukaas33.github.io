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
    messages: null,
    self: []
  },
  read: [],
  scroll: true,
  setup: false,
  hover: null,
  time: 400,
  privkey: null
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

// RSA encryption
// https://en.wikipedia.org/wiki/RSA_(cryptosystem)#Code
// https://stackoverflow.com/questions/14346829/is-there-a-way-to-convert-a-string-to-a-base-10-number-for-encryption
const rsa = {
  // String to hex
  encode: function (string) {
    let number = "0x"
    for (let i = 0; i < string.length; i++) {
        number += string.charCodeAt(i).toString(16)
    }
    number = parseInt(number, 16)
    return number
  },
  decode: function (number) {
      number = number.toString(16)
      let string = ""
      for (let i = 0; i < number.length;) {
          let code = number.slice(i, i += 2);
          string += String.fromCharCode(parseInt(code, 16));
      }
      return string;
  },
  // Generates key pair
  keys: function (keysize) {
    const random_prime = function (bits) {
      const min = bigInt(6074001000).shiftLeft(bits - 33) // min ≈ √2 × 2^(bits - 1)
      const max = bigInt.one.shiftLeft(bits).minus(1)   // max = 2^(bits) - 1

      while (true) {
        let p = bigInt.randBetween(min, max)
        if (p.isProbablePrime(256)) {
          return p
        }
      }
    }

    // Init
    let e = bigInt(65537) // use fixed public exponent
    let p = null
    let q = null
    let lambda = null

    // generate p and q such that λ(n) = lcm(p − 1, q − 1) is coprime with e and |p-q| >= 2^(keysize/2 - 100)
    do {
      p = random_prime(keysize / 2)
      q = random_prime(keysize / 2)
      lambda = bigInt.lcm(p.minus(1), q.minus(1))
    } while (bigInt.gcd(e, lambda).notEquals(1) || p.minus(q).abs().shiftRight(keysize / 2 - 100).isZero())

    return {
      pubkey: {
        n: p.multiply(q),   // public key (part I)
        e: e,               // public key (part II)
      },
      privkey: {
        d: e.modInv(lambda) // private key d = e^(-1) mod λ(n)
      }
    }
  },
  // Encrypts
  encrypt: function (text = '', pubkey) {
    text = rsa.encode(text)
    return bigInt(text).modPow(pubkey.e, pubkey.n);
  },
  // Decrypts
  decrypt: function (text = '', privkey, pubkey) {
    const val =  bigInt(text).modPow(privkey.d, pubkey.n)
    return rsa.decode(val)
  },
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
        container.setAttribute('data-up', 'true')
        let text = document.createElement('p')
        text.classList.add('text')
        let date = document.createElement('span')
        date.classList.add('date')

        let databaseText = mess.message
        databaseText = databaseText.replace(/''/g, `'`).replace(/""/g, `"`)

        if (mess.sender !== 'chatbot' && mess.sender !== local.user.ID) {
          text.textContent = rsa.decrypt(databaseText, local.privkey, JSON.parse(local.user.pubkey))
        } else {
          text.textContent = databaseText
        }

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
    if (['ID', 'name', 'country', 'age'].indexOf(prop) !== -1) {
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
    elem.classList.add('self')
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
      item.classList.add('other')
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
  register.outerHTML = ''
  chat.style.display = 'flex'

  window.onbeforeunload = function (event) {
    return ''
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
        local.data.messages = data.messages // Messages received
        for (let message of local.data.self) { // Messages sent
          for (let user of local.data.users) {
            if (user.ID === message.receiver) { // User exists
              local.data.messages.push(message)
            }
          }
        }
        local.data.messages = local.data.messages.sort(function(a, b) {
          return (a.time.getTime() - b.time.getTime())
        })
        displayData()
        displayChats()
        let load = doc('#text .loader')
        load.style.display = 'none'
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
  var submit = doc('#input [type=submit]')
  var fields = doc('#input .field')

  var values = { // Store values
    ID: id(8),
    name: fields[0].value,
    country: fields[1].options[fields[1].selectedIndex].value,
    age: Number(fields[2].value),
    pubkey: null
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
    let load = doc('#input .loader')
    load.style.display = 'inline-block'

    const keys = rsa.keys(512)
    local.privkey = keys.privkey
    values.pubkey = JSON.stringify(keys.pubkey)
    local.user = values

    sendData('user', values, (success) => {
      if (success) {
        register.style.display = 'none'
        initialiseApp() // Start the app
      } else {
        alert('Server error')
        load.style.display = 'none'
        submit.disabled = false
        values = {}
      }
    })
  }

})

// Message
text.addEventListener('submit', function (event) {
  event.preventDefault()
  var submit = doc('#text [type=submit]')
  var field = doc('#text textarea')

  var values = {
    messageID: id(16),
    sender: local.user.ID,
    receiver: local.selected,
    message: escape(field.value),
    time: new Date()
  }

  // Encrypts with receiver pubkey if exists
  let original = null
  for (let user of local.data.users) {
    if (user.ID === local.selected && user.pubkey) {
      original = values.message
      values.message = rsa.encrypt(values.message, JSON.parse(user.pubkey))
    }
  }

  submit.disabled = true

  if (values.message !== null) {
    console.log('send', values)
    let load = doc('#text .loader')
    load.style.display = 'inline-block'
    sendData('message', values, (success) => {
      if (original) {
        values.message = original
      }
      local.data.self.push(values)
      submit.disabled = false
      if (success) {
        text.reset() // The form
      } else {
        load.style.display = 'none'
      }
    })
  } else {
    console.log(values)
  }
})

for (let tooltip of doc('[data-tooltip]')) { // Assumes multiple
  tooltip.addEventListener('mouseover', function (event) {
    for (let item of tooltip.childNodes) {
      if (item instanceof HTMLElement) {
        if (item.classList.contains('tooltip')) { // Tooltip div
          local.hover = setTimeout((item) => {
            item.style.opacity = 1
          }, local.time * 2, item)
        }
      }
    }
  })
  tooltip.addEventListener('mouseout', function (event) {
    for (let item of tooltip.childNodes) {
      if (item instanceof HTMLElement) {
        if (item.classList.contains('tooltip')) { // Tooltip div
          clearTimeout(local.hover)
          item.style.opacity = 0
        }
      }
    }
  })

}

for (let ripplebox of doc('[data-ripple]')) { // Assumes multiple
  // Edited from https://codepen.io/lehollandaisvolant/pen/dMQXYX
  ripplebox.addEventListener('click', function (event) {
    for (let item of ripplebox.childNodes) {
      if (item instanceof HTMLElement) {
        if (item.classList.contains('ripple')) {
          item.outerHTML = '' // Previous
        }
      }
    }
    var rect = ripplebox.getBoundingClientRect()
    var width = rect.width
    var height = rect.height

    if (width >= height) {
      height = width
    } else {
      width = height
    }

    var x = event.pageX - rect.x - width / 2
    var y = event.pageY - rect.y - height / 2

    var ripple = document.createElement('span')
    ripple.classList.add('ripple')
    ripplebox.appendChild(ripple)

    for (let item of ripplebox.childNodes) {
      if (item instanceof HTMLElement) {
        if (item.classList.contains('ripple')) {
          item.style.width = `${width}px`
          item.style.height = `${height}px`
          item.style.top = `${y}px`
          item.style.left = `${x}px`

          item.classList.add('effect')
        }
      }
    }
  })
}

}).call(this)
