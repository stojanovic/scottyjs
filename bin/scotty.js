#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const AWS = require('aws-sdk')
const scotty = require('../index')
const inquirer = require('inquirer')
const colors = require('colors')
const clipboardy = require('clipboardy')
const configFilePath = path.join(__dirname, '..', '.scotty-config.json')

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
  'sa-east-1',
  'cn-north-1'
]

function showHelp() {
  return console.log(`
    ${colors.magenta('Scotty')} ✤ ${colors.cyan('deploy static websites or folders to AWS S3 with a single command')}

    ${colors.magenta('Version:')} ${colors.cyan(require(path.join(__dirname, '..', 'package.json')).version)}

    ✤ ✤ ✤

    USAGE:

    ${colors.magenta('scotty {options}')} ${colors.cyan('or')} ${colors.magenta('beam-me-up {options}')}

    AVAILABLE OPTIONS:

    ${colors.magenta('--help')}        ${colors.cyan('or')} ${colors.magenta('-h')}    Print this help
    ${colors.magenta('--version')}     ${colors.cyan('or')} ${colors.magenta('-v')}    Print the current version
    ${colors.magenta('--quiet')}       ${colors.cyan('or')} ${colors.magenta('-q')}    Suppress output when executing commands ${colors.cyan('| default: false')}
    ${colors.magenta('--noclipboard')} ${colors.cyan('or')} ${colors.magenta('-n')}    Do not copy the URL to clipboard ${colors.cyan('| default: false')}
    ${colors.magenta('--website')}     ${colors.cyan('or')} ${colors.magenta('-w')}    Set uploaded folder as a static website ${colors.cyan('| default: false')}
    ${colors.magenta('--spa')}                  Set uploaded folder as a single page app and redirect all non-existing pages to index.html ${colors.cyan('| default: false')}
    ${colors.magenta('--source')}      ${colors.cyan('or')} ${colors.magenta('-s')}    Source of the folder that will be uploaded ${colors.cyan('| default: current folder')}
    ${colors.magenta('--bucket')}      ${colors.cyan('or')} ${colors.magenta('-b')}    Name of the S3 bucket ${colors.cyan('| default: name of the current folder')}
    ${colors.magenta('--prefix')}      ${colors.cyan('or')} ${colors.magenta('-p')}    Prefix on the S3 bucket ${colors.cyan('| default: the root of the bucket')}
    ${colors.magenta('--region')}      ${colors.cyan('or')} ${colors.magenta('-r')}    AWS region where the files will be uploaded ${colors.cyan('| default: saved region if exists or a list to choose one if it is not saved yet')}
    ${colors.magenta('--force')}       ${colors.cyan('or')} ${colors.magenta('-f')}    Update the bucket without asking, region can be overridden with ${colors.magenta('-r')} ${colors.cyan('| default: false')}
    ${colors.magenta('--update')}      ${colors.cyan('or')} ${colors.magenta('-u')}    Update existing bucket ${colors.cyan('| default: false')}
    ${colors.magenta('--delete')}      ${colors.cyan('or')} ${colors.magenta('-d')}    Delete existing bucket ${colors.cyan('| default: false')}
    ${colors.magenta('--nocdn')}       ${colors.cyan('or')} ${colors.magenta('-c')}    Disable Cloudfront handling ${colors.cyan('| default: false')}
    ${colors.magenta('--urlonly')}     ${colors.cyan('or')} ${colors.magenta('-o')}    Only output the resulting URL, CDN or S3 according to options ${colors.cyan('| default: false')}
    ${colors.magenta('--expire')}      ${colors.cyan('or')} ${colors.magenta('-e')}    Delete objects on bucket older than n days ${colors.cyan('| default: no expiration')}
    ${colors.magenta('--profile')}     ${colors.cyan('or')} ${colors.magenta('-a')}    AWS profile to be used ${colors.cyan('| default: default')}
    ${colors.magenta('--empty')}       ${colors.cyan('or')} ${colors.magenta('-y')}    Empty the bucket (Delete all objects before upload files) ${colors.cyan('| default: false')}

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
      n: 'noclipboard',
      w: 'website',
      s: 'source',
      b: 'bucket',
      p: 'prefix',
      r: 'region',
      f: 'force',
      u: 'update',
      d: 'delete',
      c: 'nocdn',
      o: 'urlonly',
      e: 'expire',
      a: 'profile',
      y: 'empty'
    },
    string: ['source', 'bucket', 'prefix', 'region', 'profile'],
    boolean: ['quiet', 'website', 'spa', 'force', 'update', 'delete', 'empty'],
    default: {
      source: process.cwd(),
      bucket: path.parse(process.cwd()).name,
      prefix: ''
    }
  })
}

function getConfigFile() {
  try {
    return require(configFilePath)
  } catch(e) {
    return {}
  }
}

function getDefaultRegion() {
  return new Promise((resolve, reject) => {
    fs.readFile(configFilePath, (err, data) => {
      if (err && err.code === 'ENOENT') {
        fs.readFile(configFilePath, (err, data) => {
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
    fs.writeFile(configFilePath, `{"region":"${region}"}`, 'utf8', err => {
      if (err) {
        fs.writeFile(configFilePath, `{"region":"${region}"}`, 'utf8', () => {
          resolve(region)
        })
      }

      resolve(region)
    })
  })
}

function setAWSProfile(profile) {
  const options = {}

  // Replace the file value for the CLI one if exist
  if (profile) {
    options.profile = profile
    
    // update the Credentials for the current value or the default value which is 'default'
    AWS.config.credentials = new AWS.SharedIniFileCredentials(options)
  }
}

function cmd(console) {
  const args = readArgs()

  if (args.version)
    return console.log(require(path.join(__dirname, '..', 'package.json')).version)

  if (args.help)
    return showHelp()

  setAWSProfile(args.profile)

  // if a non-existent profile is set AWS.config.credentials.accessKeyId will be undefined
  if (!AWS.config.credentials || !AWS.config.credentials.accessKeyId)
    return console.log(`Set AWS credentials first. Guide is available here: http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html`)

  if (!args.region) {
    return getDefaultRegion()
      .catch(() => {
        if (args.force)
          return 'us-east-1'

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
      .then(region => beamUp(args, region, console))
  }

  return saveDefaultRegion(args.region)
    .then(() => beamUp(args, args.region, console))
}

function beamUp (args, region, console) {
  const s3 = new AWS.S3({
    region: region
  })
  const promise = scotty(args.source, args.bucket, args.prefix, region, args.website, args.spa, args.update, args.delete, args.nocdn, args.urlonly, args.expire, args.force, args.empty, args.quiet, !args.noclipboard, console, s3)

  if (!args.noclipboard) {
    promise.then(endpoint => clipboardy.write(endpoint))
  }

  return promise
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

if (require.main === module)
  cmd(console)

module.exports = cmd
