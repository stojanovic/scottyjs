'use strict'

function getFormattedSize(size) {
  if (size > 1024 * 1024)
    return `${size / 1024 / 1024}Mb`

  if (size > 1024)
    return `${size / 1024}Kb`

  return `${size}b`
}

module.exports = getFormattedSize
