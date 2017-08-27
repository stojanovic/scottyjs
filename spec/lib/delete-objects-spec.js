/* global describe, spyOn, it, expect, beforeAll */
'use strict'

const underTest = require('../../lib/delete-objects')
let s3spy

describe('Delete objects', () => {
  beforeAll(() => {
    s3spy = {
      deleteObjects: () => {
      }
    }

    spyOn(s3spy, 'deleteObjects').and.returnValue({
      promise: () => Promise.resolve({
        Location: 'http://example.com'
      })
    })
  })

  it('should be a function that returns a promise', () => {
    const deleteObjects = underTest().catch(() => {})

    expect(typeof underTest).toBe('function')
    expect(typeof deleteObjects.then).toBe('function')
    expect(typeof deleteObjects.catch).toBe('function')
  })

  it('should throw an error if the bucketName and keys are not provided', (done) => {
    underTest()
      .then(done.fail)
      .catch(err => {
        expect(err).toBe('Bucket name or an array of keys are required')
        done()
      })
  })

  it('should throw an error if bucketName is and keys are not provided', (done) => {
    underTest('bucketName')
      .then(done.fail)
      .catch(err => {
        expect(err).toBe('Bucket name or an array of keys are required')
        done()
      })
  })

  it('should throw an error if bucketName and keys are provided, but keys are not an array', (done) => {
    underTest('bucketName', {})
      .then(done.fail)
      .catch(err => {
        expect(err).toBe('Bucket name or an array of keys are required')
        done()
      })
  })

  it('should invoke deleteObjects method of the s3 class', done => {
    underTest('bucketName', ['testKey'], s3spy)
      .then(() => {
        expect(s3spy.deleteObjects).toHaveBeenCalled()
        done()
      })
      .catch(done.fail)
  })

  it('should invoke deleteObjects method of the s3 class with options: bucketName and testKey ', done => {
    underTest('bucketName', ['testKey'], s3spy)
      .then(() => {
        expect(s3spy.deleteObjects).toHaveBeenCalledWith({
          Bucket: 'bucketName',
          Delete: {
            Objects: [
              { Key: 'testKey' }
            ],
            Quiet: false
          }
        })
        done()
      })
      .catch(done.fail)
  })

})