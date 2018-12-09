// Functionality for retrieving data from the online database
// Functions for local storage

// === Vars ===
const database = {
  link: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKWPQTIs8YZoVGNTRzE1iMiAmEWIsqs9xv0aBzTWIisn338KClhoAA0nuA4-8CS0b6CBjA433s2VIe/pub?gid=0&single=true&output=csv",
  name: "treeLocationData",
  getOnline (callback) {
    getCsv(this.link, (data) => { // Get via xhttp
      // Cache images for offline use
      this.checkCachedImages(data)

      this.locations = data // Store data
      callback(data) // Return the data
    })
  },
  get locations () { // Accessed via database.locations
    if (window.localStorage) {
      const stringData = localStorage.getItem(this.name)
      if (stringData === null) {
        return null
      } else {
        const data = JSON.parse(stringData) // decode
        return data
      }
    } else {

    }
  },
  set locations (jsonData) {
    const stringData = JSON.stringify(jsonData) // encode
    if (window.localStorage) {
      localStorage.setItem(this.name, stringData)
    } else {

    }
  },
  checkCachedImages (data) {
    for (let loc of data) {
      if (loc.image) { // Exists
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
