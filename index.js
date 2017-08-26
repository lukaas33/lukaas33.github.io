'use strict'

// Require
const express = require('express')
const helmet = require('helmet')
const filesystem = require('fs')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const compression = require('compression')
const minify = require('express-minify')

var mongoClient = require('mongodb')
var mailgun = require('mailgun-js')
const app = express()
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
app.engine('html', require('ejs').renderFile)
app.set('views', `${__dirname}/views`)
app.set('view engine', 'ejs')

// Routes
app.get('/', function (request, response) {
  response.render('index')
})

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

    let mailOptions = {
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

const data = function (entering) {
  mongoClient.connect(process.env.MONGODB_URI, function (error, database) { // Connects to database using env info
    const open = function (name, callback) {
      filesystem.readFile(name, 'utf8', function (error, data) { // Open the files and store the content
        if (error) {
          console.log('File reading')
          throw error
        }

        let json = JSON.parse(data, function (key, value) { // Text to json
          if ((key === 'date_start' || key === 'date_end') && value !== null) {
            return new Date(value) // Date strings will be converted to dates
          } else {
            return value // Normal values
          }
        })

        return callback(json.content) // Run function with object
      })
    }

    const insert = function (document, collection, callback) {
      database.collection(collection).update(document, document, {upsert: true}, function (error, result) {
        if (error) {
          console.log('Database entry')
          throw error
        }
        callback()
      })
    }

    if (error) {
      console.log('Database connect')
      throw error
    }

    console.log('Database connection established')
    if (typeof entering === 'undefined') { // Will check with the local data
      let files = ['experience', 'projects', 'skills']

      files.forEach((file) => { // Loops through the files
        open(`data/${file}.json`, (objects) => { // Opens the file
          objects.forEach((object) => { // Loops through the objects
            insert(object, file, () => { database.close() }) // Closes database
          })
        })
      })
    } else { // Will enter new data

    }
  })
}

// Events
app.post('/send', function (request, response) { // Post request at send
  console.log('Post request from client at /send')
  send(request, response) // Email sender
})

app.post('/auth', function (request, response) { // Admin authenticate
  console.log('Post request from client at /auth')
  if (process.env.ADMIN_PASS === request.body.pass) { // Password entered is correct
    response.end('success')
  } else {
    response.end('fail')
  }
})

app.listen(app.get('port'), () => console.log(`Node app is running at ${app.get('port')}`))

// Actions
data() // Database sync without entering new data
