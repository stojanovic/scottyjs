'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const emptyBucket = require('./empty-bucket')

function deleteBucket(options, s3lib) {
  s3lib = s3lib || s3

  if (!options.bucket)
    return Promise.reject('Bucket name is required')

  const s3Options = {
    Bucket: options.bucket
  }

  return emptyBucket(options.bucket)
    .then(() => s3lib.deleteBucket(s3Options).promise())
    .then(() => options)
}

module.exports = deleteBucket
