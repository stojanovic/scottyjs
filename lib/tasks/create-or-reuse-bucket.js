'use strict'

const reuseBucket = require('./reuse-bucket')
const colors = require('colors')

function createOrReuseBucket(options, s3, logger) {
  if (!options.bucket)
    return Promise.reject('Bucket name is required')

  const bucketOptions = {
    ACL: 'public-read',
    Bucket: options.bucket,
    CreateBucketConfiguration: {
      LocationConstraint: options.region || s3.config.region
    }
  }
  
  return s3
    .createBucket(bucketOptions)
    .promise()
    .then(result => result.Location)
    .then(() => {
      if (options.log)
        logger(colors.inverse.green('    Create bucket   ') + ` "${options.bucket}" S3 bucket is created in ${options.region ? options.region : 'your default'} region`)

      return Object.assign({ isBucketCreatedByScotty: true }, options)
    })
    .catch(err => {
      if (err.code === 'BucketAlreadyOwnedByYou') {
        if (options.reuse)
          return Object.assign({ isBucketCreatedByScotty: true }, options)

        return reuseBucket(options)
      }

      if (err.code === 'BucketAlreadyExists') {
        err.type = 'SCOTTY_ERROR'
        err.title = 'Bucket already exists'
        err.message = 'The requested bucket name is not available. The bucket namespace is shared by all AWS S3 users. To fix this issue, you can change the name of the folder you are deploying and re-run the same command, or you can re-run scotty command and provide different bucket name by adding "--bucket" option, for example:\n\n' +
          colors.magenta('    scotty --bucket some-new-unique-name\n')
      }

      if (err.code === 'InvalidLocationConstraint') {
        err.type = 'SCOTTY_ERROR'
        err.title = 'Wrong bucket region',
        err.message = 'Bucket already exists in a different region. Please change to: \n\n 1) the correct region (using "-r region-name" option).\n 2) a different bucket name (using the "-b bucket-name" option).\n'
      }

      throw err
    })
    .then(options => {
      if (options.log)
        logger(colors.inverse.green('    Select bucket   ') + ` "${options.bucket}" S3 bucket is selected`)

      return options
    })
}

module.exports = createOrReuseBucket
