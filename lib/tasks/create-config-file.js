'use strict'

const fs = require('fs')
const path = require('path')
const colors = require('colors')

function createConfigFile(options) {
  const fileName = path.basename(options.config)
  process.stdout.write('       config file' + colors.yellow(' ✤ ') + `config file is created on following path: "${fileName}".`)

  return new Promise((resolve, reject) => {
    fs.writeFile(options.config, JSON.stringify(options, null, 2), err => {
      if (err)
        return reject(err)

      process.stdout.clearLine()
      process.stdout.cursorTo(0)
      process.stdout.write('       config file' + colors.magenta(' ✤ ') + `config file is created on following path: "${fileName}".\n`)

      return resolve(Object.assign({}, options))
    })
  })
}

module.exports = createConfigFile
