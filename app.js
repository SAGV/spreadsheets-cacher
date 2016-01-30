"use strict"

//Module requests
let express    = require('express')
let morgan     = require('morgan')
let bodyParser = require('body-parser')
let app        = express()
let router     = express.Router()
let Promise    = require('bluebird')
let _          = require('lodash')
let requestify = require('requestify')
let md5        = require('md5')
let fs         = Promise.promisifyAll(require("fs"))
require('dotenv').config({silent: true})

// App Config
const port       = process.env.PORT || 3000
const spreadsheetsEndpoint = process.env.SPREADSHEETS_ENDPOINT || 'https://spreadsheets.google.com'
const cachePath = __dirname + (process.env.CACHE_PATH || '/cache/')
const reloadTimeout = process.env.RELOAD_TIMEOUT_MINUTES || 60

app.use(morgan('dev'))                     // log every request to the console
app.use(bodyParser.json()) // for parsing application/json

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
});


router.get('*', function(req, res, next) {
  
  getSpreadsheet(req.path)
  .then(spreadsheet => {
    res.status(200).send(spreadsheet)  
  })
  .catch(err => {
    res.status(400).send('Something went wrong =(')
  })
  .done()

})

app.use('/', router)

app.listen(port)
console.log('App running on port', port)


//Getting spreadsheets
let getSpreadsheet = url => {
  return new Promise((resolve, reject) => {
    
    getCachedSpreadsheet(url)
    .then(spreadsheet => {
      resolve(spreadsheet)  
    })
    .catch(() => {
      downloadSpreadsheet(url)
      .then(spreadsheet => {
        saveSpreadsheet(spreadsheet, url)
        resolve(spreadsheet)
      })
      .catch(reject)
      .done()
    })
    .done()
    
  })
}

let downloadSpreadsheet = url => {
  return new Promise((resolve, reject) => {

    requestify.get(spreadsheetsEndpoint+url+'?alt=json')
    .then(spreadsheet => {
      resolve(spreadsheet.getBody())
    }, reject)
    .done()

  })
}

let saveSpreadsheet = (json, name) => {
  let encodedName = md5(name)
  console.log('Saving ' + name)
  console.log('Encoded name is ' + encodedName)

  fs.writeFileAsync(cachePath + encodedName, JSON.stringify(json), 'utf8')
  .then(() => {
    console.log('Saved ' + encodedName)
  })
  .done()

}

let getCachedSpreadsheet = (name) => {
  let encodedName = md5(name)
  console.log('Getting ' + name)
  console.log('Encoded name is ' + encodedName)

  return new Promise((resolve, reject) => {

    fs.readFileAsync(cachePath + encodedName, 'utf8')
    .then(file => {
      console.log('File found, returning!')
      resolve(JSON.parse(file))
    })
    .catch(err => {
      console.log('File not found!')
      reject('404')
    })
    .done()
    
  })
}

let createCacheDir = () => {
  fs.accessAsync(cachePath.slice(0,cachePath.length-1))
  .then(() => {
    console.log('Cache dir exists, everything is fine')
  })
  .catch(() => {
    console.log('Cache dir is missing, creating one...')
    fs.mkdir(cachePath.slice(0,cachePath.length-1))
  })
  .done()
}
createCacheDir()

