const Translation = require('./translations.model')
// events-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'events'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    title: [{ type: Translation, required: true }],
    text: [{ type: Translation, required: true }],
    categories: [
      {
        type: ObjectId,
        ref: 'categories'
      }
    ],
    tags: [
      {
        type: ObjectId,
        ref: 'tags'
      }
    ],
    pics: [
      {
        url: { type: String },
        credit: { type: String }
      }
    ],
    organisation: {
      type: ObjectId,
      ref: 'organisations'
    },
    duration: {
      start: {
        type: Date
      },
      end: {
        type: Date
      }
    },
    isActive: {
      type: Boolean
    }
  }, {
    timestamps: true,
    collation: { locale: 'en', strength: 1 }
  })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model(modelName, schema)
}
