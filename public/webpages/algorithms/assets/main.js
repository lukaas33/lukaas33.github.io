// >> Variables
const doc = {
  menu: document.getElementById("menu"),
  main: document.getElementById("main")
}


// >> functions
// > Pure
const getData = function (path, callback) {
  const xmlhttp = new XMLHttpRequest()

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        callback(this.responseText)
    }
  }

  xmlhttp.open('GET', path, true)
  xmlhttp.send()
}

const webName = function (title) {
  title = title.toLowerCase().replace(/ /g, '-')
  title = encodeURIComponent(title) // Remove special symbols
  return title
}

// > Change doc
const loadProject = function (details) {
  console.log(details, "loading")
}

const addToMenu = function (names) {
  for (let object of names) {
    if (typeof(object) === 'string') {
      let name = object
      let list = document.createElement('li')
      let link = document.createElement('a')
      link.href = '#' + webName(name)
      link.textContent = name
      list.appendChild(link)
      doc.menu.appendChild(list) // Add to dom
    } else { // Array
      let sub = document.createElement('ol')
      for (let name of object) {
        let list = document.createElement('li')
        let link = document.createElement('a')
        link.href = '#' + webName(name)
        link.textContent = name
        list.appendChild(link)
        sub.appendChild(list) // Add to dom
      }
      doc.menu.appendChild(sub)
    }
  }
}


// >> Setup
getData("projects.json", (data) => {
  const projects = JSON.parse(data)['*'] // Assign

  const names = []
  for (let object of projects) {

    // Setup structure of the dom and start loading the projects into it
    if ("group" in object) { // Subgroup
      let container = document.createElement('div')
      container.id = webName(object.name)
      let header = document.createElement('h2')
      header.textContent = object.name
      container.appendChild(header)

      names.push(object.name)
      const subNames = []
      for (let project of object.group) {
        let section = document.createElement('section')
        section.id = webName(project.title)
        let header = document.createElement('h3')
        header.textContent = project.title
        section.appendChild(header)
        container.appendChild(section)

        subNames.push(project.title)

        loadProject(project) // Async loading
      }
      doc.main.appendChild(container)
      names.push(subNames)
    } else { // Normal project
      let project = object
      let section = document.createElement('section')
      section.id = webName(project.title)
      let header = document.createElement('h2')
      header.textContent = project.title
      section.appendChild(header)
      doc.main.appendChild(section)

      names.push(project.title)

      loadProject(project) // Async loading
    }
  }

  addToMenu(names) // Add all the names to the menu's
})
