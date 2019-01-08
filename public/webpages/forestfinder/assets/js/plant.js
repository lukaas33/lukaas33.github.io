// Functionality for displaying stored data
// Functionality for loading an overlay with more data

// Functions
const diplayCard = function (data) {
  const page = document.querySelector('main')
  const card = document.createElement('div')
  card.className += 'card'

  const img = document.createElement('img')
  img.src = data.image
  card.appendChild(img)

  const name = document.createElement('p')
  name.textContent = data.name
  card.appendChild(name)

  page.appendChild(card)
}

const plants = function () {
  const id = location.href.split('?id=')[1]
  const trees = database.locations

  if (id === undefined) { // Home
    for (let tree of trees) {
      if (!tree.double) {
        diplayCard(tree)
      }
    }
  } else { // Detail page

  }
}


// Run
plants()
