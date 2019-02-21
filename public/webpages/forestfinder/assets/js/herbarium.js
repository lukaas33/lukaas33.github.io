// Functionality for displaying stored data
// Functionality for loading an overlay with more data

// Functions
const herbarium = {
  filter (trees, visited) { // Filter out some
    const sorted = []

    if (trees) {
      if (database.getCookie("ended") === true) {
        // Display all
        for (let tree of trees) {
          if (!tree.double) { // Found the correct one
            sorted.push(tree)
          }
        }
      } else {
        // Filter the ones reached
        for (let point of visited) {
          for (let tree of trees) {
            if (!tree.double && tree.tree_id === point.tree) { // Found the correct one
              sorted.push(tree)
            }
          }
        }
      }
    }

    // Sort by increasing age
    sorted.sort((a, b) => {
      if (a.time > b.time) {
        return 1
      }
      if (a.time < b.time) {
        return -1
      }
      return 0
    })
    sorted.reverse()

    return sorted
  },
  plants () { // Display all plants
    const id = location.href.split('?id=')[1]

    if (database.progress.length > 0) { // Not empty
      if (id === undefined) { // Home
        const page = document.createElement('div')
        page.id = "overview-page"
        document.querySelector('main').appendChild(page)

        const trees = this.filter(database.locations, database.progress)

        document.querySelector('#num').textContent = trees.length
        document.querySelector('.tag').style.opacity = 1 // Display

        for (let tree of trees) {
          this.diplayCard(tree)
        }
      } else { // Detail page
        const trees = database.locations

        for (let tree of trees) {
          if (tree.location_id == id) {
            this.displayPage(tree)
          }
        }
      }
    } else { // No progress
      if (id === undefined) { // Home
        const text = document.createElement('div')
        text.textContent = "Je hebt nog geen bomen gevonden"
        document.querySelector('main').appendChild(text)
      } else { // Detail page
        const text = document.createElement('div')
        text.textContent = "Je hebt deze boom nog niet gevonden"
        document.querySelector('main').appendChild(text)
      }
    }
  },
  recents () {
    const trees = this.filter(database.locations, database.progress)
    const n = 3
    const recent = trees.slice(0, n) // n most recent

    for (let tree of recent) {
      this.diplayCard(tree)
    }

  },
  displayPage (data) {
    const page = document.createElement('div')
    page.id = "detail-page"

    const elements = {}

    elements.img = document.createElement('div')
    elements.img.id = 'img'
    const img = document.createElement('img')
    img.src = data.image
    elements.img.appendChild(img)

    elements.description = document.createElement('div')
    elements.description.classList += "card"

    const title = document.createElement('h3')
    title.textContent = data.name
    elements.description.appendChild(title)

    const sub = document.createElement('h6')
    sub.textContent = `Boom #${data.tree_id}`
    elements.description.appendChild(sub)

    const sci = document.createElement('h5')
    sci.textContent = data.sci_name
    elements.description.appendChild(sci)

    elements.description.appendChild(document.createElement('br'))
    const des = document.createElement('p')
    des.textContent = data.description
    elements.description.appendChild(des)

    elements.sep1 = document.createElement('hr')

    if (database.progress) {
      elements.res = document.createElement('h4')
      elements.res.textContent = "Jouw resultaten"
      for (let point of database.progress) {
        let i = 0
        if (point.tree === data.tree_id) {
          i += 1
          const info = document.createElement('div')
          info.classList += "card"

          const dateBox = document.createElement('div')
          dateBox.classList += 'date'
          const dateIcon = document.createElement('img')
          dateIcon.src = "assets/images/date.svg"
          dateBox.appendChild(dateIcon)

          const date = document.createElement('p')
          date.textContent = (new Date(point.time)).toString()
          dateBox.appendChild(date)
          info.appendChild(dateBox)

          const scoreBox = document.createElement('div')
          scoreBox.classList += 'score'
          const scoreIcon = document.createElement('img')
          scoreIcon.src = "assets/images/score.svg"
          scoreBox.appendChild(scoreIcon)

          const progress = document.createElement('progress')
          progress.max = quiz.question_names.length
          progress.value = 0

          // Table uses a lot of nested elements so I am using a different way of html insertion here
          const table = document.createElement('table')
          let content = `<tr><th>Vraag</th><th>Antwoord</th><th>Correct</th></tr>` // Header row

          for (let question in point.questions) { // Properties
            let text = quiz.questions[question]
            let user = point.questions[question].user

            let answer = point.questions[question].answer
            let correct = ''
            if (user.toLowerCase() !== answer.toLowerCase()) { // Wrong
              correct = answer
              user = `<s>${user}<s/>` // Strikethrough
            } else { // Correct
              progress.value += 1
            }
            content += `<tr><td>${text}</td><td>${user}</td><td>${correct}</td></tr>` // Add to string
          }

          progress.textContent = `${progress.value}/${progress.max}`
          scoreBox.appendChild(progress)
          info.appendChild(scoreBox)

          table.innerHTML = content
          info.appendChild(table)

          elements[`res${i}`] = info
        }
      }
      elements.sep2 = document.createElement('hr')
    }

    elements.header = document.createElement('h4')
    elements.header.textContent = "Meer info"

    elements.info = document.createElement('div')
    elements.info.classList += "card"

    const map = document.createElement('a')
    map.href = `https://www.google.com/maps/?q=${data.latitude},${data.longitude}`
    map.textContent = `Locatie op de kaart`
    elements.info.appendChild(map)

    const urls = data.link.split(',')
    for (let url of urls) {
      let link = document.createElement('a')
      link.href = url
      link.textContent = url
      elements.info.appendChild(link)
    }

    for (let element in elements) { // Add all to page
      page.appendChild(elements[element])
    }

    document.querySelector('main').appendChild(page)
  },
  diplayCard (data) {
    const card = document.createElement('div')
    card.className += 'card'

    const link = document.createElement('a')
    link.href = `herbarium/?id=${data.location_id}` // To unique page

    const img = document.createElement('img')
    img.src = data.image
    link.appendChild(img)

    const name = document.createElement('h3')
    name.textContent = data.name
    const box = document.createElement('div')
    box.appendChild(name)
    link.appendChild(box)

    card.appendChild(link)

    document.querySelector('#overview-page').appendChild(card)
  }
}


// Run
if (location.href.indexOf('herbarium') === -1) { // At home
  herbarium.recents()
} else {
  herbarium.plants()
}
