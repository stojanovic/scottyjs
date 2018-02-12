#!/usr/bin/env node

const path = require('path')
const minimist = require('minimist')
const scotty = require('../lib/scotty')

function readArgs() {
  return minimist(process.argv.slice(2), {
    alias: {
      b: 'bucket',
      d: 'delete',
      f: 'force',
      h: 'help',
      i: 'interactive',
      q: 'quiet',
      r: 'region',
      s: 'source',
      u: 'update',
      v: 'version',
      w: 'website'
    },
    string: ['source', 'bucket', 'region', 'config'],
    boolean: [
      'delete',
      'force',
      'interactive',
      'quiet',
      'reuse',
      'spa',
      'update',
      'website'
    ],
    default: {
      source: process.cwd(),
      bucket: path.parse(process.cwd()).name,
      config: path.join(process.cwd(), 'scotty.json')
    }
  })
}

function cmd() {
  const args = readArgs()
  const command = args._ && args._.length && args._[0]

  if (command === 'destroy') {
    console.log('Destroy current scotty build')
  }

  if (args.help) {
    console.log('Help, command:', command)
  }

  if (args.version) {
    const packageJson = require(path.join(__dirname, '..', 'package.json'))
    return console.log(`Scotty.js v${packageJson.version}`)
  }

  if (args.interactive) {
    // Run interactive scotty command
  }

  // console.log(args)

  scotty({
    bucket: args.bucket,
    config: args.config,
    log: !args.quiet,
    region: args.region,
    source: args.source,
    spa: args.spa,
    website: args.website
  }, console.log)
}

if (require.main === module)
  cmd(console)

module.exports = cmd
