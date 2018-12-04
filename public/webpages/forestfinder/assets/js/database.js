// Functionality for retrieving data from the online database
// Functions for local storage
const database = {
  link: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKWPQTIs8YZoVGNTRzE1iMiAmEWIsqs9xv0aBzTWIisn338KClhoAA0nuA4-8CS0b6CBjA433s2VIe/pub?gid=0&single=true&output=csv",
  name: "treeLocationData",
  getOnline: function (callback) {
    getCsv(this.link, (data) => { // Get via xhttp
      this.data = data // Store data
      callback(data) // Return the data
    })
  },
  get data () { // Accessed via database.data
    if (window.localStorage) {
      const stringData = localStorage.getItem(this.name)
      const data = JSON.parse(stringData)
      return data
    } else {

    }
  },
  set data (jsonData) {
    const stringData = JSON.stringify(jsonData)
    if (window.localStorage) {
      localStorage.setItem(this.name, stringData)
    } else {

    }
  }
}

// Gets the target locations
const getCsv = function (link, callback) {
  if (navigator.onLine) { // Internet connection
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () { // When data returns
      if (this.readyState === 4 && this.status === 200) {
        console.log("Text:", this.responseText)

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
  } else {
    alert(`
      Can't connect to the database.
      Please connect to the internet and try again.
    `)
  }
}
