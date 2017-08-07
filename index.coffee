# Require
express = require "express"
nodemailer = require "nodemailer"
bodyParser = require "body-parser"
formidable = require "formidable"

# Variables
app = express()
transporter = nodemailer.createTransport
  service: "Gmail"
  auth:
    user: "lucasnogwat@gmail.com"
    pass: "kgqtsrtjzdbphoee"

# Functions
send = (request, response) ->
  form = new formidable.IncomingForm()

  form.parse(request, (error, fields, files) ->
    mailOptions =
      from: "\"#{fields.email}\" <#{fields.email}>"
      to: "\"Personal\" <lucasvanosenbruggen@gmail.com>"
      subject: "[SITE MESSAGE]"
      html: "<em>Sent by: #{fields.name}</em><br/>" +
            "<em>Reply at: #{fields.email}</em><br/><hr/>" +
            "#{fields.message}"

    transporter.sendMail(mailOptions, (error, info) ->
      if error
        console.log error
      else
        console.log "Email sent: #{info.response}"
    )
  )

# Setup
app.use(express.static "#{__dirname}/public")
app.use bodyParser.json()
app.use(bodyParser.urlencoded extended: true)
app.set("port", process.env.PORT || 5000)
app.set("index", "#{__dirname}/index")
app.set("view engine", "html")

# Events
app.get('/', (request, response) ->
  response.render("index")
)

app.post("/send", (request, response) ->
  console.log "POST request from client"
  send(request, response)
  response.end()
)

app.listen(app.get("port"), ->
  console.log "Node app is running at #{app.get("port")}"
)
