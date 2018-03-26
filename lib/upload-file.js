'use strict'

const fs = require('fs')
const mime = require('mime')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function uploadFile(fileName, filePath, bucket, prefix, s3lib) {
  s3lib = s3lib || s3
  prefix = prefix || ''

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, fileContent) => {
      if (err)
        return reject(err)

      resolve(fileContent)
    })
  })
    .then(fileContent => {
      return s3lib.putObject({
        Bucket: bucket,
        Key: prefix + fileName,
        ContentType: mime.lookup(fileName),
        Body: fileContent,
        ACL: 'public-read'
      }).promise()
    })
}

module.exports = uploadFile
