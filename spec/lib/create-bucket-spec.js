/* global describe, spyOn, it, expect, beforeAll */
'use strict'

const underTest = require('../../lib/create-bucket')
let s3spy

describe('Create a bucket', () => {
  beforeAll(() => {
    s3spy = {
      createBucket: () => {}
    }

    spyOn(s3spy, 'createBucket').and.returnValue({
      promise: () => Promise.resolve({
        Location: 'http://example.com'
      })
    })
  })

  it('should be a function that returns a promise', () => {
    const createBucket = underTest().catch(() => {})

    expect(typeof underTest).toBe('function')
    expect(typeof createBucket.then).toBe('function')
    expect(typeof createBucket.catch).toBe('function')
  })

  it('should throw an error if name and region are not provided', (done) => {
    underTest()
      .then(done.fail)
      .catch(err => {
        expect(err).toBe('Bucket name and region are required')
        done()
      })
  })

  it('should throw an error if name is and region is not provided', (done) => {
    underTest('bucketName')
      .then(done.fail)
      .catch(err => {
        expect(err).toBe('Bucket name and region are required')
        done()
      })
  })

  it('should invoke createBucket method of s3 class', done => {
    underTest('bucketName', 'eu-central-1', s3spy)
      .then(() => {
        expect(s3spy.createBucket).toHaveBeenCalled()
        done()
      })
      .catch(done.fail)
  })

  it('should invoke createBucket method of s3 class with options', done => {
    underTest('bucketName', 'eu-central-1', s3spy)
      .then(() => {
        expect(s3spy.createBucket).toHaveBeenCalledWith({
          Bucket: 'bucketName',
          ACL: 'public-read',
          CreateBucketConfiguration: {
            LocationConstraint: 'eu-central-1'
          }
        })
        done()
      })
      .catch(done.fail)
  })
})
