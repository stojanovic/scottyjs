'use strict'

const colors = require('colors')
const getFolderSize = require('get-folder-size')

const createBucket = require('./create-bucket')
const reuseBucket = require('./reuse-bucket')
const upload = require('./upload')
const getFormattedSize = require('./get-formatted-size')
const setAsWebsite = require('./set-as-website')
const createRoute = require('./create-route')
const setCdn = require('./set-cdn')

let time = new Date()

function createOrUpdateBucket(options) {
  const logger = options.logger
  if (options.update)
    return Promise.resolve(options.bucket)

  return createBucket(options.bucket, options.region)
    .then(location => {
      if (!options.quiet)
        logger.log('   create'.magenta, '✤', colors.cyan(`${location} bucket`))

      return options.bucket
    })
    .catch(err => {
      if (err.code === 'BucketAlreadyOwnedByYou') {
        if (options.force)
          return options.bucket

        return reuseBucket(options.bucket)
      }

      if (err.code === 'BucketAlreadyExists')
        err.message += '\n\nTry running the command with a new bucket name: \n   scotty --bucket some-new-unique-name\n\nor change the name of your folder and re-run the same command.'

      if (err.code === 'InvalidLocationConstraint')
        err.message += '\n\nBucket already exists in a different region. Please change to: \n a) the correct region (using `-r region-name`) \n   OR \n b) a different bucket name (using `-b bucket-name`)'
      throw err
    })
}

function scotty(options) {
  if (!options || !options.source || !options.bucket || !options.region)
    return Promise.reject('Source, bucket and region are required')

  return createOrUpdateBucket(options)
    .then(result => {
      if (!options.quiet)
        options.logger.log('   bucket'.magenta, '✤', colors.cyan(result))

      time = new Date().getTime()
      return upload(options.source, options.bucket)
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        return getFolderSize(options.source, (err, size) => {
          if (err)
            return reject(err)

          const duration = ((new Date().getTime() - time) / 1000).toFixed(2)

          if (!options.quiet)
            options.logger.log('   upload'.magenta, '✤', colors.cyan('completed'), `(${getFormattedSize(size)}, ${duration}s)`.cyan.dim)

          resolve()
        })
      })
    })
    .then(() => {
      if (options.website || options.spa) {
        if (!options.quiet)
          options.logger.log('   config'.magenta, '✤', 'set as a website'.cyan)

        return setAsWebsite(options.bucket, options.spa)
          .then(() => {
            if (!options.quiet)
              options.logger.log('   config'.magenta, '✤', 'set cdn'.cyan)

            return setCdn(options.bucket)
          })
          .then(domainName => {
            return {
              cdn: true,
              domain: domainName,
              url: 'https://' + domainName
            }
          })
      }

      return true
    })
    .then( response => {
      return new Promise((resolve) => {
        if( response.domain && options.zoneId && options.domain ) {
          if (!options.quiet)
            options.logger.log('   config'.magenta, '✤', 'set r53 route '.cyan)
          return createRoute(response.domain, options.zoneId, options.domain)
            .then( change => {
              if (!options.quiet)
                options.logger.log('   config'.magenta, '✤', 'set r53 route II'.cyan)

              resolve(change)
            })
        } else {
          resolve(response)
        }
      })
    })
    .then(response => {
      const cdnUrl = response && response.cdn ? response.url : null
      const endpoint = options.website || options.spa ?
        ( options.region === 'us-east-1' ?
          `http://${options.bucket}.s3-website-${options.region}.amazonaws.com/` :
          `http://${options.bucket}.s3-website.${options.region}.amazonaws.com/` ) :
        `http://${options.bucket}.s3.amazonaws.com/`

      if (!options.quiet) {
        options.logger.log('\nSuccessfully beamed up!'.magenta, colors.cyan(endpoint), '\nThis link should be copied to your clipboard now.'.magenta)
        options.logger.log('\nCDN URL:'.magenta, colors.cyan(cdnUrl), '\nCloudFront is super slow, this link should be valid in next 10 minutes or so.'.magenta)
      }

      return endpoint
    })
    .catch(err => {
      if (!options.quiet)
        options.logger.error('\n 💥  Beam up failed 💥 \n'.red, colors.red(err && err.message ? err.message : err || ''))

      throw err
    })
}

module.exports = scotty
