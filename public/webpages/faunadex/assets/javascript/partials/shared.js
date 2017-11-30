'use strict'
const shared = {} // No naming confict between files

// Uses getter and setters

shared.cookie = function (name, value) {
    var cookies = decodeURIComponent(document.cookie) // Removes the expires header

    if (cookies.length > 0) {
        cookies = cookies.split(';')
        console.log(`Got from cookies: ${cookies}`)

        if (typeof(value) === 'undefined') { // Getting
            console.log(`Will get cookie: ${name}`)
            object = undefined
            for (let cookie in cookies) {
                let item = cookie.trim()
                let cookieName = item.split('=')[0]
                if (name === cookieName) {
                    try {
                      object = JSON.parse(item)
                    } catch (error) {
                      object = item // Strings can't be parsed, are already ok
                    }
                }
            }
            return object
        } else { // Setting
            console.log(`Will set cookie: ${name} to ${value}`)
            document.cookie = ``
        }
    } else {
        return undefined
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
