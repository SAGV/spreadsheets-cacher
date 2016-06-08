"use strict"

let config          = require('../config')
let h               = require('./helper.service')

exports.authorizationCheck = function (req, res, next) {
  if (req.path.indexOf('/api') === -1) {
    next()
    return
  }

  if (!config.password) {
    next()
    return
  }

  if (!req.headers.authorization) {
    res.status(401)
    res.send()
    return
  }

  if (req.headers.authorization !== config.password) {
    res.status(403)
    res.send()
    return
  }

  next()
}
