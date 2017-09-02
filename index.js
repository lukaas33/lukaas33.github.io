'use strict'

// Require
const express = require('express')
const helmet = require('helmet')
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

// Setup
app.set('port', process.env.PORT || 5000) // Chooses a port

app.use(helmet())
app.use(helmet.contentSecurityPolicy({ // Allowed sources
  directives: {
    // Setup for http headers
    defaultSrc: ["'self'", '*.googleapis.com'],
    frameSrc: ['*.google.com'],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdnjs.cloudflare.com', 'ajax.googleapis.com', 'cdn.ampproject.org'],
    styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com', '*.googleapis.com'],
    fontSrc: ["'self'", 'fonts.gstatic.com'],
    imgSrc: ["'self'"],
    objectSrc: ["'none'"]
  }
}))

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
      console.log('Form parse')
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
  }
  )
}

data.set = (entering) => {
  const open = function (name, callback) {
    filesystem.readFile(name, 'utf8', function (error, data) { // Open the files and store the content
      if (error) {
        console.log('File reading')
        throw error
      }
      // TODO Enter more data
      // TODO Make a way to enter data online

      let json = JSON.parse(data, function (key, value) { // Text to json
        if ((key === 'start' || key === 'end') && value !== null) {
          return new Date(value) // Date strings will be converted to dates
        } else {
          return value // Normal values
        }
      })

      callback(json.content) // Run function with object
    })
  }

  const upsert = function (document, collection, callback) {
    var query = {title: document.title} // Title is unique
    var current = data.database.collection(collection)
    current.updateOne(query, document, {upsert: true}, function (error, result) {
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
          upsert(object, file, () => {}) // Empty callback
        }
      })
    }
  } else { // Will enter new data

  }
}

data.get = function (collections, callback) {
  var result = {} // Will be filled
  for (let file of collections) { // Loop through collections needed
    let options = { // Sort options for each file
      'experience': {'date.start': 1, 'title': 1},
      'projects': {'date.end': -1, 'title': 1},
      'skills': {'title': 1}
    }

    var current = data.database.collection(file)
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
    response.render('index', {data: variables})
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
      response.status(404).send('The project does not exist') // The project doesn't exist
    }
  })
})

// Events
app.post('/send', function (request, response) { // Post request at send
  console.log('Post request from client at /send')
  send(request, response) // Email sender
})

app.listen(app.get('port'), () => console.log(`Node app is running at ${app.get('port')}`))

// Actions
mongoClient.connect(process.env.MONGODB_URI, function (error, database) { // Connects to database using env info
  if (error) {
    console.log('Database connect')
    throw error
  }
  data.database = database
  data.set() // Database sync without entering new data
  console.log('Database connection established')
})
