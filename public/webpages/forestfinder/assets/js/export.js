// Save the current page as html
const saveToHtml = function () {
  const content = [document.querySelector('html').innerHTML]
  const file = new Blob(content, {type: "text/html"}) // JS file object
  const link = document.createElement('a')
  database.getUserData((data) => {
    link.href = URL.createObjectURL(file) // Save to Url
    link.download = `forestfinder-${data.names}-${data.class}-${data.teacher}.html` // File name
    link.hidden = true // Not visible
    document.body.appendChild(link) // Needs to be in the DOM
    link.innerHTML = 'Download'
    link.click() // Start download
    history.back() // Back to last page
  })
}

// Not using anymore
const mailAsHtml = function () {
  const content = document.querySelector('html').innerHTML
  database.getUserData((data) => {
    // Using mailto link
    subject = `ForestFinder: ${data.class} - ${data.names}`
    link = `mailto:${data.teacher}@lcl.nl?subject=${subject}&body=${encodeURIComponent(content)}`
    window.open(link)
  })}

// Make the file without dependencies
const removeDep = function (callback) {
  // Remove images
  const logos = document.querySelectorAll(".date img, .score img")
  for (let logo of logos) {
    logo.parentNode.removeChild(logo)
  }

  // Move css inline
  const css = document.getElementsByTagName("link")
  for (let i = 0; i < css.length; i++) {
    console.log(css[i])
    let style = document.createElement("style")
    style.media = "print,screen"
    // Get the css code
    let xml = new XMLHttpRequest()
    xml.open('GET', css[i].href)
    xml.onreadystatechange = function () {
      // Enter inline
      if (this.readyState === 4) {
        style.textContent = xml.responseText
        document.body.appendChild(style)

        if (i === css.length - 1) {
          callback()
        }
      }
    }
    xml.send()
  }

  // Remove text of links
  const links = document.getElementsByTagName('a')
  for (let link of links) {
      link.textContent = `${link.textContent}: ${link.href}`
  }
}

// Run
removeDep(() => {
  const head = document.querySelector('head')
  // Remove all javascript and style elements
  head.innerHTML = `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=0">`

  const argument = location.href.split('?action=')[1]
  if (argument === 'save') {
    saveToHtml()
  } else if (argument === 'mail') {
    // Option disabled
    mailAsHtml()
  }
})
