'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function createBucket(name, region, s3lib) {
  s3lib = s3lib || s3

  if (!name || !region)
    return Promise.reject('Bucket name and region are required')

  const options = {
    Bucket: name,
    ACL: 'public-read'
  }

  if(region !== 'us-east-1') {
    options.CreateBucketConfiguration = {
      LocationConstraint: region
    }
  }
  
  return s3lib.createBucket(options)
    .promise()
    .then(result => result.Location)
}

module.exports = createBucket
