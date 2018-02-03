'use strict'

// << Variables >>
// Require
const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const compression = require('compression')
const minify = require('express-minify')
const marked = require('marked')
const wildcard = require('wildcard-subdomains')

const data = require('./modules/data')
const mail = require('./modules/mail')
const enter = require('./modules/enter')

const app = express()


// << Setup >>
const renderer = new marked.Renderer()
renderer.link = (href, title, text) => {
  // Adds target to external links, from https://github.com/chjj/marked/pull/451
  let external = /^https?:\/\/.+$/.test(href) // Is external
  let add = external ? 'rel="noopener" target="_blank"' : null
  return `<a ${add} href="${href}">${text}</a>` // Edited url
}
marked.setOptions({renderer: renderer})

app.set('port', process.env.PORT || 5000) // Chooses a port

app.use(helmet())
// app.use(helmet.contentSecurityPolicy({ // Allowed sources
//   directives: {
//     // Setup for http headers
//     defaultSrc: ["'self'", '*.googleapis.com'],
//     frameSrc: ['*.google.com'],
//     scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'ajax.cloudflare.com', 'cdnjs.cloudflare.com', 'ajax.googleapis.com', 'cdn.ampproject.org'],
//     styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com', '*.googleapis.com'],
//     fontSrc: ["'self'", 'fonts.gstatic.com'],
//     imgSrc: ["'self'", 'data'],
//     objectSrc: ["'self'"]
//   }
// }))

app.use(compression({threshold: 0})) // Compression for static files
app.use(minify()) // Minifies code
app.use(bodyParser.json({limit: '50mb'})) // Enable json parsing of requests
app.use(bodyParser.urlencoded({extended: true}))

app.all(/.*/, function (request, response, next) { // Top layer redirect
  const host = request.get('host')
  if (host.indexOf('lucas-resume.herokuapp.com') === -1) { // redirect away from
    next() // No problem
  } else {
    response.redirect(301, process.env.DOMAIN + request.path)
  }
})

app.use(wildcard({ // Webpages get their own domain
  namespace: 'webpages',
  whitelist: ['www']
}))

app.use(express.static(`${__dirname}/public`, {maxage: '7d'})) // Serve static files

app.engine('html', require('ejs').renderFile) // No idea what it does but everything breaks without this line
app.set('views', `${__dirname}/views`)
app.set('view engine', 'ejs') // Use ejs for templating


// << Routes >>
app.get('/', function (request, response, next) { // Home
  data.get(data.files, (variables) => {
    response.status(200).render('index', {data: variables, markdown: marked})
  })
})

app.get('/projects', function (request, response, next) { // Base folder
  response.redirect(302, process.env.DOMAIN + '/#portfolio')
})

app.get('/projects/:title', function (request, response, next) { // The title can be different
  let needed = 'projects'
  data.get([needed], (variables) => {
    let exists = false

    for (let project of variables[needed]) { // Existing projects
      // Standard webname convert
      let webtitle = project.title.toLowerCase()
      webtitle = webtitle.replace(/ /g, '-') // Whitespace will be replaced in the url
      // Check name
      if (webtitle === request.params.title) {
        exists = true // Project exists
        response.status(200).render('project', {data: project, markdown: marked})
        break // Ends loop
      }
    }
    if (!exists) {
      // The project doesn't exist
      const error = new Error("This project doesn't exist")
      error.status(404)
      next(error)
    }
  })
})

app.get('/webpages', function (request, response, next) { // Base folder
  response.redirect(302, process.env.DOMAIN + '/#portfolio') // TODO only show webpages
})

app.get('/webpages/:name', function (request, response, next) { // Subdomain name.example.com, handles if folder doesn't exist
 switch (request.params.name) {
   case 'webpages':
   case 'web': // TODO only show webpages
   case 'portfolio':
   case 'projects': // TODO different oucome
     response.redirect(301, process.env.DOMAIN + '/#portfolio')
     break
   case 'mail': // TODO different outcome
   case 'contact':
     response.redirect(301, process.env.DOMAIN + '/#contact')
     break
   default:
    // No response or redirect
    const error = new Error("This page doesn't exist")
    error.status(404)
    next(error)
  }
})

app.post('/send', mail.sendForm)

app.post('/enter', enter.entry)

// Error handle
app.use((error, request, response) => {
  if (!error.status) {
    error.status = 500
  }
  console.error(error)
  if (error.status === 404) {
    response.status(error.status).render('error', {error: error})
  } else {
    response.send(error)
  }
  response.end()
})

app.listen(app.get('port'), () => console.log(`Node app is running at ${app.get('port')}`))
