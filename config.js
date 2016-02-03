//Please, avoid editing that file and use .env instead.

"use strict"
require('dotenv').config({silent: true})

exports.port                 = process.env.PORT || 3000
exports.spreadsheetsEndpoint = process.env.SPREADSHEETS_ENDPOINT || 'https://spreadsheets.google.com'
exports.cachePath            = __dirname + (process.env.CACHE_PATH || '/cache/')
exports.updateTimeout        = (process.env.UPDATE_TIMEOUT_MINUTES || 60) * 60 * 1000
exports.removeTimeout        = (process.env.REMOVE_TIMEOUT_MINUTES || 1440) * 60 * 1000
exports.dev                  = (process.env.DEV) || false
exports.db                   = (process.env.db) || null
