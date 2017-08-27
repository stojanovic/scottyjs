'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function deleteObjects(bucketName, keys, s3lib) {
  s3lib = s3lib || s3

  if (!bucketName || !keys || !Array.isArray(keys))
    return Promise.reject('Bucket name or an array of keys are required')

  const options = {
    Bucket: bucketName,
    Delete: {
      Objects: [],
      Quiet: false
    }
  }

  keys.forEach(key => {
    options.Delete.Objects.push({Key: key})
  })

  if (keys.length < 1)
    return Promise.resolve()

  return s3lib.deleteObjects(options)
    .promise()
    .then(result => result)
    .catch(err => {
      throw err
    })
}

module.exports = deleteObjects