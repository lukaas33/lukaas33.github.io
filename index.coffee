# Require
express = require "express"
nodemailer = require "nodemailer"
bodyParser = require "body-parser"
formidable = require "formidable"
compression = require "compression"
minify = require "express-minify"

# Variables
app = express()
transporter = nodemailer.createTransport
  service: "Gmail"
  auth:
    user: process.env.emailDefault
    pass: process.env.emailPassword

# Functions
send = (request, response) ->
  # Handles email form
  form = new formidable.IncomingForm()

  form.parse request, (error, fields, files) ->
    mailOptions =
      from: "\"#{fields.email}\" <#{fields.email}>"
      to: "\"Personal\" <#{process.env.emailPersonal}>"
      subject: "[SITE MESSAGE]"
      html:
        "<em>Sent by: #{fields.name}</em><br/>" +
        "<em>Reply at: #{fields.email}</em><br/><hr/>" +
        "#{fields.message}"

    transporter.sendMail mailOptions, (error, info) ->
      if error
        console.log error
      else
        console.log "Email sent: #{info.response}"


# Setup
app.use compression() # Compression for site
app.use minify() # Minifies code
app.use(express.static "#{__dirname}/public") # Serve static files

app.use bodyParser.json() # Enable json parsing
app.use(bodyParser.urlencoded extended: true)

app.set("port", process.env.PORT || 5000) # Chooses either port
app.set("index", "#{__dirname}/index")
app.set("views", "#{__dirname}/views")
app.set("view engine", "ejs")
# app.set("view engine", "html")

# Routes
app.get '/', (request, response) ->
  response.set("Content-Encoding", "gzip")
  # response.render("index")
  response.render "index"

# Exceptions

# Events
app.post "/send", (request, response) ->
  console.log "POST request from client"
  send(request, response) # Email sender
  response.end()

app.listen app.get("port"), ->
  console.log "Node app is running at #{app.get("port")}"
