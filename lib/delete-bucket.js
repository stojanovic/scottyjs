'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const emptyBucket = require('./empty-bucket')

function deleteBucket(name, s3lib) {
  s3lib = s3lib || s3

  if (!name)
    return Promise.reject('Bucket name is required')

  const options = {
    Bucket: name
  }

  return emptyBucket(name)
    .then(() => s3lib.deleteBucket(options).promise())
    .then(() => name)
}

module.exports = deleteBucket
