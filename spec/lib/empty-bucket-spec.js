/* global describe, spyOn, it, expect, beforeAll */
'use strict'

const underTest = require('../../lib/empty-bucket')
let s3spy

describe('Empty bucket', () => {
  beforeAll(() => {
    s3spy = {
      listObjectsV2: () => {},
      deleteObjects: () => {}
    }

    spyOn(s3spy, 'listObjectsV2').and.returnValue({
      promise: () => Promise.resolve({
        Contents: [
          { Key: 'test.html' },
          { Key: 'test2.css' }
        ]
      })
    })

    spyOn(s3spy, 'deleteObjects').and.returnValue({
      promise: () => Promise.resolve({})
    })
  })

  it('should be a function that returns a promise', () => {
    const emptyBucket = underTest().catch(() => {})

    expect(typeof underTest).toBe('function')
    expect(typeof emptyBucket.then).toBe('function')
    expect(typeof emptyBucket.catch).toBe('function')
  })

  it('should throw an error if the bucketName is not provided', (done) => {
    underTest()
      .then(done.fail)
      .catch(err => {
        expect(err).toBe('Bucket name is required')
        done()
      })
  })

  it('should invoke listObjectsV2 method of the s3 class to list the available objects', done => {
    underTest('bucketName', s3spy)
      .then(() => {
        expect(s3spy.listObjectsV2).toHaveBeenCalled()
        done()
      })
      .catch(done.fail)
  })

  it('should invoke listObjectsV2 method of the s3 class with options bucketName ', done => {
    underTest('bucketName', s3spy)
      .then(() => {
        expect(s3spy.listObjectsV2).toHaveBeenCalledWith({
          Bucket: 'bucketName'
        })
        done()
      })
      .catch(done.fail)
  })

})