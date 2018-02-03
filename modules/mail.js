// << Variables >>
let mailgun = require('mailgun-js')
mailgun = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.DOMAIN}) // Gets mailgun data from env
const formidable = require('formidable')


// << Functions >>
const sendForm = function (request, response, next) {
  // Handles email form
  const form = new formidable.IncomingForm() // Object for handeling forms

  form.parse(request, function (error, fields, files) {
    try {
      if (error) {
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
          throw error
        }
        console.log('Email was sent')
        response.status(201).send() // No errors occured
        response.end()
      })
    } catch (error) {
      console.error(error)
      const err = new Error("Couldn't parse form")
      err.status(500)
      next(err)
    }
  })
}

module.exports = {sendForm}
