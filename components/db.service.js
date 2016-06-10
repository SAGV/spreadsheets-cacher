"use strict"

let Datastore       = require('nedb')
let moment          = require('moment')
let config          = require('../config')
let h               = require('./helper.service')
let DownloadService = require('./download.service')
let Promise         = require('bluebird')
let _               = require('lodash')

exports.initDb = () => {
  exports.db = new Datastore({ filename: config.db, autoload: true })
  Promise.promisifyAll(exports.db)
}

exports.getInformationAboutSpreadsheets = () => {
  return new Promise((resolve, reject) => {
    exports.db.find({}, (err, records) => {
      if (err || !records) {
        reject(err)
      } else {
        let recordsInfo = []

        records.forEach(record => {
          recordsInfo.push({
            uri: record.name,
            dateLastRequested: record.dateLastRequested,
          })
        })

        //Sort them by latest requeted first
        recordsInfo = recordsInfo.sort((a, b) => {
          return moment(a.dateLastRequested).isBefore(b.dateLastRequested) ? 1 : -1;
        })

        resolve({
          total: recordsInfo.length,
          spreadsheets: recordsInfo
        })
      }
    })
  })
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
      h.log(!error ? 'Saved db' : error)
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
          }
          // err => { h.log(!err ? 'Saved db' : err) }
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
          h.log('Spreadsheet expired, getting new one ')

          exports.db.remove(
            { name: record.name },
            {}, 
            err => {
              h.log(!err ? 'Removed record' : err)
              checkForResolve()
            }
          )
        } else {
          h.log('Spreadsheet not expired yet, updating')

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

exports.removeSingleItem = (name) => {
  return new Promise((resolve, reject) => {
    exports.db.remove({name: name}, {}, function (err, numRemoved) {
      if (err) {
        h.log(err)
        reject({status: 400})
      } else if (numRemoved === 0) {
        h.log(`Have not found the item`)
        reject({status: 404})
      } else {
        h.log(`Removed ${numRemoved} records`)
        resolve()
      }
    })
  })
}

exports.removeEverything = () => {
  return new Promise((resolve, reject) => {
    exports.db.remove({}, { multi: true }, function (err, numRemoved) {
      if (err) {
        h.log(err)
        reject(err)
      } else {
        h.log(`Removed ${numRemoved} records`)
        resolve(numRemoved)
      }
    })
  })
}

exports.setUpdateInterval = () => {
  setInterval(() => {
    h.log('Updating all spreadsheets...')
    exports.updateOrRemoveSpreadsheets()
  }, config.updateTimeout)
}
