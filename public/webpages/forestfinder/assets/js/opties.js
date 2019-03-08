// Events
document.querySelector("button[name=refresh]").addEventListener('click', (event) => {
  database.getOnline((data) => {
    console.log(data)
    document.querySelector("button[name=refresh]").disabled = true // Can't press twice
  })
})

document.querySelector("button[name=end]").addEventListener('click', (event) => {
  database.startTime = (new Date()).getTime() - (database.duration * 1000) // Clock will be 0
  // Automatic redirect via menu.js
})

document.querySelector("button[name=reset]").addEventListener('click', (event) => {
  this.disabled = true // No clicking twice

  database.setCookie("ended", false)
  database.startTime = null

  database.setCookie("visited", [])
  database.setCookie("route", [])

  database.setStorage("gameProgress", null)
  database.setStorage("points", 0)


  location.href = '' // Redirect home
})

document.querySelector("button[name=mail]").addEventListener('click', (event) => {
  this.disabled = true // No clicking twice

  location.href = 'assets/elements/export.html/?action=mail'
})

  document.querySelector("button[name=save]").addEventListener('click', (event) => {
    this.disabled = true // No clicking twice

    location.href = 'assets/elements/export.html/?action=save'
})

// Run
if (database.getStorage("userData")) {
  const data = database.getStorage("userData")
  const doc = document.getElementById('user-data')
  const text = document.createElement('p')
  text.textContent = `${data.class}, ${data.teacher}`
  doc.appendChild(text)

  const names = document.createElement('p')
  names.textContent = data.names.join(', ')

  doc.appendChild(names)
}

if (database.getCookie("ended") === true) { // Doesn't work if game already ended
  document.querySelector("button[name=end]").disabled = true
}
