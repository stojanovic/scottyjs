#!/usr/bin/env node

const path = require('path')
const minimist = require('minimist')
const scotty = require('../lib/scotty')

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
      u: 'update',
      d: 'delete',
      i: 'interactive'
    },
    string: ['source', 'bucket', 'region'],
    boolean: ['quiet', 'website', 'spa', 'force', 'update', 'delete', 'interactive'],
    default: {
      source: process.cwd(),
      bucket: path.parse(process.cwd()).name
    }
  })
}

function cmd() {
  const args = readArgs()
  // const command = args._ && args._.length && args._[0]

  if (args.version) {
    const packageJson = require(path.join(__dirname, '..', 'package.json'))
    return console.log(`Scotty.js v${packageJson.version}`)
  }

  if (args.interactive) {
    // Run interactive scotty command
  }

  console.log(args)

  scotty({
    log: !args.quiet,
    spa: args.spa,
    website: args.website
  })
}

if (require.main === module)
  cmd(console)

module.exports = cmd
