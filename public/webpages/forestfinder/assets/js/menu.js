// TODO insert menu into pages
const menu = {
  nav: document.querySelector('nav'),
  open: document.querySelector('button[name=menu]'),
  links: null
}


menu.open.addEventListener('click', (event) => {
  menu.nav.style.display = 'inline-block'
})

// Earlier solution for navigation, not needed because of base tag in html
  // menu.links = document.querySelectorAll('nav a')
  // for (let link of menu.links) {
  //   link.addEventListener('click', (event) => {
  //     event.preventDefault() // No normal link behaviour
  //     for (let element of event.path) {
  //       if (element.localName === 'a') { // Found link element
  //         let url = element.attributes[0].baseURI
  //
  //         // Normalise path
  //         for (let pageName of ['herbarium', 'opties']) {
  //           url = url.split(pageName)[0]
  //         }
  //
  //         url = url + element.attributes[0].nodeValue
  //         window.location = url // Redirect
  //       }
  //     }
  //   })
  // }
