document.querySelector("button[name=refresh]").addEventListener('click', (event) => {
  database.getOnline((data) => {
    console.log(data)
  })
})
