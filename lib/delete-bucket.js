'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function deleteBucket(name, s3lib) {
  s3lib = s3lib || s3

  if (!name)
    return Promise.reject('Bucket name is required')

  const options = {
    Bucket: name,
    ACL: 'public-read'
  }

  return s3lib.deleteBucket(options)
    .promise()
    .then(result => result.Location)
}

module.exports = deleteBucket
