'use strict'

const colors = require('colors')
const aws = require('aws-sdk')
const createOrReuseBucket = require('../tasks/create-or-reuse-bucket')
const uploadFolder = require('../tasks/upload-folder')
const setAsWebsite = require('../tasks/set-as-website')
const setCdn = require('../tasks/set-cdn')
const setCustomDomain = require('../tasks/set-custom-domain')
const createConfigFile = require('../tasks/create-config-file')

function logError(err, logger) {
  if (err && err.type === 'SCOTTY_ERROR')
    return logger(colors.inverse.red(` ${err.title} `) + ' ' + err.message)

  logger(colors.inverse.red(' Error ') + JSON.stringify(err))
}

function create(options, logger) {
  logger('\n')
  logger('    create project' + colors.magenta(' ✤ ') + 'config file not found, creating new Scotty project')

  const s3Options = {}
  if (options.region) {
    s3Options.region = options.region
  }

  const s3 = new aws.S3(s3Options)

  return createOrReuseBucket(options, s3, logger)
    .then(result => uploadFolder(result, s3, logger))
    .then(result => setAsWebsite(result, logger))
    .then(result => setCdn(result, logger))
    .then(result => setCustomDomain(result, logger))
    .then(result => createConfigFile(result, logger))
    .catch(err => logError(err, logger))
}

module.exports = create
