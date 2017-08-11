'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function createBucket(name, region) {
  return s3.createBucket({
    Bucket: name,
    ACL: 'public-read',
    CreateBucketConfiguration: {
      LocationConstraint: region
    }
  }).promise()
    .then(result => result.Location)
}

module.exports = createBucket
