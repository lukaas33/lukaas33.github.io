(function() {
  var app, bodyParser, compression, express, formidable, minify, nodemailer, send, transporter;

  express = require("express");

  nodemailer = require("nodemailer");

  bodyParser = require("body-parser");

  formidable = require("formidable");

  compression = require("compression");

  minify = require("express-minify");

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

  app.use(compression());

  app.use(minify());

  app.use(express["static"](__dirname + "/public"));

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.set("port", process.env.PORT || 5000);

  app.set("index", __dirname + "/index");

  app.set("views", __dirname + "/views");

  app.set("view engine", "ejs");

  app.get('/', function(request, response) {
    response.set("Content-Encoding", "gzip");
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
