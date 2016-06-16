//Please, avoid editing that file and use .env instead.

"use strict"
require('dotenv').config({silent: true})

exports.port                 = process.env.PORT || 3000
exports.endpoint = process.env.ENDPOINT || 'https://spreadsheets.google.com'
exports.updateTimeout        = (process.env.UPDATE_TIMEOUT_MINUTES || 60) * 60 * 1000
exports.removeTimeout        = (process.env.REMOVE_TIMEOUT_MINUTES || 4320) * 60 * 1000
exports.dev                  = (process.env.DEV) || false
exports.db                   = (process.env.DB) || false
exports.password             = (process.env.PASSWORD) || false
