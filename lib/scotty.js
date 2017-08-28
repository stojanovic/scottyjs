'use strict'

const colors = require('colors')
const getFolderSize = require('get-folder-size')

const createBucket = require('./create-bucket')
const deleteBucket = require('./delete-bucket')
const reuseBucket = require('./reuse-bucket')
const upload = require('./upload')
const getFormattedSize = require('./get-formatted-size')
const setAsWebsite = require('./set-as-website')
const setCdn = require('./set-cdn')

let time = new Date()

function createOrUpdateBucket(bucket, region, update, force, quiet, logger) {
  if (update)
    return Promise.resolve(bucket)

  return createBucket(bucket, region)
    .then(location => {
      if (!quiet)
        logger.log('   create'.magenta, '✤', colors.cyan(`${location} bucket`))

      return bucket
    })
    .catch(err => {
      if (err.code === 'BucketAlreadyOwnedByYou') {
        if (force)
          return bucket

        return reuseBucket(bucket)
      }

      if (err.code === 'BucketAlreadyExists')
        err.message += '\n\nTry running the command with a new bucket name: \n   scotty --bucket some-new-unique-name\n\nor change the name of your folder and re-run the same command.'

      if (err.code === 'InvalidLocationConstraint')
        err.message += '\n\nBucket already exists in a different region. Please change to: \n a) the correct region (using `-r region-name`) \n   OR \n b) a different bucket name (using `-b bucket-name`)'
      throw err
    })
}

function destroyBucket(bucket, quiet, logger) {
  if (!bucket)
    return Promise.reject('Bucket is required')

  if (!quiet)
    logger.log('   empty'.magenta, '✤', colors.cyan(`${bucket} bucket`))
  return deleteBucket(bucket)
    .then(bucket => {
      if (!quiet)
        logger.log('   delete'.magenta, '✤', colors.cyan(`${bucket} bucket`))

      return bucket
    })
    .then(response => {
      if (!quiet) {
        logger.log('\nSuccessfully deleted'.magenta, colors.cyan(bucket), '!'.magenta)
      }
      return response
    })
    .catch(err => {
      if (!quiet)
        logger.error('\n 💥  Vaporization failed 💥 \n'.red, colors.red(err && err.message ? err.message : err || ''))
      throw err
    })
}

function scotty(source, bucket, region, website, spa, update, destroy, force, quiet, logger) {
  if (destroy)
    return destroyBucket(bucket, quiet, logger)

  if (!source || !bucket || !region)
    return Promise.reject('Source, bucket and region are required')

  return createOrUpdateBucket(bucket, region, update, force, quiet, logger)
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
      if (website || spa) {
        if (!quiet)
          logger.log('   config'.magenta, '✤', 'set as a website'.cyan)

        return setAsWebsite(bucket, spa)
          .then(() => {
            if (!quiet)
              logger.log('   config'.magenta, '✤', 'set cdn'.cyan)

            return setCdn(bucket)
          })
          .then(domainName => {
            return {
              cdn: true,
              url: 'https://' + domainName
            }
          })
      }

      return true
    })
    .then(response => {
      const cdnUrl = response && response.cdn ? response.url : null
      const endpoint = website || spa ?
        ( region === 'us-east-1' ?
          `http://${bucket}.s3-website-${region}.amazonaws.com/` :
          `http://${bucket}.s3-website.${region}.amazonaws.com/` ) :
        `http://${bucket}.s3.amazonaws.com/`

      if (!quiet) {
        logger.log('\nSuccessfully beamed up!'.magenta, colors.cyan(endpoint), '\nThis link should be copied to your clipboard now.'.magenta)
        logger.log('\nCDN URL:'.magenta, colors.cyan(cdnUrl), '\nCloudFront is super slow, this link should be valid in next 10 minutes or so.'.magenta)
      }

      return endpoint
    })
    .catch(err => {
      if (!quiet)
        logger.error('\n 💥  Beam up failed 💥 \n'.red, colors.red(err && err.message ? err.message : err || ''))

      throw err
    })
}

module.exports = scotty
