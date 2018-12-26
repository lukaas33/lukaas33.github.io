// Functionality for retrieving data from the online database
// Functions for local storage

// === Vars ===
const database = {
  link: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKWPQTIs8YZoVGNTRzE1iMiAmEWIsqs9xv0aBzTWIisn338KClhoAA0nuA4-8CS0b6CBjA433s2VIe/pub?gid=0&single=true&output=csv",
  // Locations in the local database
  get locations () { // Accessed via database.locations
    return this.getStorage("treeLocationData")
  },
  set locations (data) {
    this.setStorage("treeLocationData", data)
  },
  // The route progress
  get progress () { // Get all datapoints
    let progess = this.getStorage("gameProgress")
    if (progess === null) {
      progress = [] // Init as array
    }
    return progress
  },
  set progress (data) { // Add datapoint, will add (not overwrite) via database.prograss = {}
    let progress = this.progress
    progress.push(data) // Add to the array
    this.setStorage('gameProgress', progress)
  },
  getUserData (callback) {
    let data = this.getStorage("userData")
    if (data === null) {
      promptUserData(callback)
    } else {
      callback(data)
    }
  },
  // Get the data online and save it
  getOnline (callback) {
    getCsv(this.link, (data) => { // Get via xhttp
      // Cache images for offline use
      this.checkCachedImages(data)

      this.locations = data // Store data
      callback(data) // Return the data
    })
  },
  // Local storage functions
  getStorage (name) {
    if (window.localStorage) {
      const stringData = localStorage.getItem(name)
      if (stringData === null) { // Avoid trying to parse null
        return null
      } else {
        const data = JSON.parse(stringData) // decode
        return data
      }
    } else {

    }
  },
  setStorage (name, jsonData) {
    const stringData = JSON.stringify(jsonData) // encode
    if (window.localStorage) {
      localStorage.setItem(name, stringData)
    } else {

    }
  },
  // Cookie functions
  getCookie (name) {
    const cookies = document.cookie.split(';') // Split all cookies
    for (let cookie of cookies) {
      let keyVal = cookie.trim().split('=') // Seperate key from value
      if (name === keyVal[0]) {
        let value = JSON.parse(keyVal[1]) // String to js datatypes
        return value
      }
    }

  },
  setCookie (name, value) {
    // TODO secure option + possible expiration
    const stringValue = JSON.stringify(value) // Convert to string
    const expire = new Date((new Date()).getTime() + (1 * 24 * 60 * 60 * 1000)) // Won't expire when browser window closes
    document.cookie = `${name}=${stringValue}; path=/webpages/forestfinder; expires=${expire.toUTCString()}` // Add to cookies
  },
  // Cache functions
  checkCachedImages (data) { // TODO check if cached before caching
    for (let loc of data) {
      if (loc.image) { // Exists in data
        this.cacheImage(loc.image)
      }
    }
  },
  cacheImage (url) {
    caches.open('cached-images').then((cache) => {
      // Caches image after getting from url
      let request = new Request(url, {mode: 'no-cors'}) // opague resonse will be stored
      fetch(request).then((response) => {
        return cache.put(request, response)
      })
    })
  }
}

// === Functions ===
// Asks the user for data
const promptUserData = function (callback) {
  const ask = function (question) {
    let answer = prompt(question)
    while (!answer) { // Empty answers ('', null, 0) not valid, repeat until valid
       answer = prompt(question)
    }
    return answer
  }

  // Sequence of unskippable questions
  let group = ask("Wie zitten er allemaal in je groepje?\nVul alle namen gescheiden door komma's in.")
  let names = group.split(',')
  names = names.map(x => trim(x)) // Remove whitespace
  let grade = ask("In welke klas zit je?")
  let teacher = ask("Welke docent heb je?")

  database.setStorage("userData", {
    names: names,
    "class": grade,
    teacher: teacher
  })

  while (!confirm("Klik op 'ok' als je klaar bent om te beginnen.")) {} // Display until true
  callback() // Continue executing code
}

// Gets the target location from the spreadsheet
const getCsv = function (link, callback) {
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () { // When data returns
    if (this.readyState === 4 && this.status === 200) {

      // Convert csv to js object
      const lines = this.responseText.split('\r')
      const names = lines[0].split(',')
      const data = []

      for (let i = 1; i < lines.length; i++) {
        let line = lines[i].split(',')
        let object = {}
        for (let j in line) {
          let val = line[j]
          // Convert to numbers if possible
          if (!isNaN(parseFloat(val))) {
            val = parseFloat(val)
          }
          // Convert sheets format of TRUE and False
          if (val === "TRUE") {
            val = true
          } else if (val === "FALSE") {
            val = false
          }
          if (val === "") {
            val = null
          }
          object[names[j]] = val
        }

        data.push(object)
      }

      callback(data) // Async return
    }
  }
  xhttp.open("GET", link, true) // Async get request
  xhttp.send()
}
