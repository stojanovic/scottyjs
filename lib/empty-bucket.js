'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const deleteObjects = require('./delete-objects')

function emptyBucket(name, s3lib) {
  s3lib = s3lib || s3

  if (!name)
    return Promise.reject('Bucket name is required')

  const options = {
    Bucket: name
  }

  return s3lib.listObjectsV2(options)
    .promise()
    .then(result => {
      let keys = result.Contents.map(item => item.Key)
      return deleteObjects(name, keys, s3lib)
    })
    .catch(err => {
      throw err })
}

module.exports = emptyBucket