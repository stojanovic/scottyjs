'use strict'

const fs = require('fs')

function checkIfConfigExists(options) {
  if (fs.existsSync(options.config))
    return Promise.resolve(options)

  return Promise.reject(options)
}

module.exports = checkIfConfigExists
