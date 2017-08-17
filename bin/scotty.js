#!/usr/bin/env node

const path = require('path')
const minimist = require('minimist')
const AWS = require('aws-sdk')
const scotty = require('../index')
const inquirer = require('inquirer')
const levelup = require('level')
const colors = require('colors')

// TODO: simplify/six this
let db = levelup(path.join(__dirname, '..', '/scotty-db'), {}, err => {
  // There's an issue for those who needs to run `npm i -g` with sudo
  // So we'll try to save DB in home dir
  if (err)
    db = levelup(path.join('~', '/.scotty-db'), {}, err => {
      // And as a final fallback to TMP
      if (err)
        db = levelup(path.join('tmp', '/.scotty-db'))
    })
})

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
    ${colors.magenta('--force')}   ${colors.cyan('or')} ${colors.magenta('-f')}    Update the bucket and pick "eu-central-1" region without asking ${colors.cyan('| default: false')}

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
      f: 'force'
    },
    string: ['source', 'bucket', 'region'],
    boolean: ['quiet', 'website', 'spa', 'force'],
    default: {
      source: process.cwd(),
      bucket: path.parse(process.cwd()).name
    }
  })
}

function getDefaultRegion() {
  return new Promise((resolve, reject) => {
    db.get('defaultRegion', (err, region) => {
      if (err)
        return reject(err)

      resolve(region)
    })
  })
}

function saveDefaultRegion(region) {
  return new Promise((resolve) => {
    db.put('defaultRegion', region, () => resolve(region))
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
          return saveDefaultRegion('eu-central-1')

        return inquirer.prompt([{
          type: 'list',
          name: 'region',
          message: `Where do you want me to beam you up to?`,
          choices: AWS_REGIONS,
          default: 'eu-central-1'
        }])
          .then(result => result.region)
          .then(saveDefaultRegion)
      })
      .then(region => scotty(args.source, args.bucket, region, args.website, args.spa, args.force, args.quiet, console))
      .then(() => process.exit(1))
      .catch(() => process.exit(1))

  return scotty(args.source, args.bucket, AWS.config.region, args.website, args.spa, args.force, args.quiet, console)
    .then(() => process.exit(1))
    .catch(() => process.exit(1))
}

if (require.main === module)
  cmd(console)

module.exports = cmd
