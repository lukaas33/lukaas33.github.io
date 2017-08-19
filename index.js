'use strict'

// Require
const express = require('express')
const helmet = require('helmet')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const compression = require('compression')
const minify = require('express-minify')

// Variables
const app = express()
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.emailDefault,
    pass: process.env.emailPassword
  }
})

// Functions
const send = function (request, response) {
  // Handles email form
  const form = new formidable.IncomingForm()

  form.parse(request, function (error, fields, files) {
    const mailOptions = {
      from: `'${fields.email}' <${fields.email}>`,
      to: `'Personal' <${process.env.emailPersonal}>`,
      subject: '[SITE MESSAGE]',
      html:
        `<em>Sent by: ${fields.name}</em><br/>` +
        `<em>Reply at: ${fields.email}</em><br/><hr/>` +
        `${fields.message}`
    }

    if (error) {
      console.log("Form didn't parse")
    } else {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log(`Email sent: ${info.response}`)
        }
      })
    }
  })
}

// Setup
app.use(helmet())
app.use(helmet.contentSecurityPolicy({ // Allowed sources
  directives: {
    // Setup for http headers
    defaultSrc: ["'self'", '*.googleapis.com'],
    frameSrc: ['*.google.com'],
    scriptSrc: ["'self'", "'unsafe-inline'", 'ajax.googleapis.com'],
    styleSrc: ["'self'", "'unsafe-inline'", '*.googleapis.com'],
    fontSrc: ["'self'", 'fonts.gstatic.com'],
    imgSrc: ["'self'"],
    objectSrc: ["'none'"]
  }
}))

app.use(compression()) // Compression for site
app.use(minify()) // Minifies code
app.use(express.static(`${__dirname}/public`, { maxage: '7d' })) // Serve static files

app.use(bodyParser.json()) // Enable json parsing
app.use(bodyParser.urlencoded({extended: true}))

app.set('port', process.env.PORT || 5000) // Chooses either port
app.set('index', `${__dirname}/index`)
app.set('views', `${__dirname}/views`)
app.set('view engine', 'ejs')

// Routes
app.get('/', function (request, response) {
  response.set('Content-Encoding', 'gzip')
  response.render('index')
})

// Exceptions

// Events
app.post('/send', function (request, response) {
  console.log('POST request from client')
  send(request, response) // Email sender
  response.end()
})

app.listen(app.get('port'), () => console.log(`Node app is running at ${app.get('port')}`))
