'use strict'

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function setExpirationDays(bucket, prefix, days) {
  const prefixName = (prefix || '/')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/^-$/, 'no-prefix')
    .replace(/^-/, '')
    .replace(/-$/, '')
  const scottyRuleId = `scotty-expiration-${prefixName}`

  return s3.getBucketLifecycleConfiguration({
    Bucket: bucket
  })
    .promise()
    .catch(() => { return {Rules: []} })
    .then((data) => {
      let rules = data.Rules
      const ruleExists = rules.filter((rule) => rule.ID === scottyRuleId).length > 0
      const currentRule = {
        ID: scottyRuleId,
        Expiration: {
          Days: days
        },
        Filter: {
          Prefix: prefix || ''
        },
        Status: 'Enabled',
        NoncurrentVersionExpiration: {
          NoncurrentDays: days
        },
        AbortIncompleteMultipartUpload: {
          DaysAfterInitiation: 7
        }
      }

      if (ruleExists) {
        rules = rules.filter((rule) => rule.ID !== scottyRuleId)
      }
      rules.push(currentRule)

      return s3.putBucketLifecycleConfiguration({
        Bucket: bucket,
        LifecycleConfiguration: {
          Rules: rules
        }
      })
        .promise()
    })
}

module.exports = setExpirationDays
