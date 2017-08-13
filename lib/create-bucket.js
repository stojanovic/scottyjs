'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function createBucket(name, region, s3lib) {
  s3lib = s3lib || s3

  if (!name || !region)
    return Promise.reject('Bucket name and region are required')

  return s3lib.createBucket({
    Bucket: name,
    ACL: 'public-read',
    CreateBucketConfiguration: {
      LocationConstraint: region
    }
  }).promise()
    .then(result => result.Location)
}

module.exports = createBucket
