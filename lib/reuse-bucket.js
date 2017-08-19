'use strict'

const inquirer = require('inquirer')

function reuseBucket(bucket, promptLib) {
  promptLib = promptLib || inquirer

  return promptLib.prompt([{
    type: 'list',
    name: 'sameBucket',
    message: `"${bucket}" bucket already exist, do you want to use it?`,
    choices: ['Yes', 'No'],
    default: 'No'
  }])
    .then(result => {
      if (!result || !result.sameBucket || result.sameBucket === 'No')
        throw {
          message: 'Re-run command with a new bucket name.'
        }

      return bucket
    })
}

module.exports = reuseBucket
