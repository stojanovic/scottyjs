/* global describe, it, expect, spyOn */
'use strict'

const underTest = require('../../lib/reuse-bucket')
let inquirer = {
  prompt: () => {}
}

describe('Reuse bucket', () => {
  it('should be a function', () => {
    spyOn(inquirer, 'prompt').and.returnValue(Promise.resolve())

    const reuseBucket = underTest('sampleBucket', inquirer).catch(() => {})

    expect(typeof underTest).toBe('function')
    expect(typeof reuseBucket.then).toBe('function')
    expect(typeof reuseBucket.catch).toBe('function')
  })

  it('should throw an error if answer is "No"', done => {
    spyOn(inquirer, 'prompt').and.returnValue(Promise.resolve({
      sameBucket: 'No'
    }))

    underTest('sampleBucket', inquirer)
      .then(done.fail)
      .catch(done)
  })

  it('should resolve if answer is "Yes"', done => {
    spyOn(inquirer, 'prompt').and.returnValue(Promise.resolve({
      sameBucket: 'Yes'
    }))

    underTest('sampleBucket', inquirer)
      .then(done)
      .catch(done.fail)
  })
})
