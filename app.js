"use strict"
require('dotenv').config({silent: true})

//Module requests
let express    = require('express')
let morgan     = require('morgan')
let bodyParser = require('body-parser')
let app        = express()
let router     = express.Router()
let Promise    = require('bluebird')
let _          = require('lodash')
let requestify = require('requestify')
let moment     = require('moment')
let md5        = require('md5')
let fs         = Promise.promisifyAll(require("fs"))

//DB
let Datastore  = require('nedb')
let db         = new Datastore({ filename: './cache.db', autoload: true })

// App Config
const port       = process.env.PORT || 3000
const spreadsheetsEndpoint = process.env.SPREADSHEETS_ENDPOINT || 'https://spreadsheets.google.com'
const cachePath = __dirname + (process.env.CACHE_PATH || '/cache/')
const updateTimeout = (process.env.UPDATE_TIMEOUT_MINUTES || 60) * 60 * 1000
const removeTimeout = (process.env.REMOVE_TIMEOUT_MINUTES || 1440) * 60 * 1000

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
      console.log('Spreadsheet found in cache...')
      resolve(spreadsheet)  
    })
    .catch(() => {
      console.log('Spreadsheet not cached...')

      downloadSpreadsheet(url)
      .then(spreadsheet => {
        cacheSpreadsheet(url, spreadsheet)
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

let createTable = () => {
  if(!dbExists) {
    console.log('Freshly created DB, creating table')
    db.run("CREATE TABLE Cache (id INTEGER PRIMARY KEY, name TEXT, json TEXT, dateLastRequested DATE)")
  } else {
    console.log('DB is old, table exists')
  }
}

let cacheSpreadsheet = (name, spreadsheet) => {
  let date = new Date()
  date = date.toISOString()

  db.serialize(() => {
    var stmt = db.prepare('INSERT INTO Cache VALUES (?,?,?,?)')
    stmt.run(null, name, JSON.stringify(spreadsheet), date)
    stmt.finalize()
  })
}

let getCachedSpreadsheet = (name) => {
  return new Promise((resolve, reject) => {
    console.log('Getting spreadheet... ', name)

    db.get(`SELECT * FROM Cache WHERE name = "${name}"`, (err, record) => {
      if (err || !record) {
        reject(err)
      } else {

        //Async call so users won't wait for the update
        let date = new Date()
        db.exec(`UPDATE Cache SET dateLastRequested = "${date.toISOString()}" WHERE name = "${name}"`)

        resolve(JSON.parse(record.json))
      }
    })
  })
}

let setUpdateInterval = () => {
  console.log(updateTimeout)

  setInterval(() => {
    console.log('Updating all spreadsheets...')
    updateOrRemoveSpreadsheets()
  }, updateTimeout)
}

let updateOrRemoveSpreadsheets = () => {
  db.each('SELECT * FROM Cache', (err, record) => {

    // if (moment(record.dateLastRequested).isBefore(moment().subtract(removeTimeout, 'minutes'))) {
    //   db.exec(`DELETE FROM Cache WHERE name = "${record.name}"`, err => {
    //     if (err) console.log('Updating errored!')
    //   })
    // } else {
      downloadSpreadsheet(record.name)
      .then(json => {
        let stringifiedJSON = JSON.stringify(json)
        console.log(stringifiedJSON)

        db.exec(`UPDATE Cache SET json = '${stringifiedJSON}' WHERE name = '${record.id}'`, err => {
          if (err) console.log('Updating errored!', err)
        })
      })
    // }

  })
}



//1. Put all requested sheets into DB
//2. Update sheets in memort every N mins
//3. Remove not used for a week or so


let readDB = () => {
  console.log('reading db')
  db.each("SELECT * FROM Cache", function(err, row) {
    console.log(row.dateLastRequested);
  })
}

createTable()
setUpdateInterval()
readDB()
