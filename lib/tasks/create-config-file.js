'use strict'

const colors = require('colors')

function createConfigFile(options) {
  process.stdout.write(colors.inverse.green('     Config file    ') + ` Config file is created on following path: "${options.config}".\n`)

  return Promise.resolve()
}

module.exports = createConfigFile
