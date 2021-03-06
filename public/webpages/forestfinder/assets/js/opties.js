// Events
document.querySelector("button[name=refresh]").addEventListener('click', (event) => {
  database.getOnline((data) => {
    document.querySelector("button[name=refresh]").disabled = true // Can't press twice
  })
})

document.querySelector("button[name=end]").addEventListener('click', (event) => {
  let prompt = "Weet je het zeker?\nJe kan geen bomen meer zoeken.\nJe voorgang blijft wel bewaard."
  if (window.confirm(prompt)) {
    database.startTime = (new Date()).getTime() - (database.duration * 1000) // Clock will be 0 (Automatic redirect via menu.js)
  }
})

document.querySelector("button[name=reset]").addEventListener('click', (event) => {
  this.disabled = true // No clicking twice
  let prompt = "Weet je het zeker?\nJe verliest al je voortgang in de app.\nZorg dat je je data hierboven downloadt."

  if (window.confirm(prompt)) {
    database.setStorage("ended", false)
    database.startTime = null

    database.setStorage("visited", [])
    database.setStorage("route", [])

    database.setStorage("gameProgress", null)
    database.setStorage("points", 0)

    if (confirm("Wil je ook je gebruikerdata verwijderen?")) {
      database.setStorage("userData", null)
    }

    location.href = '' // Redirect home
  }
})

// Not used anymore
// document.querySelector("button[name=mail]").addEventListener('click', (event) => {
//   this.disabled = true // No clicking twice
//   location.href = 'assets/elements/export.html?action=mail'
// })

  document.querySelector("button[name=save]").addEventListener('click', (event) => {
    this.disabled = true // No clicking twice
    location.href = 'assets/elements/export.html?action=save'
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

if (database.getStorage("ended") === true) { // Activated based on game ended
  document.querySelector("button[name=end]").disabled = true
  document.querySelector("button[name=save]").disabled = false
}
