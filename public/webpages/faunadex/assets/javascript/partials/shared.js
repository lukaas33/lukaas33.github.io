'use strict'
const shared = {} // No naming confict between files

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
            object = JSON.parse(cookie.split('=')[1])
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

shared.storage = function (name, options = null) {
  var item = localStorage.getItem(name)
  if (item !== null) {
    console.log(`Got from storage: ${item}`)
    // Convert string back to object
    var object = null
    try {
      object = JSON.parse(item)
    } catch (error) {
      // Can't be parsed because it is an object
      object = item
    }
    for (let index in object.content) { // All objects in the array
      try {
        object.content[index] = JSON.parse(object.content[index]) // String to object
      }
      catch (error) {
        // Can't be parsed, leave it as it is
      }
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

      if (options === null || typeof(options.id) === 'undefined') { // Not editing
        object.content.push(JSON.stringify(options.value)) // Add to the array
      } else { // Editing
        for (let index in object.content) {
          let entry = object.content[index]
          if (entry.id === options.id) {
            object.content[index] = JSON.stringify(options.value) // Update
          }
        }
      }

      localStorage.setItem(name, JSON.stringify(object)) // Store as string
    }
  } else {
    	return undefined
  }


}
