// >> Variables
const image = document.getElementById('image')
const source = document.getElementById('source')

const next = document.getElementById('next')


// >> Functions
// Get a new image
const getImage = function () {
  const url = generateQuery('jungle')
  editCookie('images', url)
  ajax(url)
}

// Query url
const generateQuery = function (query) {
  const baseUrl = 'https://www.googleapis.com/customsearch/v1?'
  const key = 'AIzaSyDBvJJwZ45Qs8WEOg5CEZ0l8GYChqUS3CE'
  const searchId = '011138358794174578058:h8onfy4r7c4'
  // const searchId = '017576662512468239146:omuauf_lfve'
  const url = `${baseUrl}key=${key}&cx=${searchId}&q=${query}&prettyPrint=false&fields=items&searchType=image`
  console.log(url)
  return url
}

const editCookie = function (name, value = null) {
  const cookies = document.cookie.split(';')
  let cookie = null
  for (let ckie of cookies) { // Search
    ckie = ckie.split('=')
    if (ckie[0] === name) { // Found
      try {
        cookie = JSON.parse(ckie[1])
      } catch (error) {
        // Normal string value
        cookie = ckie[1]
      }
    }
  }

  if (value === null) { // None given
    if (cookie === null) { // None found
      return undefined // End empty return
    } else { // Found
      return cookie
    }
  } else {
    if (cookie === null) { // New
      document.cookie = `${name}=${value}; path=/;`
      console.log('Assign', value)
    } else { // Add to old
      cookie.push(value) // Assumes array
      document.cookie = `${name}=${JSON.stringify(cookie)}; path=/;`
      console.log('Assign', cookie)
    }
  }
}

// Send request to api
const ajax = function (url) {
  const xhttp = new XMLHttpRequest()

  xhttp.onreadystatechange = function() { // Done
    if (this.readyState == 4 && this.status == 200) {
      display(JSON.parse(this.responseText)) // Display response
    }
  }
  xhttp.open('GET', url, true)
  xhttp.send()
}

// Display in screen
const display = function (data) {
  console.log(data)
  const item = data.items[0]

  const img = new Image()
  img.src = item.link // Load from site
  img.onload = () => {
    image.src = item.link // Load in body
    image.style.display = 'block'
    image.setAttribute('alt', item.title)
  }

  source.textContent = item.title
  source.href = item.image.contextLink // Link to source
}


// >> Events
window.onload = function () {
  if (editCookie('images') === undefined) {
    editCookie('images', []) // initial
  }
  getImage()
}

next.addEventListener('click', (event) => {
  getImage()
})
