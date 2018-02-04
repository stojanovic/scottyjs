'use strict'

const checkIfConfigExists = require('./tasks/check-if-config-exists')
const create = require('./commands/create')
const update = require('./commands/update')

function scotty(options, logger) {
  // console.log('Scotty options', options)

  return checkIfConfigExists(options, logger)
    .then(
      options => update(options, logger),
      options => create(options, logger)
    )
}

module.exports = scotty
