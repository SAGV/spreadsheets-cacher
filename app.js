"use strict"

//Module requests
let express    = require('express')
let morgan     = require('morgan')
let bodyParser = require('body-parser')
let app        = express()
let port       = process.env.PORT || 3000
let router     = express.Router()
let Promise    = require('bluebird')
let _          = require('lodash')
let requestify = require('requestify')
let md5        = require('md5')
let fs         = Promise.promisifyAll(require("fs"))

// App Config
const spreadsheetsEndpoint = 'https://spreadsheets.google.com'
const cachePath = '/cache/'

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
  console.log('url', req.path)
  getSpreadsheet(req.path)
  .then(spreadsheet => {
    res.status(200).send(spreadsheet)  
  }, err => {
    res.status(400).send('Something went wrong =(')
  })
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
      }, reject)
    })
    
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

  fs.writeFileAsync(cachePath+encodedName, JSON.stringify(json), 'utf8')
  .then(() => {
    console.log('Saved ' + encodedName)
  })
}

let getCachedSpreadsheet = (name) => {
  let encodedName = md5(name)
  console.log('Getting ' + name)
  console.log('Encoded name is ' + encodedName)

  return new Promise((resolve, reject) => {

    fs.readFileAsync(__dirname + cachePath + encodedName, 'utf8')
    .then(file => {
      console.log('File found, returning!')
      resolve(JSON.parse(file))
    })
    .catch(err => {
      console.log('File not found!')
      console.log(err)
      reject('404')
    })
    
  })
}

let createCacheDir = () => {
  fs.accessAsync(__dirname+cachePath.slice(0,cachePath.length-1))
  .then(() => {
    console.log('Cache dir exists, everything is fine')
  })
  .catch(() => {
    console.log('Cache dir is missing, creating one...')
    fs.mkdir(__dirname+cachePath.slice(0,cachePath.length-1))
  })
}
createCacheDir()
