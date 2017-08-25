'use strict'

// Require
const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const compression = require('compression')
const minify = require('express-minify')

var mongoClient = require('mongodb')
var mailgun = require('mailgun-js')

// Variables
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

mongoClient.connect(process.env.MONGODB_URI, function (error, database) { // Connects to database with env info
  if (error) {
    console.log('Database connect', error)
  } else {
    console.log('Database connection established')
  }
  database.close()
})

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
      console.log('Form parse:', error)
      response.end('error') // Info for client
    } else {
      let mailOptions = {
        from: `'${fields.name}' <${fields.email}>`,
        to: `'Personal' <${process.env.EMAIL_CONTACT}>`,
        subject: '[SITE MESSAGE]',
        text: fields.message,
        html: fields.message
      }

      mailgun.messages().send(mailOptions, function (error, body) {
        if (error) {
          console.log('Email send', error)
          response.end('error') // Info for client
        } else {
          console.log('Email was sent')
          response.end() // No errors occured
        }
      })
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
