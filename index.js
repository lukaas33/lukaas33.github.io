// Require
var express = require("express");
var nodemailer = require("nodemailer");
var bodyParser = require("body-parser");

// Vars
var app = express();
var parser = bodyParser.urlencoded({extended: false});
var transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "lucasnogwat@gmail.com",
    pass: "kgqtsrtjzdbphoee"
  }
});

// Functions


// Port
app.set("port", (process.env.PORT || 5000));
app.use(express.static([__dirname, "/public"].join('')));

// Routes
app.set("index", [__dirname, "/index.html"].join(''));
app.set("view engine", "html");

// Events
app.get("/", function(request, response) {
  response.render("index");
});

app.post("/send", parser, function (request, result) {
   console.log("Got a POST request for the homepage");

   var mailOptions = {
     from: '\"' + request.body.name + '\" ' + '<' + request.body.email + '>',
     to: '"Personal" <lucasvanosenbruggen@gmail.com>',
     subject: "[SITE MESSAGE]",
     html: "<em>Sent by: " + request.body.name + '</em><br>' + "<em>Reply at: " + request.body.email + '</em><br>' + '<hr>' + request.body.message
   };

   transporter.sendMail(mailOptions, function(error, info) {
     if (error) {
       console.log(error);
     } else {
       console.log("Email sent: " + info.response);
     }
   });

   result.end();
})

app.listen(app.get("port"), function() {
  console.log("Node app is running at localhost:" + app.get("port"));
})
