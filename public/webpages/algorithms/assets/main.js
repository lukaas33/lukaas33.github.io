// >> Variables
const doc = {
  body: document.getElementsByTagName("body")[0],
  menu: document.getElementById("menu"),
  main: document.getElementById("main")
}

const converter = new showdown.Converter({
  simplifiedAutoLink: true,
  excludeTrailingPunctuationFromURLs: true,
})

// >> functions
// > Pure
const getData = function (path, callback) {
  const xmlhttp = new XMLHttpRequest()

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        callback(this.responseText) // File content as text
    }
  }

  xmlhttp.open('GET', path, true)
  xmlhttp.send()
}

const webName = function (title) {
  // https://stackoverflow.com/questions/11652681/replacing-umlauts-in-js
  title = title.toLowerCase()
  title = title.replace(/ï/g, 'i')
  title = title.replace(/ä/g, 'ae')
  title = title.replace(/ö/g, 'oe')
  title = title.replace(/ü/g, 'ue')
  title = title.replace(/ß/g, 'ss')
  title = title.replace(/ /g, '-')
  title = title.replace(/\./g, '')
  title = title.replace(/,/g, '')
  title = title.replace(/\(/g, '')
  title = title.replace(/\)/g, '')
  return title
}

// > Change doc
const loadProject = function (details) {
  let path = []

  if (details.iframe) { // Add an iframe
    path[0] = `data/${webName(details.title)}/main.${details.exe}`
    path[1] = `data/${webName(details.title)}/text.${details.text}`
    path[2] = `data/${webName(details.title)}/index.html`
  } else {
    path[0] = `data/${webName(details.title)}.${details.exe}`
    path[1] = `data/${webName(details.title)}.${details.text}`
  }
  console.log(path)

  getData(path[0], (data) => {
    const dom = document.getElementById(webName(details.title))
    const box = document.createElement('div')
    const container = document.createElement('pre')
    const code = document.createElement('code')

    code.textContent = data
    code.classList.add(details.exe)
    hljs.highlightBlock(code) // Add syntax highlighting

    container.appendChild(code)
    box.appendChild(container)

    if (details.text == 'pdf') {
      const embed = document.createElement('embed')
      embed.type = 'application/pdf'
      embed.src = path[1]
      box.appendChild(embed)
      dom.appendChild(box)
    } else {
      getData(path[1], (data) => {
        const dom = document.getElementById(webName(details.title))
        const descr = document.createElement('div')

        if (details.text === 'txt') {
          descr.textContent = data
        } else if (details.text === 'html') {
          descr.innerHTML = data
        } else if (details.text === 'md') {
        	const html = converter.makeHtml(data)
          descr.innerHTML = html
        }

        box.appendChild(descr)
        dom.appendChild(box)

        if (path[2]) {
          const iframe = document.createElement('iframe')
          iframe.src = path[2]
          dom.appendChild(document.createElement('br'))
          dom.appendChild(iframe)
          iframe.height = Math.floor((iframe.offsetWidth / 16) * 9) // 16:9
        }
      })
    }

  })
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
