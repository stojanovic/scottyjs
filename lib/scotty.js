'use strict'

const colors = require('colors')
const getFolderSize = require('get-folder-size')
const clipboardy = require('clipboardy')

const createBucket = require('./create-bucket')
const reuseBucket = require('./reuse-bucket')
const upload = require('./upload')
const getFormattedSize = require('./get-formatted-size')
const setAsWebsite = require('./set-as-website')

let time = new Date()

function scotty(source, bucket, region, website, quiet, logger) {
  if (!source || !bucket || !region)
    return Promise.reject('Source, bucket and region are required')

  return createBucket(bucket, region)
    .then(location => {
      if (!quiet)
        logger.log('   create'.magenta, '✤', colors.cyan(`${location} bucket`))

      return bucket
    })
    .catch(err => {
      if (err.code === 'BucketAlreadyOwnedByYou')
        return reuseBucket(bucket)

      throw err
    })
    .then(result => {
      if (!quiet)
        logger.log('   bucket'.magenta, '✤', colors.cyan(result))

      time = new Date().getTime()
      return upload(source, bucket)
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        return getFolderSize(source, (err, size) => {
          if (err)
            return reject(err)

          const duration = ((new Date().getTime() - time) / 1000).toFixed(2)

          if (!quiet)
            logger.log('   upload'.magenta, '✤', colors.cyan('completed'), `(${getFormattedSize(size)}, ${duration}s)`.cyan.dim)

          resolve()
        })
      })
    })
    .then(() => {
      if (website) {
        logger.log('   config'.magenta, '✤', 'set as a website'.cyan)

        return setAsWebsite(bucket)
      }

      return true
    })
    .then(() => {
      const endpoint = website ? `http://${bucket}.s3-website.${region}.amazonaws.com/` : `http://${bucket}.s3.amazonaws.com/`
      clipboardy.writeSync(endpoint)

      if (!quiet)
        logger.log('\nSuccessfully beamed up!'.magenta, colors.cyan(endpoint), '\nThis link should be copied to your clipboard now.'.magenta)

      return true
    })
    .catch(err => {
      if (!quiet)
        logger.error('Beam up failed 💥 '.red, colors.red(err && err.message ? err.message : err || ''))

      throw err
    })
}

module.exports = scotty
