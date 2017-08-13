/* global jasmine, require, process */
'use strict'

const Jasmine = require('jasmine')
const SpecReporter = require('jasmine-spec-reporter').SpecReporter
const noop = function () {}
const jrunner = new Jasmine()
let filter

process.argv.slice(2).forEach(option => {
  if (option === 'full') {
    jrunner.configureDefaultReporter({
      print: noop
    }) // remove default reporter logs
    jasmine.getEnv().addReporter(new SpecReporter()) // add jasmine-spec-reporter
  }

  if (option.match('^filter='))
    filter = option.match('^filter=(.*)')[1]
})

jrunner.loadConfigFile() // load jasmine.json configuration
jrunner.execute(undefined, filter)
