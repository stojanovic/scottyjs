#!/usr/bin/env node

const path = require('path')
const minimist = require('minimist')
const AWS = require('aws-sdk')
const scotty = require('../index')
const inquirer = require('inquirer')
const levelup = require('level')
const colors = require('colors')
const db = levelup(path.join(__dirname, '..', '/scotty-db'))

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

    ✤ ✤ ✤

    USAGE:

    ${colors.magenta('scotty {options}')} ${colors.gray('or')} ${colors.magenta('beam-me-up {options}')}

    AVAILABLE OPTIONS:

    ${colors.magenta('--help')}    ${colors.white.dim('or')} ${colors.magenta('-h')}    Print this help
    ${colors.magenta('--version')} ${colors.white.dim('or')} ${colors.magenta('-v')}    Print the current version
    ${colors.magenta('--quiet')}   ${colors.white.dim('or')} ${colors.magenta('-q')}    Suppress output when executing commands
    ${colors.magenta('--website')} ${colors.white.dim('or')} ${colors.magenta('-w')}    Set uploaded folder as a static website, default: false
    ${colors.magenta('--source')}  ${colors.white.dim('or')} ${colors.magenta('-s')}    Source of the folder that will be uploaded, default: current folder
    ${colors.magenta('--bucket')}  ${colors.white.dim('or')} ${colors.magenta('-b')}    Name of the S3 bucket (default: name of the current folder)
    ${colors.magenta('--region')}  ${colors.white.dim('or')} ${colors.magenta('-r')}    AWS region where the files will be uploaded, default: saved region if exists or a list to choose one if it is not saved yet

    ✤ ✤ ✤

    ${colors.magenta('Beam me up, Scotty!')}
    More info: ${colors.cyan('https://github.com/stojanovic/scottyjs')}
  `)
}

function readArgs() {
  return minimist(process.argv.slice(2), {
		alias: { h: 'help', v: 'version', q: 'quiet', w: 'website', s: 'source', b: 'bucket', r: 'region' },
		string: ['source', 'bucket', 'region'],
		boolean: ['quiet', 'website'],
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
  return new Promise((resolve, reject) => {
    db.put('defaultRegion', region, err => {
      if (err)
        return reject(err)

      resolve(region)
    })
  })
}

function cmd(console) {
  const args = readArgs()
  const command = args._ && args._.length && args._[0]

  if (args.versiond)
		return console.log(require(path.join(__dirname, '..', 'package.json')).version)

  if (args.help)
		return showHelp()

  if (!AWS.config.credentials)
    return console.log(`Set AWS credentials first. Guide is available here: http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html`)

  if (!AWS.config.region)
    return getDefaultRegion()
      .catch(() => {
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
      .then(region => scotty(args.source, args.bucket, region, args.website, args.quiet, console))

  return scotty(args.source, args.bucket, AWS.config.region, args.website, args.quiet, console)
}

if (require.main === module)
  return cmd(console)

module.exports = cmd
