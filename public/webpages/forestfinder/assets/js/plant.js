// Functionality for displaying stored data
// Functionality for loading an overlay with more data

// Functions
const diplayCard = function (data) {
  const card = document.createElement('div')
  card.className += 'card'

  const link = document.createElement('a')
  link.href = `herbarium/?id=${data.location_id}`

  const img = document.createElement('img')
  img.src = data.image
  link.appendChild(img)

  const name = document.createElement('h3')
  name.textContent = data.name
  link.appendChild(name)

  card.appendChild(link)

  document.querySelector('main').appendChild(card)
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
    const trees = database.locations
    let data = null

    for (let tree of trees) {
      if (tree.location_id == id) {
        data = tree
      }
    }

    const page = document.createElement('div')

    const img = document.createElement('img')
    img.src = data.image
    page.appendChild(img)

    const name = document.createElement('h3')
    name.textContent = data.name
    page.appendChild(name)

    document.querySelector('main').appendChild(page)
  }
}


// Run
plants()
