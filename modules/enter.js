// << Variables >>
const filesystem = require('fs')


// << Functions >>
const entry = function (request, response, next) {
  if (request.body.user === process.env.ADMIN_NAME && request.body.pass === process.env.ADMIN_PASS) {
    try { // Detect errors
      // Standard webname convert
      let webtitle = request.body.data.title.toLowerCase()
      webtitle = webtitle.replace(/ /g, '-') // Whitespace will be replaced in the url

      // Save images
      let toLoad = 2
      let load = function () {
        toLoad -= 1
        if (toLoad === 0) {
          console.log('Enter:', request.body.data)

          data.set({target: request.body.target, data: request.body.data}, () => {
            response.status(201).send('Data entered') // Everything worked
            response.end()
          })
        }
      }

      let folder = `${__dirname}/public/assets/images/project`
      filesystem.writeFile(`${folder}/banners/${webtitle}.jpg`, request.body.data.cover[0].split(',')[1], 'base64', (error) => {
        if (error) {
          throw error
        }
        delete request.body.data.cover
        load()
      })
      filesystem.writeFile(`${folder}/thumbnails/${webtitle}.jpg`, request.body.data.thumbnail[0].split(',')[1], 'base64', (error) => {
        if (error) {
          throw error
        }
        delete request.body.data.thumbnail
        load()
      })
    } catch (error) {
      console.error(error)
      const err = new Error("Couldn't create image")
      err.status(400)
      next(err)
    }
  } else {
    const err = new Error('Invalid login')
    err.status(401)
    next(err)
  }
}

module.exports = {entry}
