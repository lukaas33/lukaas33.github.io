// << Variables >>
var mailgun = require('mailgun-js')
mailgun = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.DOMAIN}) // Gets mailgun data from env
const formidable = require('formidable')


// Functions >>
const sendForm = function (request, response) {
  // Handles email form
  const form = new formidable.IncomingForm() // Object for handeling forms

  form.parse(request, function (error, fields, files) {
    if (error) {
      response.end('error') // Info for client
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
        throw error
      }
      console.log('Email was sent')
      response.end() // No errors occured
    })
  })
}

module.exports = {sendForm}
