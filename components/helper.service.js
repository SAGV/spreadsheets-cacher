"use strict"

let config     = require('../config.js')

//
exports.log = (a, b, c) => {
  if (typeof jasmine === 'undefined') console.log(a ? a : '', b ? b : '', c ? c : '')
}
