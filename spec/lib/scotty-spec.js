/* global describe, it, expect */
'use strict'

const underTest = require('../../lib/scotty')

describe('Scotty', () => {
  it('should be a function that exports a promise', () => {
    const scotty = underTest().catch(() => {})

    expect(typeof underTest).toBe('function')
    expect(typeof scotty.then).toBe('function')
    expect(typeof scotty.catch).toBe('function')
  })
})
