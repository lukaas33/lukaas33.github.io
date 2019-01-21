// Functionality for displaying stored data
// Functionality for loading an overlay with more data

// Functions
const diplayCard = function (data) {
  const card = document.createElement('div')
  card.className += 'card'

  const link = document.createElement('a')
  link.href = `herbarium/?id=${data.location_id}` // To unique page

  const img = document.createElement('img')
  img.src = data.image
  link.appendChild(img)

  const name = document.createElement('h3')
  name.textContent = data.name
  link.appendChild(name)

  card.appendChild(link)

  document.querySelector('#overview-page').appendChild(card)
}

const displayPage = function (data) {
  const page = document.createElement('div')
  page.id = "detail-page"

  const elements = {}

  elements.img = document.createElement('img')
  elements.img.src = data.image

  elements.title = document.createElement('h3')
  elements.title.textContent = data.name
  elements.sub = document.createElement('h5')
  elements.sub.textContent = `Boom #${data.tree_id}`

  elements.br1 = document.createElement('br')
  elements.des = document.createElement('p')
  elements.des.textContent = data.description

  elements.sep1 = document.createElement('hr')

  if (database.progress) {
    elements.res = document.createElement('h4')
    elements.res.textContent = "Jouw resultaten"
    for (let point of database.progress) {
      let i = 0
      if (point.tree === data.tree_id) {
        i += 1
        const info = document.createElement('div')

        const name = document.createElement('h5')
        name.textContent = `Ontmoeting ${i}`
        info.appendChild(name)

        const date = document.createElement('p')
        date.textContent = (new Date(point.time)).toString()
        info.appendChild(date)

        // TODO add quiz results

        elements[`res${i}`] = info
      }
    }
    elements.sep2 = document.createElement('hr')
  }

  elements.info = document.createElement('h4')
  elements.info.textContent = "Meer info"

  const wiki = document.createElement('a')
  wiki.href = data.link
  wiki.textContent = `Wikipedia: ${data.name}`
  elements.wiki = document.createElement('p')
  elements.wiki.appendChild(wiki)

  const map = document.createElement('a')
  map.href = `https://www.google.com/maps/?q=${data.latitude},${data.longitude}`
  map.textContent = `Kaart`
  elements.map = document.createElement('p')
  elements.map.appendChild(map)

  for (let element in elements) { // Add all to page
    page.appendChild(elements[element])
  }

  document.querySelector('main').appendChild(page)
}

const plants = function () {
  const id = location.href.split('?id=')[1]
  const trees = database.locations

  if (id === undefined) { // Home

    const page = document.createElement('div')
    page.id = "overview-page"
    document.querySelector('main').appendChild(page)

    for (let tree of trees) {
      if (!tree.double) {
        diplayCard(tree)
      }
    }
  } else { // Detail page
    const trees = database.locations

    for (let tree of trees) {
      if (tree.location_id == id) {
        displayPage(tree)
      }
    }
  }
}


// Run
plants()
