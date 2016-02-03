"use strict"

let config     = require('../config.js')

exports.log = () => {
  if (typeof jasmine === 'undefined') console.log(arguments)
}
