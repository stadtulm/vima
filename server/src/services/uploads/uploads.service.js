// Initializes the `uploads` service on path `/uploads`
const hooks = require('./uploads.hooks')

const AWS = require('aws-sdk')
const S3BlobStore = require('s3-blob-store')
const BlobService = require('feathers-blob')
const multer = require('multer')
const multipartMiddleware = multer()

module.exports = function (app) {
  const s3 = new AWS.S3({
    endpoint: 'https://s3.eu-central-1.amazonaws.com',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })

  const blobStore = S3BlobStore({
    client: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    returnUri: false
  })

  app.use('/uploads',
    multipartMiddleware.single('uri'),
    function (req, res, next) {
      req.feathers.uuid = req.body.uuid
      req.feathers.file = req.file
      next()
    },
    BlobService({
      Model: blobStore
    })
  )

  // Get our initialized service so that we can register hooks
  const service = app.service('uploads')
  service.hooks(hooks)
}
