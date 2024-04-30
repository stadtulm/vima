const Translation = require('./translations-entity.model')

// chat-messages-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html

// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'chatMessages'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    chat: {
      type: ObjectId,
      ref: 'chats'
    },
    author: {
      type: ObjectId,
      ref: 'users'
    },
    text: [
      {
        type: Translation,
        rewuired: true
      }
    ],
    pics: [
      {
        url: { type: String },
        credit: { type: String }
      }
    ],
    editedAt: { type: Date },
    translationSum: {
      type: String
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
