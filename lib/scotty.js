'use strict'

const checkIfConfigExists = require('./tasks/check-if-config-exists')
const create = require('./commands/create')
const update = require('./commands/update')

function printUrls(options) {
  console.log(`
    Your project is successfully deployed to AWS S3 and CloudFront!

    You can find AWS S3 version here: https://s3.${options.region}.amazonaws.com/${options.bucket} (It's in your clipboard, just paste it).

    CDN version is available here: ${options.cdnUrl}. It can take a few minutes for this version to be available.

    Thanks for using Scotty.js!
  `)
}

function scotty(options, logger) {
  // console.log('Scotty options', options)

  return checkIfConfigExists(options, logger)
    .then(
      options => update(options, logger),
      options => create(options, logger)
    )
    .then(printUrls)
}

module.exports = scotty
