"use strict"

let express     = require('express')
let morgan      = require('morgan')
let bodyParser  = require('body-parser')
let app         = express()
let router      = express.Router()
let DbService   = require('./components/db.service')
let AuthService = require('./components/auth.service')
let config      = require('./config')

app.use(morgan('dev'))                     // log every request to the console
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  next()
});


app.use(AuthService.authorizationCheck)

router.get('/', function(req, res, next) {
  res.status(200).send('Everything is up & running! Request <a href="https://github.com/goabout/spreadsheets-cacher/blob/master/README.md" target="_blank">some real spreadsheet</a> to get the result')
})

router.get('/admin', function(req, res, next) {
  res.status(200).render('admin.html')
})

router.post('/api/wipe', function(req, res, next) {
  DbService.removeEverything()
  .then(numRemoved => {
    res.status(200).send({
      error: false,
      numRemoved: numRemoved
    })
  })
  .catch(err => {
    res.status(400).send({
      error: true,
      numRemoved: 0,
      errorDescription: err
    })
  })
})

router.get('/api/validatePassword', function(req, res, next) {
  console.log('here')
  res.status(200).send()
})


router.get('*', function(req, res, next) {

  //Send an answer for a home page
  if (req.path.indexOf('/api') !== -1 || req.path === '/' || req.path === '/admin') {
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
  console.log('The password is', config.password)

  DbService.initDb()
  DbService.setUpdateInterval()
}
