"use strict"

let express    = require('express')
let morgan     = require('morgan')
let app        = express()
let router     = express.Router()
let DbService  = require('./components/db.service')
let config     = require('./config')

app.use(morgan('dev'))                     // log every request to the console

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
});


router.get('*', function(req, res, next) {

  //Send an answer for a home page
  if (req.path === '/') {
    res.status(200).send('Everything is up & running! Request <a href="https://github.com/goabout/spreadsheets-cacher/blob/master/README.md" target="_blank">some real spreadsheet</a> to get the result')
    return
  }
  
  DbService.getSpreadsheet(req.path)
  .then(spreadsheet => {
    res.status(200).send(spreadsheet)  
  })
  .catch(err => {
    res.status(400).send('Something went wrong =(')
  })
  .done()

})


if (typeof jasmine === 'undefined') {
  app.use('/', router)

  app.listen(config.port)
  console.log('App running on port', config.port)

  DbService.initDb()
  DbService.setUpdateInterval()
}
