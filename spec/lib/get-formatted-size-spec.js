/* global describe, it, expect */
'use strict'

const underTest = require('../../lib/get-formatted-size')

describe('Get formatted size', () => {
  it('should be a function', () => {
    expect(typeof underTest).toBe('function')
  })

  it('should throw an error if size is not provided or is not a number', () => {
    expect(() => underTest()).toThrowError('Size is required and it needs to be a number')
    expect(() => underTest('a')).toThrowError('Size is required and it needs to be a number')
    expect(() => underTest({})).toThrowError('Size is required and it needs to be a number')
    expect(() => underTest([1,2,3])).toThrowError('Size is required and it needs to be a number')
  })

  it('should throw an error if size is negative', () => {
    expect(() => underTest(-1).toThrowError('Size must be a positive number'))
  })

  it('should return a string with the size in bytes if size is less than 1024', () => {
    expect(typeof underTest(100)).toBe('string')
    expect(underTest(100)).toBe('100b')
    expect(underTest(0)).toBe('0b')
    expect(underTest(1023)).toBe('1023b')
  })

  it('should return the size in kilobytes if it is between 1024 and 1024*1024', () => {
    expect(underTest(1024)).toBe('1Kb')
    expect(underTest(1024 + 512)).toBe('1.50Kb')
    expect(underTest(1024 * 1023)).toBe('1023Kb')
    expect(underTest(1024 * 1024 - 1)).toBe('1024.00Kb')
  })

  it('should return the size in Mbs if it is larger than 1024*1024', () => {
    expect(underTest(1024 * 1024)).toBe('1Mb')
    expect(underTest((1024 + 512) * 1024)).toBe('1.50Mb')
  })
})
