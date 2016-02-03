"use strict"

let requestify = require('requestify')
let Promise    = require('bluebird')
let config     = require('../config.js')

exports.urlEnding = '?alt=json'

exports.downloadSpreadsheet = url => {
  return new Promise((resolve, reject) => {
    requestify.get(config.spreadsheetsEndpoint + url + exports.urlEnding)
    .then(spreadsheet => {
      resolve(spreadsheet.getBody())
    }, reject)
    .done()
  })
}
