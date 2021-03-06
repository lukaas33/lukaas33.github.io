// Functionality for retrieving data from the online database
// Functions for local storage

// === Vars ===
const database = {
  link: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKWPQTIs8YZoVGNTRzE1iMiAmEWIsqs9xv0aBzTWIisn338KClhoAA0nuA4-8CS0b6CBjA433s2VIe/pub?gid=0&single=true&output=tsv",
  // Locations in the local database
  get locations () { // Accessed via database.locations
    return this.getStorage("treeLocationData")
  },
  set locations (data) {
    this.setStorage("treeLocationData", data)
  },
  // The route progress
  get progress () { // Get all datapoints
    let progress = this.getStorage("gameProgress")
    if (progress === null) {
      progress = [] // Init as array
    }
    return progress
  },
  set progress (data) { // Add datapoint, will add (not overwrite) via database.prograss = {}
    let progress = this.progress
    progress.push(data) // Add to the array
    this.setStorage('gameProgress', progress)
  },
  get startTime () {
    let res = this.getStorage("startTime")
    return res
  },
  set startTime (time) {
    this.setStorage("startTime", time)
  },
  duration: 40 * 60,
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
    if (navigator.onLine) {
      getTsv(this.link, (data) => { // Get via xhttp
        // Cache images for offline use
        this.checkCachedImages(data)

        this.locations = data // Store data
        callback(data) // Return the data
      })
    } else {
      alert("Je hebt geen internet.\nData kan niet worden gedownload.")
    }
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
    const time = (5 * 24 * 60 * 60 * 1000) // x days
    const expire = new Date((new Date()).getTime() + time) // Won't expire when browser window closes
    document.cookie = `${name}=${stringValue}; path=${location.origin}; expires=${expire.toUTCString()};` // Add to cookies
  },
  // Cache functions
  checkCachedImages (data) {
    for (let loc of data) {
      if (loc.image) { // Exists in data
        this.cacheImage(loc.image)
      }
    }
  },
  cacheImage (url) {
    const img = new Image()
    img.src = url // Preload
  },
  cache (url) { // NOT USED, was used for caching images
    caches.open('cached').then((cache) => {
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
  // Sequence of unskippable questions
  const ask = function (question) {
    const pattern =/^[\u0080-\uFFFFa-z0-9, ]+$/i // Alphabet, number and extended latin (ü etc.)
    while (true) {
      let answer = prompt(question)

      if (answer.match(pattern)) {
        return answer
      } else {
        alert("Incorrecte invoer.\nGebruik alleen letters en getallen.")
      }
    }
  }

  let group = ask("Wie zitten er allemaal in je groepje?\nVul alle namen gescheiden door komma's in.")
  let names = group.split(',')
  names = names.map(x => x.trim()) // Remove whitespace
  let grade = ask("In welke klas zit je?")
  let teacher = ask("Welke docent heb je?")

  database.setStorage("userData", {
    names: names,
    "class": grade.trim(),
    teacher: teacher.trim()
  })

  while (!confirm(`Welkom bij Forestfinder.\nJe gaat op zoek naar een boom. Je krijgt een naam, afbeelding en de afstand. Ook heb je een kompas die aangeeft welke richting je op moet lopen.\nBij elke boom krijg je een quiz en moet je een foto maken. Hier krijg je punten voor.\nVeel succes.`)) {} // Display until true
  callback() // Continue executing code
}

// Convert the file to DataUrl for displaying
const fileToDataUrl = function (file, callback) {
  const reader = new FileReader()
  reader.addEventListener("load", function () {
    // Decrease image size (reduce quality)
    const img = new Image()

    img.onload = function () {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext('2d')

      let targetHeight = 500
      let targetWidth = Math.round(img.width * targetHeight / img.height)
      canvas.height = targetHeight
      canvas.width = targetWidth

      context.drawImage(img, 0, 0, targetWidth, targetHeight)

      // Compress base64 and return for storage
      let dataUrl = canvas.toDataURL('image/jpeg', 1.0)
      const res = LZString.compressToUTF16(dataUrl)
      callback(res)
    }

    img.src = this.result
  }, false)
  reader.readAsDataURL(file)
}

// Gets the target location from the spreadsheet
const getTsv = function (link, callback) {
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () { // When data returns
    if (this.readyState === 4 && this.status === 200) {

      // Convert csv to js object
      const lines = this.responseText.split('\r') // Linebreak
      const names = lines[0].split('\t') // Tab
      const data = []

      for (let i = 1; i < lines.length; i++) {
        let line = lines[i].split('\t')
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
  xhttp.setRequestHeader('Cache-Control', 'no-cache')
  xhttp.send()
}
