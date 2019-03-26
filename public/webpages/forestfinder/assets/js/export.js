const saveToHtml = function () {
  const content = [document.querySelector('html').innerHTML]
  const file = new Blob(content, {type: "text/html"}) // JS file object
  const link = document.createElement('a')
  link.href = URL.createObjectURL(file) // Save to Url
  link.download = "forestfinder-export.html" // File name
  link.hidden = true // Not visible
  document.body.appendChild(link) // Needs to be in the DOM
  link.innerHTML = 'Download'
  link.click() // Start download
  // history.back() // Back to last page
}

const removeDep = function (callback) {
  // Make the site without dependencies
  const links = document.getElementsByTagName("link")
  for (let i = 0; i < links.length; i++) {
    let style = document.createElement("style")
    style.media = "print,screen"
    // Get the css code
    let xml = new XMLHttpRequest()
    xml.open('GET', links[i].href)
    xml.onreadystatechange = function () {
      // Enter inline
      if (this.readyState === 4) {
        style.textContent = xml.responseText
        document.body.appendChild(style)

        if (i === links.length - 1) {
          callback()
        }
      }
    }
    xml.send()
  }
}

// Run
removeDep(() => {
  const head = document.querySelector('head')
  head.innerHTML = `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=0">`

  const argument = location.href.split('?action=')[1]
  if (argument === 'save') {
    saveToHtml()
  } else if (argument === 'mail') {

  }
})
