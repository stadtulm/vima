const Translation = require('./translations.model')
// discussion-messages-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'discussionMessages'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    discussion: {
      type: ObjectId,
      ref: 'discussions'
    },
    author: {
      type: ObjectId,
      ref: 'users'
    },
    text: [
      {
        type: Translation
      }
    ],
    repliesTo: {
      type: ObjectId,
      ref: 'discussionMessages'
    },
    replies: [
      {
        type: ObjectId,
        ref: 'discussionMessages'
      }
    ],
    editedAt: { type: Date }
  }, {
    timestamps: true
  })

  schema.virtual('latestAnswers', {
    ref: 'discussionMessages', // Collection
    localField: '_id', // Here
    foreignField: 'repliesTo', // There
    justOne: true,
    options: {
      sort: { updatedAt: -1 }
    }
  })

  // Ensure virtual fields are serialised.
  schema.set('toJSON', { virtuals: true })
  schema.set('toObject', { virtuals: true })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model(modelName, schema)
}
