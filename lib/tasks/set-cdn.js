'use strict'

const colors = require('colors')
const AWS = require('aws-sdk')
const cloudFront = new AWS.CloudFront()

function setCdn(options) {
  process.stdout.write(' cloud front cache' + colors.yellow(' ✤ ') + `setting CloudFront cache.`)
  
  const cloudFrontOptions = {
    DistributionConfig: { /* required */
      CallerReference: `scotty-${options.bucket}`, /* required */
      Comment: `scotty-${options.bucket}`, /* required */
      DefaultCacheBehavior: { /* required */
        ForwardedValues: { /* required */
          Cookies: { /* required */
            Forward: 'none' /* required */
          },
          QueryString: false /* required */
        },
        MinTTL: 0, /* required */
        TargetOriginId: options.bucket, /* required */
        TrustedSigners: { /* required */
          Enabled: false, /* required */
          Quantity: 0 /* required */
        },
        ViewerProtocolPolicy: 'redirect-to-https', /* required */
        AllowedMethods: {
          Items: ['GET', 'HEAD'],
          Quantity: 2, /* required */
          CachedMethods: {
            Items: ['GET', 'HEAD'],
            Quantity: 2
          }
        },
        Compress: true
      },
      Enabled: true, /* required */
      Origins: { /* required */
        Quantity: 1, /* required */
        Items: [
          {
            S3OriginConfig: {
              OriginAccessIdentity: ''
            },
            OriginPath: '',
            CustomHeaders: {
              Quantity: 0
            },
            Id: options.bucket,
            DomainName: `${options.bucket}.s3.amazonaws.com`
          }
        ]
      },
      CustomErrorResponses: {
        Quantity: 2, /* required */
        Items: [
          {
            ErrorCode: 403,
            ResponsePagePath: '/index.html',
            ResponseCode: '200',
            ErrorCachingMinTTL: 300
          },
          {
            ErrorCode: 404,
            ResponsePagePath: '/index.html',
            ResponseCode: '200',
            ErrorCachingMinTTL: 300
          }
        ]
      },
      DefaultRootObject: 'index.html',
      HttpVersion: 'http2',
      PriceClass: 'PriceClass_100',
      ViewerCertificate: {
        CloudFrontDefaultCertificate: true,
        MinimumProtocolVersion: 'SSLv3',
        CertificateSource: 'cloudfront'
      }
    }
  }

  return cloudFront.listDistributions({
    MaxItems: '1000'
  }).promise()
    .then(list => {
      // console.log(list.DistributionList.Items)
      if (list.DistributionList.Items.length) {
        const existingItem = list.DistributionList.Items
          .find(item => item.Comment && item.Comment === `scotty-${options.bucket}`)

        if (existingItem) {
          return cloudFront.createInvalidation({
            DistributionId: existingItem.Id, /* required */
            InvalidationBatch: { /* required */
              CallerReference: `scotty:${options.bucket}:${new Date().getTime()}`, /* required */
              Paths: { /* required */
                Quantity: 1, /* required */
                Items: [
                  '/*'
                ]
              }
            }
          }).promise()
            .then(() => {
              process.stdout.clearLine()
              process.stdout.cursorTo(0)
              process.stdout.write(' cloud front cache' + colors.magenta(' ✤ ') + `invalidate CloudFront cache.\n`)

              const result = Object.assign({}, options)

              return result
            })
        }
      }

      return cloudFront
        .createDistribution(cloudFrontOptions)
        .promise()
        .then(response => {
          const result = Object.assign({
            cdnUrl: response.Distribution.DomainName,
            cfId: response.Distribution.Id
          }, options)

          process.stdout.clearLine()
          process.stdout.cursorTo(0)
          process.stdout.write(' cloud front cache' + colors.magenta(' ✤ ') +  `set CloudFront CDN ("${result.cfId}" distribution).\n`)

          return result
        })
    })
    .catch(err => {
      console.log(err)

      throw err
    })
}

module.exports = setCdn
