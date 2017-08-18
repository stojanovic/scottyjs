#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const AWS = require('aws-sdk')
const scotty = require('../index')
const inquirer = require('inquirer')
const colors = require('colors')
const clipboardy = require('clipboardy')

// Supported regions from http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region
const AWS_REGIONS = [
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'us-east-2',
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'ap-south-1',
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'sa-east-1'
]

function showHelp() {
  return console.log(`
    ${colors.magenta('Scotty')} ✤ ${colors.cyan('deploy static websites or folders to AWS S3 with a single command')}

    ${colors.magenta('Version:')} ${colors.cyan(require(path.join(__dirname, '..', 'package.json')).version)}

    ✤ ✤ ✤

    USAGE:

    ${colors.magenta('scotty {options}')} ${colors.cyan('or')} ${colors.magenta('beam-me-up {options}')}

    AVAILABLE OPTIONS:

    ${colors.magenta('--help')}    ${colors.cyan('or')} ${colors.magenta('-h')}    Print this help
    ${colors.magenta('--version')} ${colors.cyan('or')} ${colors.magenta('-v')}    Print the current version
    ${colors.magenta('--quiet')}   ${colors.cyan('or')} ${colors.magenta('-q')}    Suppress output when executing commands ${colors.cyan('| default: false')}
    ${colors.magenta('--website')} ${colors.cyan('or')} ${colors.magenta('-w')}    Set uploaded folder as a static website ${colors.cyan('| default: false')}
    ${colors.magenta('--spa')}              Set uploaded folder as a single page app and redirect all non-existing pages to index.html ${colors.cyan('| default: false')}
    ${colors.magenta('--source')}  ${colors.cyan('or')} ${colors.magenta('-s')}    Source of the folder that will be uploaded ${colors.cyan('| default: current folder')}
    ${colors.magenta('--bucket')}  ${colors.cyan('or')} ${colors.magenta('-b')}    Name of the S3 bucket ${colors.cyan('| default: name of the current folder')}
    ${colors.magenta('--region')}  ${colors.cyan('or')} ${colors.magenta('-r')}    AWS region where the files will be uploaded ${colors.cyan('| default: saved region if exists or a list to choose one if it is not saved yet')}
    ${colors.magenta('--force')}   ${colors.cyan('or')} ${colors.magenta('-f')}    Update the bucket without asking, region can be overridden with ${colors.magenta('-r')} ${colors.cyan('| default: false')} 
    ${colors.magenta('--update')}  ${colors.cyan('or')} ${colors.magenta('-u')}    Update existing bucket ${colors.cyan('| default: false')}

    ✤ ✤ ✤

    ${colors.magenta('Beam me up, Scotty!')}
    More info: ${colors.cyan('https://github.com/stojanovic/scottyjs')}

    Changelog/release history: ${colors.cyan('https://github.com/stojanovic/scottyjs/releases')}
  `)
}

function readArgs() {
  return minimist(process.argv.slice(2), {
    alias: {
      h: 'help',
      v: 'version',
      q: 'quiet',
      w: 'website',
      s: 'source',
      b: 'bucket',
      r: 'region',
      f: 'force',
      u: 'update'
    },
    string: ['source', 'bucket', 'region'],
    boolean: ['quiet', 'website', 'spa', 'force', 'update'],
    default: {
      source: process.cwd(),
      bucket: path.parse(process.cwd()).name
    }
  })
}

function getDefaultRegion() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '..', '.scotty-config.json'), (err, data) => {
      if (err && err.code === 'ENOENT') {
        fs.readFile(path.join('/tmp', '.scotty-config.json'), (err, data) => {
          if (data) {
            const region = JSON.parse(data.toString('utf8')).region
            if (region)
              return resolve(region)
          }

          reject('No default region')
        })
      }

      if (data) {
        const region = JSON.parse(data.toString('utf8')).region
        if (region)
          return resolve(region)
      }

      reject('No default region')
    })
  })
}

function saveDefaultRegion(region) {
  return new Promise((resolve) => {
    fs.writeFile(path.join(__dirname, '..', '.scotty-config.json'), `{"region":"${region}"}`, 'utf8', err => {
      if (err) {
        fs.writeFile(path.join('/tmp', '.scotty-config.json'), `{"region":"${region}"}`, 'utf8', () => {
          resolve(region)
        })
      }

      resolve(region)
    })
  })
}

function cmd(console) {
  const args = readArgs()

  if (args.version)
    return console.log(require(path.join(__dirname, '..', 'package.json')).version)

  if (args.help)
    return showHelp()

  if (!AWS.config.credentials)
    return console.log(`Set AWS credentials first. Guide is available here: http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html`)

  if (!AWS.config.region)
    return getDefaultRegion()
      .catch(() => {
        if (args.force)
          return saveDefaultRegion(args.region || 'us-east-1')

        return inquirer.prompt([{
          type: 'list',
          name: 'region',
          message: `Where do you want me to beam you up to?`,
          choices: AWS_REGIONS,
          default: 'us-east-1'
        }])
          .then(result => result.region)
          .then(saveDefaultRegion)
      })
      .then(region => beamUp(args, region))

  return beamUp(args, AWS.config.region)
}

function beamUp (args, region) {
  return scotty(args.source, args.bucket, region, args.website, args.spa, args.update, args.force, args.quiet, console)
    .then(endpoint => clipboardy.write(endpoint)).then(() => process.exit(1))
    .catch(() => process.exit(1))
}

if (require.main === module)
  cmd(console)

module.exports = cmd
