'use strict'

function update(configFile) {
  const config = require(configFile)
  console.log('update', config)
}

module.exports = update
