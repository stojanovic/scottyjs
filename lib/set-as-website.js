'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function setAsWebsite(bucket, isSpa) {
  return s3.putBucketWebsite({
    Bucket: bucket,
    ContentMD5: '',
    WebsiteConfiguration: {
      ErrorDocument: {
        Key: isSpa ? 'index.html' : 'error.html'
      },
      IndexDocument: {
        Suffix: 'index.html'
      }
    }
  })
    .promise()
}

module.exports = setAsWebsite
