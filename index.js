(function() {
  var app, bodyParser, express, formidable, nodemailer, send, transporter;

  express = require("express");

  nodemailer = require("nodemailer");

  bodyParser = require("body-parser");

  formidable = require("formidable");

  app = express();

  transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.emailDefault,
      pass: process.env.emailPassword
    }
  });

  send = function(request, response) {
    var form;
    form = new formidable.IncomingForm();
    return form.parse(request, function(error, fields, files) {
      var mailOptions;
      mailOptions = {
        from: "\"" + fields.email + "\" <" + fields.email + ">",
        to: "\"Personal\" <" + process.env.emailPersonal + ">",
        subject: "[SITE MESSAGE]",
        html: ("<em>Sent by: " + fields.name + "</em><br/>") + ("<em>Reply at: " + fields.email + "</em><br/><hr/>") + ("" + fields.message)
      };
      return transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          return console.log(error);
        } else {
          return console.log("Email sent: " + info.response);
        }
      });
    });
  };

  app.use(express["static"](__dirname + "/public"));

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.set("port", process.env.PORT || 5000);

  app.set("index", __dirname + "/index");

  app.set("view engine", "html");

  app.get('/', function(request, response) {
    return response.render("index");
  });

  app.post("/send", function(request, response) {
    console.log("POST request from client");
    send(request, response);
    return response.end();
  });

  app.listen(app.get("port"), function() {
    return console.log("Node app is running at " + (app.get("port")));
  });

}).call(this);
