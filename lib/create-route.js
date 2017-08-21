'use strict'

const AWS = require('aws-sdk')
const r53 = new AWS.Route53()

function createRoute(endpoint, zoneId, name, r53lib) {
  r53lib = r53lib || r53

  if (!endpoint || !zoneId || !name)
    return Promise.reject('endpoint and zoneId are required')

  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: `${name}`,
            Type: 'A',
            TTL: 600,
            ResourceRecords: [
              {
                Value: `${endpoint}`
              }
            ]
          }
        }
      ],
      Comment: 'scotty dns upsert'
    },
    HostedZoneId: `${zoneId}`
  }

  return r53lib.changeResourceRecordSets(params)
    .promise()
    .then(result => result.ChangeInfo)
}

module.exports = createRoute