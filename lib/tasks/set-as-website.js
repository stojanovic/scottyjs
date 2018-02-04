'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function setAsWebsite(options) {
  console.log('Set as website')
  return s3.putBucketWebsite({
    Bucket: options.bucket,
    ContentMD5: '',
    WebsiteConfiguration: {
      ErrorDocument: {
        Key: options.spa ? 'index.html' : options.errorDocument || 'error.html'
      },
      IndexDocument: {
        Suffix: 'index.html'
      }
    }
  })
    .promise()
}

module.exports = setAsWebsite
