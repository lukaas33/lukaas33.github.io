// << Variables >>
const filesystem = require('fs')
var mongoClient = require('mongodb')
mongoClient = mongoClient.MongoClient
const files = ['experience', 'projects', 'skills']
let database = null


// << Functions >>
const get = function (collections, callback = () => {}) {
  let result = {} // Will be filled
  for (let file of collections) { // Loop through collections needed
    let options = { // Sort options for each file
      'experience': {'date.start': 1, 'title': 1},
      'projects': {'date.end': -1, 'title': 1},
      'skills': {'title': 1}
    }

    let current = database.collection(file)
    current.find().sort(options[file]).toArray((error, results) => {
      if (error) {
        throw error
      }

      result[file] = results
      result[file]['sort'] = options[file]

      if (Object.keys(result).length === collections.length) { // Data from all files is got
        callback(result)
      }
    })
  }
}

const set = function (entering, complete = () => {}) {
  const open = function (name, callback = () => {}) {
    filesystem.readFile(name, 'utf8', function (error, data) { // Open the files and store the content
      if (error) {
        throw error
      }

      let json = JSON.parse(data, function (key, value) { // Text to json
        if ((key === 'start' || key === 'end') && value !== null) {
          return new Date(value) // Date strings will be converted to dates
        } else {
          return value // Normal values
        }
      })

      callback(json.content) // Run function with object
    })
  }

  const upsert = function (document, collection, callback = () => {}) {
    let query = {title: document.title} // Title is unique
    let current = database.collection(collection)
    current.updateOne(query, {$set: document}, {upsert: true}, function (error, result) {
      if (error) {
        throw error
      }

      callback()
    })
  }

  if (typeof entering === 'undefined') { // Will check with the local data
    for (let file of files) {  // Loops through the files
      open(`data/${file}.json`, (objects) => { // Opens the file
        for (let object of objects) { // Loops through the objects
          upsert(object, file, () => {
            complete()
          }) // Empty callback
        }
      })
    }
  } else { // Will enter new data
    upsert(entering.data, entering.target, () => {
      complete() // Success
    })
  }
}

// << Actions >>
// Start connection
mongoClient.connect(process.env.MONGODB_URI, function (error, db) { // Connects to database using env info
  if (error) {
    throw error
  }
  database = db.db(process.env.DB_NAME)
  set() // Database sync without entering new data
  console.log('Database connection established')
})

module.exports = {get, set, files}
