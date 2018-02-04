'use strict'

const inquirer = require('inquirer')

function reuseBucket(options, promptLib) {
  promptLib = promptLib || inquirer

  return promptLib.prompt([
    {
      type: 'list',
      name: 'sameBucket',
      message: `"${options.bucket}" bucket already exists, do you want to use it?`,
      choices: ['Yes', 'No'],
      default: 'No'
    }
  ])
    .then(result => {
      if (!result || !result.sameBucket || result.sameBucket === 'No')
        throw {
          type: 'SCOTTY_ERROR',
          title: 'Bucket reuse rejected',
          message: 'Re-run command with a new bucket name.'
        }

      return Object.assign({ isBucketCreatedByScotty: false }, options)
    })
}

module.exports = reuseBucket
