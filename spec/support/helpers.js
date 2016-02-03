"use strict"

let Promise    = require('bluebird')

exports.fakePromise = (isSuccess, answer) => {
  return new Promise((resolve, reject) => {
    if (isSuccess) {
      resolve(answer)
    } else {
      reject(answer)
    }
  })
}
