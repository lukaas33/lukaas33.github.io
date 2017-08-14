// Require
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const formidable = require("formidable");
const compression = require("compression");
const minify = require("express-minify");

// Variables
const app = express();
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.emailDefault,
    pass: process.env.emailPassword
  }
});

// Functions
const send = function(request, response) {
  // Handles email form
  const form = new formidable.IncomingForm();

  return form.parse(request, function(error, fields, files) {
    const mailOptions = {
      from: `"${fields.email}" <${fields.email}>`,
      to: `"Personal" <${process.env.emailPersonal}>`,
      subject: "[SITE MESSAGE]",
      html:
        `<em>Sent by: ${fields.name}</em><br/>` +
        `<em>Reply at: ${fields.email}</em><br/><hr/>` +
        `${fields.message}`
    };

    return transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        return console.log(error);
      } else {
        return console.log(`Email sent: ${info.response}`);
      }
    });
  });
};


// Setup
app.use(compression()); // Compression for site
app.use(minify()); // Minifies code
app.use(express.static(`${__dirname}/public`)); // Serve static files

app.use(bodyParser.json()); // Enable json parsing
app.use(bodyParser.urlencoded({extended: true}));

app.set("port", process.env.PORT || 5000); // Chooses either port
app.set("index", `${__dirname}/index`);
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");
// app.set("view engine", "html")

// Routes
app.get('/', function(request, response) {
  response.set("Content-Encoding", "gzip");
  // response.render("index")
  return response.render("index");
});

// Exceptions

// Events
app.post("/send", function(request, response) {
  console.log("POST request from client");
  send(request, response); // Email sender
  return response.end();
});

app.listen(app.get("port"), () => console.log(`Node app is running at ${app.get("port")}`));
