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
}

for (let script of document.getElementsByTagName('script')) {
  script.parentNode.removeChild(script)
}

const argument = location.href.split('?action=')[1]
if (argument === 'save') {
  saveToHtml()
} else if (argument === 'mail') {

}
