'use strict'

function getFormattedSize(size) {
  if (typeof size !== 'number')
    throw new Error('Size is required and it needs to be a number')

  if (size < 0)
    throw new Error('Size must be a positive number')

  if (size >= 1024 * 1024) {
    const calculatedSize = size / 1024 / 1024
    if (Number.isInteger(calculatedSize))
      return `${calculatedSize}Mb`

    return `${(calculatedSize).toFixed(2)}Mb`
  }

  if (size >= 1024) {
    const calculatedSize = size / 1024
    if (Number.isInteger(calculatedSize))
      return `${calculatedSize}Kb`

    return `${(calculatedSize).toFixed(2)}Kb`
  }

  return `${size}b`
}

module.exports = getFormattedSize
