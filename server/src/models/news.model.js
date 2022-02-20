const Translation = require('./translations.model')
// news-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html

// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'news'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    title: [{ type: Translation, required: true }],
    subTitle: [{ type: Translation }],
    text: [{ type: Translation, required: true }],
    pics: [
      {
        url: { type: String },
        credit: { type: String }
      }
    ],
    videos: [
      {
        type: {
          type: String,
          enum: ['youtube', 'vimeo']
        },
        id: {
          type: String
        }
      }
    ],
    author: {
      type: ObjectId,
      ref: 'users'
    },
    isActive: { type: Boolean },
    isInternal: { type: Boolean }
  }, {
    timestamps: true
  })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model(modelName, schema)
}
