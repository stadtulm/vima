// ad-messages-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html

// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'adMessages'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    ad: {
      type: ObjectId,
      ref: 'ads',
      required: true
    },
    author: {
      type: ObjectId,
      ref: 'users'
    },
    text: {
      type: String,
      required: true
    },
    repliesTo: {
      type: ObjectId,
      ref: 'chatMessages'
    },
    replies: [
      {
        type: ObjectId,
        ref: 'chatMessages'
      }
    ],
    chat: {
      type: ObjectId,
      ref: 'chats'
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
