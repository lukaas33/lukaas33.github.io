const menu = {
  nav: document.querySelector('nav'),
  open: document.querySelector('button[name=menu]'),
  insert () {
    // Insert menu in page
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          menu.nav.innerHTML = this.responseText // Include in html
        }
      }
    }
    xhttp.open("GET", 'assets/elements/menu.html', true)
    xhttp.send()
  }
}

// Run
menu.insert()

// Events
menu.open.addEventListener('click', (event) => {
  menu.nav.style.display = 'inline-block'
})
