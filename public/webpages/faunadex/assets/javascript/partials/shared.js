'use strict'
const shared = {} // No naming confict between files


shared.var = {
  time: 400
}

// Sort object
  // https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
shared.sort = function (property) {
  var sortOrder = 1;
   if(property[0] === "-") {
       sortOrder = -1;
       property = property.substr(1);
   }
   return function (a,b) {
       var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
       if (property )
       return result * sortOrder;
   }
}

// Convertion options
shared.json = {
  stringify: (key, value) => {
    // if (key === 'text') { // Html object
    if (false) {
      return value.outerHTML
    } else {
      return value
    }
  },
  parse: (key, value) => {
    if (key === 'date') { // Datestring
      return new Date(value)
    // } else if (key === 'text') { // Html as string
      // return $.parseHTML(value)[0]
    } else {
      return value
    }
  }
}

shared.id = function () {
  let id = []
  let maxCh = 122
  let minCh = 97
  for (let i = 0; i < 8; i++) { // Length of 8
    let ch = Math.floor(Math.random() * (maxCh-minCh) + minCh)
    id.push(String.fromCharCode(ch)) // Random from a-z
  }

  return id.join('')
}

// Uses getter and setters
shared.cookie = function (name, value) {
  if (typeof(value) === 'undefined') { // Getting
    var cookies = decodeURIComponent(document.cookie) // Removes the expires header
    cookies = cookies.split(';')
    console.log(`Got from cookies: ${cookies}`)
    if (cookies.length > 0) {
      console.log(`Will get cookie: ${name}`)
      let object = undefined
      for (let index in cookies) {
        let cookie = cookies[index]
        cookie = cookie.trim()
        let cookieName = cookie.split('=')[0]

        if (name === cookieName) {
          try {
            object = JSON.parse(cookie.split('=')[1], shared.json.parse)
          } catch (error) {
            object = cookie.split('=')[1] // Strings can't be parsed, are already ok
          }
        }
      }
      return object
    } else {
      return undefined
    }
  } else { // Setting
    console.log(`Will set cookie: ${name} to ${value}`)
    let strValue = JSON.stringify(value) // To store objects
    let nextWeek = new Date(Date.now() + (7*24*60*60*1000))
    // TODO add secure tag after testing
    document.cookie = `${name}=${strValue}; expires=${nextWeek.toUTCString()}; path=./` // Store cookie
  }
}

// Gets and sets storage
shared.storage = function (name, options = null, callback = () => {}) {
  var item = localStorage.getItem(name)
  if (item !== null) {
    console.log(`Got from storage: ${typeof(item)}`)
    // Convert string back to object
    var object = null
    try {
      object = JSON.parse(item, shared.json.parse)
    } catch (error) {
      // Can't be parsed because it is an object
      object = item
    }

    if (options === null || typeof(options.value) === 'undefined') { // Needs to get
      console.log(`Will get ${name}`)
      if (options === null || typeof(options.id) === 'undefined') { // Get all
        return object.content
      } else { // Get specific
        for (let index in object.content) {
          let entry = object.content[index]
          if (entry.id === options.id) {
            return entry
          }
        }
      }
    } else { // Needs to set
      console.log(`Will set ${name} to ${options.value}`)

      if (object.content.length > 0) { // Not empty
        if (options === null || typeof(options.id) === 'undefined') { // Not editing
          if (options === null || typeof(options.genId) === 'undefined') { // Has an ID
            for (let index in object.content) {
              let entry = object.content[index]
              let unique = true
              if (entry.id === options.value.id) { // Tests if this id is unique
                unique = false
              }
              if (unique) {
                object.content.push(options.value) // Add to the array
              }
            }
          } else { // Create an ID
            let unique = false
            let final = null
            while (!unique) {
              final = shared.id()

              unique = true // Stop running
              for (let index in object.content) {
                let entry = object.content[index]
                if (entry.id === final) {
                  unique = false // Run again
                  break // The for loop
                }
              }
            }
            options.value.id = final
            object.content.push(options.value) // Add to the array
          }
        } else { // Editing
          for (let index in object.content) {
            let entry = object.content[index]
            if (entry.id === options.id) {
              object.content[index] = options.value // Update
              break
            }
          }
        }
      } else { // Empty
        if (options === null || typeof(options.genId) === 'undefined') { // Has an ID
          object.content.push(options.value) // Add to the array
        } else { // Create an Id
          options.value.id = shared.id()
          object.content.push(options.value) // Add to the array
        }

      }

      localStorage.setItem(name, JSON.stringify(object, shared.json.stringify)) // Store as string
      callback() // Finished
    }
  } else {
  	return undefined
  }
}
