// Events
document.querySelector("button[name=refresh]").addEventListener('click', (event) => {
  database.getOnline((data) => {
    console.log(data)
  })
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
