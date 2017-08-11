'use strict'

const fs = require('fs')
const path = require('path')
const uploadFile = require('./upload-file')

function upload(source, bucket, prefix) {
  return new Promise((resolve, reject) => {
    fs.readdir(source, (err, files) => {
      if (err)
        return reject(err)

      if (!prefix && (!files || !files.length))
        return reject({
          message: 'Source folder is empty.'
        })

      resolve(files)
    })
  })
    .then(files => {
      return Promise.all(files.map(file => {
        const filePath = path.join(source, file)

        if (fs.lstatSync(filePath).isDirectory())
          return upload(filePath, bucket, (prefix ? prefix : '') + file + '/')

        return uploadFile(file, filePath, bucket, prefix || '')
      }))
    })
}

module.exports = upload
