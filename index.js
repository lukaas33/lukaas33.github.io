'use strict'

// Require
const express = require('express')
// const helmet = require('helmet')
const filesystem = require('fs')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const compression = require('compression')
const minify = require('express-minify')
const marked = require('marked')

var mongoClient = require('mongodb')
var mailgun = require('mailgun-js')
const app = express()
const data = {files: ['experience', 'projects', 'skills']}

mongoClient = mongoClient.MongoClient
mailgun = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.DOMAIN}) // Gets mailgun data from env
var renderer = new marked.Renderer()
renderer.link = (href, title, text) => {
  // Adds target to external links, from https://github.com/chjj/marked/pull/451
  let external = /^https?:\/\/.+$/.test(href) // Is external
  var add = null
  if (external) {
    add = 'rel="noopener" target="_blank"' // To add
  }
  return `<a ${add} href="${href}">${text}</a>` // Edited url
}
marked.setOptions({renderer: renderer})

// Setup
app.set('port', process.env.PORT || 5000) // Chooses a port

// app.use(helmet())
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

app.use(compression({ threshold: 0 })) // Compression for static files
app.use(minify()) // Minifies code
app.use(bodyParser.json()) // Enable json parsing
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(`${__dirname}/public`, { maxage: '7d' })) // Serve static files
app.engine('html', require('ejs').renderFile) // No idea but it breaks without this line
app.set('views', `${__dirname}/views`)
app.set('view engine', 'ejs') // Use ejs for templating

// Functions
const send = function (request, response) {
  // Handles email form
  const form = new formidable.IncomingForm() // Object for handeling forms

  form.parse(request, function (error, fields, files) {
    if (error) {
      response.end('error') // Info for client
      console.log('orm parse')
      throw error
    }

    var mailOptions = {
      from: `'${fields.name}' <${fields.email}>`,
      to: `'Personal' <${process.env.EMAIL_CONTACT}>`,
      subject: '[SITE MESSAGE]',
      text: fields.message,
      html: fields.message
    }

    mailgun.messages().send(mailOptions, function (error, body) {
      if (error) {
        response.end('error') // Info for client
        console.log('Email send')
        throw error
      }
      console.log('Email was sent')
      response.end() // No errors occured
    })
  })
}

data.set = function (entering, complete = () => {}) {
  const open = function (name, callback = () => {}) {
    filesystem.readFile(name, 'utf8', function (error, data) { // Open the files and store the content
      if (error) {
        console.log('File reading')
        throw error
      }

      var json = JSON.parse(data, function (key, value) { // Text to json
        if ((key === 'start' || key === 'end') && value !== null) {
          return new Date(value) // Date strings will be converted to dates
        } else {
          return value // Normal values
        }
      })

      callback(json.content) // Run function with object
    })
  }

  const upsert = function (document, collection, callback = () => {}) {
    var query = {title: document.title} // Title is unique
    var current = data.database.collection(collection)
    current.updateOne(query, {$set: document}, {upsert: true}, function (error, result) {
      if (error) {
        console.log('Database entry')
        throw error
      }

      callback()
    })
  }

  if (typeof entering === 'undefined') { // Will check with the local data
    for (let file of data.files) {  // Loops through the files
      open(`data/${file}.json`, (objects) => { // Opens the file
        for (let object of objects) { // Loops through the objects
          upsert(object, file, () => {
            complete()
          }) // Empty callback
        }
      })
    }
  } else { // Will enter new data
    upsert(entering.data, entering.target, () => {
      complete() // Success
    })
  }
}

data.get = function (collections, callback = () => {}) {
  var result = {} // Will be filled
  for (let file of collections) { // Loop through collections needed
    let options = { // Sort options for each file
      'experience': {'date.start': 1, 'title': 1},
      'projects': {'date.end': -1, 'title': 1},
      'skills': {'title': 1}
    }

    let current = data.database.collection(file)
    current.find().sort(options[file]).toArray((error, results) => {
      if (error) {
        console.log('Getting data')
        throw error
      }

      result[file] = results
      result[file]['sort'] = options[file]

      if (Object.keys(result).length === collections.length) { // Data from all files is got
        callback(result)
      }
    })
  }
}

// Routes
app.get('/', function (request, response) {
  data.get(data.files, (variables) => {
    response.render('index', {data: variables, markdown: marked})
  })
})

app.get('/projects/:title', function (request, response) { // The title can be different
  var needed = 'projects'
  data.get([needed], (variables) => {
    var exists = false

    for (let project of variables[needed]) { // Existing projects
      // Standard webname convert
      let webtitle = project.title.toLowerCase()
      webtitle = webtitle.replace(/ /g, '-') // Whitespace will be replaced like in the url
      // Check name
      if (webtitle === request.params.title) {
        exists = true // Project exists
        response.render('project', {data: project, markdown: marked})
        break // Ends loop
      }
    }
    if (!exists) {
      response.status(404).end('The project does not exist') // The project doesn't exist
    }
  })
})

// Events
app.post('/send', function (request, response) { // Post request at send
  console.log('Post request from client at /send')
  send(request, response) // Email sender
})

app.post('/enter', function(request, response) {
  // Authenticate
  if (request.body.user === process.env.ADMIN_NAME && request.body.pass === process.env.ADMIN_PASS) {
    console.log('Enter:', request.body.data)
    try { // Detect errors
      data.set({target: request.body.target, data: request.body.data}, () => {
        response.end('Data entered') // Everything worked
      })
    } catch (error) {
      response.end(error)
    }
  } else {
    response.end('Invalid login')
  }
})

app.listen(app.get('port'), () => console.log(`Node app is running at ${app.get('port')}`))

// Actions
mongoClient.connect(process.env.MONGODB_URI, function (error, database) { // Connects to database using env info
  if (error) {
    console.log('Database connect')
    throw error
  }
  data.database = database.db(process.env.DB_NAME)
  data.set() // Database sync without entering new data
  console.log('Database connection established')
})
