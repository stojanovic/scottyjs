'use strict'

const colors = require('colors')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function setAsWebsite(options) {
  process.stdout.write('    set as website' + colors.yellow(' ✤ ') + `setting "${options.bucket}" S3 bucket as a website.`)
  
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
    .then(() => {
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
      process.stdout.write('    set as website' + colors.magenta(' ✤ ') + `set "${options.bucket}" S3 bucket as a website.\n`)

      return Object.assign({}, options)
    })
}

module.exports = setAsWebsite
