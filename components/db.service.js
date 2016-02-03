"use strict"

let Datastore       = require('nedb')
let moment          = require('moment')
let config          = require('../config')
let h               = require('./helper.service')
let DownloadService = require('./download.service')
let Promise         = require('bluebird')

exports.initDb = () => {
  exports.db = new Datastore({ filename: config.db, autoload: true })
  Promise.promisifyAll(exports.db)
}

//This is the function which handles getting spreadsheets
exports.getSpreadsheet = uri => {
  return new Promise((resolve, reject) => {
    
    exports.getCachedSpreadsheet(uri)
    .then(spreadsheet => {
      h.log('Spreadsheet found in cache...')
      resolve(spreadsheet)  
    })
    .catch(() => {
      h.log('Spreadsheet not cached...')

      DownloadService.downloadSpreadsheet(uri)
      .then(spreadsheet => {
        exports.cacheSpreadsheet(uri, spreadsheet)
        resolve(spreadsheet)
      })
      .catch(reject)
      .done()
    })
    .done()
    
  })
}

exports.cacheSpreadsheet = (name, spreadsheet) => {
  return new Promise((resolve, reject) => {

    let date = new Date()

    exports.db.insert({
      name: name,
      spreadsheet: JSON.stringify(spreadsheet),
      dateLastRequested: date.toISOString()
    }, error => {
      // h.log(!error ? 'Saved db' : error)
      !error ? resolve() : reject(error) 
    })

  })
}

exports.getCachedSpreadsheet = (name) => {
  return new Promise((resolve, reject) => {
    h.log('Getting spreadheet... ', name)

    exports.db.findOne({name: name}, (err, record) => {
      if (err || !record) {
        reject('No record found')
      } else {
        

        // Async call so users won't wait for the update
        let date = new Date()
        exports.db.update(
          { name: name }, 
          { $set: {
            dateLastRequested: date.toISOString() }
          }, 
          err => { h.log(!err ? 'Saved db' : err) }
        )

        resolve(JSON.parse(record.spreadsheet))
      }
    })
    
  })
}

exports.updateOrRemoveSpreadsheets = () => {
  
  //The promise is mostly needed for test
  return new Promise((resolve, reject) => {
    let counter = 0
    let numOfRecords = 0
    let expiredBefore = moment().subtract(config.removeTimeout, 'milliseconds')

    let checkForResolve = () => {
      counter++
      if (counter === numOfRecords) resolve()
    }

    exports.db.find({}, (err, records) => {
      if (err) h.log('Error on getting all spreadsheets')
      numOfRecords = records.length

      records.forEach(record => {
        if (moment(record.dateLastRequested).isBefore(expiredBefore)) {
          exports.db.remove(
            { name: record.name },
            {}, 
            err => {
              h.log(!err ? 'Removed record' : err)
              checkForResolve()
            }
          )
        } else {
          DownloadService.downloadSpreadsheet(record.name)
          .then(spreadsheet => {
            exports.db.update(
              { name: record.name }, 
              { $set: {
                  spreadsheet: JSON.stringify(spreadsheet) 
                }
              },
              err => {
                h.log(!err ? 'Updated record' : err)
                checkForResolve()
              }
            )
          })
        }

      })
    })

  })
}

exports.setUpdateInterval = () => {
  setInterval(() => {
    h.log('Updating all spreadsheets...')
    exports.updateOrRemoveSpreadsheets()
  }, config.updateTimeout)
}
