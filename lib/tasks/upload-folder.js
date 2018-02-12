'use strict'

const fs = require('fs')
const path = require('path')
const colors = require('colors')
const uploadFile = require('./upload-file')
const getFormattedSize = require('../utils/get-formatted-size')

const filesInfo = {
  totalNum: 0,
  totalSize: 0,
  uploadedNum: 0,
  uploadedSize: 0,
  percentage: 0
}

function logPercentage(filesInfo) {
  const limitedPercentage = parseInt(filesInfo.percentage / 4, 10)
  process.stdout.clearLine()
  process.stdout.cursorTo(0)

  if (filesInfo.totalNum === filesInfo.uploadedNum) {
    process.stdout.write('      upload files' + colors.magenta(' ✤ ') + colors.green.bold(Array(limitedPercentage + 1).join('—')) + colors.dim.bold(Array(26 - limitedPercentage).join('—')) + ` ${filesInfo.percentage}% ${filesInfo.uploadedNum}/${filesInfo.totalNum} files ` + colors.dim(`(${getFormattedSize(filesInfo.uploadedSize)}/${getFormattedSize(filesInfo.totalSize)})`))
    return process.stdout.write('\n')
  }

  process.stdout.write('      upload files' + colors.yellow(' ✤ ') + colors.green.bold(Array(limitedPercentage + 1).join('—')) + colors.dim.bold(Array(26 - limitedPercentage).join('—')) + ` ${filesInfo.percentage}% ${filesInfo.uploadedNum}/${filesInfo.totalNum} files ` + colors.dim(`(${getFormattedSize(filesInfo.uploadedSize)}/${getFormattedSize(filesInfo.totalSize)})`))
}

function uploadFolder(options, s3, logger) {
  return new Promise((resolve, reject) => {
    fs.readdir(options.source, (err, files) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return reject({
            type: 'SCOTTY_ERROR',
            title: 'Source doesn\'t exist',
            message: 'Source folder doesn\'t exist. You can select another source folder using "--source" option.'
          })
        }

        return reject(err)
      }

      if (!options.prefix && (!files || !files.length))
        return reject({
          type: 'SCOTTY_ERROR',
          title: 'Source is empty',
          message: 'Source folder seems to be empty. You can select another source folder using "--source" option.'
        })

      resolve(files)
    })
  })
    .then(files => {
      return Promise.all(files.map(file => {
        const filePath = path.join(options.source, file)

        if (fs.lstatSync(filePath).isDirectory()) {
          const optionsCopy = Object.assign({}, options, {
            source: filePath,
            prefix: (options.prefix ? options.prefix : '') + file + '/'
          })
          
          return uploadFolder(optionsCopy, s3, logger)
        }

        const fileSize = fs.statSync(filePath).size
        filesInfo.totalNum++
        filesInfo.totalSize += fileSize
        
        if (options.log)
          logPercentage(filesInfo, logger)
        
        return uploadFile(file, filePath, options.bucket, options.prefix || '', s3)
          .then(result => {
            filesInfo.uploadedNum++
            filesInfo.uploadedSize += fileSize
            filesInfo.percentage = parseInt((filesInfo.uploadedSize / filesInfo.totalSize) * 100, 10)

            if (options.log)
              logPercentage(filesInfo, logger)

            return result
          })
      }))
    })
    .then(() => {
      return Object.assign({}, options)
    })
}

module.exports = uploadFolder
